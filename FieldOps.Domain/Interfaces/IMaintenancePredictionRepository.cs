using FieldOps.Domain.Entities;

namespace FieldOps.Domain.Interfaces;

public interface IMaintenancePredictionRepository
{
    // Returns the most recently generated prediction per machine (DISTINCT ON machine_id),
    // optionally narrowed to a single machine.
    Task<IEnumerable<MaintenancePrediction>> GetLatestAsync(int? machineId);

    Task<int> AddAsync(MaintenancePrediction prediction);
}
