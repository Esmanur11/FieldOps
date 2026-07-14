namespace FieldOps.Domain.Entities;

public class Machine
{
    public int Id { get; set; }
    public int SiteId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? SerialNumber { get; set; }
    public DateOnly? PurchaseDate { get; set; }
    public string Status { get; set; } = "active";
}
