namespace FieldOps.Application.Sites;

public class CreateSiteRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Location { get; set; }
    public DateOnly StartDate { get; set; }
    public string Status { get; set; } = "active";
}
