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
[Route("api/orders")]
[Authorize(Roles = AppRoles.ClinicAdmin + "," + AppRoles.Staff)]
public class OrdersController : ControllerBase
{
    private readonly IStoreOrderService _service;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _context;

    public OrdersController(
        IStoreOrderService service,
        UserManager<ApplicationUser> userManager,
        AppDbContext context)
    {
        _service = service;
        _userManager = userManager;
        _context = context;
    }

    [HttpGet]
    [Authorize(Policy = AppPermissions.OrdersView)]
    public async Task<ActionResult<List<StoreOrderDto>>> GetAll()
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            return Ok(await _service.GetAllAsync(
                clinicId.Value));
        }
        catch (ValidationException exception)
        {
            return InvalidData(exception);
        }
    }

    [HttpGet("{id:int}")]
    [Authorize(Policy = AppPermissions.OrdersView)]
    public async Task<ActionResult<StoreOrderDto>> GetById(
        int id)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            var order = await _service.GetByIdAsync(
                id,
                clinicId.Value);

            if (order is null)
            {
                return NotFound();
            }

            return Ok(order);
        }
        catch (ValidationException exception)
        {
            return InvalidData(exception);
        }
    }

    [HttpPut("{id:int}/status")]
    [Authorize(Policy = AppPermissions.OrdersUpdate)]
    public async Task<ActionResult<StoreOrderDto>> UpdateStatus(
        int id,
        [FromBody] UpdateStoreOrderStatusDto dto)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            var order = await _service.UpdateStatusAsync(
                id,
                clinicId.Value,
                dto);

            if (order is null)
            {
                return NotFound();
            }

            return Ok(order);
        }
        catch (ValidationException exception)
        {
            return InvalidData(exception);
        }
    }

    [HttpGet("deliveries")]
    [Authorize(Policy = AppPermissions.PosAccess)]
    public async Task<ActionResult<List<StoreOrderDto>>>
        GetPendingDeliveries()
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            return Ok(
                await _service.GetPendingDeliveriesAsync(
                    clinicId.Value));
        }
        catch (ValidationException exception)
        {
            return InvalidData(exception);
        }
    }

    [HttpPost("{id:int}/delivery/complete")]
    [Authorize(Policy = AppPermissions.PosAccess)]
    [Authorize(Policy = AppPermissions.PosCheckout)]
    public async Task<ActionResult<StoreOrderDto>> MarkDelivered(
        int id)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            var order = await _service.MarkDeliveredAsync(
                id,
                clinicId.Value);

            if (order is null)
            {
                return NotFound();
            }

            return Ok(order);
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