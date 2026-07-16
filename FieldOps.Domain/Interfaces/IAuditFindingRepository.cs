using FieldOps.Domain.Entities;

namespace FieldOps.Domain.Interfaces;

public interface IAuditFindingRepository
{
    Task<IEnumerable<AuditFinding>> GetAllAsync();
    Task<IEnumerable<AuditFinding>> GetByAuditIdAsync(int auditId);
    Task<int> AddAsync(AuditFinding finding);

    // Returns the number of rows affected (0 = no finding with that id) since audit_id is
    // immutable and never part of the update, there's no need to look the record up first.
    Task<int> UpdateAsync(AuditFinding finding);
}
