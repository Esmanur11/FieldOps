using FieldOps.Application.Notifications;
using FieldOps.Application.WorkOrders;
using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Application.Maintenance;

public class PredictiveMaintenanceService
{
    private const decimal HighRiskThreshold = 80m;

    private readonly IMachineRepository _machineRepository;
    private readonly IMaintenanceRecordRepository _maintenanceRecordRepository;
    private readonly IMachineUsageLogRepository _usageLogRepository;
    private readonly IMaintenancePredictionRepository _predictionRepository;
    private readonly WorkOrderService _workOrderService;
    private readonly NotificationService _notificationService;

    public PredictiveMaintenanceService(
        IMachineRepository machineRepository,
        IMaintenanceRecordRepository maintenanceRecordRepository,
        IMachineUsageLogRepository usageLogRepository,
        IMaintenancePredictionRepository predictionRepository,
        WorkOrderService workOrderService,
        NotificationService notificationService)
    {
        _machineRepository = machineRepository;
        _maintenanceRecordRepository = maintenanceRecordRepository;
        _usageLogRepository = usageLogRepository;
        _predictionRepository = predictionRepository;
        _workOrderService = workOrderService;
        _notificationService = notificationService;
    }

    public async Task<MaintenancePredictionDto?> RecalculateForMachineAsync(int machineId)
    {
        var machine = await _machineRepository.GetByIdAsync(machineId);
        if (machine is null)
        {
            return null;
        }

        var records = (await _maintenanceRecordRepository.GetByMachineIdAsync(machineId))
            .OrderBy(r => r.MaintenanceDate)
            .ToList();
        var logs = (await _usageLogRepository.GetByMachineIdAsync(machineId))
            .OrderBy(l => l.LogDate)
            .ToList();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var baselineStart = machine.PurchaseDate ?? logs.FirstOrDefault()?.LogDate ?? today;
        var lastMaintenanceDate = records.Count > 0 ? records[^1].MaintenanceDate : baselineStart;

        var (averageIntervalHours, basis) = ComputeAverageMaintenanceIntervalHours(records, logs, baselineStart);
        var accumulatedHours = logs.Where(l => l.LogDate > lastMaintenanceDate).Sum(l => l.HoursUsed);

        var riskScore = averageIntervalHours > 0
            ? Math.Min(100m, Math.Round(accumulatedHours / averageIntervalHours * 100m, 2))
            : accumulatedHours > 0 ? 100m : 0m;

        var predictedDate = EstimatePredictedDate(today, lastMaintenanceDate, logs, averageIntervalHours, accumulatedHours);

        var prediction = new MaintenancePrediction
        {
            MachineId = machineId,
            PredictedDate = predictedDate,
            RiskScore = riskScore,
            Basis = $"{basis} Son bakımdan bu yana biriken kullanım: {accumulatedHours:F1} saat, risk skoru: {riskScore:F0}.",
            GeneratedAt = DateTime.UtcNow
        };

        var id = await _predictionRepository.AddAsync(prediction);
        prediction.Id = id;

        if (riskScore >= HighRiskThreshold)
        {
            await _workOrderService.AutoCreateAsync(
                machine.SiteId,
                $"Bakım gerekli: {machine.Name} (risk %{riskScore:F0})",
                prediction.Basis,
                "maintenance_prediction",
                machine.Id);

            await _notificationService.CreateAsync(
                "maintenance_prediction",
                "machine",
                machine.Id,
                $"{machine.Name} için bakım riski %{riskScore:F0}'a ulaştı.",
                "high");
        }

        return ToDto(prediction);
    }

    public async Task<IEnumerable<MaintenancePredictionDto>> RecalculateAllActiveMachinesAsync()
    {
        var activeMachines = (await _machineRepository.GetAllAsync()).Where(m => m.Status == "active");

        var results = new List<MaintenancePredictionDto>();
        foreach (var machine in activeMachines)
        {
            var dto = await RecalculateForMachineAsync(machine.Id);
            if (dto is not null)
            {
                results.Add(dto);
            }
        }

        return results;
    }

    public async Task<IEnumerable<MaintenancePredictionDto>> GetLatestAsync(int? machineId)
    {
        var predictions = await _predictionRepository.GetLatestAsync(machineId);
        return predictions.Select(ToDto);
    }

    // With 2+ maintenance records, averages the usage-hours span between each consecutive pair
    // (how many hours of use a maintenance interval typically covers). With 0 or 1 records there's
    // no pair to average, so the single observed span since the baseline anchor stands in for it.
    private static (decimal AverageIntervalHours, string Basis) ComputeAverageMaintenanceIntervalHours(
        List<MaintenanceRecord> records,
        List<MachineUsageLog> logs,
        DateOnly baselineStart)
    {
        if (records.Count < 2)
        {
            var anchor = records.Count == 1 ? records[0].MaintenanceDate : baselineStart;
            var hoursSinceAnchor = logs.Where(l => l.LogDate >= anchor).Sum(l => l.HoursUsed);
            var basis = records.Count == 0
                ? $"Geçmiş bakım kaydı yok; satın alma tarihinden ({anchor:yyyy-MM-dd}) bu yana toplam {hoursSinceAnchor:F1} saat kullanım baz alındı."
                : $"Tek bakım kaydı mevcut; {anchor:yyyy-MM-dd} tarihinden bu yana toplam {hoursSinceAnchor:F1} saat kullanım baz alındı.";
            return (hoursSinceAnchor, basis);
        }

        var intervalHours = new List<decimal>();
        for (var i = 1; i < records.Count; i++)
        {
            var from = records[i - 1].MaintenanceDate;
            var to = records[i].MaintenanceDate;
            intervalHours.Add(logs.Where(l => l.LogDate > from && l.LogDate <= to).Sum(l => l.HoursUsed));
        }

        var average = intervalHours.Average();
        return (average, $"{records.Count} bakım kaydına dayanan {intervalHours.Count} aralığın ortalaması: {average:F1} saat/bakım.");
    }

    // No explicit target date exists to project from, so a daily usage rate is derived from logs
    // recorded since the last maintenance and used to convert the remaining hours into a day count.
    private static DateOnly EstimatePredictedDate(
        DateOnly today,
        DateOnly lastMaintenanceDate,
        List<MachineUsageLog> logs,
        decimal averageIntervalHours,
        decimal accumulatedHours)
    {
        var remainingHours = Math.Max(0, averageIntervalHours - accumulatedHours);
        if (remainingHours <= 0)
        {
            return today;
        }

        var recentLogs = logs.Where(l => l.LogDate > lastMaintenanceDate).ToList();
        if (recentLogs.Count == 0)
        {
            return today.AddDays(30);
        }

        var spanDays = Math.Max(1, today.DayNumber - lastMaintenanceDate.DayNumber);
        var dailyRate = recentLogs.Sum(l => l.HoursUsed) / spanDays;
        if (dailyRate <= 0)
        {
            return today.AddDays(30);
        }

        var daysUntilDue = (int)Math.Ceiling(remainingHours / dailyRate);
        return today.AddDays(daysUntilDue);
    }

    private static MaintenancePredictionDto ToDto(MaintenancePrediction prediction) => new()
    {
        Id = prediction.Id,
        MachineId = prediction.MachineId,
        PredictedDate = prediction.PredictedDate,
        RiskScore = prediction.RiskScore,
        Basis = prediction.Basis,
        GeneratedAt = prediction.GeneratedAt
    };
}
