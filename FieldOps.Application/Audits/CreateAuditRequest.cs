namespace FieldOps.Application.Audits;

public class CreateAuditRequest
{
    public int SiteId { get; set; }
    public int InspectorId { get; set; }
    public DateOnly AuditDate { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = "completed";
}
