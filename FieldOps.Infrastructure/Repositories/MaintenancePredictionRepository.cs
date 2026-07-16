using Dapper;
using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Infrastructure.Repositories;

public class MaintenancePredictionRepository : IMaintenancePredictionRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public MaintenancePredictionRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    private const string SelectColumns = """
        id AS "Id", machine_id AS "MachineId", predicted_date AS "PredictedDate",
        risk_score AS "RiskScore", basis AS "Basis", generated_at AS "GeneratedAt"
        """;

    public async Task<IEnumerable<MaintenancePrediction>> GetLatestAsync(int? machineId)
    {
        var sql = $"""
            SELECT DISTINCT ON (machine_id) {SelectColumns}
            FROM maintenance_predictions
            WHERE (@MachineId::int IS NULL OR machine_id = @MachineId)
            ORDER BY machine_id, generated_at DESC
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<MaintenancePrediction>(sql, new { MachineId = machineId });
    }

    public async Task<int> AddAsync(MaintenancePrediction prediction)
    {
        const string sql = """
            INSERT INTO maintenance_predictions (machine_id, predicted_date, risk_score, basis, generated_at)
            VALUES (@MachineId, @PredictedDate, @RiskScore, @Basis, @GeneratedAt)
            RETURNING id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, prediction);
    }
}
