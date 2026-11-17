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
[Route("api/prescriptions")]
[Authorize(Roles = AppRoles.ClinicAdmin + "," + AppRoles.Staff)]
public class PrescriptionsController : ControllerBase
{
    private readonly IPrescriptionService _service;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _context;

    public PrescriptionsController(
        IPrescriptionService service,
        UserManager<ApplicationUser> userManager,
        AppDbContext context)
    {
        _service = service;
        _userManager = userManager;
        _context = context;
    }

    [HttpGet]
    [Authorize(Policy = AppPermissions.PrescriptionsView)]
    public async Task<ActionResult<List<PrescriptionDto>>> GetAll(
        [FromQuery] int? petId = null)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            return Ok(await _service.GetAllAsync(
                clinicId.Value,
                petId));
        }
        catch (ValidationException exception)
        {
            return ValidationError(exception);
        }
    }

    [HttpGet("{id:int}")]
    [Authorize(Policy = AppPermissions.PrescriptionsView)]
    public async Task<ActionResult<PrescriptionDto>> GetById(int id)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        var prescription = await _service.GetByIdAsync(
            id,
            clinicId.Value);

        if (prescription is null)
        {
            return NotFound();
        }

        return Ok(prescription);
    }

    [HttpPost]
    [Authorize(Policy = AppPermissions.PrescriptionsCreate)]
    public async Task<ActionResult<PrescriptionDto>> Create(
        [FromBody] CreatePrescriptionDto dto)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            var prescription = await _service.CreateAsync(
                clinicId.Value,
                dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = prescription.Id },
                prescription);
        }
        catch (ValidationException exception)
        {
            return ValidationError(exception);
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = AppPermissions.PrescriptionsUpdate)]
    public async Task<ActionResult<PrescriptionDto>> Update(
        int id,
        [FromBody] UpdatePrescriptionDto dto)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            var prescription = await _service.UpdateAsync(
                id,
                clinicId.Value,
                dto);

            if (prescription is null)
            {
                return NotFound();
            }

            return Ok(prescription);
        }
        catch (ValidationException exception)
        {
            return ValidationError(exception);
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = AppPermissions.PrescriptionsDelete)]
    public async Task<IActionResult> Delete(int id)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        var deleted = await _service.DeleteAsync(
            id,
            clinicId.Value);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    private async Task<int?> GetClinicIdAsync()
    {
        var user = await _userManager.GetUserAsync(User);

        if (user is null ||
            !user.IsActive ||
            !user.ClinicId.HasValue ||
            user.ClinicId.Value <= 0)
        {
            return null;
        }

        if (await _userManager.IsInRoleAsync(
            user,
            AppRoles.SuperAdmin))
        {
            return null;
        }

        var isClinicAdmin = await _userManager.IsInRoleAsync(
            user,
            AppRoles.ClinicAdmin);

        var isStaff = await _userManager.IsInRoleAsync(
            user,
            AppRoles.Staff);

        if (!isClinicAdmin && !isStaff)
        {
            return null;
        }

        var clinicId = user.ClinicId.Value;

        var clinicIsActive = await _context.Clinics
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