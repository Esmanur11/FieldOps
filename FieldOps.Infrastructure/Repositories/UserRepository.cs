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

    public async Task<IEnumerable<UserDetail>> GetAllAsync()
    {
        const string sql = """
            SELECT u.id AS "Id", u.username AS "Username", u.role AS "Role",
                   u.personnel_id AS "PersonnelId", p.full_name AS "PersonnelName"
            FROM users u
            LEFT JOIN personnel p ON p.id = u.personnel_id
            ORDER BY u.username
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<UserDetail>(sql);
    }

    public async Task<IEnumerable<Personnel>> GetPersonnelWithoutAccountAsync()
    {
        const string sql = """
            SELECT p.id AS "Id", p.site_id AS "SiteId", p.full_name AS "FullName",
                   p.role AS "Role", p.phone AS "Phone", p.hire_date AS "HireDate", p.status AS "Status"
            FROM personnel p
            LEFT JOIN users u ON u.personnel_id = p.id
            WHERE u.id IS NULL
            ORDER BY p.full_name
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Personnel>(sql);
    }

    public async Task<bool> ExistsForPersonnelAsync(int personnelId)
    {
        const string sql = "SELECT EXISTS(SELECT 1 FROM users WHERE personnel_id = @PersonnelId)";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<bool>(sql, new { PersonnelId = personnelId });
    }
}
