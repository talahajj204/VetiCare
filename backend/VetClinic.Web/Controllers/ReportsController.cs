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
[Route("api/reports")]
[Authorize(Roles = AppRoles.ClinicAdmin + "," + AppRoles.Staff)]
[Authorize(Policy = AppPermissions.ReportsView)]
[ResponseCache(
    NoStore = true,
    Location = ResponseCacheLocation.None)]
public class ReportsController : ControllerBase
{
    private readonly IReportService _service;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _context;

    public ReportsController(
        IReportService service,
        UserManager<ApplicationUser> userManager,
        AppDbContext context)
    {
        _service = service;
        _userManager = userManager;
        _context = context;
    }

    [HttpGet]
    public Task<ActionResult<ReportDto>> Get(
        [FromQuery] DateOnly? startDate,
        [FromQuery] DateOnly? endDate,
        CancellationToken cancellationToken)
    {
        return ReadReportAsync(
            startDate,
            endDate,
            cancellationToken);
    }

    [HttpGet("print")]
    [Authorize(Policy = AppPermissions.ReportsPrint)]
    public Task<ActionResult<ReportDto>> GetForPrint(
        [FromQuery] DateOnly? startDate,
        [FromQuery] DateOnly? endDate,
        CancellationToken cancellationToken)
    {
        return ReadReportAsync(
            startDate,
            endDate,
            cancellationToken);
    }

    private async Task<ActionResult<ReportDto>> ReadReportAsync(
        DateOnly? startDate,
        DateOnly? endDate,
        CancellationToken cancellationToken)
    {
        var clinicId = await GetClinicIdAsync(
            cancellationToken);

        if (clinicId is null)
        {
            return Forbid();
        }

        if (!startDate.HasValue)
        {
            ModelState.AddModelError(
                nameof(startDate),
                "Choose a From date.");
        }

        if (!endDate.HasValue)
        {
            ModelState.AddModelError(
                nameof(endDate),
                "Choose a To date.");
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        try
        {
            var report = await _service.GetAsync(
                clinicId.Value,
                startDate!.Value,
                endDate!.Value,
                cancellationToken);

            return Ok(report);
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