using FieldOps.Application.Personnel;
using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Application.Users;

public class UserService
{
    private readonly IUserRepository _repository;

    public UserService(IUserRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync()
    {
        var users = await _repository.GetAllAsync();
        return users.Select(ToDto);
    }

    public async Task<IEnumerable<PersonnelDto>> GetPersonnelWithoutAccountAsync()
    {
        var personnel = await _repository.GetPersonnelWithoutAccountAsync();
        return personnel.Select(ToPersonnelDto);
    }

    public async Task<int> CreateAsync(CreateUserRequest request)
    {
        var user = new User
        {
            Username = request.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = request.Role,
            PersonnelId = request.PersonnelId
        };

        return await _repository.AddAsync(user);
    }

    private static UserDto ToDto(UserDetail user) => new()
    {
        Id = user.Id,
        Username = user.Username,
        Role = user.Role,
        PersonnelId = user.PersonnelId,
        PersonnelName = user.PersonnelName
    };

    private static PersonnelDto ToPersonnelDto(FieldOps.Domain.Entities.Personnel personnel) => new()
    {
        Id = personnel.Id,
        SiteId = personnel.SiteId,
        FullName = personnel.FullName,
        Role = personnel.Role,
        Phone = personnel.Phone,
        HireDate = personnel.HireDate,
        Status = personnel.Status
    };
}
