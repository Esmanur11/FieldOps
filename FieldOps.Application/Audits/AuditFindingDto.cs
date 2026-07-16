namespace FieldOps.Application.Audits;

public class AuditFindingDto
{
    public int Id { get; set; }
    public int AuditId { get; set; }
    public string? Category { get; set; }
    public string Severity { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? CorrectiveAction { get; set; }
    public DateOnly? DueDate { get; set; }
    public string Status { get; set; } = string.Empty;
}
