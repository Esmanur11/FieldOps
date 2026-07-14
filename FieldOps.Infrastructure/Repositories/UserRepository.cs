using Dapper;
using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public UserRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    private const string SelectColumns = """
        id AS "Id", username AS "Username", password_hash AS "PasswordHash",
        role AS "Role", personnel_id AS "PersonnelId"
        """;

    public async Task<User?> GetByUsernameAsync(string username)
    {
        var sql = $"""
            SELECT {SelectColumns}
            FROM users
            WHERE username = @Username
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Username = username });
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        var sql = $"""
            SELECT {SelectColumns}
            FROM users
            WHERE id = @Id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Id = id });
    }

    public async Task<int> AddAsync(User user)
    {
        const string sql = """
            INSERT INTO users (username, password_hash, role, personnel_id)
            VALUES (@Username, @PasswordHash, @Role, @PersonnelId)
            RETURNING id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, user);
    }
}
