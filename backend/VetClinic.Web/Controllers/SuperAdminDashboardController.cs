using System.Globalization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Constants;
using VetClinic.Core.Entities;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Web.Controllers;

[ApiController]
[Route("api/super-admin/dashboard")]
[Authorize(Roles = AppRoles.SuperAdmin)]
public class SuperAdminDashboardController : ControllerBase
{
    private readonly AppDbContext _db;

    private static readonly TimeZoneInfo Zone =
        TimeZoneInfo.FindSystemTimeZoneById("Asia/Beirut");

    private static readonly CultureInfo English =
        CultureInfo.InvariantCulture;

    public SuperAdminDashboardController(AppDbContext db)
    {
        _db = db;
    }

    private static DateTime ToUtc(DateTime local)
    {
        local = DateTime.SpecifyKind(
            local,
            DateTimeKind.Unspecified);

        while (Zone.IsInvalidTime(local))
        {
            local = local.AddMinutes(1);
        }

        return TimeZoneInfo.ConvertTimeToUtc(local, Zone);
    }

    private static DateTime ToLocal(DateTime utc)
    {
        return TimeZoneInfo.ConvertTimeFromUtc(
            DateTime.SpecifyKind(utc, DateTimeKind.Utc),
            Zone);
    }

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] string period = "Last 7 Months",
        CancellationToken cancellationToken = default)
    {
        var nowUtc = DateTime.UtcNow;
        var now = ToLocal(nowUtc);
        var today = DateOnly.FromDateTime(now);
        var month = new DateTime(now.Year, now.Month, 1);

        var boundaries = new List<DateTime>();
        var labels = new List<string>();

        switch (period)
        {
            case "Today":
            case "Yesterday":
                var day = now.Date.AddDays(
                    period == "Yesterday" ? -1 : 0);

                for (var hour = 0; hour <= 24; hour += 4)
                {
                    boundaries.Add(day.AddHours(hour));
                }

                labels.AddRange(
                    boundaries.Take(6).Select(date =>
                        date.ToString("HH:mm", English)));
                break;

            case "Last Month":
                var previousMonth = month.AddMonths(-1);

                var days = DateTime.DaysInMonth(
                    previousMonth.Year,
                    previousMonth.Month);

                for (var index = 0; index <= days; index++)
                {
                    boundaries.Add(previousMonth.AddDays(index));
                }

                labels.AddRange(
                    boundaries.Take(days).Select(date =>
                        date.ToString("dd MMM", English)));
                break;

            case "Last Year":
                var previousYear = new DateTime(
                    now.Year - 1, 1, 1);

                for (var index = 0; index <= 12; index++)
                {
                    boundaries.Add(previousYear.AddMonths(index));
                }

                labels.AddRange(
                    boundaries.Take(12).Select(date =>
                        date.ToString("MMM", English)));
                break;

            case "Last 7 Months":
                for (var index = -6; index <= 1; index++)
                {
                    boundaries.Add(month.AddMonths(index));
                }

                labels.AddRange(
                    boundaries.Take(7).Select(date =>
                        date.ToString("MMM yy", English)));
                break;

            default:
                return BadRequest(new
                {
                    message = "Invalid dashboard period."
                });
        }

        var totalUsers = await _db.Users
            .CountAsync(cancellationToken);

        var clinics = await _db.Clinics
            .AsNoTracking()
            .Select(clinic => new
            {
                clinic.IsActive,
                clinic.AccountStatus
            })
            .ToListAsync(cancellationToken);

        var activePlans = await _db.Set<SubscriptionPlan>()
            .AsNoTracking()
            .CountAsync(
                plan => plan.Status == "Active",
                cancellationToken);

        var activeSubscriptionsQuery =
            _db.Set<ClinicSubscription>()
                .AsNoTracking()
                .Where(item =>
                    item.StartDate <= today &&
                    item.EndDate > today);

        var activeSubscriptions =
            await activeSubscriptionsQuery.CountAsync(
                cancellationToken);

        var totalCollected =
            await _db.Set<SubscriptionPayment>()
                .AsNoTracking()
                .SumAsync(
                    payment => (decimal?)payment.Amount,
                    cancellationToken)
            ?? 0m;

        var startUtc = ToUtc(boundaries[0]);
        var endUtc = ToUtc(boundaries[^1]);

        if (endUtc > nowUtc)
        {
            endUtc = nowUtc;
        }

        var registrationDates = await _db.Users
            .AsNoTracking()
            .Where(user =>
                user.CreatedAt >= startUtc &&
                user.CreatedAt < endUtc)
            .Select(user => user.CreatedAt)
            .ToListAsync(cancellationToken);

        var localDates = registrationDates
            .Select(ToLocal)
            .ToList();

        var growth = labels.Select((label, index) => new
        {
            Label = label,
            Users = localDates.Count(date =>
                date >= boundaries[index] &&
                date < boundaries[index + 1])
        }).ToList();

        var statuses = new[]
        {
            new
            {
                Name = "Active",
                Value = clinics.Count(clinic =>
                    clinic.IsActive &&
                    clinic.AccountStatus != "Pending" &&
                    clinic.AccountStatus != "Inactive"),
                Color = "#39aaa5"
            },
            new
            {
                Name = "Pending",
                Value = clinics.Count(clinic =>
                    clinic.IsActive &&
                    clinic.AccountStatus == "Pending"),
                Color = "#ffc857"
            },
            new
            {
                Name = "Suspended",
                Value = clinics.Count(clinic => !clinic.IsActive),
                Color = "#ff786c"
            },
            new
            {
                Name = "Inactive",
                Value = clinics.Count(clinic =>
                    clinic.IsActive &&
                    clinic.AccountStatus == "Inactive"),
                Color = "#a5b4be"
            }
        };

        var planCounts = await activeSubscriptionsQuery
            .GroupBy(item => item.PlanId)
            .Select(group => new
            {
                PlanId = group.Key,
                Count = group.Count()
            })
            .ToListAsync(cancellationToken);

        var planNames = await _db.Set<SubscriptionPlan>()
            .AsNoTracking()
            .Select(plan => new { plan.Id, plan.Name })
            .ToListAsync(cancellationToken);

        var topPlans = planNames.Select(plan => new
        {
            plan.Name,
            Subscribers = planCounts
                .FirstOrDefault(count => count.PlanId == plan.Id)
                ?.Count ?? 0
        })
        .OrderByDescending(plan => plan.Subscribers)
        .ThenBy(plan => plan.Name)
        .ToList();

        var activity = new List<(
            string Id,
            string Name,
            string Action,
            DateTime At)>();

        var audit = await _db.AuditLogEntries
            .AsNoTracking()
            .OrderByDescending(entry => entry.CreatedAt)
            .ThenByDescending(entry => entry.Id)
            .Take(10)
            .Select(entry => new
            {
                entry.Id,
                entry.UserName,
                entry.Action,
                entry.EntityType,
                entry.CreatedAt
            })
            .ToListAsync(cancellationToken);

        activity.AddRange(audit.Select(entry => (
            $"audit-{entry.Id}",
            entry.UserName,
            $"{entry.Action} {entry.EntityType}",
            entry.CreatedAt)));

        var newClinics = await _db.Clinics
            .AsNoTracking()
            .OrderByDescending(clinic => clinic.CreatedAt)
            .ThenByDescending(clinic => clinic.Id)
            .Take(10)
            .Select(clinic => new
            {
                clinic.Id,
                clinic.Name,
                clinic.CreatedAt
            })
            .ToListAsync(cancellationToken);

        activity.AddRange(newClinics.Select(clinic => (
            $"clinic-{clinic.Id}",
            clinic.Name,
            "Clinic registered",
            clinic.CreatedAt)));

        var newUsers = await _db.Users
            .AsNoTracking()
            .OrderByDescending(user => user.CreatedAt)
            .ThenBy(user => user.Id)
            .Take(10)
            .Select(user => new
            {
                user.Id,
                user.FullName,
                user.CreatedAt
            })
            .ToListAsync(cancellationToken);

        activity.AddRange(newUsers.Select(user => (
            $"user-{user.Id}",
            user.FullName,
            "User registered",
            user.CreatedAt)));

        var recentActivity = activity
            .OrderByDescending(entry => entry.At)
            .ThenBy(entry => entry.Id)
            .Take(10)
            .Select(entry => new
            {
                entry.Id,
                entry.Name,
                entry.Action,
                Date = ToLocal(entry.At)
                    .ToString("dd MMM yyyy HH:mm", English)
            })
            .ToList();

        return Ok(new
        {
            Period = period,
            Summary = new
            {
                TotalUsers = totalUsers,
                TotalClinics = clinics.Count,
                ActivePlans = activePlans,
                ActiveSubscriptions = activeSubscriptions,
                TotalCollected = totalCollected
            },
            Growth = growth,
            Statuses = statuses,
            Plans = topPlans,
            RecentActivity = recentActivity
        });
    }
}
