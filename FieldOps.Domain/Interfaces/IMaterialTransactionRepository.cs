using FieldOps.Domain.Entities;

namespace FieldOps.Domain.Interfaces;

public interface IMaterialTransactionRepository
{
    Task<IEnumerable<MaterialTransaction>> GetAsync(int? siteId, int? materialId);
}