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
[Route("api/supplier-invoices")]
[Authorize(Roles = AppRoles.ClinicAdmin + "," + AppRoles.Staff)]
public class SupplierInvoicesController : ControllerBase
{
    private readonly ISupplierInvoiceService _service;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _context;

    public SupplierInvoicesController(
        ISupplierInvoiceService service,
        UserManager<ApplicationUser> userManager,
        AppDbContext context)
    {
        _service = service;
        _userManager = userManager;
        _context = context;
    }

    [HttpGet]
    [Authorize(Policy = AppPermissions.InventoryView)]
    public async Task<ActionResult<List<SupplierInvoiceDto>>> GetAll()
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        return Ok(
            await _service.GetAllAsync(clinicId.Value));
    }

    [HttpGet("{id:int}")]
    [Authorize(Policy = AppPermissions.InventoryView)]
    public async Task<ActionResult<SupplierInvoiceDto>> GetById(
        int id)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        var invoice = await _service.GetByIdAsync(
            id,
            clinicId.Value);

        if (invoice is null)
        {
            return NotFound();
        }

        return Ok(invoice);
    }

    [HttpPost]
    [Authorize(Policy = AppPermissions.InventoryCreate)]
    [Authorize(Policy = AppPermissions.InventoryUpdate)]
    public async Task<ActionResult<SupplierInvoiceDto>> Create(
        [FromBody] CreateSupplierInvoiceDto dto)
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

        var clinicIsActive = await _context.Clinics
            .AnyAsync(clinic =>
                clinic.Id == clinicId &&
                clinic.IsActive);

        return clinicIsActive ? clinicId : null;
    }
}