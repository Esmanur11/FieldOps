namespace FieldOps.Domain.Entities;

public class ShiftAssignment
{
    public int Id { get; set; }
    public int ShiftId { get; set; }
    public int PersonnelId { get; set; }
    public DateOnly WorkDate { get; set; }
    public DateTime? CheckIn { get; set; }
    public DateTime? CheckOut { get; set; }
    public string Status { get; set; } = "scheduled";
}
