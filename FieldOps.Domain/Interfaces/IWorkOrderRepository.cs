using FieldOps.Domain.Entities;

namespace FieldOps.Domain.Interfaces;

public interface IWorkOrderRepository
{
    Task<IEnumerable<WorkOrderDetail>> GetAsync(int? siteId, string? status);
    Task<WorkOrderDetail?> GetByIdAsync(int id);
    Task<int> AddAsync(WorkOrder workOrder);
    Task<bool> UpdateStatusAsync(int id, string status, DateTime? completedAt);
    Task<bool> UpdateAssignmentAsync(int id, int? assignedTo);

    // status NOT IN ('completed', 'cancelled') counts as "open" for dedup purposes.
    Task<bool> ExistsOpenForSourceAsync(string sourceType, int sourceId);
}
