using System.ComponentModel.DataAnnotations;
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

[ApiController]
[Route("api/clinic-options")]
[Authorize(Roles = AppRoles.ClinicAdmin + "," + AppRoles.Staff)]
public class ClinicOptionsController : ControllerBase
{
    private readonly IClinicOptionService _service;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _context;

    public ClinicOptionsController(
        IClinicOptionService service,
        UserManager<ApplicationUser> userManager,
        AppDbContext context)
    {
        _service = service;
        _userManager = userManager;
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<ClinicOptionDto>>> GetAll(
        [FromQuery] string? listKey = null,
        [FromQuery] bool includeInactive = false)
    {
        var clinicId = await GetClinicIdAsync(
            requireAdmin: includeInactive);

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            var options = await _service.GetAllAsync(
                clinicId.Value,
                listKey,
                includeInactive);

            return Ok(options);
        }
        catch (ValidationException exception)
        {
            return ValidationError(exception);
        }
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ClinicOptionDto>> GetById(
        int id)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        var option = await _service.GetByIdAsync(
            id,
            clinicId.Value);

        if (option is null)
        {
            return NotFound();
        }

        if (!option.IsActive)
        {
            var adminClinicId = await GetClinicIdAsync(
                requireAdmin: true);

            if (adminClinicId is null)
            {
                return NotFound();
            }
        }

        return Ok(option);
    }

    [HttpPost]
    [Authorize(Roles = AppRoles.ClinicAdmin)]
    public async Task<ActionResult<ClinicOptionDto>> Create(
        [FromBody] CreateClinicOptionDto dto)
    {
        var clinicId = await GetClinicIdAsync(
            requireAdmin: true);

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            var option = await _service.CreateAsync(
                clinicId.Value,
                dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = option.Id },
                option);
        }
        catch (ValidationException exception)
        {
            return ValidationError(exception);
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = AppRoles.ClinicAdmin)]
    public async Task<ActionResult<ClinicOptionDto>> Update(
        int id,
        [FromBody] UpdateClinicOptionDto dto)
    {
        var clinicId = await GetClinicIdAsync(
            requireAdmin: true);

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            var option = await _service.UpdateAsync(
                id,
                clinicId.Value,
                dto);

            if (option is null)
            {
                return NotFound();
            }

            return Ok(option);
        }
        catch (ValidationException exception)
        {
            return ValidationError(exception);
        }
    }

    private ActionResult ValidationError(
        ValidationException exception)
    {
        ModelState.AddModelError(
            string.Empty,
            exception.Message);

        return ValidationProblem(ModelState);
    }

    private async Task<int?> GetClinicIdAsync(
        bool requireAdmin = false)
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

        var isAdmin = await _userManager.IsInRoleAsync(
            user,
            AppRoles.ClinicAdmin);

        if (requireAdmin && !isAdmin)
        {
            return null;
        }

        if (!isAdmin)
        {
            var isStaff = await _userManager.IsInRoleAsync(
                user,
                AppRoles.Staff);

            if (!isStaff)
            {
                return null;
            }
        }

        var clinicIsActive = await _context.Clinics
            .AnyAsync(clinic =>
                clinic.Id == clinicId &&
                clinic.IsActive);

        return clinicIsActive ? clinicId : null;
    }
}