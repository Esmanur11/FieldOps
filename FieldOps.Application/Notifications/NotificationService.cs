using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Application.Notifications;

public class NotificationService
{
    private readonly INotificationRepository _repository;
    private readonly INotificationBroadcaster _broadcaster;

    public NotificationService(INotificationRepository repository, INotificationBroadcaster broadcaster)
    {
        _repository = repository;
        _broadcaster = broadcaster;
    }

    public async Task<NotificationsResponse> GetAsync()
    {
        var notifications = await _repository.GetAllAsync();
        var unreadCount = await _repository.GetUnreadCountAsync();

        return new NotificationsResponse
        {
            Notifications = notifications.Select(ToDto).ToList(),
            UnreadCount = unreadCount
        };
    }

    public async Task<bool> MarkAsReadAsync(int id)
    {
        return await _repository.MarkAsReadAsync(id);
    }

    public async Task MarkAllAsReadAsync()
    {
        await _repository.MarkAllAsReadAsync();
    }

    // Called by AuditFindingService / PredictiveMaintenanceService / MaterialTransactionService
    // right alongside WorkOrderService.AutoCreateAsync, for the same three triggers, so one
    // event produces both. Skips creation (and the broadcast) if an unread notification already
    // exists for this source.
    public async Task CreateAsync(
        string type, string relatedEntityType, int relatedEntityId, string message, string severity)
    {
        if (await _repository.ExistsUnreadForSourceAsync(relatedEntityType, relatedEntityId))
        {
            return;
        }

        var notification = new Notification
        {
            Type = type,
            RelatedEntityType = relatedEntityType,
            RelatedEntityId = relatedEntityId,
            Message = message,
            Severity = severity,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        var id = await _repository.AddAsync(notification);
        notification.Id = id;

        await _broadcaster.BroadcastAsync(notification);
    }

    private static NotificationDto ToDto(Notification notification) => new()
    {
        Id = notification.Id,
        Type = notification.Type,
        RelatedEntityType = notification.RelatedEntityType,
        RelatedEntityId = notification.RelatedEntityId,
        Message = notification.Message,
        Severity = notification.Severity,
        IsRead = notification.IsRead,
        CreatedAt = notification.CreatedAt,
        RecipientId = notification.RecipientId
    };
}
