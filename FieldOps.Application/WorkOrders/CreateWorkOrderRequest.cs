namespace FieldOps.Application.WorkOrders;

public class CreateWorkOrderRequest
{
    public int SiteId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Priority { get; set; } = "medium";
    public int? AssignedTo { get; set; }
}
