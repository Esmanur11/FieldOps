namespace FieldOps.Domain.Entities;

public class UserDetail
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int? PersonnelId { get; set; }
    public string? PersonnelName { get; set; }
}
