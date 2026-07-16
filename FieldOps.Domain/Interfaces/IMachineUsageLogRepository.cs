using FieldOps.Domain.Entities;

namespace FieldOps.Domain.Interfaces;

public interface IMachineUsageLogRepository
{
    Task<IEnumerable<MachineUsageLog>> GetAllAsync();
    Task<IEnumerable<MachineUsageLog>> GetByMachineIdAsync(int machineId);
    Task<int> AddAsync(MachineUsageLog log);
}
