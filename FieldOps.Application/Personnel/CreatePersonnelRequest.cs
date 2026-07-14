namespace FieldOps.Application.Personnel;

public class CreatePersonnelRequest
{
    public int SiteId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public DateOnly HireDate { get; set; }
    public string Status { get; set; } = "active";
}
