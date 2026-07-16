using FieldOps.Application.Audits;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FieldOps.Api.Controllers;

[ApiController]
[Route("api/audit-findings")]
[Authorize]
public class AuditFindingsController : ControllerBase
{
    private readonly AuditFindingService _findingService;
    private readonly IValidator<CreateAuditFindingRequest> _createValidator;
    private readonly IValidator<UpdateAuditFindingRequest> _updateValidator;

    public AuditFindingsController(
        AuditFindingService findingService,
        IValidator<CreateAuditFindingRequest> createValidator,
        IValidator<UpdateAuditFindingRequest> updateValidator)
    {
        _findingService = findingService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AuditFindingDto>>> GetAll([FromQuery] int? auditId)
    {
        var findings = await _findingService.GetAsync(auditId);
        return Ok(findings);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateAuditFindingRequest request)
    {
        var validationResult = await _createValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.ToDictionary());
        }

        var id = await _findingService.CreateAsync(request);
        return Created(string.Empty, new { id });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateAuditFindingRequest request)
    {
        var validationResult = await _updateValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.ToDictionary());
        }

        var updated = await _findingService.UpdateAsync(id, request);
        return updated ? NoContent() : NotFound();
    }
}
