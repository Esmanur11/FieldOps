using FieldOps.Domain.Entities;

namespace FieldOps.Domain.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByIdAsync(int id);
    Task<int> AddAsync(User user);
}
