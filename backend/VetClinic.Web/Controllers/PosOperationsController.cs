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
[Route("api/pos")]
[Authorize(Roles = AppRoles.ClinicAdmin + "," + AppRoles.Staff)]
[Authorize(Policy = AppPermissions.PosAccess)]
public class PosOperationsController : ControllerBase
{
    private readonly IPosOperationsService _service;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _context;

    public PosOperationsController(
        IPosOperationsService service,
        UserManager<ApplicationUser> userManager,
        AppDbContext context)
    {
        _service = service;
        _userManager = userManager;
        _context = context;
    }

    [HttpGet("held-sales")]
    public async Task<ActionResult<List<HeldSaleDto>>> GetHeldSales()
    {
        var user = await GetClinicUserAsync();

        if (user is null)
        {
            return Forbid();
        }

        return Ok(await _service.GetHeldSalesAsync(
            user.ClinicId!.Value));
    }

    [HttpGet("held-sales/{id:int}")]
    public async Task<ActionResult<HeldSaleDto>> GetHeldSale(
        int id)
    {
        var user = await GetClinicUserAsync();

        if (user is null)
        {
            return Forbid();
        }

        var held = await _service.GetHeldSaleAsync(
            id,
            user.ClinicId!.Value);

        if (held is null)
        {
            return NotFound();
        }

        return Ok(held);
    }

    [HttpPost("held-sales")]
    public async Task<ActionResult<HeldSaleDto>> HoldSale(
        [FromBody] CreateHeldSaleDto dto)
    {
        var user = await GetClinicUserAsync();

        if (user is null)
        {
            return Forbid();
        }

        try
        {
            var held = await _service.HoldSaleAsync(
                user.ClinicId!.Value,
                user.Id,
                dto);

            return CreatedAtAction(
                nameof(GetHeldSale),
                new { id = held.Id },
                held);
        }
        catch (ValidationException exception)
        {
            return InvalidData(exception);
        }
    }

    [HttpGet("deliveries")]
    public async Task<ActionResult<List<DeliverySaleDto>>>
        GetPendingDeliveries()
    {
        var user = await GetClinicUserAsync();

        if (user is null)
        {
            return Forbid();
        }

        return Ok(await _service.GetPendingDeliveriesAsync(
            user.ClinicId!.Value));
    }

    [HttpPost("deliveries/{saleId:int}/complete")]
    [Authorize(Policy = AppPermissions.PosCheckout)]
    public async Task<ActionResult<DeliverySaleDto>> MarkDelivered(
        int saleId)
    {
        var user = await GetClinicUserAsync();

        if (user is null)
        {
            return Forbid();
        }

        try
        {
            var delivery = await _service.MarkDeliveredAsync(
                saleId,
                user.ClinicId!.Value);

            if (delivery is null)
            {
                return NotFound();
            }

            return Ok(delivery);
        }
        catch (ValidationException exception)
        {
            return InvalidData(exception);
        }
    }

    [HttpGet("refundable-sales")]
    [Authorize(Policy = AppPermissions.PosCheckout)]
    public async Task<ActionResult<List<RefundableSaleDto>>>
        GetRefundableSales()
    {
        var user = await GetClinicUserAsync();

        if (user is null)
        {
            return Forbid();
        }

        return Ok(await _service.GetRefundableSalesAsync(
            user.ClinicId!.Value));
    }

    [HttpPost("refunds")]
    [Authorize(Policy = AppPermissions.PosCheckout)]
    public async Task<ActionResult<SaleRefundDto>> RefundSale(
        [FromBody] CreateSaleRefundDto dto)
    {
        var user = await GetClinicUserAsync();

        if (user is null)
        {
            return Forbid();
        }

        // Until a separate refund permission is configured,
        // refunds are restricted to clinic administrators.
        if (!await _userManager.IsInRoleAsync(
            user,
            AppRoles.ClinicAdmin))
        {
            return Forbid();
        }

        try
        {
            var refund = await _service.RefundSaleAsync(
                user.ClinicId!.Value,
                user.Id,
                dto);

            return Ok(refund);
        }
        catch (ValidationException exception)
        {
            return InvalidData(exception);
        }
    }

    private ActionResult InvalidData(
        ValidationException exception)
    {
        ModelState.AddModelError(
            string.Empty,
            exception.Message);

        return ValidationProblem(ModelState);
    }

    private async Task<ApplicationUser?> GetClinicUserAsync()
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

        return clinicIsActive ? user : null;
    }
}