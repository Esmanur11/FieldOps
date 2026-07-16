using Dapper;
using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Infrastructure.Repositories;

public class ShiftRepository : IShiftRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public ShiftRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    private const string SelectColumns = """
        sh.id AS "Id", sh.site_id AS "SiteId", s.name AS "SiteName",
        sh.name AS "Name", sh.start_time AS "StartTime", sh.end_time AS "EndTime"
        """;

    private const string FromClause = """
        FROM shifts sh
        JOIN sites s ON s.id = sh.site_id
        """;

    public async Task<IEnumerable<ShiftDetail>> GetAsync(int? siteId)
    {
        var sql = $"""
            SELECT {SelectColumns}
            {FromClause}
            WHERE (@SiteId::int IS NULL OR sh.site_id = @SiteId)
            ORDER BY s.name, sh.name
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<ShiftDetail>(sql, new { SiteId = siteId });
    }

    public async Task<ShiftDetail?> GetByIdAsync(int id)
    {
        var sql = $"""
            SELECT {SelectColumns}
            {FromClause}
            WHERE sh.id = @Id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<ShiftDetail>(sql, new { Id = id });
    }

    public async Task<int> AddAsync(Shift shift)
    {
        const string sql = """
            INSERT INTO shifts (site_id, name, start_time, end_time)
            VALUES (@SiteId, @Name, @StartTime, @EndTime)
            RETURNING id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, shift);
    }
}
