namespace FieldOps.Domain.Entities;

public class WorkOrderDetail
{
    public int Id { get; set; }
    public int SiteId { get; set; }
    public string SiteName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? SourceType { get; set; }
    public int? SourceId { get; set; }
    public int? AssignedTo { get; set; }
    public string? AssignedToName { get; set; }
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}
