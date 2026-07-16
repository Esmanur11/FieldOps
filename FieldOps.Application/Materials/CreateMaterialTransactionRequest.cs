namespace FieldOps.Application.Materials;

public class CreateMaterialTransactionRequest
{
    public int SiteId { get; set; }
    public int MaterialId { get; set; }
    public string TransactionType { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public int PerformedBy { get; set; }
}