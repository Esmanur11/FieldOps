namespace FieldOps.Application.Shifts;

public class CreateShiftAssignmentRequest
{
    public int ShiftId { get; set; }
    public int PersonnelId { get; set; }
    public DateOnly WorkDate { get; set; }
}
