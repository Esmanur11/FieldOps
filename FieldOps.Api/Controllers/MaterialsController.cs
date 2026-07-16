using FieldOps.Application.Materials;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FieldOps.Api.Controllers;

[ApiController]
[Route("api/materials")]
[Authorize]
public class MaterialsController : ControllerBase
{
    private readonly MaterialService _materialService;
    private readonly IValidator<CreateMaterialRequest> _validator;

    public MaterialsController(MaterialService materialService, IValidator<CreateMaterialRequest> validator)
    {
        _materialService = materialService;
        _validator = validator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MaterialDto>>> GetAll()
    {
        var materials = await _materialService.GetAllAsync();
        return Ok(materials);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<MaterialDto>> GetById(int id)
    {
        var material = await _materialService.GetByIdAsync(id);
        return material is null ? NotFound() : Ok(material);
    }

    [HttpPost]
    public async Task<ActionResult<MaterialDto>> Create(CreateMaterialRequest request)
    {
        var validationResult = await _validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.ToDictionary());
        }

        var id = await _materialService.CreateAsync(request);
        var created = await _materialService.GetByIdAsync(id);
        return CreatedAtAction(nameof(GetById), new { id }, created);
    }
}