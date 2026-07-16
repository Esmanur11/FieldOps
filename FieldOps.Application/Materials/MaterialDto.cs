namespace FieldOps.Application.Materials;

public class MaterialDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal? UnitCost { get; set; }
}