using FieldOps.Domain.Entities;
using FieldOps.Domain.Exceptions;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Application.Materials;

public class MaterialTransactionService
{
    private readonly IMaterialStockRepository _stockRepository;
    private readonly IMaterialTransactionRepository _transactionRepository;

    public MaterialTransactionService(
        IMaterialStockRepository stockRepository,
        IMaterialTransactionRepository transactionRepository)
    {
        _stockRepository = stockRepository;
        _transactionRepository = transactionRepository;
    }

    public async Task<MaterialTransactionResult> CreateAsync(CreateMaterialTransactionRequest request)
    {
        var transaction = new MaterialTransaction
        {
            SiteId = request.SiteId,
            MaterialId = request.MaterialId,
            TransactionType = request.TransactionType,
            Quantity = request.Quantity,
            PerformedBy = request.PerformedBy
        };

        try
        {
            var recorded = await _stockRepository.RecordTransactionAsync(transaction);
            return new MaterialTransactionResult { Transaction = ToDto(recorded) };
        }
        catch (InsufficientStockException ex)
        {
            return new MaterialTransactionResult
            {
                ErrorMessage = $"Yetersiz stok: mevcut {ex.AvailableQuantity}, istenen {ex.RequestedQuantity}"
            };
        }
    }

    public async Task<IEnumerable<MaterialTransactionDto>> GetAsync(int? siteId, int? materialId)
    {
        var transactions = await _transactionRepository.GetAsync(siteId, materialId);
        return transactions.Select(ToDto);
    }

    private static MaterialTransactionDto ToDto(MaterialTransaction transaction) => new()
    {
        Id = transaction.Id,
        SiteId = transaction.SiteId,
        MaterialId = transaction.MaterialId,
        TransactionType = transaction.TransactionType,
        Quantity = transaction.Quantity,
        WorkOrderId = transaction.WorkOrderId,
        PerformedBy = transaction.PerformedBy,
        TransactionDate = transaction.TransactionDate
    };
}