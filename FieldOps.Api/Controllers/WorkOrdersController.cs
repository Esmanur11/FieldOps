using FieldOps.Application.WorkOrders;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FieldOps.Api.Controllers;

[ApiController]
[Route("api/work-orders")]
[Authorize]
public class WorkOrdersController : ControllerBase
{
    private readonly WorkOrderService _workOrderService;
    private readonly IValidator<CreateWorkOrderRequest> _createValidator;
    private readonly IValidator<UpdateWorkOrderStatusRequest> _statusValidator;
    private readonly IValidator<AssignWorkOrderRequest> _assignValidator;

    public WorkOrdersController(
        WorkOrderService workOrderService,
        IValidator<CreateWorkOrderRequest> createValidator,
        IValidator<UpdateWorkOrderStatusRequest> statusValidator,
        IValidator<AssignWorkOrderRequest> assignValidator)
    {
        _workOrderService = workOrderService;
        _createValidator = createValidator;
        _statusValidator = statusValidator;
        _assignValidator = assignValidator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WorkOrderDto>>> GetAll(
        [FromQuery] int? siteId,
        [FromQuery] string? status)
    {
        var workOrders = await _workOrderService.GetAsync(siteId, status);
        return Ok(workOrders);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<WorkOrderDto>> GetById(int id)
    {
        var workOrder = await _workOrderService.GetByIdAsync(id);
        return workOrder is null ? NotFound() : Ok(workOrder);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateWorkOrderRequest request)
    {
        var validationResult = await _createValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.ToDictionary());
        }

        var id = await _workOrderService.CreateAsync(request);
        var created = await _workOrderService.GetByIdAsync(id);
        return CreatedAtAction(nameof(GetById), new { id }, created);
    }

    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateWorkOrderStatusRequest request)
    {
        var validationResult = await _statusValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.ToDictionary());
        }

        var updated = await _workOrderService.UpdateStatusAsync(id, request.Status);
        return updated ? NoContent() : NotFound();
    }

    [HttpPut("{id:int}/assign")]
    public async Task<IActionResult> Assign(int id, AssignWorkOrderRequest request)
    {
        var validationResult = await _assignValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.ToDictionary());
        }

        var updated = await _workOrderService.AssignAsync(id, request.AssignedTo);
        return updated ? NoContent() : NotFound();
    }
}
