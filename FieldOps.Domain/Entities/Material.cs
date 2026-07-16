namespace FieldOps.Domain.Entities;

public class Material
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal? UnitCost { get; set; }
}