using FieldOps.Application.Personnel;
using FieldOps.Application.Users;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FieldOps.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;
    private readonly IValidator<CreateUserRequest> _validator;

    public UsersController(UserService userService, IValidator<CreateUserRequest> validator)
    {
        _userService = userService;
        _validator = validator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
    {
        var users = await _userService.GetAllAsync();
        return Ok(users);
    }

    [HttpGet("without-account")]
    public async Task<ActionResult<IEnumerable<PersonnelDto>>> GetPersonnelWithoutAccount()
    {
        var personnel = await _userService.GetPersonnelWithoutAccountAsync();
        return Ok(personnel);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateUserRequest request)
    {
        var validationResult = await _validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.ToDictionary());
        }

        var id = await _userService.CreateAsync(request);
        return Created(string.Empty, new { id });
    }
}
