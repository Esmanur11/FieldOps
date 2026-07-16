using Dapper;
using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Infrastructure.Repositories;

public class ShiftAssignmentRepository : IShiftAssignmentRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public ShiftAssignmentRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    private const string SelectColumns = """
        sa.id AS "Id", sa.shift_id AS "ShiftId", sh.name AS "ShiftName",
        sh.site_id AS "SiteId", s.name AS "SiteName",
        sa.personnel_id AS "PersonnelId", p.full_name AS "PersonnelName",
        sa.work_date AS "WorkDate", sa.check_in AS "CheckIn", sa.check_out AS "CheckOut",
        sa.status AS "Status"
        """;

    private const string FromClause = """
        FROM shift_assignments sa
        JOIN shifts sh ON sh.id = sa.shift_id
        JOIN sites s ON s.id = sh.site_id
        JOIN personnel p ON p.id = sa.personnel_id
        """;

    public async Task<IEnumerable<ShiftAssignmentDetail>> GetByFiltersAsync(
        int? personnelId, int? shiftId, int? siteId, DateOnly? date)
    {
        var sql = $"""
            SELECT {SelectColumns}
            {FromClause}
            WHERE (@PersonnelId::int IS NULL OR sa.personnel_id = @PersonnelId)
              AND (@ShiftId::int IS NULL OR sa.shift_id = @ShiftId)
              AND (@SiteId::int IS NULL OR sh.site_id = @SiteId)
              AND (@Date::date IS NULL OR sa.work_date = @Date)
            ORDER BY sa.work_date DESC, sa.id DESC
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<ShiftAssignmentDetail>(
            sql, new { PersonnelId = personnelId, ShiftId = shiftId, SiteId = siteId, Date = date });
    }

    public async Task<ShiftAssignmentDetail?> GetByIdAsync(int id)
    {
        var sql = $"""
            SELECT {SelectColumns}
            {FromClause}
            WHERE sa.id = @Id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<ShiftAssignmentDetail>(sql, new { Id = id });
    }

    public async Task<int> AddAsync(ShiftAssignment assignment)
    {
        const string sql = """
            INSERT INTO shift_assignments (shift_id, personnel_id, work_date, status)
            VALUES (@ShiftId, @PersonnelId, @WorkDate, @Status)
            RETURNING id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, assignment);
    }

    public async Task<bool> UpdateCheckInAsync(int id, DateTime checkIn)
    {
        const string sql = """
            UPDATE shift_assignments
            SET check_in = @CheckIn
            WHERE id = @Id
            """;

        using var connection = _connectionFactory.CreateConnection();
        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id, CheckIn = checkIn });
        return rowsAffected > 0;
    }

    public async Task<bool> UpdateCheckOutAsync(int id, DateTime checkOut)
    {
        const string sql = """
            UPDATE shift_assignments
            SET check_out = @CheckOut, status = 'completed'
            WHERE id = @Id
            """;

        using var connection = _connectionFactory.CreateConnection();
        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id, CheckOut = checkOut });
        return rowsAffected > 0;
    }
}
