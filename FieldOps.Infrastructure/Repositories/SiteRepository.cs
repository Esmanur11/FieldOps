using Dapper;
using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Infrastructure.Repositories;

public class SiteRepository : ISiteRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public SiteRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<Site>> GetAllAsync()
    {
        const string sql = """
            SELECT id AS "Id", name AS "Name", location AS "Location", start_date AS "StartDate", status AS "Status"
            FROM sites
            ORDER BY id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Site>(sql);
    }

    public async Task<Site?> GetByIdAsync(int id)
    {
        const string sql = """
            SELECT id AS "Id", name AS "Name", location AS "Location", start_date AS "StartDate", status AS "Status"
            FROM sites
            WHERE id = @Id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<Site>(sql, new { Id = id });
    }

    public async Task<int> AddAsync(Site site)
    {
        const string sql = """
            INSERT INTO sites (name, location, start_date, status)
            VALUES (@Name, @Location, @StartDate, @Status)
            RETURNING id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, site);
    }

    public async Task UpdateAsync(Site site)
    {
        const string sql = """
            UPDATE sites
            SET name = @Name, location = @Location, start_date = @StartDate, status = @Status
            WHERE id = @Id
            """;

        using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync(sql, site);
    }
}
