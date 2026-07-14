using FieldOps.Domain.Entities;

namespace FieldOps.Domain.Interfaces;

public interface IMachineRepository
{
    Task<IEnumerable<Machine>> GetAllAsync();
    Task<IEnumerable<Machine>> GetBySiteIdAsync(int siteId);
    Task<Machine?> GetByIdAsync(int id);
    Task<int> AddAsync(Machine machine);
    Task UpdateAsync(Machine machine);
}
