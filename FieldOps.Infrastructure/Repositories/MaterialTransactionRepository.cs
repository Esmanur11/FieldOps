using Dapper;
using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Infrastructure.Repositories;

public class MaterialTransactionRepository : IMaterialTransactionRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public MaterialTransactionRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    private const string SelectColumns = """
        id AS "Id", site_id AS "SiteId", material_id AS "MaterialId",
        transaction_type AS "TransactionType", quantity AS "Quantity",
        work_order_id AS "WorkOrderId", performed_by AS "PerformedBy",
        transaction_date AS "TransactionDate"
        """;

    public async Task<IEnumerable<MaterialTransaction>> GetAsync(int? siteId, int? materialId)
    {
        var sql = $"""
            SELECT {SelectColumns}
            FROM material_transactions
            WHERE (@SiteId::int IS NULL OR site_id = @SiteId)
              AND (@MaterialId::int IS NULL OR material_id = @MaterialId)
            ORDER BY transaction_date DESC
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<MaterialTransaction>(sql, new { SiteId = siteId, MaterialId = materialId });
    }
}