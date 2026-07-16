namespace FieldOps.Application.Materials;

public class MaterialTransactionResult
{
    public MaterialTransactionDto? Transaction { get; init; }
    public string? ErrorMessage { get; init; }
    public bool Success => ErrorMessage is null;
}