namespace FieldOps.Domain.Entities;

public class MaterialStockDetail
{
    public int Id { get; set; }
    public int SiteId { get; set; }
    public string SiteName { get; set; } = string.Empty;
    public int MaterialId { get; set; }
    public string MaterialName { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal ReorderThreshold { get; set; }
    public DateTime UpdatedAt { get; set; }
}