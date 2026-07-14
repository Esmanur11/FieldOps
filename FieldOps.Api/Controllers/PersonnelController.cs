using FieldOps.Application.Personnel;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FieldOps.Api.Controllers;

[ApiController]
[Route("api/personnel")]
[Authorize]
public class PersonnelController : ControllerBase
{
    private readonly PersonnelService _personnelService;
    private readonly IValidator<CreatePersonnelRequest> _validator;

    public PersonnelController(PersonnelService personnelService, IValidator<CreatePersonnelRequest> validator)
    {
        _personnelService = personnelService;
        _validator = validator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PersonnelDto>>> GetAll([FromQuery] int? siteId)
    {
        var personnel = siteId.HasValue
            ? await _personnelService.GetBySiteIdAsync(siteId.Value)
            : await _personnelService.GetAllAsync();

        return Ok(personnel);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PersonnelDto>> GetById(int id)
    {
        var person = await _personnelService.GetByIdAsync(id);
        return person is null ? NotFound() : Ok(person);
    }

    [HttpPost]
    public async Task<ActionResult<PersonnelDto>> Create(CreatePersonnelRequest request)
    {
        var validationResult = await _validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.ToDictionary());
        }

        var id = await _personnelService.CreateAsync(request);
        var created = await _personnelService.GetByIdAsync(id);
        return CreatedAtAction(nameof(GetById), new { id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, CreatePersonnelRequest request)
    {
        var validationResult = await _validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.ToDictionary());
        }

        var updated = await _personnelService.UpdateAsync(id, request);
        return updated ? NoContent() : NotFound();
    }
}
