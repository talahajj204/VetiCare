using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Constants;
using VetClinic.Core.Entities;
using VetClinic.Infrastructure.Data;
using VetClinic.Infrastructure.Identity;

namespace VetClinic.Web.Services;

public sealed record SubscriptionAccessDecision(
    bool Allowed,
    string Code,
    string Message,
    string? EndDate = null);

public sealed class ClinicSubscriptionAccess
{
    private readonly AppDbContext _db;
    private readonly UserManager<ApplicationUser> _users;

    public ClinicSubscriptionAccess(
        AppDbContext db,
        UserManager<ApplicationUser> users)
    {
        _db = db;
        _users = users;
    }

    public async Task<SubscriptionAccessDecision> CheckAsync(
        string? userId,
        CancellationToken cancellationToken = default)
    {
        var user = string.IsNullOrWhiteSpace(userId)
            ? null
            : await _users.FindByIdAsync(userId);

        if (user is null || !user.IsActive)
        {
            return new(
                false,
                "account_unavailable",
                "Your account is unavailable. Please contact the administrator.");
        }

        if (await _users.IsInRoleAsync(user, AppRoles.SuperAdmin))
        {
            return new(
                true,
                "super_admin",
                "Super Admin access.");
        }

        if (user.ClinicId is not int clinicId || clinicId <= 0)
        {
            return new(
                false,
                "clinic_required",
                "Your account is not assigned to a clinic. Please contact the administrator.");
        }

        var clinicActive = await _db.Clinics
            .AsNoTracking()
            .AnyAsync(
                clinic =>
                    clinic.Id == clinicId &&
                    clinic.IsActive,
                cancellationToken);

        if (!clinicActive)
        {
            return new(
                false,
                "clinic_unavailable",
                "Your clinic is unavailable. Please contact the administrator.");
        }

        var day = DateOnly.FromDateTime(
            TimeZoneInfo.ConvertTimeBySystemTimeZoneId(
                DateTime.UtcNow,
                "Asia/Beirut"));

        var subscriptions = _db.Set<ClinicSubscription>()
            .AsNoTracking()
            .Where(item => item.ClinicId == clinicId);

        var active = await subscriptions
            .Where(item =>
                item.StartDate <= day &&
                item.EndDate > day)
            .OrderByDescending(item => item.StartDate)
            .Select(item => new { item.EndDate })
            .FirstOrDefaultAsync(cancellationToken);

        if (active is not null)
        {
            return new(
                true,
                "active",
                "Your subscription is active.",
                active.EndDate.ToString("yyyy-MM-dd"));
        }

        var hasFutureSubscription = await subscriptions
            .AnyAsync(
                item => item.StartDate > day,
                cancellationToken);

        if (hasFutureSubscription)
        {
            return new(
                false,
                "subscription_not_started",
                "Your subscription has not started yet. Please contact the administrator.");
        }

        var expired = await subscriptions
            .Where(item => item.EndDate <= day)
            .OrderByDescending(item => item.EndDate)
            .Select(item => new { item.EndDate })
            .FirstOrDefaultAsync(cancellationToken);

        if (expired is not null)
        {
            return new(
                false,
                "subscription_expired",
                "Your subscription has expired. Please contact the administrator.",
                expired.EndDate.ToString("yyyy-MM-dd"));
        }

        return new(
            false,
            "subscription_required",
            "Your clinic does not have an active subscription. Please contact the administrator.");
    }
}
