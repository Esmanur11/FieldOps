using Dapper;
using FieldOps.Domain.Entities;
using FieldOps.Domain.Exceptions;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Infrastructure.Repositories;

public class MaterialStockRepository : IMaterialStockRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public MaterialStockRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<MaterialStockDetail>> GetDetailedAsync(int? siteId)
    {
        var sql = $"""
            SELECT
                ms.id AS "Id",
                ms.site_id AS "SiteId",
                s.name AS "SiteName",
                ms.material_id AS "MaterialId",
                m.name AS "MaterialName",
                m.unit AS "Unit",
                ms.quantity AS "Quantity",
                ms.reorder_threshold AS "ReorderThreshold",
                ms.updated_at AS "UpdatedAt"
            FROM material_stocks ms
            JOIN materials m ON m.id = ms.material_id
            JOIN sites s ON s.id = ms.site_id
            WHERE (@SiteId::int IS NULL OR ms.site_id = @SiteId)
            ORDER BY s.name, m.name
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<MaterialStockDetail>(sql, new { SiteId = siteId });
    }

    public async Task<MaterialTransaction> RecordTransactionAsync(MaterialTransaction transaction)
    {
        using var connection = _connectionFactory.CreateConnection();
        connection.Open();
        using var dbTransaction = connection.BeginTransaction();

        try
        {
            const string ensureStockRowSql = """
                INSERT INTO material_stocks (site_id, material_id, quantity, reorder_threshold, updated_at)
                VALUES (@SiteId, @MaterialId, 0, 0, now())
                ON CONFLICT (site_id, material_id) DO NOTHING
                """;

            await connection.ExecuteAsync(
                ensureStockRowSql,
                new { transaction.SiteId, transaction.MaterialId },
                dbTransaction);

            const string lockStockRowSql = """
                SELECT quantity
                FROM material_stocks
                WHERE site_id = @SiteId AND material_id = @MaterialId
                FOR UPDATE
                """;

            var currentQuantity = await connection.ExecuteScalarAsync<decimal>(
                lockStockRowSql,
                new { transaction.SiteId, transaction.MaterialId },
                dbTransaction);

            decimal newQuantity;
            if (transaction.TransactionType == "out")
            {
                if (currentQuantity < transaction.Quantity)
                {
                    throw new InsufficientStockException(currentQuantity, transaction.Quantity);
                }

                newQuantity = currentQuantity - transaction.Quantity;
            }
            else
            {
                newQuantity = currentQuantity + transaction.Quantity;
            }

            const string updateStockSql = """
                UPDATE material_stocks
                SET quantity = @NewQuantity, updated_at = now()
                WHERE site_id = @SiteId AND material_id = @MaterialId
                """;

            await connection.ExecuteAsync(
                updateStockSql,
                new { transaction.SiteId, transaction.MaterialId, NewQuantity = newQuantity },
                dbTransaction);

            const string insertTransactionSql = """
                INSERT INTO material_transactions
                    (site_id, material_id, transaction_type, quantity, work_order_id, performed_by, transaction_date)
                VALUES
                    (@SiteId, @MaterialId, @TransactionType, @Quantity, @WorkOrderId, @PerformedBy, now())
                RETURNING id AS "Id", site_id AS "SiteId", material_id AS "MaterialId",
                    transaction_type AS "TransactionType", quantity AS "Quantity",
                    work_order_id AS "WorkOrderId", performed_by AS "PerformedBy",
                    transaction_date AS "TransactionDate"
                """;

            var recorded = await connection.QuerySingleAsync<MaterialTransaction>(
                insertTransactionSql,
                transaction,
                dbTransaction);

            dbTransaction.Commit();
            return recorded;
        }
        catch
        {
            dbTransaction.Rollback();
            throw;
        }
    }
}