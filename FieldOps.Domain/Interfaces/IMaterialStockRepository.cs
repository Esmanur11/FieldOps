using FieldOps.Domain.Entities;

namespace FieldOps.Domain.Interfaces;

public interface IMaterialStockRepository
{
    Task<IEnumerable<MaterialStockDetail>> GetDetailedAsync(int? siteId);

    // Row-locks material_stocks (FOR UPDATE) and applies the delta atomically so concurrent
    // "out" transactions can never drive quantity negative; throws InsufficientStockException.
    Task<MaterialTransaction> RecordTransactionAsync(MaterialTransaction transaction);
}