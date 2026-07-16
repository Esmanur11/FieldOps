namespace FieldOps.Application.Shifts;

public class CreateShiftRequest
{
    public int SiteId { get; set; }
    public string Name { get; set; } = string.Empty;
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
}
