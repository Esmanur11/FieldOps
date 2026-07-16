namespace FieldOps.Application.Materials;

public class CreateMaterialRequest
{
    public string Name { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal? UnitCost { get; set; }
}