using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace FieldOps.Api.Hubs;

// Clients only listen for server-pushed events (see SignalRNotificationBroadcaster); there are
// no client-invokable methods yet.
[Authorize]
public class NotificationHub : Hub
{
}
