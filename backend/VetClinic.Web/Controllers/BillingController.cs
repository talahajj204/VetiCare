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
[Route("api/billing")]
[Authorize(Roles = AppRoles.ClinicAdmin + "," + AppRoles.Staff)]
public class BillingController : ControllerBase
{
    private readonly IBillingInvoiceService _service;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _context;

    public BillingController(
        IBillingInvoiceService service,
        UserManager<ApplicationUser> userManager,
        AppDbContext context)
    {
        _service = service;
        _userManager = userManager;
        _context = context;
    }

    [HttpGet]
    [Authorize(Policy = AppPermissions.BillingView)]
    public async Task<ActionResult<List<BillingInvoiceDto>>>
        GetAll()
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            return Ok(
                await _service.GetAllAsync(clinicId.Value));
        }
        catch (ValidationException exception)
        {
            return ValidationError(exception);
        }
    }

    [HttpGet("{id:int}")]
    [Authorize(Policy = AppPermissions.BillingView)]
    public async Task<ActionResult<BillingInvoiceDto>> GetById(
        int id)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            var invoice = await _service.GetByIdAsync(
                id,
                clinicId.Value);

            return invoice is null
                ? NotFound()
                : Ok(invoice);
        }
        catch (ValidationException exception)
        {
            return ValidationError(exception);
        }
    }

    [HttpPost]
    [Authorize(Policy = AppPermissions.BillingCreate)]
    public async Task<ActionResult<BillingInvoiceDto>> Create(
        [FromBody] CreateBillingInvoiceDto dto)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            var invoice = await _service.CreateAsync(
                clinicId.Value,
                dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = invoice.Id },
                invoice);
        }
        catch (ValidationException exception)
        {
            return ValidationError(exception);
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = AppPermissions.BillingUpdate)]
    public async Task<ActionResult<BillingInvoiceDto>> Update(
        int id,
        [FromBody] UpdateBillingInvoiceDto dto)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            var invoice = await _service.UpdateAsync(
                id,
                clinicId.Value,
                dto);

            return invoice is null
                ? NotFound()
                : Ok(invoice);
        }
        catch (ValidationException exception)
        {
            return ValidationError(exception);
        }
    }

    [HttpPost("{id:int}/payments")]
    [Authorize(Policy = AppPermissions.BillingRecordPayment)]
    public async Task<ActionResult<BillingInvoiceDto>>
        RecordPayment(
            int id,
            [FromBody] RecordBillingPaymentDto dto)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            var invoice = await _service.RecordPaymentAsync(
                id,
                clinicId.Value,
                dto);

            return invoice is null
                ? NotFound()
                : Ok(invoice);
        }
        catch (ValidationException exception)
        {
            return ValidationError(exception);
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = AppPermissions.BillingDelete)]
    public async Task<IActionResult> Delete(
        int id,
        [FromBody] DeleteBillingInvoiceRequest dto)
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
                clinicId.Value,
                dto.RowVersion);

            return deleted ? NoContent() : NotFound();
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

        var isClinicAdmin =
            await _userManager.IsInRoleAsync(
                user,
                AppRoles.ClinicAdmin);

        var isStaff =
            await _userManager.IsInRoleAsync(
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

public class DeleteBillingInvoiceRequest
{
    [Required]
    [MinLength(8)]
    [MaxLength(8)]
    public byte[] RowVersion { get; set; } = [];
}