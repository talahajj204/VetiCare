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
[Route("api/store-settings")]
[Authorize(Roles = AppRoles.ClinicAdmin)]
[ResponseCache(
    NoStore = true,
    Location = ResponseCacheLocation.None)]
public class StoreSettingsController : ControllerBase
{
    private readonly IStoreSettingsService _service;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _context;

    public StoreSettingsController(
        IStoreSettingsService service,
        UserManager<ApplicationUser> userManager,
        AppDbContext context)
    {
        _service = service;
        _userManager = userManager;
        _context = context;
    }

    // Clinic administrator reads their own settings.
    [HttpGet]
    public async Task<ActionResult<StoreSettingsDto>> Get()
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        return Ok(await _service.GetAsync(clinicId.Value));
    }

    // Clinic administrator saves their own settings.
    [HttpPut]
    [RequestSizeLimit(15_000_000)]
    public async Task<ActionResult<StoreSettingsDto>> Update(
        [FromBody] UpdateStoreSettingsDto dto)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            var result = await _service.UpdateAsync(
                clinicId.Value,
                dto);

            return Ok(result);
        }
        catch (ValidationException exception)
        {
            ModelState.AddModelError(
                string.Empty,
                exception.Message);

            return ValidationProblem(ModelState);
        }
    }

    // Customers read the public website settings.
    [AllowAnonymous]
    [HttpGet("~/api/store/{clinicId:int}/settings")]
    public async Task<ActionResult<StoreSettingsDto>> GetPublic(
        int clinicId)
    {
        if (!await ClinicIsActiveAsync(clinicId))
        {
            return NotFound();
        }

        return Ok(await _service.GetAsync(clinicId));
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

        return await ClinicIsActiveAsync(clinicId)
            ? clinicId
            : null;
    }

    private async Task<bool> ClinicIsActiveAsync(
        int clinicId)
    {
        return clinicId > 0 &&
            await _context.Clinics
                .AsNoTracking()
                .AnyAsync(
                    clinic =>
                        clinic.Id == clinicId &&
                        clinic.IsActive,
                    HttpContext.RequestAborted);
    }
}