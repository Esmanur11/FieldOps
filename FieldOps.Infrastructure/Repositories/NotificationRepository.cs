using Dapper;
using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Infrastructure.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public NotificationRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    private const string SelectColumns = """
        id AS "Id", type AS "Type", related_entity_type AS "RelatedEntityType",
        related_entity_id AS "RelatedEntityId", message AS "Message", severity AS "Severity",
        is_read AS "IsRead", created_at AS "CreatedAt", recipient_id AS "RecipientId"
        """;

    public async Task<IEnumerable<Notification>> GetAllAsync()
    {
        var sql = $"""
            SELECT {SelectColumns}
            FROM notifications
            ORDER BY created_at DESC
            LIMIT 50
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Notification>(sql);
    }

    public async Task<int> GetUnreadCountAsync()
    {
        const string sql = "SELECT COUNT(*) FROM notifications WHERE is_read = false";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql);
    }

    public async Task<int> AddAsync(Notification notification)
    {
        const string sql = """
            INSERT INTO notifications
                (type, related_entity_type, related_entity_id, message, severity, is_read, created_at, recipient_id)
            VALUES
                (@Type, @RelatedEntityType, @RelatedEntityId, @Message, @Severity, @IsRead, @CreatedAt, @RecipientId)
            RETURNING id
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, notification);
    }

    public async Task<bool> MarkAsReadAsync(int id)
    {
        const string sql = "UPDATE notifications SET is_read = true WHERE id = @Id";

        using var connection = _connectionFactory.CreateConnection();
        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
        return rowsAffected > 0;
    }

    public async Task MarkAllAsReadAsync()
    {
        const string sql = "UPDATE notifications SET is_read = true WHERE is_read = false";

        using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync(sql);
    }

    public async Task<bool> ExistsUnreadForSourceAsync(string relatedEntityType, int relatedEntityId)
    {
        const string sql = """
            SELECT EXISTS(
                SELECT 1 FROM notifications
                WHERE related_entity_type = @RelatedEntityType AND related_entity_id = @RelatedEntityId
                  AND is_read = false
            )
            """;

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<bool>(
            sql, new { RelatedEntityType = relatedEntityType, RelatedEntityId = relatedEntityId });
    }
}
