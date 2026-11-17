using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using VetClinic.Core.Interfaces;

namespace VetClinic.Web.Services;

public class HttpAuditActorAccessor : IAuditActorAccessor
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public HttpAuditActorAccessor(
        IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public bool HasHttpRequest =>
        _httpContextAccessor.HttpContext is not null;

    public bool IsAuthenticated =>
        _httpContextAccessor.HttpContext?
            .User.Identity?.IsAuthenticated == true;

    public string? UserId
    {
        get
        {
            if (!IsAuthenticated)
            {
                return null;
            }

            return _httpContextAccessor.HttpContext?
                .User.FindFirst(ClaimTypes.NameIdentifier)?
                .Value;
        }
    }
}