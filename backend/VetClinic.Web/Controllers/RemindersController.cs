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
[Route("api/reminders")]
[Authorize(Roles = AppRoles.ClinicAdmin + "," + AppRoles.Staff)]
public class RemindersController : ControllerBase
{
    private readonly IReminderService _service;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _context;

    public RemindersController(
        IReminderService service,
        UserManager<ApplicationUser> userManager,
        AppDbContext context)
    {
        _service = service;
        _userManager = userManager;
        _context = context;
    }

    [HttpGet]
    [Authorize(Policy = AppPermissions.RemindersView)]
    public async Task<ActionResult<List<ReminderDto>>> GetAll(
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
    [Authorize(Policy = AppPermissions.RemindersView)]
    public async Task<ActionResult<ReminderDto>> GetById(int id)
    {
        var clinicId = await GetClinicIdAsync();

        if (!clinicId.HasValue)
        {
            return Forbid();
        }

        var reminder = await _service.GetByIdAsync(
            id,
            clinicId.Value);

        if (reminder is null)
        {
            return NotFound();
        }

        return Ok(reminder);
    }

    [HttpPost]
    [Authorize(Policy = AppPermissions.RemindersCreate)]
    public async Task<ActionResult<ReminderDto>> Create(
        [FromBody] CreateReminderDto dto)
    {
        var clinicId = await GetClinicIdAsync();

        if (!clinicId.HasValue)
        {
            return Forbid();
        }

        try
        {
            var reminder = await _service.CreateAsync(
                clinicId.Value,
                dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = reminder.Id },
                reminder);
        }
        catch (ValidationException exception)
        {
            return InvalidData(exception);
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = AppPermissions.RemindersUpdate)]
    public async Task<ActionResult<ReminderDto>> Update(
        int id,
        [FromBody] UpdateReminderDto dto)
    {
        var clinicId = await GetClinicIdAsync();

        if (!clinicId.HasValue)
        {
            return Forbid();
        }

        try
        {
            var reminder = await _service.UpdateAsync(
                id,
                clinicId.Value,
                dto);

            if (reminder is null)
            {
                return NotFound();
            }

            return Ok(reminder);
        }
        catch (ValidationException exception)
        {
            return InvalidData(exception);
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = AppPermissions.RemindersDelete)]
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