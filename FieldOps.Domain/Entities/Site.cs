namespace FieldOps.Domain.Entities;

public class Site
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Location { get; set; }
    public DateOnly StartDate { get; set; }
    public string Status { get; set; } = "active";
}
