using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using VetClinic.Web.Controllers;

namespace VetClinic.Web.Services;

public sealed class ClinicSubscriptionFilter : IAsyncActionFilter
{
    private readonly ClinicSubscriptionAccess _access;

    public ClinicSubscriptionFilter(ClinicSubscriptionAccess access)
    {
        _access = access;
    }

    public async Task OnActionExecutionAsync(
        ActionExecutingContext context,
        ActionExecutionDelegate next)
    {
        var http = context.HttpContext;

        // Authentication and public endpoints remain available.
        if (
            http.User.Identity?.IsAuthenticated != true ||
            http.GetEndpoint()?.Metadata
                .GetMetadata<IAllowAnonymous>() is not null ||
            context.Controller is AuthController ||
            context.Controller is SubscriptionAccessController)
        {
            await next();
            return;
        }

        var decision = await _access.CheckAsync(
            http.User.FindFirstValue(ClaimTypes.NameIdentifier),
            http.RequestAborted);

        if (!decision.Allowed)
        {
            http.Response.Headers.CacheControl = "no-store";

            context.Result = new ObjectResult(new
            {
                code = decision.Code,
                message = decision.Message,
                endDate = decision.EndDate
            })
            {
                StatusCode = StatusCodes.Status403Forbidden
            };

            return;
        }

        await next();
    }
}
