namespace FieldOps.Domain.Entities;

public class MaterialStock
{
    public int Id { get; set; }
    public int SiteId { get; set; }
    public int MaterialId { get; set; }
    public decimal Quantity { get; set; }
    public decimal ReorderThreshold { get; set; }
    public DateTime UpdatedAt { get; set; }
}