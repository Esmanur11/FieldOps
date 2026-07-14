using Dapper;
using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Infrastructure.Repositories;

public class PersonnelRepository : IPersonnelRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public PersonnelRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    private const string SelectColumns = """
        id AS "Id", site_id AS "SiteId", full_name AS "FullName", role AS "Role",
        phone AS "Phone", hire_date AS "HireDate", status AS "Status"
        """;

    public async Task<IEnumerable<Personnel>> GetAllAsync()
    {
        var sql = $"""
            SELECT {SelectColumns}
            FROM personnel
            ORDER BY id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Personnel>(sql);
    }

    public async Task<IEnumerable<Personnel>> GetBySiteIdAsync(int siteId)
    {
        var sql = $"""
            SELECT {SelectColumns}
            FROM personnel
            WHERE site_id = @SiteId
            ORDER BY id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Personnel>(sql, new { SiteId = siteId });
    }

    public async Task<Personnel?> GetByIdAsync(int id)
    {
        var sql = $"""
            SELECT {SelectColumns}
            FROM personnel
            WHERE id = @Id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<Personnel>(sql, new { Id = id });
    }

    public async Task<int> AddAsync(Personnel personnel)
    {
        const string sql = """
            INSERT INTO personnel (site_id, full_name, role, phone, hire_date, status)
            VALUES (@SiteId, @FullName, @Role, @Phone, @HireDate, @Status)
            RETURNING id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, personnel);
    }

    public async Task UpdateAsync(Personnel personnel)
    {
        const string sql = """
            UPDATE personnel
            SET site_id = @SiteId, full_name = @FullName, role = @Role,
                phone = @Phone, hire_date = @HireDate, status = @Status
            WHERE id = @Id
            """;

        using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync(sql, personnel);
    }
}
