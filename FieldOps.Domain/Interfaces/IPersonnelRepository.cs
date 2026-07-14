using FieldOps.Domain.Entities;

namespace FieldOps.Domain.Interfaces;

public interface IPersonnelRepository
{
    Task<IEnumerable<Personnel>> GetAllAsync();
    Task<IEnumerable<Personnel>> GetBySiteIdAsync(int siteId);
    Task<Personnel?> GetByIdAsync(int id);
    Task<int> AddAsync(Personnel personnel);
    Task UpdateAsync(Personnel personnel);
}
