using System.ComponentModel.DataAnnotations;
using System.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Constants;
using VetClinic.Core.Entities;
using VetClinic.Infrastructure.Data;
using VetClinic.Infrastructure.Identity;

namespace VetClinic.Web.Controllers;

public class AddClinicAdminRequest
{
    [Required, MaxLength(200)]
    public string ClinicName { get; set; } = "";

    [Required, MaxLength(200)]
    public string Name { get; set; } = "";

    [Required, EmailAddress, MaxLength(254)]
    public string Email { get; set; } = "";

    [MaxLength(50)]
    public string? Phone { get; set; }

    [Required, MinLength(12)]
    public string Password { get; set; } = "";

    [Required, Compare(nameof(Password))]
    public string ConfirmPassword { get; set; } = "";
}

public class EditManagedClinicRequest
{
    [Required, MaxLength(200)]
    public string ClinicName { get; set; } = "";

    [MaxLength(200)]
    public string? AdminName { get; set; }

    [EmailAddress, MaxLength(254)]
    public string? Email { get; set; }

    [MaxLength(50)]
    public string? Phone { get; set; }

    [MaxLength(500)]
    public string? Location { get; set; }

    [Required, RegularExpression("^(Basic|Professional|Premium)$")]
    public string Plan { get; set; } = "Basic";

    [Required, RegularExpression("^(Active|Pending|Expired)$")]
    public string Subscription { get; set; } = "Pending";

    [MaxLength(2048)]
    public string? Instagram { get; set; }

    [MaxLength(2048)]
    public string? Facebook { get; set; }

    [MaxLength(2048)]
    public string? Website { get; set; }
}

public class ManagedClinicStatusRequest
{
    [Required]
    public bool? IsActive { get; set; }
}

