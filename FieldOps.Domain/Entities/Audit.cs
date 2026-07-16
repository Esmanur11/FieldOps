namespace FieldOps.Domain.Entities;

public class Audit
{
    public int Id { get; set; }
    public int SiteId { get; set; }
    public int InspectorId { get; set; }
    public DateOnly AuditDate { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = "completed";
}
