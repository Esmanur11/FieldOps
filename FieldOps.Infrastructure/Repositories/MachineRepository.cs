using Dapper;
using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Infrastructure.Repositories;

public class MachineRepository : IMachineRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public MachineRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    private const string SelectColumns = """
        id AS "Id", site_id AS "SiteId", name AS "Name", type AS "Type",
        serial_number AS "SerialNumber", purchase_date AS "PurchaseDate", status AS "Status"
        """;

    public async Task<IEnumerable<Machine>> GetAllAsync()
    {
        var sql = $"""
            SELECT {SelectColumns}
            FROM machines
            ORDER BY id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Machine>(sql);
    }

    public async Task<IEnumerable<Machine>> GetBySiteIdAsync(int siteId)
    {
        var sql = $"""
            SELECT {SelectColumns}
            FROM machines
            WHERE site_id = @SiteId
            ORDER BY id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Machine>(sql, new { SiteId = siteId });
    }

    public async Task<Machine?> GetByIdAsync(int id)
    {
        var sql = $"""
            SELECT {SelectColumns}
            FROM machines
            WHERE id = @Id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<Machine>(sql, new { Id = id });
    }

    public async Task<int> AddAsync(Machine machine)
    {
        const string sql = """
            INSERT INTO machines (site_id, name, type, serial_number, purchase_date, status)
            VALUES (@SiteId, @Name, @Type, @SerialNumber, @PurchaseDate, @Status)
            RETURNING id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, machine);
    }

    public async Task UpdateAsync(Machine machine)
    {
        const string sql = """
            UPDATE machines
            SET site_id = @SiteId, name = @Name, type = @Type,
                serial_number = @SerialNumber, purchase_date = @PurchaseDate, status = @Status
            WHERE id = @Id
            """;

        using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync(sql, machine);
    }
}
