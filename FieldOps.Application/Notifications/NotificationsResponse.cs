namespace FieldOps.Application.Notifications;

public class NotificationsResponse
{
    public List<NotificationDto> Notifications { get; set; } = [];
    public int UnreadCount { get; set; }
}
