namespace FieldOps.Domain.Entities;

public class Notification
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? RelatedEntityType { get; set; }
    public int? RelatedEntityId { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }

    // Null means a broadcast notification (visible to everyone) — the only kind that exists
    // today since there's a single admin user; per-recipient targeting can build on this once
    // user management lands.
    public int? RecipientId { get; set; }
}
