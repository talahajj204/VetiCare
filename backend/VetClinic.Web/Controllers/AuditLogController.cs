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
[Route("api/audit-log")]
[Authorize(Roles = AppRoles.ClinicAdmin + "," + AppRoles.Staff)]
[Authorize(Policy = AppPermissions.AuditLogView)]
[ResponseCache(
    NoStore = true,
    Location = ResponseCacheLocation.None)]
public class AuditLogController : ControllerBase
{
    private readonly IAuditLogService _service;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _context;

    public AuditLogController(
        IAuditLogService service,
        UserManager<ApplicationUser> userManager,
        AppDbContext context)
    {
        _service = service;
        _userManager = userManager;
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<AuditLogDto>>> GetAll(
        CancellationToken cancellationToken)
    {
        var clinicId = await GetClinicIdAsync(
            cancellationToken);

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            var entries = await _service.GetAllAsync(
                clinicId.Value,
                cancellationToken);

            return Ok(entries);
        }
        catch (ValidationException exception)
        {
            ModelState.AddModelError(
                string.Empty,
                exception.Message);

            return ValidationProblem(ModelState);
        }
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
            .AsNoTracking()
            .AnyAsync(
                clinic =>
                    clinic.Id == clinicId &&
                    clinic.IsActive,
                cancellationToken);

        return clinicIsActive ? clinicId : null;
    }
}