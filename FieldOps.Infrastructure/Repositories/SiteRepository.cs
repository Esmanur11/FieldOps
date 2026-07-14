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

    private const string SelectColumns = """
        id AS "Id", name AS "Name", location AS "Location", start_date AS "StartDate", status AS "Status",
        latitude AS "Latitude", longitude AS "Longitude", completion_percentage AS "CompletionPercentage"
        """;

    public async Task<IEnumerable<Site>> GetAllAsync()
    {
        var sql = $"""
            SELECT {SelectColumns}
            FROM sites
            ORDER BY id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Site>(sql);
    }

    public async Task<Site?> GetByIdAsync(int id)
    {
        var sql = $"""
            SELECT {SelectColumns}
            FROM sites
            WHERE id = @Id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<Site>(sql, new { Id = id });
    }

    public async Task<int> AddAsync(Site site)
    {
        const string sql = """
            INSERT INTO sites (name, location, start_date, status, latitude, longitude, completion_percentage)
            VALUES (@Name, @Location, @StartDate, @Status, @Latitude, @Longitude, @CompletionPercentage)
            RETURNING id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, site);
    }

    public async Task UpdateAsync(Site site)
    {
        const string sql = """
            UPDATE sites
            SET name = @Name, location = @Location, start_date = @StartDate, status = @Status,
                latitude = @Latitude, longitude = @Longitude, completion_percentage = @CompletionPercentage
            WHERE id = @Id
            """;

        using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync(sql, site);
    }
}
