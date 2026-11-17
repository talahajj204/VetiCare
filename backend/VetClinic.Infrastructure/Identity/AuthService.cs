using System.Reflection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;
using VetClinic.Core.Constants;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Infrastructure.Identity;

public class AuthService : IAuthService
{
    private const string PermissionClaimType = "permission";

    private readonly AppDbContext _db;

    private readonly UserManager<ApplicationUser> _userManager;

    private readonly SignInManager<ApplicationUser> _signInManager;

    private static readonly HashSet<string> ValidPermissions =
        typeof(AppPermissions)
            .GetFields(BindingFlags.Public | BindingFlags.Static)
            .Where(field =>
                field.IsLiteral &&
                !field.IsInitOnly &&
                field.FieldType == typeof(string))
            .Select(field =>
                (string)field.GetRawConstantValue()!)
            .ToHashSet(StringComparer.Ordinal);

    public AuthService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        AppDbContext db)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _db = db;
    }

    private async Task<bool> CanAccessAsync(
        ApplicationUser user)
    {
        if (!user.IsActive)
        {
            return false;
        }

        if (user.ClinicId is int clinicId)
        {
            return await _db.Clinics
                .AsNoTracking()
                .AnyAsync(clinic =>
                    clinic.Id == clinicId &&
                    clinic.IsActive);
        }

        return true;
    }

    public async Task<AuthUserDto?> LoginAsync(
        LoginDto request)
    {
        var user = await _userManager.FindByEmailAsync(
            request.Email.Trim());

        if (user is null || !await CanAccessAsync(user))
        {
            return null;
        }

        var result = await _signInManager.PasswordSignInAsync(
            user,
            request.Password,
            isPersistent: request.RememberMe,
            lockoutOnFailure: true);

        if (!result.Succeeded)
        {
            return null;
        }

        return await ToDtoAsync(user);
    }

    public async Task LogoutAsync()
    {
        await _signInManager.SignOutAsync();
    }

    public async Task<AuthUserDto?> GetUserAsync(
        string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user is null || !await CanAccessAsync(user))
        {
            return null;
        }

        return await ToDtoAsync(user);
    }

    private async Task<AuthUserDto> ToDtoAsync(
        ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);

        List<string> permissions;

        if (roles.Contains(AppRoles.ClinicAdmin))
        {
            permissions = ValidPermissions
                .OrderBy(permission => permission)
                .ToList();
        }
        else
        {
            var claims = await _userManager.GetClaimsAsync(user);

            permissions = claims
                .Where(claim =>
                    claim.Type == PermissionClaimType &&
                    ValidPermissions.Contains(claim.Value))
                .Select(claim => claim.Value)
                .Distinct(StringComparer.Ordinal)
                .OrderBy(permission => permission)
                .ToList();
        }

        return new AuthUserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email ?? string.Empty,
            ClinicId = user.ClinicId,
            Roles = roles.ToList(),
            Permissions = permissions
        };
    }
}