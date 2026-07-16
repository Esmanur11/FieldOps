namespace FieldOps.Application.Audits;

public class CreateAuditFindingRequest
{
    public int AuditId { get; set; }
    public string? Category { get; set; }
    public string Severity { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? CorrectiveAction { get; set; }
    public DateOnly? DueDate { get; set; }
}
