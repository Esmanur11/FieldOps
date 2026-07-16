using FieldOps.Application.Maintenance;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FieldOps.Api.Controllers;

[ApiController]
[Route("api/machine-usage-logs")]
[Authorize]
public class MachineUsageLogsController : ControllerBase
{
    private readonly MachineUsageLogService _service;
    private readonly IValidator<CreateMachineUsageLogRequest> _validator;

    public MachineUsageLogsController(MachineUsageLogService service, IValidator<CreateMachineUsageLogRequest> validator)
    {
        _service = service;
        _validator = validator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MachineUsageLogDto>>> GetAll([FromQuery] int? machineId)
    {
        var logs = await _service.GetAsync(machineId);
        return Ok(logs);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateMachineUsageLogRequest request)
    {
        var validationResult = await _validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.ToDictionary());
        }

        var id = await _service.CreateAsync(request);
        return Created(string.Empty, new { id });
    }
}
