using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Application.Audits;

public class AuditFindingService
{
    private readonly IAuditFindingRepository _repository;

    public AuditFindingService(IAuditFindingRepository repository)
    {
        _repository = repository;
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

        return await _repository.AddAsync(finding);
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

        var rowsAffected = await _repository.UpdateAsync(finding);
        return rowsAffected > 0;
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
