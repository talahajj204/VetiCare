using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Web.Controllers;

[ApiController]
[Route("api/store/{clinicId:int}/checkout")]
[AllowAnonymous]
[ResponseCache(
    NoStore = true,
    Location = ResponseCacheLocation.None)]
public class StoreCheckoutController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public StoreCheckoutController(
        AppDbContext context,
        IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpGet]
    public async Task<IActionResult> GetSettings(int clinicId)
    {
        var clinicExists = await _context.Clinics
            .AsNoTracking()
            .AnyAsync(clinic =>
                clinic.Id == clinicId &&
                clinic.IsActive);

        if (!clinicExists)
        {
            return NotFound();
        }

        var fee = _configuration.GetValue<decimal?>(
            $"Stores:{clinicId}:DeliveryFee");

        var deliveryAvailable =
            fee.HasValue &&
            fee.Value >= 0 &&
            fee.Value <= 9999999999999999.99m &&
            decimal.Round(fee.Value, 2) == fee.Value;

        return Ok(new
        {
            deliveryAvailable,
            deliveryFee = deliveryAvailable ? fee : null,
            paymentMethods = new[] { "cash" }
        });
    }
}