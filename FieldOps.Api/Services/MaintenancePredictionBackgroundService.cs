using FieldOps.Application.Maintenance;

namespace FieldOps.Api.Services;

public class MaintenancePredictionBackgroundService : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromHours(6);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<MaintenancePredictionBackgroundService> _logger;

    public MaintenancePredictionBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<MaintenancePredictionBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var predictiveMaintenanceService = scope.ServiceProvider.GetRequiredService<PredictiveMaintenanceService>();
                var results = await predictiveMaintenanceService.RecalculateAllActiveMachinesAsync();
                _logger.LogInformation("Bakım tahminleri yeniden hesaplandı: {Count} aktif makine.", results.Count());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Bakım tahmini yeniden hesaplaması başarısız oldu.");
            }

            try
            {
                await Task.Delay(Interval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }
    }
}
