using Dapper;
using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Infrastructure.Repositories;

public class AuditFindingRepository : IAuditFindingRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public AuditFindingRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    private const string SelectColumns = """
        id AS "Id", audit_id AS "AuditId", category AS "Category", severity AS "Severity",
        description AS "Description", corrective_action AS "CorrectiveAction",
        due_date AS "DueDate", status AS "Status"
        """;

    public async Task<IEnumerable<AuditFinding>> GetAllAsync()
    {
        var sql = $"""
            SELECT {SelectColumns}
            FROM audit_findings
            ORDER BY id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<AuditFinding>(sql);
    }

    public async Task<IEnumerable<AuditFinding>> GetByAuditIdAsync(int auditId)
    {
        var sql = $"""
            SELECT {SelectColumns}
            FROM audit_findings
            WHERE audit_id = @AuditId
            ORDER BY id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<AuditFinding>(sql, new { AuditId = auditId });
    }

    public async Task<int> AddAsync(AuditFinding finding)
    {
        const string sql = """
            INSERT INTO audit_findings (audit_id, category, severity, description, corrective_action, due_date, status)
            VALUES (@AuditId, @Category, @Severity, @Description, @CorrectiveAction, @DueDate, @Status)
            RETURNING id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, finding);
    }

    public async Task<int> UpdateAsync(AuditFinding finding)
    {
        const string sql = """
            UPDATE audit_findings
            SET category = @Category, severity = @Severity, description = @Description,
                corrective_action = @CorrectiveAction, due_date = @DueDate, status = @Status
            WHERE id = @Id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteAsync(sql, finding);
    }
}
