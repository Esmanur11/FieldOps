using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Application.Audits;

public class AuditService
{
    private readonly IAuditRepository _auditRepository;
    private readonly IAuditFindingRepository _findingRepository;

    public AuditService(IAuditRepository auditRepository, IAuditFindingRepository findingRepository)
    {
        _auditRepository = auditRepository;
        _findingRepository = findingRepository;
    }

    public async Task<IEnumerable<AuditDto>> GetAsync(int? siteId)
    {
        var audits = siteId.HasValue
            ? await _auditRepository.GetBySiteIdAsync(siteId.Value)
            : await _auditRepository.GetAllAsync();

        return audits.Select(ToDto);
    }

    public async Task<AuditDetailDto?> GetByIdAsync(int id)
    {
        var audit = await _auditRepository.GetByIdAsync(id);
        if (audit is null)
        {
            return null;
        }

        var findings = await _findingRepository.GetByAuditIdAsync(id);

        return new AuditDetailDto
        {
            Id = audit.Id,
            SiteId = audit.SiteId,
            SiteName = audit.SiteName,
            InspectorId = audit.InspectorId,
            InspectorName = audit.InspectorName,
            AuditDate = audit.AuditDate,
            Type = audit.Type,
            Status = audit.Status,
            Findings = findings.Select(ToFindingDto).ToList()
        };
    }

    public async Task<int> CreateAsync(CreateAuditRequest request)
    {
        var audit = new Audit
        {
            SiteId = request.SiteId,
            InspectorId = request.InspectorId,
            AuditDate = request.AuditDate,
            Type = request.Type,
            Status = request.Status
        };

        return await _auditRepository.AddAsync(audit);
    }

    public async Task<bool> UpdateAsync(int id, CreateAuditRequest request)
    {
        var existing = await _auditRepository.GetByIdAsync(id);
        if (existing is null)
        {
            return false;
        }

        var audit = new Audit
        {
            Id = id,
            SiteId = request.SiteId,
            InspectorId = request.InspectorId,
            AuditDate = request.AuditDate,
            Type = request.Type,
            Status = request.Status
        };

        await _auditRepository.UpdateAsync(audit);
        return true;
    }

    private static AuditDto ToDto(AuditDetail audit) => new()
    {
        Id = audit.Id,
        SiteId = audit.SiteId,
        SiteName = audit.SiteName,
        InspectorId = audit.InspectorId,
        InspectorName = audit.InspectorName,
        AuditDate = audit.AuditDate,
        Type = audit.Type,
        Status = audit.Status
    };

    private static AuditFindingDto ToFindingDto(AuditFinding finding) => new()
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
