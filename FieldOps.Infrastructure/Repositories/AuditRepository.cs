using Dapper;
using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Infrastructure.Repositories;

public class AuditRepository : IAuditRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public AuditRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    private const string SelectColumns = """
        a.id AS "Id", a.site_id AS "SiteId", s.name AS "SiteName",
        a.inspector_id AS "InspectorId", p.full_name AS "InspectorName",
        a.audit_date AS "AuditDate", a.type AS "Type", a.status AS "Status"
        """;

    private const string FromClause = """
        FROM audits a
        JOIN sites s ON s.id = a.site_id
        JOIN personnel p ON p.id = a.inspector_id
        """;

    public async Task<IEnumerable<AuditDetail>> GetAllAsync()
    {
        var sql = $"""
            SELECT {SelectColumns}
            {FromClause}
            ORDER BY a.audit_date DESC
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<AuditDetail>(sql);
    }

    public async Task<IEnumerable<AuditDetail>> GetBySiteIdAsync(int siteId)
    {
        var sql = $"""
            SELECT {SelectColumns}
            {FromClause}
            WHERE a.site_id = @SiteId
            ORDER BY a.audit_date DESC
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<AuditDetail>(sql, new { SiteId = siteId });
    }

    public async Task<AuditDetail?> GetByIdAsync(int id)
    {
        var sql = $"""
            SELECT {SelectColumns}
            {FromClause}
            WHERE a.id = @Id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<AuditDetail>(sql, new { Id = id });
    }

    public async Task<int> AddAsync(Audit audit)
    {
        const string sql = """
            INSERT INTO audits (site_id, inspector_id, audit_date, type, status)
            VALUES (@SiteId, @InspectorId, @AuditDate, @Type, @Status)
            RETURNING id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, audit);
    }

    public async Task UpdateAsync(Audit audit)
    {
        const string sql = """
            UPDATE audits
            SET site_id = @SiteId, inspector_id = @InspectorId, audit_date = @AuditDate,
                type = @Type, status = @Status
            WHERE id = @Id
            """;

        using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync(sql, audit);
    }
}
