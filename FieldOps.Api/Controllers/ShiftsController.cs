using FieldOps.Application.Shifts;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FieldOps.Api.Controllers;

[ApiController]
[Route("api/shifts")]
[Authorize]
public class ShiftsController : ControllerBase
{
    private readonly ShiftService _shiftService;
    private readonly IValidator<CreateShiftRequest> _validator;

    public ShiftsController(ShiftService shiftService, IValidator<CreateShiftRequest> validator)
    {
        _shiftService = shiftService;
        _validator = validator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ShiftDto>>> GetAll([FromQuery] int? siteId)
    {
        var shifts = await _shiftService.GetAsync(siteId);
        return Ok(shifts);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ShiftDto>> GetById(int id)
    {
        var shift = await _shiftService.GetByIdAsync(id);
        return shift is null ? NotFound() : Ok(shift);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateShiftRequest request)
    {
        var validationResult = await _validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.ToDictionary());
        }

        var id = await _shiftService.CreateAsync(request);
        var created = await _shiftService.GetByIdAsync(id);
        return CreatedAtAction(nameof(GetById), new { id }, created);
    }
}
