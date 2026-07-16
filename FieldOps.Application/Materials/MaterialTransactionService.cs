using FieldOps.Application.WorkOrders;
using FieldOps.Domain.Entities;
using FieldOps.Domain.Exceptions;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Application.Materials;

public class MaterialTransactionService
{
    private readonly IMaterialStockRepository _stockRepository;
    private readonly IMaterialTransactionRepository _transactionRepository;
    private readonly WorkOrderService _workOrderService;

    public MaterialTransactionService(
        IMaterialStockRepository stockRepository,
        IMaterialTransactionRepository transactionRepository,
        WorkOrderService workOrderService)
    {
        _stockRepository = stockRepository;
        _transactionRepository = transactionRepository;
        _workOrderService = workOrderService;
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
            await AutoCreateWorkOrderIfLowStockAsync(request.SiteId, request.MaterialId);
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

    // Re-reads the post-transaction stock level (rather than threading it through
    // RecordTransactionAsync's return value) to keep that method's concurrency-critical locking
    // logic focused on the stock update itself.
    private async Task AutoCreateWorkOrderIfLowStockAsync(int siteId, int materialId)
    {
        var stocks = await _stockRepository.GetDetailedAsync(siteId);
        var stock = stocks.FirstOrDefault(s => s.MaterialId == materialId);
        if (stock is null || stock.Quantity > stock.ReorderThreshold)
        {
            return;
        }

        await _workOrderService.AutoCreateAsync(
            siteId,
            $"Düşük stok: {stock.MaterialName}",
            $"Mevcut: {stock.Quantity} {stock.Unit}, eşik: {stock.ReorderThreshold} {stock.Unit}. Şantiye: {stock.SiteName}.",
            "low_stock",
            stock.Id);
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
