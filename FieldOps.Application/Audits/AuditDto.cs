namespace FieldOps.Application.Audits;

public class AuditDto
{
    public int Id { get; set; }
    public int SiteId { get; set; }
    public string SiteName { get; set; } = string.Empty;
    public int InspectorId { get; set; }
    public string InspectorName { get; set; } = string.Empty;
    public DateOnly AuditDate { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}
