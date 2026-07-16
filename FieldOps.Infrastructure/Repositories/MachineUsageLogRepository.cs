using Dapper;
using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Infrastructure.Repositories;

public class MachineUsageLogRepository : IMachineUsageLogRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public MachineUsageLogRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    private const string SelectColumns = """
        id AS "Id", machine_id AS "MachineId", log_date AS "LogDate",
        hours_used AS "HoursUsed", fuel_consumed AS "FuelConsumed", operator_id AS "OperatorId"
        """;

    public async Task<IEnumerable<MachineUsageLog>> GetAllAsync()
    {
        var sql = $"""
            SELECT {SelectColumns}
            FROM machine_usage_logs
            ORDER BY log_date DESC
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<MachineUsageLog>(sql);
    }

    public async Task<IEnumerable<MachineUsageLog>> GetByMachineIdAsync(int machineId)
    {
        var sql = $"""
            SELECT {SelectColumns}
            FROM machine_usage_logs
            WHERE machine_id = @MachineId
            ORDER BY log_date
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<MachineUsageLog>(sql, new { MachineId = machineId });
    }

    public async Task<int> AddAsync(MachineUsageLog log)
    {
        const string sql = """
            INSERT INTO machine_usage_logs (machine_id, log_date, hours_used, fuel_consumed, operator_id)
            VALUES (@MachineId, @LogDate, @HoursUsed, @FuelConsumed, @OperatorId)
            RETURNING id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, log);
    }
}
