using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Application.Materials;

public class MaterialStockService
{
    private readonly IMaterialStockRepository _repository;

    public MaterialStockService(IMaterialStockRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<MaterialStockDto>> GetAsync(int? siteId)
    {
        var stocks = await _repository.GetDetailedAsync(siteId);
        return stocks.Select(ToDto);
    }

    private static MaterialStockDto ToDto(MaterialStockDetail stock) => new()
    {
        Id = stock.Id,
        SiteId = stock.SiteId,
        SiteName = stock.SiteName,
        MaterialId = stock.MaterialId,
        MaterialName = stock.MaterialName,
        Unit = stock.Unit,
        Quantity = stock.Quantity,
        ReorderThreshold = stock.ReorderThreshold,
        UpdatedAt = stock.UpdatedAt,
        IsLowStock = stock.Quantity <= stock.ReorderThreshold
    };
}