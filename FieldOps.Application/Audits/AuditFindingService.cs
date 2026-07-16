using FieldOps.Application.WorkOrders;
using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Application.Audits;

public class AuditFindingService
{
    private readonly IAuditFindingRepository _repository;
    private readonly IAuditRepository _auditRepository;
    private readonly WorkOrderService _workOrderService;

    public AuditFindingService(
        IAuditFindingRepository repository,
        IAuditRepository auditRepository,
        WorkOrderService workOrderService)
    {
        _repository = repository;
        _auditRepository = auditRepository;
        _workOrderService = workOrderService;
    }

    public async Task<IEnumerable<AuditFindingDto>> GetAsync(int? auditId)
    {
        var findings = auditId.HasValue
            ? await _repository.GetByAuditIdAsync(auditId.Value)
            : await _repository.GetAllAsync();

        return findings.Select(ToDto);
    }

    public async Task<int> CreateAsync(CreateAuditFindingRequest request)
    {
        var finding = new AuditFinding
        {
            AuditId = request.AuditId,
            Category = request.Category,
            Severity = request.Severity,
            Description = request.Description,
            CorrectiveAction = request.CorrectiveAction,
            DueDate = request.DueDate,
            Status = "open"
        };

        var id = await _repository.AddAsync(finding);
        await AutoCreateWorkOrderIfSevereAsync(request.AuditId, request.Severity, request.Description);
        return id;
    }

    public async Task<bool> UpdateAsync(int id, UpdateAuditFindingRequest request)
    {
        var finding = new AuditFinding
        {
            Id = id,
            Category = request.Category,
            Severity = request.Severity,
            Description = request.Description,
            CorrectiveAction = request.CorrectiveAction,
            DueDate = request.DueDate,
            Status = request.Status
        };

        var auditId = await _repository.UpdateAsync(finding);
        if (auditId is null)
        {
            return false;
        }

        await AutoCreateWorkOrderIfSevereAsync(auditId.Value, request.Severity, request.Description);
        return true;
    }

    // A critical/high finding is due-for-attention regardless of whether it just got created or
    // was edited into that state; WorkOrderService.AutoCreateAsync's dedup (keyed on the audit, not
    // the individual finding) keeps a second severe finding on the same audit from spawning another.
    private async Task AutoCreateWorkOrderIfSevereAsync(int auditId, string severity, string description)
    {
        if (severity is not ("critical" or "high"))
        {
            return;
        }

        var audit = await _auditRepository.GetByIdAsync(auditId);
        if (audit is null)
        {
            return;
        }

        await _workOrderService.AutoCreateAsync(
            audit.SiteId,
            $"Denetim bulgusu ({severity}): {description}",
            $"{audit.Type} denetiminde tespit edildi. Şantiye: {audit.SiteName}.",
            "audit_finding",
            audit.Id);
    }

    private static AuditFindingDto ToDto(AuditFinding finding) => new()
    {
        Id = finding.Id,
        AuditId = finding.AuditId,
        Category = finding.Category,
        Severity = finding.Severity,
        Description = finding.Description,
        CorrectiveAction = finding.CorrectiveAction,
        DueDate = finding.DueDate,
        Status = finding.Status
    };
}
