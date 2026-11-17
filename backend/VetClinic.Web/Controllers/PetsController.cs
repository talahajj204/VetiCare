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
[Route("api/pets")]
[Authorize(Roles = AppRoles.ClinicAdmin + "," + AppRoles.Staff)]
public class PetsController : ControllerBase
{
    private readonly IPetService _service;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _context;

    public PetsController(
        IPetService service,
        UserManager<ApplicationUser> userManager,
        AppDbContext context)
    {
        _service = service;
        _userManager = userManager;
        _context = context;
    }

    [HttpGet]
    [Authorize(Policy = AppPermissions.PetsView)]
    public async Task<ActionResult<List<PetDto>>> GetAll()
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        return Ok(await _service.GetAllAsync(clinicId.Value));
    }

    [HttpGet("{id:int}")]
    [Authorize(Policy = AppPermissions.PetsView)]
    public async Task<ActionResult<PetDto>> GetById(int id)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        var pet = await _service.GetByIdAsync(
            id,
            clinicId.Value);

        if (pet is null)
        {
            return NotFound();
        }

        return Ok(pet);
    }

    [HttpPost]
    [Authorize(Policy = AppPermissions.PetsCreate)]
    public async Task<ActionResult<PetDto>> Create(
        [FromBody] CreatePetDto dto)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            var pet = await _service.CreateAsync(
                clinicId.Value,
                dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = pet.Id },
                pet);
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
    [Authorize(Policy = AppPermissions.PetsUpdate)]
    public async Task<ActionResult<PetDto>> Update(
        int id,
        [FromBody] UpdatePetDto dto)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            var pet = await _service.UpdateAsync(
                id,
                clinicId.Value,
                dto);

            if (pet is null)
            {
                return NotFound();
            }

            return Ok(pet);
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
    [Authorize(Policy = AppPermissions.PetsDelete)]
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

        var clinicIsActive = await _context.Clinics
            .AnyAsync(clinic =>
                clinic.Id == clinicId &&
                clinic.IsActive);

        return clinicIsActive ? clinicId : null;
    }
}