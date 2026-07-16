namespace FieldOps.Domain.Entities;

public class TopRiskMachine
{
    public int MachineId { get; set; }
    public string MachineName { get; set; } = string.Empty;
    public int SiteId { get; set; }
    public string SiteName { get; set; } = string.Empty;
    public decimal RiskScore { get; set; }
    public DateOnly PredictedDate { get; set; }
}
