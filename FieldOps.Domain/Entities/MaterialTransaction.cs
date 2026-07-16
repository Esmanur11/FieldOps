namespace FieldOps.Domain.Entities;

public class MaterialTransaction
{
    public int Id { get; set; }
    public int SiteId { get; set; }
    public int MaterialId { get; set; }
    public string TransactionType { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public int? WorkOrderId { get; set; }
    public int PerformedBy { get; set; }
    public DateTime TransactionDate { get; set; }
}