using Dapper;
using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Infrastructure.Repositories;

public class MaterialRepository : IMaterialRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public MaterialRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    private const string SelectColumns = """
        id AS "Id", name AS "Name", unit AS "Unit", unit_cost AS "UnitCost"
        """;

    public async Task<IEnumerable<Material>> GetAllAsync()
    {
        var sql = $"""
            SELECT {SelectColumns}
            FROM materials
            ORDER BY name
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Material>(sql);
    }

    public async Task<Material?> GetByIdAsync(int id)
    {
        var sql = $"""
            SELECT {SelectColumns}
            FROM materials
            WHERE id = @Id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<Material>(sql, new { Id = id });
    }

    public async Task<int> AddAsync(Material material)
    {
        const string sql = """
            INSERT INTO materials (name, unit, unit_cost)
            VALUES (@Name, @Unit, @UnitCost)
            RETURNING id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, material);
    }
}