using FieldOps.Domain.Entities;

namespace FieldOps.Domain.Interfaces;

public interface ISiteRepository
{
    Task<IEnumerable<Site>> GetAllAsync();
    Task<Site?> GetByIdAsync(int id);
    Task<int> AddAsync(Site site);
    Task UpdateAsync(Site site);
}
