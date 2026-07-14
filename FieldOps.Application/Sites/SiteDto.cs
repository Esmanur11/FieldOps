namespace FieldOps.Application.Sites;

public class SiteDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Location { get; set; }
    public DateOnly StartDate { get; set; }
    public string Status { get; set; } = string.Empty;
}
