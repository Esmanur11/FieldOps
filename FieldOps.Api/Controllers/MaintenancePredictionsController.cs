using FieldOps.Application.Maintenance;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FieldOps.Api.Controllers;

[ApiController]
[Route("api/maintenance-predictions")]
[Authorize]
public class MaintenancePredictionsController : ControllerBase
{
    private readonly PredictiveMaintenanceService _service;

    public MaintenancePredictionsController(PredictiveMaintenanceService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MaintenancePredictionDto>>> GetLatest([FromQuery] int? machineId)
    {
        var predictions = await _service.GetLatestAsync(machineId);
        return Ok(predictions);
    }

    [HttpGet("top-risk")]
    public async Task<ActionResult<IEnumerable<TopRiskMachineDto>>> GetTopRisk([FromQuery] int limit = 5)
    {
        var machines = await _service.GetTopRiskAsync(limit);
        return Ok(machines);
    }

    [HttpPost("recalculate")]
    public async Task<IActionResult> Recalculate([FromQuery] int? machineId)
    {
        if (machineId.HasValue)
        {
            var prediction = await _service.RecalculateForMachineAsync(machineId.Value);
            return prediction is null ? NotFound() : Ok(prediction);
        }

        var predictions = await _service.RecalculateAllActiveMachinesAsync();
        return Ok(predictions);
    }
}
