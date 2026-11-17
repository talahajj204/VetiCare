using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Constants;
using VetClinic.Infrastructure.Data;
using VetClinic.Infrastructure.Identity;

namespace VetClinic.Infrastructure.Authorization;

public sealed class PermissionRequirement : IAuthorizationRequirement
{
    public string Permission { get; }

    public PermissionRequirement(string permission)
    {
        Permission = permission;
    }
}

public sealed class PermissionAuthorizationHandler
    : AuthorizationHandler<PermissionRequirement>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _dbContext;

    public PermissionAuthorizationHandler(
        UserManager<ApplicationUser> userManager,
        AppDbContext dbContext)
    {
        _userManager = userManager;
        _dbContext = dbContext;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        if (context.User.Identity?.IsAuthenticated != true)
        {
            return;
        }

        var userId = context.User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
        {
            return;
        }

        var user = await _userManager.FindByIdAsync(userId);

        if (user is null ||
            !user.IsActive ||
            user.ClinicId is not int clinicId)
        {
            return;
        }

        var clinicIsActive = await _dbContext.Clinics
            .AsNoTracking()
            .AnyAsync(clinic =>
                clinic.Id == clinicId &&
                clinic.IsActive);

        if (!clinicIsActive)
        {
            return;
        }

        if (await _userManager.IsInRoleAsync(
            user,
            AppRoles.ClinicAdmin))
        {
            context.Succeed(requirement);
            return;
        }

        if (!await _userManager.IsInRoleAsync(
            user,
            AppRoles.Staff))
        {
            return;
        }

        var claims = await _userManager.GetClaimsAsync(user);

        var hasPermission = claims.Any(claim =>
            claim.Type == "permission" &&
            claim.Value == requirement.Permission);

        if (hasPermission)
        {
            context.Succeed(requirement);
        }
    }
}