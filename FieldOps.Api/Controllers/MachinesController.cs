using FieldOps.Application.Machines;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace FieldOps.Api.Controllers;

[ApiController]
[Route("api/machines")]
public class MachinesController : ControllerBase
{
    private readonly MachineService _machineService;
    private readonly IValidator<CreateMachineRequest> _validator;

    public MachinesController(MachineService machineService, IValidator<CreateMachineRequest> validator)
    {
        _machineService = machineService;
        _validator = validator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MachineDto>>> GetAll([FromQuery] int? siteId)
    {
        var machines = siteId.HasValue
            ? await _machineService.GetBySiteIdAsync(siteId.Value)
            : await _machineService.GetAllAsync();

        return Ok(machines);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<MachineDto>> GetById(int id)
    {
        var machine = await _machineService.GetByIdAsync(id);
        return machine is null ? NotFound() : Ok(machine);
    }

    [HttpPost]
    public async Task<ActionResult<MachineDto>> Create(CreateMachineRequest request)
    {
        var validationResult = await _validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.ToDictionary());
        }

        var id = await _machineService.CreateAsync(request);
        var created = await _machineService.GetByIdAsync(id);
        return CreatedAtAction(nameof(GetById), new { id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, CreateMachineRequest request)
    {
        var validationResult = await _validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.ToDictionary());
        }

        var updated = await _machineService.UpdateAsync(id, request);
        return updated ? NoContent() : NotFound();
    }
}
