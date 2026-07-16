using FieldOps.Domain.Entities;

namespace FieldOps.Domain.Interfaces;

public interface INotificationRepository
{
    Task<IEnumerable<Notification>> GetAllAsync();
    Task<int> GetUnreadCountAsync();
    Task<int> AddAsync(Notification notification);
    Task<bool> MarkAsReadAsync(int id);
    Task MarkAllAsReadAsync();

    // is_read = false counts as "active" for dedup, mirroring how WorkOrder treats
    // status NOT IN (completed, cancelled) as "open" for the same purpose.
    Task<bool> ExistsUnreadForSourceAsync(string relatedEntityType, int relatedEntityId);
}
