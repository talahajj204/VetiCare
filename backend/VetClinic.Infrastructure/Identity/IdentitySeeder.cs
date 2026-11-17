using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Constants;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Infrastructure.Identity;

public static class IdentitySeeder
{
    public static async Task SeedRolesAsync(
        RoleManager<IdentityRole> roleManager)
    {
        string[] roles =
        [
            AppRoles.SuperAdmin,
            AppRoles.ClinicAdmin,
            AppRoles.Staff
        ];

        foreach (var role in roles)
        {
            if (await roleManager.RoleExistsAsync(role))
            {
                continue;
            }

            var result = await roleManager.CreateAsync(
                new IdentityRole(role)
            );

            EnsureSucceeded(result, $"create role '{role}'");
        }
    }

    public static async Task SeedSuperAdminAsync(
        UserManager<ApplicationUser> userManager,
        string email,
        string password)
    {
        if (string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(password))
        {
            throw new InvalidOperationException(
                "Super Admin email and password must be configured."
            );
        }

        email = email.Trim();

        var existingUser = await userManager.FindByEmailAsync(email);

        if (existingUser is not null)
        {
            if (!await userManager.IsInRoleAsync(
                existingUser,
                AppRoles.SuperAdmin))
            {
                throw new InvalidOperationException(
                    "The configured email belongs to an existing " +
                    "account without the SuperAdmin role."
                );
            }

            return;
        }

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FullName = "Tala El Hajj",
            IsActive = true,
            ClinicId = null
        };

        var createResult = await userManager.CreateAsync(
            user,
            password
        );

        EnsureSucceeded(createResult, "create Super Admin");

        var roleResult = await userManager.AddToRoleAsync(
            user,
            AppRoles.SuperAdmin
        );

        EnsureSucceeded(roleResult, "assign SuperAdmin role");
    }

    public static async Task SeedClinicAdminAsync(
        UserManager<ApplicationUser> userManager,
        AppDbContext dbContext,
        string email,
        string password,
        int clinicId)
    {
        if (string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(password) ||
            clinicId <= 0)
        {
            throw new InvalidOperationException(
                "Clinic Admin email, password, and a valid " +
                "ClinicId must be configured."
            );
        }

        var clinicExists = await dbContext.Clinics.AnyAsync(
            clinic => clinic.Id == clinicId && clinic.IsActive
        );

        if (!clinicExists)
        {
            throw new InvalidOperationException(
                $"Active clinic with ID '{clinicId}' was not found."
            );
        }

        email = email.Trim();

        var existingUser = await userManager.FindByEmailAsync(email);

        if (existingUser is not null)
        {
            var isClinicAdmin = await userManager.IsInRoleAsync(
                existingUser,
                AppRoles.ClinicAdmin
            );

            var isSuperAdmin = await userManager.IsInRoleAsync(
                existingUser,
                AppRoles.SuperAdmin
            );

            if (!isClinicAdmin ||
                isSuperAdmin ||
                existingUser.ClinicId != clinicId)
            {
                throw new InvalidOperationException(
                    "The configured email belongs to an account " +
                    "with a different role or clinic."
                );
            }

            return;
        }

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FullName = "Fatima Abbas",
            IsActive = true,
            ClinicId = clinicId
        };

        await using var transaction =
            await dbContext.Database.BeginTransactionAsync();

        var createResult = await userManager.CreateAsync(
            user,
            password
        );

        EnsureSucceeded(createResult, "create Clinic Admin");

        var roleResult = await userManager.AddToRoleAsync(
            user,
            AppRoles.ClinicAdmin
        );

        EnsureSucceeded(roleResult, "assign ClinicAdmin role");

        await transaction.CommitAsync();
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
            result.Errors.Select(error => error.Description)
        );

        throw new InvalidOperationException(
            $"Could not {operation}: {errors}"
        );
    }
}