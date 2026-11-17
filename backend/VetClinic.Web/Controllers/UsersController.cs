using System.ComponentModel.DataAnnotations;
using System.Reflection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;
using VetClinic.Core.Constants;
using VetClinic.Infrastructure.Data;
using VetClinic.Infrastructure.Identity;

namespace VetClinic.Web.Controllers;

public sealed class UpdateStaffStatusRequest
{
    [Required]
    public bool? IsActive { get; set; }
}

[ApiController]
[Route("api/users")]
[Authorize(Roles = AppRoles.ClinicAdmin)]
public class UsersController : ControllerBase
{
    private readonly IStaffUserService _service;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _context;

    public UsersController(
        IStaffUserService service,
        UserManager<ApplicationUser> userManager,
        AppDbContext context)
    {
        _service = service;
        _userManager = userManager;
        _context = context;
    }

    [HttpGet("permissions")]
    public async Task<ActionResult<List<string>>> GetPermissions()
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        var permissions = typeof(AppPermissions)
            .GetFields(BindingFlags.Public | BindingFlags.Static)
            .Where(field =>
                field.IsLiteral &&
                !field.IsInitOnly &&
                field.FieldType == typeof(string))
            .Select(field => (string)field.GetRawConstantValue()!)
            .Distinct(StringComparer.Ordinal)
            .OrderBy(permission => permission)
            .ToList();

        return Ok(permissions);
    }

    [HttpGet]
    public async Task<ActionResult<List<StaffUserDto>>> GetAll()
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            return Ok(await _service.GetAllAsync(clinicId.Value));
        }
        catch (ValidationException exception)
        {
            return ValidationError(exception);
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<StaffUserDto>> GetById(string id)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            var user = await _service.GetByIdAsync(
                clinicId.Value,
                id);

            return user is null
                ? NotFound()
                : Ok(user);
        }
        catch (ValidationException exception)
        {
            return ValidationError(exception);
        }
    }

    [HttpPost]
    public async Task<ActionResult<StaffUserDto>> Create(
        [FromBody] CreateStaffUserDto dto)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            var user = await _service.CreateAsync(
                clinicId.Value,
                dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = user.Id },
                user);
        }
        catch (ValidationException exception)
        {
            return ValidationError(exception);
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<StaffUserDto>> Update(
        string id,
        [FromBody] UpdateStaffUserDto dto)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            var user = await _service.UpdateAsync(
                clinicId.Value,
                id,
                dto);

            return user is null
                ? NotFound()
                : Ok(user);
        }
        catch (ValidationException exception)
        {
            return ValidationError(exception);
        }
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult<StaffUserDto>> UpdateStatus(
        string id,
        [FromBody] UpdateStaffStatusRequest request)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        if (request.IsActive is not bool isActive)
        {
            ModelState.AddModelError(
                nameof(request.IsActive),
                "IsActive is required.");

            return ValidationProblem(ModelState);
        }

        try
        {
            var user = await _service.SetActiveAsync(
                clinicId.Value,
                id,
                isActive);

            return user is null
                ? NotFound()
                : Ok(user);
        }
        catch (ValidationException exception)
        {
            return ValidationError(exception);
        }
    }

    private async Task<int?> GetClinicIdAsync()
    {
        var user = await _userManager.GetUserAsync(User);

        if (user is null ||
            !user.IsActive ||
            user.ClinicId is not int clinicId ||
            clinicId <= 0)
        {
            return null;
        }

        if (await _userManager.IsInRoleAsync(
            user,
            AppRoles.SuperAdmin))
        {
            return null;
        }

        if (!await _userManager.IsInRoleAsync(
            user,
            AppRoles.ClinicAdmin))
        {
            return null;
        }

        var clinicIsActive = await _context.Clinics
            .AsNoTracking()
            .AnyAsync(clinic =>
                clinic.Id == clinicId &&
                clinic.IsActive);

        return clinicIsActive ? clinicId : null;
    }

    private ActionResult ValidationError(
        ValidationException exception)
    {
        ModelState.AddModelError(
            string.Empty,
            exception.Message);

        return ValidationProblem(ModelState);
    }
}