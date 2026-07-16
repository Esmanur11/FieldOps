using FieldOps.Application.Maintenance;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FieldOps.Api.Controllers;

[ApiController]
[Route("api/maintenance-records")]
[Authorize]
public class MaintenanceRecordsController : ControllerBase
{
    private readonly MaintenanceRecordService _service;
    private readonly IValidator<CreateMaintenanceRecordRequest> _validator;

    public MaintenanceRecordsController(MaintenanceRecordService service, IValidator<CreateMaintenanceRecordRequest> validator)
    {
        _service = service;
        _validator = validator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MaintenanceRecordDto>>> GetAll([FromQuery] int? machineId)
    {
        var records = await _service.GetAsync(machineId);
        return Ok(records);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateMaintenanceRecordRequest request)
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
