namespace FieldOps.Application.Maintenance;

public class CreateMaintenanceRecordRequest
{
    public int MachineId { get; set; }
    public DateOnly MaintenanceDate { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal? Cost { get; set; }
    public string PerformedBy { get; set; } = string.Empty;
}
