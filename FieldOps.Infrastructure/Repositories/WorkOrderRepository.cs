using Dapper;
using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Infrastructure.Repositories;

public class WorkOrderRepository : IWorkOrderRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public WorkOrderRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    private const string SelectColumns = """
        wo.id AS "Id", wo.site_id AS "SiteId", s.name AS "SiteName", wo.title AS "Title",
        wo.description AS "Description", wo.source_type AS "SourceType", wo.source_id AS "SourceId",
        wo.assigned_to AS "AssignedTo", p.full_name AS "AssignedToName",
        wo.priority AS "Priority", wo.status AS "Status",
        wo.created_at AS "CreatedAt", wo.completed_at AS "CompletedAt"
        """;

    private const string FromClause = """
        FROM work_orders wo
        JOIN sites s ON s.id = wo.site_id
        LEFT JOIN personnel p ON p.id = wo.assigned_to
        """;

    public async Task<IEnumerable<WorkOrderDetail>> GetAsync(int? siteId, string? status)
    {
        var sql = $"""
            SELECT {SelectColumns}
            {FromClause}
            WHERE (@SiteId::int IS NULL OR wo.site_id = @SiteId)
              AND (@Status::text IS NULL OR wo.status = @Status)
            ORDER BY wo.created_at DESC
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<WorkOrderDetail>(sql, new { SiteId = siteId, Status = status });
    }

    public async Task<WorkOrderDetail?> GetByIdAsync(int id)
    {
        var sql = $"""
            SELECT {SelectColumns}
            {FromClause}
            WHERE wo.id = @Id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<WorkOrderDetail>(sql, new { Id = id });
    }

    public async Task<int> AddAsync(WorkOrder workOrder)
    {
        const string sql = """
            INSERT INTO work_orders
                (site_id, title, description, source_type, source_id, assigned_to, priority, status, created_at)
            VALUES
                (@SiteId, @Title, @Description, @SourceType, @SourceId, @AssignedTo, @Priority, @Status, @CreatedAt)
            RETURNING id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, workOrder);
    }

    public async Task<bool> UpdateStatusAsync(int id, string status, DateTime? completedAt)
    {
        const string sql = """
            UPDATE work_orders
            SET status = @Status, completed_at = @CompletedAt
            WHERE id = @Id
            """;

        using var connection = _connectionFactory.CreateConnection();
        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id, Status = status, CompletedAt = completedAt });
        return rowsAffected > 0;
    }

    public async Task<bool> UpdateAssignmentAsync(int id, int? assignedTo)
    {
        const string sql = """
            UPDATE work_orders
            SET assigned_to = @AssignedTo
            WHERE id = @Id
            """;

        using var connection = _connectionFactory.CreateConnection();
        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id, AssignedTo = assignedTo });
        return rowsAffected > 0;
    }

    public async Task<bool> ExistsOpenForSourceAsync(string sourceType, int sourceId)
    {
        const string sql = """
            SELECT EXISTS(
                SELECT 1 FROM work_orders
                WHERE source_type = @SourceType AND source_id = @SourceId
                  AND status NOT IN ('completed', 'cancelled')
            )
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<bool>(sql, new { SourceType = sourceType, SourceId = sourceId });
    }
}
