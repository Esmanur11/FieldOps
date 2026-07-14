using FieldOps.Application.Sites;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace FieldOps.Api.Controllers;

[ApiController]
[Route("api/sites")]
public class SitesController : ControllerBase
{
    private readonly SiteService _siteService;
    private readonly IValidator<CreateSiteRequest> _validator;

    public SitesController(SiteService siteService, IValidator<CreateSiteRequest> validator)
    {
        _siteService = siteService;
        _validator = validator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SiteDto>>> GetAll()
    {
        var sites = await _siteService.GetAllAsync();
        return Ok(sites);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<SiteDto>> GetById(int id)
    {
        var site = await _siteService.GetByIdAsync(id);
        return site is null ? NotFound() : Ok(site);
    }

    [HttpPost]
    public async Task<ActionResult<SiteDto>> Create(CreateSiteRequest request)
    {
        var validationResult = await _validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.ToDictionary());
        }

        var id = await _siteService.CreateAsync(request);
        var created = await _siteService.GetByIdAsync(id);
        return CreatedAtAction(nameof(GetById), new { id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, CreateSiteRequest request)
    {
        var validationResult = await _validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.ToDictionary());
        }

        var updated = await _siteService.UpdateAsync(id, request);
        return updated ? NoContent() : NotFound();
    }
}
