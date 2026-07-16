using FieldOps.Domain.Entities;

namespace FieldOps.Domain.Interfaces;

public interface IMaintenanceRecordRepository
{
    Task<IEnumerable<MaintenanceRecord>> GetAllAsync();
    Task<IEnumerable<MaintenanceRecord>> GetByMachineIdAsync(int machineId);
    Task<int> AddAsync(MaintenanceRecord record);
}
