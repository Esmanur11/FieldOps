using FieldOps.Application.Audits;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FieldOps.Api.Controllers;

[ApiController]
[Route("api/audits")]
[Authorize]
public class AuditsController : ControllerBase
{
    private readonly AuditService _auditService;
    private readonly IValidator<CreateAuditRequest> _validator;

    public AuditsController(AuditService auditService, IValidator<CreateAuditRequest> validator)
    {
        _auditService = auditService;
        _validator = validator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AuditDto>>> GetAll([FromQuery] int? siteId)
    {
        var audits = await _auditService.GetAsync(siteId);
        return Ok(audits);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AuditDetailDto>> GetById(int id)
    {
        var audit = await _auditService.GetByIdAsync(id);
        return audit is null ? NotFound() : Ok(audit);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateAuditRequest request)
    {
        var validationResult = await _validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.ToDictionary());
        }

        var id = await _auditService.CreateAsync(request);
        var created = await _auditService.GetByIdAsync(id);
        return CreatedAtAction(nameof(GetById), new { id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, CreateAuditRequest request)
    {
        var validationResult = await _validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.ToDictionary());
        }

        var updated = await _auditService.UpdateAsync(id, request);
        return updated ? NoContent() : NotFound();
    }
}
