using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Constants;
using VetClinic.Infrastructure.Data;
using VetClinic.Infrastructure.Identity;

namespace VetClinic.Web.Controllers;

[ApiController]
[Route("api/appointments/lookups")]
[Authorize(Roles = AppRoles.ClinicAdmin + "," + AppRoles.Staff)]
[Authorize(Policy = AppPermissions.AppointmentsView)]
[ResponseCache(
    NoStore = true,
    Location = ResponseCacheLocation.None)]
public class AppointmentLookupsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IAuthorizationService _authorization;

    public AppointmentLookupsController(
        AppDbContext context,
        UserManager<ApplicationUser> userManager,
        IAuthorizationService authorization)
    {
        _context = context;
        _userManager = userManager;
        _authorization = authorization;
    }

    [HttpGet("owners")]
    public async Task<IActionResult> GetOwners(
        CancellationToken cancellationToken)
    {
        var clinicId = await GetClinicIdAsync(
            cancellationToken);

        if (clinicId is null)
        {
            return Forbid();
        }

        var owners = await _context.Owners
            .AsNoTracking()
            .Where(owner => owner.ClinicId == clinicId.Value)
            .OrderBy(owner => owner.FirstName)
            .ThenBy(owner => owner.LastName)
            .ThenBy(owner => owner.Id)
            .Select(owner => new
            {
                owner.Id,
                owner.FirstName,
                owner.LastName
            })
            .ToListAsync(cancellationToken);

        return Ok(owners);
    }

    [HttpGet("pets")]
    public async Task<IActionResult> GetPets(
        CancellationToken cancellationToken)
    {
        var clinicId = await GetClinicIdAsync(
            cancellationToken);

        if (clinicId is null)
        {
            return Forbid();
        }

        var pets = await _context.Pets
            .AsNoTracking()
            .Where(pet =>
                pet.ClinicId == clinicId.Value &&
                pet.Owner.ClinicId == clinicId.Value)
            .OrderBy(pet => pet.Name)
            .ThenBy(pet => pet.Id)
            .Select(pet => new
            {
                pet.Id,
                pet.Name,
                pet.OwnerId,
                Owner = (
                    pet.Owner.FirstName + " " +
                    pet.Owner.LastName
                ).Trim()
            })
            .ToListAsync(cancellationToken);

        return Ok(pets);
    }

    [HttpGet("permissions")]
    public async Task<IActionResult> GetPermissions(
        CancellationToken cancellationToken)
    {
        var clinicId = await GetClinicIdAsync(
            cancellationToken);

        if (clinicId is null)
        {
            return Forbid();
        }

        var remindersAccess =
            await _authorization.AuthorizeAsync(
                User,
                null,
                AppPermissions.RemindersView);

        return Ok(new
        {
            canViewReminders = remindersAccess.Succeeded
        });
    }

    private async Task<int?> GetClinicIdAsync(
        CancellationToken cancellationToken)
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

        var isStaff = await _userManager.IsInRoleAsync(
            user,
            AppRoles.Staff);

        if (!isAdmin && !isStaff)
        {
            return null;
        }

        var active = await _context.Clinics
            .AsNoTracking()
            .AnyAsync(
                clinic =>
                    clinic.Id == clinicId &&
                    clinic.IsActive,
                cancellationToken);

        return active ? clinicId : null;
    }
}