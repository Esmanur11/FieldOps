using FieldOps.Domain.Entities;

namespace FieldOps.Domain.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByIdAsync(int id);
    Task<int> AddAsync(User user);

    // Joined with the linked personnel's name, for the admin-facing account list.
    Task<IEnumerable<UserDetail>> GetAllAsync();

    // Personnel rows with no matching users.personnel_id (LEFT JOIN ... WHERE users.id IS NULL) —
    // the pool a new account can be created for.
    Task<IEnumerable<Personnel>> GetPersonnelWithoutAccountAsync();

    Task<bool> ExistsForPersonnelAsync(int personnelId);
}
