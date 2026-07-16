using FieldOps.Domain.Entities;

namespace FieldOps.Domain.Interfaces;

// Abstracts the SignalR hub away from Application: NotificationHub lives in FieldOps.Api
// (a hosting concern), so Application can't reference it directly without inverting the
// dependency rule — this interface is the seam, implemented in FieldOps.Api and wired via DI.
public interface INotificationBroadcaster
{
    Task BroadcastAsync(Notification notification);
}
