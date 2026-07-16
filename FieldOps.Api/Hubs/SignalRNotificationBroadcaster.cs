using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace FieldOps.Api.Hubs;

public class SignalRNotificationBroadcaster : INotificationBroadcaster
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public SignalRNotificationBroadcaster(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task BroadcastAsync(Notification notification)
    {
        await _hubContext.Clients.All.SendAsync("ReceiveNotification", new
        {
            id = notification.Id,
            type = notification.Type,
            relatedEntityType = notification.RelatedEntityType,
            relatedEntityId = notification.RelatedEntityId,
            message = notification.Message,
            severity = notification.Severity,
            isRead = notification.IsRead,
            createdAt = notification.CreatedAt
        });
    }
}
