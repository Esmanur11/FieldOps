using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Application.Shifts;

public class ShiftAssignmentService
{
    private readonly IShiftAssignmentRepository _repository;

    public ShiftAssignmentService(IShiftAssignmentRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<ShiftAssignmentDto>> GetAsync(
        int? personnelId, int? shiftId, int? siteId, DateOnly? date)
    {
        var assignments = await _repository.GetByFiltersAsync(personnelId, shiftId, siteId, date);
        return assignments.Select(ToDto);
    }

    public async Task<int> CreateAsync(CreateShiftAssignmentRequest request)
    {
        var assignment = new ShiftAssignment
        {
            ShiftId = request.ShiftId,
            PersonnelId = request.PersonnelId,
            WorkDate = request.WorkDate,
            Status = "scheduled"
        };

        return await _repository.AddAsync(assignment);
    }

    public async Task<bool> CheckInAsync(int id)
    {
        return await _repository.UpdateCheckInAsync(id, DateTime.UtcNow);
    }

    public async Task<bool> CheckOutAsync(int id)
    {
        return await _repository.UpdateCheckOutAsync(id, DateTime.UtcNow);
    }

    private static ShiftAssignmentDto ToDto(ShiftAssignmentDetail assignment) => new()
    {
        Id = assignment.Id,
        ShiftId = assignment.ShiftId,
        ShiftName = assignment.ShiftName,
        SiteId = assignment.SiteId,
        SiteName = assignment.SiteName,
        PersonnelId = assignment.PersonnelId,
        PersonnelName = assignment.PersonnelName,
        WorkDate = assignment.WorkDate,
        CheckIn = assignment.CheckIn,
        CheckOut = assignment.CheckOut,
        Status = assignment.Status
    };
}
