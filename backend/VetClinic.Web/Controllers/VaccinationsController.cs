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
[Route("api/vaccinations")]
[Authorize(Roles = AppRoles.ClinicAdmin + "," + AppRoles.Staff)]
public class VaccinationsController : ControllerBase
{
    private readonly IVaccinationService _service;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _context;

    public VaccinationsController(
        IVaccinationService service,
        UserManager<ApplicationUser> userManager,
        AppDbContext context)
    {
        _service = service;
        _userManager = userManager;
        _context = context;
    }

    [HttpGet]
    [Authorize(Policy = AppPermissions.VaccinationsView)]
    public async Task<ActionResult<List<VaccinationDto>>> GetAll(
        [FromQuery] int? petId = null)
    {
        var clinicId = await GetClinicIdAsync();

        if (!clinicId.HasValue)
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
            return InvalidData(exception);
        }
    }

    [HttpGet("{id:int}")]
    [Authorize(Policy = AppPermissions.VaccinationsView)]
    public async Task<ActionResult<VaccinationDto>> GetById(int id)
    {
        var clinicId = await GetClinicIdAsync();

        if (!clinicId.HasValue)
        {
            return Forbid();
        }

        var vaccination = await _service.GetByIdAsync(
            id,
            clinicId.Value);

        if (vaccination is null)
        {
            return NotFound();
        }

        return Ok(vaccination);
    }

    [HttpPost]
    [Authorize(Policy = AppPermissions.VaccinationsCreate)]
    public async Task<ActionResult<VaccinationDto>> Create(
        [FromBody] CreateVaccinationDto dto)
    {
        var clinicId = await GetClinicIdAsync();

        if (!clinicId.HasValue)
        {
            return Forbid();
        }

        try
        {
            var vaccination = await _service.CreateAsync(
                clinicId.Value,
                dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = vaccination.Id },
                vaccination);
        }
        catch (ValidationException exception)
        {
            return InvalidData(exception);
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = AppPermissions.VaccinationsUpdate)]
    public async Task<ActionResult<VaccinationDto>> Update(
        int id,
        [FromBody] UpdateVaccinationDto dto)
    {
        var clinicId = await GetClinicIdAsync();

        if (!clinicId.HasValue)
        {
            return Forbid();
        }

        try
        {
            var vaccination = await _service.UpdateAsync(
                id,
                clinicId.Value,
                dto);

            if (vaccination is null)
            {
                return NotFound();
            }

            return Ok(vaccination);
        }
        catch (ValidationException exception)
        {
            return InvalidData(exception);
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = AppPermissions.VaccinationsDelete)]
    public async Task<IActionResult> Delete(int id)
    {
        var clinicId = await GetClinicIdAsync();

        if (!clinicId.HasValue)
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

    private ActionResult InvalidData(
        ValidationException exception)
    {
        ModelState.AddModelError(
            string.Empty,
            exception.Message);

        return ValidationProblem(ModelState);
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
}