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
[Route("api/owners")]
[Authorize(Roles = AppRoles.ClinicAdmin + "," + AppRoles.Staff)]
public class OwnersController : ControllerBase
{
    private readonly IOwnerService _service;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _dbContext;

    public OwnersController(
        IOwnerService service,
        UserManager<ApplicationUser> userManager,
        AppDbContext dbContext)
    {
        _service = service;
        _userManager = userManager;
        _dbContext = dbContext;
    }

    [HttpGet]
    [Authorize(Policy = AppPermissions.OwnersView)]
    public async Task<ActionResult<List<OwnerDto>>> GetAll()
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        return Ok(await _service.GetAllAsync(clinicId.Value));
    }

    [HttpGet("{id:int}")]
    [Authorize(Policy = AppPermissions.OwnersView)]
    public async Task<ActionResult<OwnerDto>> GetById(int id)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        var owner = await _service.GetByIdAsync(
            id,
            clinicId.Value);

        if (owner is null)
        {
            return NotFound();
        }

        return Ok(owner);
    }

    [HttpPost]
    [Authorize(Policy = AppPermissions.OwnersCreate)]
    public async Task<ActionResult<OwnerDto>> Create(
        [FromBody] CreateOwnerDto dto)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            var owner = await _service.CreateAsync(
                clinicId.Value,
                dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = owner.Id },
                owner);
        }
        catch (ValidationException exception)
        {
            ModelState.AddModelError(
                string.Empty,
                exception.Message);

            return ValidationProblem(ModelState);
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = AppPermissions.OwnersUpdate)]
    public async Task<ActionResult<OwnerDto>> Update(
        int id,
        [FromBody] UpdateOwnerDto dto)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            var owner = await _service.UpdateAsync(
                id,
                clinicId.Value,
                dto);

            if (owner is null)
            {
                return NotFound();
            }

            return Ok(owner);
        }
        catch (ValidationException exception)
        {
            ModelState.AddModelError(
                string.Empty,
                exception.Message);

            return ValidationProblem(ModelState);
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = AppPermissions.OwnersDelete)]
    public async Task<IActionResult> Delete(int id)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            var deleted = await _service.DeleteAsync(
                id,
                clinicId.Value);

            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }
        catch (ValidationException exception)
        {
            ModelState.AddModelError(
                string.Empty,
                exception.Message);

            return ValidationProblem(ModelState);
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

        var clinicIsActive = await _dbContext.Clinics
            .AnyAsync(clinic =>
                clinic.Id == clinicId &&
                clinic.IsActive);

        return clinicIsActive ? clinicId : null;
    }
}