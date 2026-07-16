using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Application.Shifts;

public class ShiftService
{
    private readonly IShiftRepository _repository;

    public ShiftService(IShiftRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<ShiftDto>> GetAsync(int? siteId)
    {
        var shifts = await _repository.GetAsync(siteId);
        return shifts.Select(ToDto);
    }

    public async Task<ShiftDto?> GetByIdAsync(int id)
    {
        var shift = await _repository.GetByIdAsync(id);
        return shift is null ? null : ToDto(shift);
    }

    public async Task<int> CreateAsync(CreateShiftRequest request)
    {
        var shift = new Shift
        {
            SiteId = request.SiteId,
            Name = request.Name,
            StartTime = request.StartTime,
            EndTime = request.EndTime
        };

        return await _repository.AddAsync(shift);
    }

    private static ShiftDto ToDto(ShiftDetail shift) => new()
    {
        Id = shift.Id,
        SiteId = shift.SiteId,
        SiteName = shift.SiteName,
        Name = shift.Name,
        StartTime = shift.StartTime,
        EndTime = shift.EndTime
    };
}
