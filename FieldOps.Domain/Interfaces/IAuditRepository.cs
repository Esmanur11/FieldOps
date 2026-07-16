using FieldOps.Domain.Entities;

namespace FieldOps.Domain.Interfaces;

public interface IAuditRepository
{
    Task<IEnumerable<AuditDetail>> GetAllAsync();
    Task<IEnumerable<AuditDetail>> GetBySiteIdAsync(int siteId);
    Task<AuditDetail?> GetByIdAsync(int id);
    Task<int> AddAsync(Audit audit);
    Task UpdateAsync(Audit audit);
}
