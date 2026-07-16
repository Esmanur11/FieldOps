using FieldOps.Domain.Entities;

namespace FieldOps.Domain.Interfaces;

public interface IShiftAssignmentRepository
{
    Task<IEnumerable<ShiftAssignmentDetail>> GetByFiltersAsync(
        int? personnelId, int? shiftId, int? siteId, DateOnly? date);

    Task<ShiftAssignmentDetail?> GetByIdAsync(int id);
    Task<int> AddAsync(ShiftAssignment assignment);
    Task<bool> UpdateCheckInAsync(int id, DateTime checkIn);

    // Also sets status to 'completed'.
    Task<bool> UpdateCheckOutAsync(int id, DateTime checkOut);
}
