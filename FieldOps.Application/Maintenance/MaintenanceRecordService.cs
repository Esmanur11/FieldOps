using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Application.Maintenance;

public class MaintenanceRecordService
{
    private readonly IMaintenanceRecordRepository _repository;

    public MaintenanceRecordService(IMaintenanceRecordRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<MaintenanceRecordDto>> GetAsync(int? machineId)
    {
        var records = machineId.HasValue
            ? await _repository.GetByMachineIdAsync(machineId.Value)
            : await _repository.GetAllAsync();

        return records.Select(ToDto);
    }

    public async Task<int> CreateAsync(CreateMaintenanceRecordRequest request)
    {
        var record = new MaintenanceRecord
        {
            MachineId = request.MachineId,
            MaintenanceDate = request.MaintenanceDate,
            Type = request.Type,
            Description = request.Description,
            Cost = request.Cost,
            PerformedBy = request.PerformedBy
        };

        return await _repository.AddAsync(record);
    }

    private static MaintenanceRecordDto ToDto(MaintenanceRecord record) => new()
    {
        Id = record.Id,
        MachineId = record.MachineId,
        MaintenanceDate = record.MaintenanceDate,
        Type = record.Type,
        Description = record.Description,
        Cost = record.Cost,
        PerformedBy = record.PerformedBy
    };
}
