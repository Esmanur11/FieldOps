using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Application.Maintenance;

public class MachineUsageLogService
{
    private readonly IMachineUsageLogRepository _repository;

    public MachineUsageLogService(IMachineUsageLogRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<MachineUsageLogDto>> GetAsync(int? machineId)
    {
        var logs = machineId.HasValue
            ? await _repository.GetByMachineIdAsync(machineId.Value)
            : await _repository.GetAllAsync();

        return logs.Select(ToDto);
    }

    public async Task<int> CreateAsync(CreateMachineUsageLogRequest request)
    {
        var log = new MachineUsageLog
        {
            MachineId = request.MachineId,
            LogDate = request.LogDate,
            HoursUsed = request.HoursUsed,
            FuelConsumed = request.FuelConsumed,
            OperatorId = request.OperatorId
        };

        return await _repository.AddAsync(log);
    }

    private static MachineUsageLogDto ToDto(MachineUsageLog log) => new()
    {
        Id = log.Id,
        MachineId = log.MachineId,
        LogDate = log.LogDate,
        HoursUsed = log.HoursUsed,
        FuelConsumed = log.FuelConsumed,
        OperatorId = log.OperatorId
    };
}
