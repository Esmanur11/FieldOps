using FieldOps.Application.Materials;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FieldOps.Api.Controllers;

[ApiController]
[Route("api/material-stocks")]
[Authorize]
public class MaterialStocksController : ControllerBase
{
    private readonly MaterialStockService _stockService;

    public MaterialStocksController(MaterialStockService stockService)
    {
        _stockService = stockService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MaterialStockDto>>> GetAll([FromQuery] int? siteId)
    {
        var stocks = await _stockService.GetAsync(siteId);
        return Ok(stocks);
    }
}