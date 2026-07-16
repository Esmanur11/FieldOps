using FieldOps.Domain.Entities;

namespace FieldOps.Domain.Interfaces;

public interface IAuditFindingRepository
{
    Task<IEnumerable<AuditFinding>> GetAllAsync();
    Task<IEnumerable<AuditFinding>> GetByAuditIdAsync(int auditId);
    Task<int> AddAsync(AuditFinding finding);

    // Returns the finding's audit_id on success (via RETURNING) or null if no finding has that
    // id — a single round trip that both confirms the update and gives the caller the parent
    // audit's id, which it needs to resolve the site for a possible auto-generated work order.
    Task<int?> UpdateAsync(AuditFinding finding);
}
