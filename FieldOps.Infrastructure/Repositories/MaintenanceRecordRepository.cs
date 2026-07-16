using Dapper;
using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Infrastructure.Repositories;

public class MaintenanceRecordRepository : IMaintenanceRecordRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public MaintenanceRecordRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    private const string SelectColumns = """
        id AS "Id", machine_id AS "MachineId", maintenance_date AS "MaintenanceDate",
        type AS "Type", description AS "Description", cost AS "Cost", performed_by AS "PerformedBy"
        """;

    public async Task<IEnumerable<MaintenanceRecord>> GetAllAsync()
    {
        var sql = $"""
            SELECT {SelectColumns}
            FROM maintenance_records
            ORDER BY maintenance_date DESC
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<MaintenanceRecord>(sql);
    }

    public async Task<IEnumerable<MaintenanceRecord>> GetByMachineIdAsync(int machineId)
    {
        var sql = $"""
            SELECT {SelectColumns}
            FROM maintenance_records
            WHERE machine_id = @MachineId
            ORDER BY maintenance_date
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<MaintenanceRecord>(sql, new { MachineId = machineId });
    }

    public async Task<int> AddAsync(MaintenanceRecord record)
    {
        const string sql = """
            INSERT INTO maintenance_records (machine_id, maintenance_date, type, description, cost, performed_by)
            VALUES (@MachineId, @MaintenanceDate, @Type, @Description, @Cost, @PerformedBy)
            RETURNING id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, record);
    }
}
