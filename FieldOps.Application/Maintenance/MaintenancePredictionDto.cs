namespace FieldOps.Application.Maintenance;

public class MaintenancePredictionDto
{
    public int Id { get; set; }
    public int MachineId { get; set; }
    public DateOnly PredictedDate { get; set; }
    public decimal RiskScore { get; set; }
    public string? Basis { get; set; }
    public DateTime GeneratedAt { get; set; }
}
