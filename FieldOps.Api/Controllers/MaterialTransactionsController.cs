using FieldOps.Application.Materials;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FieldOps.Api.Controllers;

[ApiController]
[Route("api/material-transactions")]
[Authorize]
public class MaterialTransactionsController : ControllerBase
{
    private readonly MaterialTransactionService _transactionService;
    private readonly IValidator<CreateMaterialTransactionRequest> _validator;

    public MaterialTransactionsController(
        MaterialTransactionService transactionService,
        IValidator<CreateMaterialTransactionRequest> validator)
    {
        _transactionService = transactionService;
        _validator = validator;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateMaterialTransactionRequest request)
    {
        var validationResult = await _validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.ToDictionary());
        }

        var result = await _transactionService.CreateAsync(request);
        return result.Success
            ? Ok(result.Transaction)
            : BadRequest(new { message = result.ErrorMessage });
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MaterialTransactionDto>>> GetAll(
        [FromQuery] int? siteId,
        [FromQuery] int? materialId)
    {
        var transactions = await _transactionService.GetAsync(siteId, materialId);
        return Ok(transactions);
    }
}