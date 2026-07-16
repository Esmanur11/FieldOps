using FieldOps.Domain.Entities;

namespace FieldOps.Domain.Interfaces;

public interface IMaterialRepository
{
    Task<IEnumerable<Material>> GetAllAsync();
    Task<Material?> GetByIdAsync(int id);
    Task<int> AddAsync(Material material);
}