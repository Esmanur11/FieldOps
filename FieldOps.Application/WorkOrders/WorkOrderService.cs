using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Application.WorkOrders;

public class WorkOrderService
{
    private readonly IWorkOrderRepository _repository;

    public WorkOrderService(IWorkOrderRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<WorkOrderDto>> GetAsync(int? siteId, string? status)
    {
        var workOrders = await _repository.GetAsync(siteId, status);
        return workOrders.Select(ToDto);
    }

    public async Task<WorkOrderDto?> GetByIdAsync(int id)
    {
        var workOrder = await _repository.GetByIdAsync(id);
        return workOrder is null ? null : ToDto(workOrder);
    }

    public async Task<int> CreateAsync(CreateWorkOrderRequest request)
    {
        var workOrder = new WorkOrder
        {
            SiteId = request.SiteId,
            Title = request.Title,
            Description = request.Description,
            AssignedTo = request.AssignedTo,
            Priority = request.Priority,
            Status = "open",
            CreatedAt = DateTime.UtcNow
        };

        return await _repository.AddAsync(workOrder);
    }

    public async Task<bool> UpdateStatusAsync(int id, string status)
    {
        var completedAt = status == "completed" ? DateTime.UtcNow : (DateTime?)null;
        return await _repository.UpdateStatusAsync(id, status, completedAt);
    }

    public async Task<bool> AssignAsync(int id, int? assignedTo)
    {
        return await _repository.UpdateAssignmentAsync(id, assignedTo);
    }

    // Called by AuditFindingService / PredictiveMaintenanceService / MaterialTransactionService
    // whenever one of their triggers fires (critical finding, high risk score, low stock). Skips
    // creation if an open work order already exists for (sourceType, sourceId), so re-evaluating
    // the same condition repeatedly (e.g. the 6-hour prediction cycle) doesn't pile up duplicates.
    public async Task<WorkOrderDto?> AutoCreateAsync(int siteId, string title, string? description, string sourceType, int sourceId)
    {
        if (await _repository.ExistsOpenForSourceAsync(sourceType, sourceId))
        {
            return null;
        }

        var workOrder = new WorkOrder
        {
            SiteId = siteId,
            Title = title.Length > 200 ? title[..200] : title,
            Description = description,
            SourceType = sourceType,
            SourceId = sourceId,
            Priority = "high",
            Status = "open",
            CreatedAt = DateTime.UtcNow
        };

        var id = await _repository.AddAsync(workOrder);
        return await GetByIdAsync(id);
    }

    private static WorkOrderDto ToDto(WorkOrderDetail workOrder) => new()
    {
        Id = workOrder.Id,
        SiteId = workOrder.SiteId,
        SiteName = workOrder.SiteName,
        Title = workOrder.Title,
        Description = workOrder.Description,
        SourceType = workOrder.SourceType,
        SourceId = workOrder.SourceId,
        AssignedTo = workOrder.AssignedTo,
        AssignedToName = workOrder.AssignedToName,
        Priority = workOrder.Priority,
        Status = workOrder.Status,
        CreatedAt = workOrder.CreatedAt,
        CompletedAt = workOrder.CompletedAt
    };
}
