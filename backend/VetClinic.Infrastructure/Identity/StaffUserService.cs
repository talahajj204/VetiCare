using System.ComponentModel.DataAnnotations;
using System.Reflection;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;
using VetClinic.Core.Constants;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Infrastructure.Identity;

public class StaffUserService : IStaffUserService
{
    private const string PermissionClaimType = "permission";
    private const string StaffRoleClaimType = "staff_role";

    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _context;

    private static readonly HashSet<string> ValidPermissions =
        typeof(AppPermissions)
            .GetFields(BindingFlags.Public | BindingFlags.Static)
            .Where(field =>
                field.IsLiteral &&
                !field.IsInitOnly &&
                field.FieldType == typeof(string))
            .Select(field => (string)field.GetRawConstantValue()!)
            .ToHashSet(StringComparer.Ordinal);

    public StaffUserService(
        UserManager<ApplicationUser> userManager,
        AppDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

    public async Task<List<StaffUserDto>> GetAllAsync(int clinicId)
    {
        await EnsureActiveClinicAsync(clinicId);

        var staffRoleIds = _context.Roles
            .Where(role => role.Name == AppRoles.Staff)
            .Select(role => role.Id);

        var adminRoleIds = _context.Roles
            .Where(role =>
                role.Name == AppRoles.ClinicAdmin ||
                role.Name == AppRoles.SuperAdmin)
            .Select(role => role.Id);

        var users = await _userManager.Users
            .Where(user =>
                user.ClinicId == clinicId &&
                _context.UserRoles.Any(userRole =>
                    userRole.UserId == user.Id &&
                    staffRoleIds.Contains(userRole.RoleId)) &&
                !_context.UserRoles.Any(userRole =>
                    userRole.UserId == user.Id &&
                    adminRoleIds.Contains(userRole.RoleId)))
            .OrderBy(user => user.FullName)
            .ToListAsync();

        var result = new List<StaffUserDto>();

        foreach (var user in users)
        {
            result.Add(await ToDtoAsync(user));
        }

        return result;
    }

    public async Task<StaffUserDto?> GetByIdAsync(
        int clinicId,
        string userId)
    {
        await EnsureActiveClinicAsync(clinicId);

        var user = await FindStaffAsync(clinicId, userId);

        return user is null
            ? null
            : await ToDtoAsync(user);
    }

    public async Task<StaffUserDto> CreateAsync(
        int clinicId,
        CreateStaffUserDto dto)
    {
        await EnsureActiveClinicAsync(clinicId);

        Validator.ValidateObject(
            dto,
            new ValidationContext(dto),
            validateAllProperties: true);

        var permissions = ValidateStaffData(
            dto.Name,
            dto.Email,
            dto.Role,
            dto.Permissions);

        var email = dto.Email.Trim();

        if (await _userManager.FindByEmailAsync(email) is not null)
        {
            throw new ValidationException(
                "This email is already used by another account.");
        }

        if (!await _context.Roles.AnyAsync(
            role => role.Name == AppRoles.Staff))
        {
            throw new ValidationException(
                "The Staff role has not been configured.");
        }

        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FullName = dto.Name.Trim(),
            PhoneNumber = (dto.Phone ?? string.Empty).Trim(),
            ClinicId = clinicId,
            IsActive = true,
            LockoutEnabled = true
        };

        EnsureSucceeded(
            await _userManager.CreateAsync(user, dto.Password),
            "create the staff account");

        // Every employee receives only the Identity Staff role.
        // Their job title is stored separately as a claim.
        EnsureSucceeded(
            await _userManager.AddToRoleAsync(
                user,
                AppRoles.Staff),
            "assign the Staff role");

        EnsureSucceeded(
            await _userManager.AddClaimsAsync(
                user,
                BuildClaims(dto.Role.Trim(), permissions)),
            "save the staff permissions");

        await transaction.CommitAsync();

        return await ToDtoAsync(user);
    }

    public async Task<StaffUserDto?> UpdateAsync(
        int clinicId,
        string userId,
        UpdateStaffUserDto dto)
    {
        await EnsureActiveClinicAsync(clinicId);

        Validator.ValidateObject(
            dto,
            new ValidationContext(dto),
            validateAllProperties: true);

        var permissions = ValidateStaffData(
            dto.Name,
            dto.Email,
            dto.Role,
            dto.Permissions);

        var user = await FindStaffAsync(clinicId, userId);

        if (user is null)
        {
            return null;
        }

        var email = dto.Email.Trim();
        var existingUser = await _userManager.FindByEmailAsync(email);

        if (existingUser is not null &&
            existingUser.Id != user.Id)
        {
            throw new ValidationException(
                "This email is already used by another account.");
        }

        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        var emailChanged = !string.Equals(
            user.Email,
            email,
            StringComparison.OrdinalIgnoreCase);

        user.FullName = dto.Name.Trim();
        user.PhoneNumber = (dto.Phone ?? string.Empty).Trim();
        user.Email = email;
        user.UserName = email;

        if (emailChanged)
        {
            user.EmailConfirmed = false;
        }

        EnsureSucceeded(
            await _userManager.UpdateAsync(user),
            "update the staff account");

        var existingClaims =
            await _userManager.GetClaimsAsync(user);

        var claimsToReplace = existingClaims
            .Where(claim =>
                claim.Type == PermissionClaimType ||
                claim.Type == StaffRoleClaimType)
            .ToList();

        if (claimsToReplace.Count > 0)
        {
            EnsureSucceeded(
                await _userManager.RemoveClaimsAsync(
                    user,
                    claimsToReplace),
                "remove the previous staff permissions");
        }

        EnsureSucceeded(
            await _userManager.AddClaimsAsync(
                user,
                BuildClaims(dto.Role.Trim(), permissions)),
            "save the updated staff permissions");

        EnsureSucceeded(
            await _userManager.UpdateSecurityStampAsync(user),
            "update the account security stamp");

        await transaction.CommitAsync();

        return await ToDtoAsync(user);
    }