[ApiController]
[Route("api/super-admin/users")]
[Authorize(Roles = AppRoles.SuperAdmin)]
public class SuperAdminUsersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<ApplicationUser> _users;

    public SuperAdminUsersController(
        AppDbContext db,
        UserManager<ApplicationUser> users)
    {
        _db = db;
        _users = users;
    }

    private async Task<List<ApplicationUser>> GetAdminsAsync()
    {
        var admins = await _users.GetUsersInRoleAsync(
            AppRoles.ClinicAdmin);

        return admins
            .Where(user => user.ClinicId.HasValue)
            .ToList();
    }

    private static object ToRow(
        Clinic clinic,
        ApplicationUser? admin)
    {
        return new
        {
            clinic.Id,
            ClinicName = clinic.Name,
            AdminId = admin?.Id,
            AdminName = admin?.FullName ?? "",
            AdminEmail = admin?.Email ?? "",
            AdminPhone = admin?.PhoneNumber ?? "",
            Email = clinic.Email ?? "",
            clinic.Phone,
            Location = clinic.Address ?? "",
            clinic.Plan,
            clinic.Subscription,
            Status = clinic.IsActive
                ? clinic.AccountStatus
                : "Suspended",
            Registered = clinic.CreatedAt.ToString("yyyy-MM-dd"),
            clinic.Instagram,
            clinic.Facebook,
            clinic.Website
        };
    }

    private static void EnsureSucceeded(IdentityResult result)
    {
        if (!result.Succeeded)
        {
            throw new ValidationException(
                string.Join(
                    " ",
                    result.Errors.Select(error => error.Description)));
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        await SubscriptionsController.RefreshClinicsAsync(_db);

        var clinics = await _db.Clinics
            .AsNoTracking()
            .OrderBy(clinic => clinic.Name)
            .ToListAsync();

        var admins = await GetAdminsAsync();

        return Ok(
            clinics.Select(clinic =>
                ToRow(
                    clinic,
                    admins.FirstOrDefault(
                        admin => admin.ClinicId == clinic.Id))));
    }

    [HttpPost("admins")]
    public async Task<IActionResult> CreateAdmin(
        AddClinicAdminRequest request)
    {
        await using var transaction =
            await _db.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);

        try
        {
            var clinicName = request.ClinicName.Trim();
            var adminName = request.Name.Trim();
            var email = request.Email.Trim();

            if (clinicName.Length == 0 || adminName.Length == 0)
            {
                throw new ValidationException(
                    "Clinic and admin names are required.");
            }

            var clinic = await _db.Clinics
                .FirstOrDefaultAsync(item =>
                    item.Name.Trim().ToUpper() ==
                    clinicName.ToUpper());

            if (clinic is not null)
            {
                var admins = await GetAdminsAsync();

                if (admins.Any(admin => admin.ClinicId == clinic.Id))
                {
                    throw new ValidationException(
                        "This clinic already has an admin. " +
                        "Edit or delete the current admin first.");
                }
            }

            if (await _users.FindByEmailAsync(email) is not null)
            {
                throw new ValidationException(
                    "This email is already used by another account.");
            }

            if (clinic is null)
            {
                clinic = new Clinic
                {
                    Name = clinicName,
                    AccountStatus = "Pending"
                };

                _db.Clinics.Add(clinic);

                await _db.SaveChangesAsync();
            }

            var admin = new ApplicationUser
            {
                FullName = adminName,
                UserName = email,
                Email = email,
                PhoneNumber = (request.Phone ?? "").Trim(),
                ClinicId = clinic.Id,
                IsActive = true,
                LockoutEnabled = true
            };

            EnsureSucceeded(
                await _users.CreateAsync(
                    admin,
                    request.Password));

            EnsureSucceeded(
                await _users.AddToRoleAsync(
                    admin,
                    AppRoles.ClinicAdmin));

            await transaction.CommitAsync();

            return Ok(ToRow(clinic, admin));
        }
        catch (ValidationException exception)
        {
            return BadRequest(new
            {
                message = exception.Message
            });
        }
    }

    [HttpPut("clinics/{id:int}")]
    public async Task<IActionResult> UpdateClinic(
        int id,
        EditManagedClinicRequest request)
    {
        await using var transaction =
            await _db.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);

        try
        {
            var clinic = await _db.Clinics.FindAsync(id);

            if (clinic is null)
            {
                return NotFound();
            }

            var clinicName = request.ClinicName.Trim();

            if (clinicName.Length == 0)
            {
                throw new ValidationException(
                    "Clinic name is required.");
            }

            var duplicateName = await _db.Clinics.AnyAsync(item =>
                item.Id != id &&
                item.Name.Trim().ToUpper() ==
                clinicName.ToUpper());

            if (duplicateName)
            {
                throw new ValidationException(
                    "Another clinic already uses this name.");
            }

            foreach (var link in new[]
            {
                request.Instagram,
                request.Facebook,
                request.Website
            })
            {
                if (string.IsNullOrWhiteSpace(link))
                {
                    continue;
                }

                if (!Uri.TryCreate(
                        link,
                        UriKind.Absolute,
                        out var uri) ||
                    (uri.Scheme != "https" && uri.Scheme != "http"))
                {
                    throw new ValidationException(
                        "Social and website links must start " +
                        "with https:// or http://.");
                }
            }

            var admins = await GetAdminsAsync();

            var admin = admins.FirstOrDefault(
                item => item.ClinicId == id);

            if (admin is not null)
            {
                if (await _users.IsInRoleAsync(
                    admin,
                    AppRoles.SuperAdmin))
                {
                    return Forbid();
                }

                if (string.IsNullOrWhiteSpace(request.AdminName))
                {
                    throw new ValidationException(
                        "Admin name is required. " +
                        "Use Delete Admin to remove the account.");
                }

                admin.FullName = request.AdminName.Trim();

                EnsureSucceeded(
                    await _users.UpdateAsync(admin));
            }
            else if (!string.IsNullOrWhiteSpace(request.AdminName))
            {
                throw new ValidationException(
                    "Use Add Admin to create an account for this clinic.");
            }

            clinic.Name = clinicName;

            clinic.Email =
                string.IsNullOrWhiteSpace(request.Email)
                    ? null
                    : request.Email.Trim();

            clinic.Phone = (request.Phone ?? "").Trim();
            clinic.Address = (request.Location ?? "").Trim();

            clinic.Plan = request.Plan;
            clinic.Subscription = request.Subscription;

            clinic.Instagram = (request.Instagram ?? "").Trim();
            clinic.Facebook = (request.Facebook ?? "").Trim();
            clinic.Website = (request.Website ?? "").Trim();

            await _db.SaveChangesAsync();

            await transaction.CommitAsync();

            return Ok(ToRow(clinic, admin));
        }
        catch (ValidationException exception)
        {
            return BadRequest(new
            {
                message = exception.Message
            });
        }
    }

    [HttpPut("clinics/{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(
        int id,
        ManagedClinicStatusRequest request)
    {
        var clinic = await _db.Clinics.FindAsync(id);

        if (clinic is null)
        {
            return NotFound();
        }

        clinic.IsActive = request.IsActive!.Value;

        clinic.AccountStatus = clinic.IsActive
            ? "Active"
            : "Suspended";

        await _db.SaveChangesAsync();

        var admins = await GetAdminsAsync();

        return Ok(
            ToRow(
                clinic,
                admins.FirstOrDefault(
                    admin => admin.ClinicId == id)));
    }

    [HttpDelete("clinics/{id:int}/admin")]
    public async Task<IActionResult> DeleteAdmin(int id)
    {
        var clinic = await _db.Clinics.FindAsync(id);

        if (clinic is null)
        {
            return NotFound();
        }

        var admins = await GetAdminsAsync();

        var admin = admins.FirstOrDefault(
            item => item.ClinicId == id);

        if (admin is null)
        {
            return NotFound(new
            {
                message = "No admin is assigned to this clinic."
            });
        }

        if (await _users.IsInRoleAsync(
            admin,
            AppRoles.SuperAdmin))
        {
            return Forbid();
        }

        var result = await _users.DeleteAsync(admin);

        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                message = string.Join(
                    " ",
                    result.Errors.Select(
                        error => error.Description))
            });
        }

        return Ok(ToRow(clinic, null));
    }
}