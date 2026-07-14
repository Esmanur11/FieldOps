using FieldOps.Domain.Interfaces;
using PersonnelEntity = FieldOps.Domain.Entities.Personnel;

namespace FieldOps.Application.Personnel;

public class PersonnelService
{
    private readonly IPersonnelRepository _repository;

    public PersonnelService(IPersonnelRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<PersonnelDto>> GetAllAsync()
    {
        var personnel = await _repository.GetAllAsync();
        return personnel.Select(ToDto);
    }

    public async Task<IEnumerable<PersonnelDto>> GetBySiteIdAsync(int siteId)
    {
        var personnel = await _repository.GetBySiteIdAsync(siteId);
        return personnel.Select(ToDto);
    }

    public async Task<PersonnelDto?> GetByIdAsync(int id)
    {
        var person = await _repository.GetByIdAsync(id);
        return person is null ? null : ToDto(person);
    }

    public async Task<int> CreateAsync(CreatePersonnelRequest request)
    {
        var person = new PersonnelEntity
        {
            SiteId = request.SiteId,
            FullName = request.FullName,
            Role = request.Role,
            Phone = request.Phone,
            HireDate = request.HireDate,
            Status = request.Status
        };

        return await _repository.AddAsync(person);
    }

    public async Task<bool> UpdateAsync(int id, CreatePersonnelRequest request)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing is null)
        {
            return false;
        }

        existing.SiteId = request.SiteId;
        existing.FullName = request.FullName;
        existing.Role = request.Role;
        existing.Phone = request.Phone;
        existing.HireDate = request.HireDate;
        existing.Status = request.Status;

        await _repository.UpdateAsync(existing);
        return true;
    }

    private static PersonnelDto ToDto(PersonnelEntity person) => new()
    {
        Id = person.Id,
        SiteId = person.SiteId,
        FullName = person.FullName,
        Role = person.Role,
        Phone = person.Phone,
        HireDate = person.HireDate,
        Status = person.Status
    };
}
