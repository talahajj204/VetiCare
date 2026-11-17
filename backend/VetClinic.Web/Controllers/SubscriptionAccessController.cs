using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VetClinic.Web.Services;

namespace VetClinic.Web.Controllers;

[ApiController]
[Authorize]
[Route("api/auth/subscription")]
public class SubscriptionAccessController : ControllerBase
{
    private readonly ClinicSubscriptionAccess _access;

    public SubscriptionAccessController(ClinicSubscriptionAccess access)
    {
        _access = access;
    }

    [HttpGet]
    public async Task<IActionResult> Get(
        CancellationToken cancellationToken)
    {
        Response.Headers.CacheControl = "no-store";

        return Ok(
            await _access.CheckAsync(
                User.FindFirstValue(ClaimTypes.NameIdentifier),
                cancellationToken));
    }
}