    public async Task<StaffUserDto?> SetActiveAsync(
        int clinicId,
        string userId,
        bool isActive)
    {
        await EnsureActiveClinicAsync(clinicId);

        var user = await FindStaffAsync(clinicId, userId);

        if (user is null)
        {
            return null;
        }

        if (user.IsActive == isActive)
        {
            return await ToDtoAsync(user);
        }

        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        user.IsActive = isActive;

        EnsureSucceeded(
            await _userManager.UpdateAsync(user),
            "update the account status");

        EnsureSucceeded(
            await _userManager.UpdateSecurityStampAsync(user),
            "update the account security stamp");

        await transaction.CommitAsync();

        return await ToDtoAsync(user);
    }

    private async Task<ApplicationUser?> FindStaffAsync(
        int clinicId,
        string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return null;
        }

        var user = await _userManager.Users
            .SingleOrDefaultAsync(item =>
                item.Id == userId &&
                item.ClinicId == clinicId);

        if (user is null)
        {
            return null;
        }

        var roles = await _userManager.GetRolesAsync(user);

        // These endpoints cannot modify administrator accounts.
        if (!roles.Contains(AppRoles.Staff) ||
            roles.Contains(AppRoles.ClinicAdmin) ||
            roles.Contains(AppRoles.SuperAdmin))
        {
            return null;
        }

        return user;
    }

    private async Task EnsureActiveClinicAsync(int clinicId)
    {
        var exists = clinicId > 0 &&
            await _context.Clinics
                .AsNoTracking()
                .AnyAsync(clinic =>
                    clinic.Id == clinicId &&
                    clinic.IsActive);

        if (!exists)
        {
            throw new ValidationException(
                "The clinic is missing or inactive.");
        }
    }

    private static List<string> ValidateStaffData(
        string name,
        string email,
        string role,
        List<string>? permissions)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ValidationException(
                "The employee name is required.");
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            throw new ValidationException(
                "The employee email is required.");
        }

        if (string.IsNullOrWhiteSpace(role))
        {
            throw new ValidationException(
                "The employee job role is required.");
        }

        if (permissions is null)
        {
            throw new ValidationException(
                "The permissions list is required.");
        }

        if (permissions.Any(permission =>
            string.IsNullOrWhiteSpace(permission) ||
            !ValidPermissions.Contains(permission)))
        {
            throw new ValidationException(
                "The permissions list contains an invalid permission.");
        }

        return permissions
            .Distinct(StringComparer.Ordinal)
            .OrderBy(permission => permission)
            .ToList();
    }

    private static List<Claim> BuildClaims(
        string jobRole,
        List<string> permissions)
    {
        var claims = new List<Claim>
        {
            new(StaffRoleClaimType, jobRole)
        };

        claims.AddRange(
            permissions.Select(permission =>
                new Claim(PermissionClaimType, permission)));

        return claims;
    }

    private async Task<StaffUserDto> ToDtoAsync(
        ApplicationUser user)
    {
        var claims = await _userManager.GetClaimsAsync(user);

        return new StaffUserDto
        {
            Id = user.Id,
            Name = user.FullName,
            Email = user.Email ?? string.Empty,
            Phone = user.PhoneNumber ?? string.Empty,
            Role = claims
                .FirstOrDefault(claim =>
                    claim.Type == StaffRoleClaimType)
                ?.Value ?? "Staff",
            Status = user.IsActive ? "Active" : "Inactive",
            Permissions = claims
                .Where(claim =>
                    claim.Type == PermissionClaimType &&
                    ValidPermissions.Contains(claim.Value))
                .Select(claim => claim.Value)
                .Distinct(StringComparer.Ordinal)
                .OrderBy(permission => permission)
                .ToList()
        };
    }

    private static void EnsureSucceeded(
        IdentityResult result,
        string operation)
    {
        if (result.Succeeded)
        {
            return;
        }

        var errors = string.Join(
            "; ",
            result.Errors.Select(error => error.Description));

        throw new ValidationException(
            $"Could not {operation}: {errors}");
    }
}