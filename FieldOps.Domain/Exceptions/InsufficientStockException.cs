namespace FieldOps.Domain.Exceptions;

public class InsufficientStockException : Exception
{
    public decimal AvailableQuantity { get; }
    public decimal RequestedQuantity { get; }

    public InsufficientStockException(decimal availableQuantity, decimal requestedQuantity)
        : base($"Insufficient stock: available {availableQuantity}, requested {requestedQuantity}")
    {
        AvailableQuantity = availableQuantity;
        RequestedQuantity = requestedQuantity;
    }
}