using FieldOps.Application.Shifts;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FieldOps.Api.Controllers;

[ApiController]
[Route("api/shift-assignments")]
[Authorize]
public class ShiftAssignmentsController : ControllerBase
{
    private readonly ShiftAssignmentService _assignmentService;
    private readonly IValidator<CreateShiftAssignmentRequest> _validator;

    public ShiftAssignmentsController(
        ShiftAssignmentService assignmentService,
        IValidator<CreateShiftAssignmentRequest> validator)
    {
        _assignmentService = assignmentService;
        _validator = validator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ShiftAssignmentDto>>> GetAll(
        [FromQuery] int? personnelId,
        [FromQuery] int? shiftId,
        [FromQuery] int? siteId,
        [FromQuery] DateOnly? date)
    {
        var assignments = await _assignmentService.GetAsync(personnelId, shiftId, siteId, date);
        return Ok(assignments);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateShiftAssignmentRequest request)
    {
        var validationResult = await _validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.ToDictionary());
        }

        var id = await _assignmentService.CreateAsync(request);
        return Created(string.Empty, new { id });
    }

    [HttpPut("{id:int}/checkin")]
    public async Task<IActionResult> CheckIn(int id)
    {
        var updated = await _assignmentService.CheckInAsync(id);
        return updated ? NoContent() : NotFound();
    }

    [HttpPut("{id:int}/checkout")]
    public async Task<IActionResult> CheckOut(int id)
    {
        var updated = await _assignmentService.CheckOutAsync(id);
        return updated ? NoContent() : NotFound();
    }
}
