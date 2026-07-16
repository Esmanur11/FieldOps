using FieldOps.Domain.Entities;

namespace FieldOps.Domain.Interfaces;

public interface IShiftRepository
{
    Task<IEnumerable<ShiftDetail>> GetAsync(int? siteId);
    Task<ShiftDetail?> GetByIdAsync(int id);
    Task<int> AddAsync(Shift shift);
}
