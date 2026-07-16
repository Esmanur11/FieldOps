namespace FieldOps.Domain.Entities;

public class ShiftAssignmentDetail
{
    public int Id { get; set; }
    public int ShiftId { get; set; }
    public string ShiftName { get; set; } = string.Empty;
    public int SiteId { get; set; }
    public string SiteName { get; set; } = string.Empty;
    public int PersonnelId { get; set; }
    public string PersonnelName { get; set; } = string.Empty;
    public DateOnly WorkDate { get; set; }
    public DateTime? CheckIn { get; set; }
    public DateTime? CheckOut { get; set; }
    public string Status { get; set; } = string.Empty;
}
