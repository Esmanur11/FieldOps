namespace FieldOps.Domain.Entities;

public class MachineUsageLog
{
    public int Id { get; set; }
    public int MachineId { get; set; }
    public DateOnly LogDate { get; set; }
    public decimal HoursUsed { get; set; }
    public decimal? FuelConsumed { get; set; }
    public int OperatorId { get; set; }
}
