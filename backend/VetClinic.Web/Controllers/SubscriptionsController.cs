using System.ComponentModel.DataAnnotations;
using System.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Constants;
using VetClinic.Core.Entities;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Web.Controllers;

public class SaveClinicSubscriptionRequest
{
    [Required, MaxLength(200)]
    public string Clinic { get; set; } = "";

    [Required, MaxLength(200)]
    public string Admin { get; set; } = "";

    [Required, EmailAddress, MaxLength(254)]
    public string Email { get; set; } = "";

    [Required, MaxLength(100)]
    public string PlanName { get; set; } = "";

    [Required, RegularExpression("^(Monthly|Yearly)$")]
    public string Billing { get; set; } = "Monthly";

    [Required, Range(typeof(decimal), "0.01", "99999999.99")]
    public decimal? Amount { get; set; }

    [Required, Range(typeof(decimal), "0", "100")]
    public decimal? Discount { get; set; }

    [Required]
    public DateOnly? StartDate { get; set; }

    [Required]
    public DateOnly? EndDate { get; set; }

    [MaxLength(4000)]
    public string? Notes { get; set; }
}

public class RecordSubscriptionPaymentRequest
{
    public Guid RequestId { get; set; }

    [Required, Range(typeof(decimal), "0.01", "99999999.99")]
    public decimal? Amount { get; set; }

    [Required]
    public DateOnly? Date { get; set; }

    [Required]
    public string Method { get; set; } = "Cash";

    [MaxLength(4000)]
    public string? Notes { get; set; }
}

[ApiController]
[Route("api/super-admin/subscriptions")]
[Authorize(Roles = AppRoles.SuperAdmin)]
public class SubscriptionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public SubscriptionsController(AppDbContext db)
    {
        _db = db;
    }

    private static decimal Round(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);

    private static decimal Total(ClinicSubscription item) =>
        item.Amount - Round(item.Amount * item.Discount / 100m);

    private static DateOnly Today() =>
        DateOnly.FromDateTime(
            TimeZoneInfo.ConvertTimeBySystemTimeZoneId(
                DateTime.UtcNow,
                "Asia/Beirut"));

    private async Task<object> ToDtoAsync(ClinicSubscription item)
    {
        var plan = await _db.Set<SubscriptionPlan>()
            .FindAsync(item.PlanId);

        return new
        {
            item.Id,
            item.ClinicId,
            item.PlanId,
            item.Clinic,
            item.Admin,
            item.Email,
            PlanName = plan!.Name,
            item.Billing,
            item.Amount,
            item.Discount,
            DiscountType = "percent",
            StartDate = item.StartDate.ToString("yyyy-MM-dd"),
            EndDate = item.EndDate.ToString("yyyy-MM-dd"),
            item.Notes,
            Payments = item.Payments
                .OrderBy(payment => payment.Id)
                .Select(payment => new
                {
                    payment.Id,
                    payment.Amount,
                    Date = payment.Date.ToString("yyyy-MM-dd"),
                    payment.Method,
                    payment.Notes
                })
        };
    }

    // Refresh displayed subscription summaries without changing account suspension.
    public static async Task RefreshClinicsAsync(AppDbContext db)
    {
        var day = Today();

        var subscriptions = await db.Set<ClinicSubscription>()
            .AsNoTracking()
            .ToListAsync();

        var plans = await db.Set<SubscriptionPlan>()
            .AsNoTracking()
            .ToDictionaryAsync(plan => plan.Id);

        var clinics = await db.Clinics.ToListAsync();

        foreach (var clinic in clinics)
        {
            var items = subscriptions
                .Where(item => item.ClinicId == clinic.Id)
                .ToList();

            var selected = items
                .Where(item =>
                    item.StartDate <= day &&
                    item.EndDate > day)
                .OrderByDescending(item => item.StartDate)
                .FirstOrDefault()
                ?? items
                    .Where(item => item.StartDate > day)
                    .OrderBy(item => item.StartDate)
                    .FirstOrDefault()
                ?? items
                    .OrderByDescending(item => item.EndDate)
                    .FirstOrDefault();

            clinic.Subscription =
                selected is null || selected.StartDate > day
                    ? "Pending"
                    : selected.EndDate <= day
                        ? "Expired"
                        : "Active";

            if (selected is not null &&
                plans.TryGetValue(selected.PlanId, out var plan))
            {
                clinic.Plan = plan.Name;
            }
        }

        await db.SaveChangesAsync();
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var records = await _db.Set<ClinicSubscription>()
            .AsNoTracking()
            .Include(item => item.Payments)
            .OrderByDescending(item => item.Id)
            .ToListAsync();

        var result = new List<object>();

        foreach (var item in records)
        {
            result.Add(await ToDtoAsync(item));
        }

        return Ok(result);
    }

    private async Task ApplyAsync(
        ClinicSubscription item,
        SaveClinicSubscriptionRequest request,
        bool creating)
    {
        if (string.IsNullOrWhiteSpace(request.Admin))
            throw new ValidationException("Admin name is required.");

        if (request.StartDate!.Value == DateOnly.MinValue ||
            request.EndDate!.Value <= request.StartDate.Value)
        {
            throw new ValidationException(
                "End Date must be later than Start Date.");
        }

        if (Round(request.Amount!.Value) != request.Amount.Value ||
            Round(request.Discount!.Value) != request.Discount.Value)
        {
            throw new ValidationException(
                "Amount and discount must have at most two decimal places.");
        }

        var clinicName = request.Clinic.Trim();

        var clinic = await _db.Clinics.FirstOrDefaultAsync(
            candidate =>
                candidate.Name.Trim().ToUpper() ==
                clinicName.ToUpper());

        if (clinic is null && !creating && clinicName == item.Clinic)
        {
            clinic = await _db.Clinics.FindAsync(item.ClinicId);
        }

        if (clinic is null)
        {
            throw new ValidationException(
                "Choose an existing registered clinic. " +
                "Create it from Admin & Users first.");
        }

        if (!creating && clinic.Id != item.ClinicId)
        {
            throw new ValidationException(
                "A subscription cannot be transferred to another clinic.");
        }

        var planName = request.PlanName.Trim();

        var plan = await _db.Set<SubscriptionPlan>()
            .FirstOrDefaultAsync(candidate =>
                candidate.Name.ToUpper() == planName.ToUpper());

        if (plan is null)
            throw new ValidationException("Choose an existing plan.");

        if (plan.Status != "Active" &&
            (creating || plan.Id != item.PlanId))
        {
            throw new ValidationException(
                "This plan is inactive. Choose an active plan.");
        }

        var overlapping = await _db.Set<ClinicSubscription>()
            .AnyAsync(candidate =>
                candidate.Id != item.Id &&
                candidate.ClinicId == clinic.Id &&
                candidate.StartDate < request.EndDate.Value &&
                candidate.EndDate > request.StartDate.Value);

        if (overlapping)
        {
            throw new ValidationException(
                "This clinic already has a subscription covering these dates.");
        }

        var amount = request.Amount.Value;
        var discount = request.Discount.Value;

        var total = amount - Round(amount * discount / 100m);

        if (item.Payments.Sum(payment => payment.Amount) > total)
        {
            throw new ValidationException(
                "The final amount cannot be lower than payments already recorded.");
        }

        item.ClinicId = clinic.Id;
        item.PlanId = plan.Id;
        item.Clinic = clinicName;
        item.Admin = request.Admin.Trim();
        item.Email = request.Email.Trim();
        item.Billing = request.Billing;
        item.Amount = amount;
        item.Discount = discount;
        item.StartDate = request.StartDate.Value;
        item.EndDate = request.EndDate.Value;
        item.Notes = (request.Notes ?? "").Trim();
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        SaveClinicSubscriptionRequest request)
    {
        await using var transaction =
            await _db.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);

        try
        {
            var item = new ClinicSubscription();

            await ApplyAsync(item, request, true);

            _db.Set<ClinicSubscription>().Add(item);

            await _db.SaveChangesAsync();
            await RefreshClinicsAsync(_db);
            await transaction.CommitAsync();

            return Ok(await ToDtoAsync(item));
        }
        catch (ValidationException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        SaveClinicSubscriptionRequest request)
    {
        await using var transaction =
            await _db.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);

        try
        {
            var item = await _db.Set<ClinicSubscription>()
                .Include(subscription => subscription.Payments)
                .SingleOrDefaultAsync(subscription => subscription.Id == id);

            if (item is null) return NotFound();

            await ApplyAsync(item, request, false);

            await _db.SaveChangesAsync();
            await RefreshClinicsAsync(_db);
            await transaction.CommitAsync();

            return Ok(await ToDtoAsync(item));
        }
        catch (ValidationException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    [HttpPost("{id:int}/payments")]
    public async Task<IActionResult> RecordPayment(
        int id,
        RecordSubscriptionPaymentRequest request)
    {
        if (request.RequestId == Guid.Empty)
        {
            return BadRequest(new
            {
                message = "Payment request ID is required."
            });
        }

        var methods = new[]
        {
            "Cash",
            "Bank Transfer",
            "Card (Recorded Manually)"
        };

        if (!methods.Contains(request.Method))
        {
            return BadRequest(new
            {
                message = "Invalid payment method."
            });
        }

        await using var transaction =
            await _db.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);

        var item = await _db.Set<ClinicSubscription>()
            .Include(subscription => subscription.Payments)
            .SingleOrDefaultAsync(subscription => subscription.Id == id);

        if (item is null) return NotFound();

        var existing = item.Payments.FirstOrDefault(
            payment => payment.RequestId == request.RequestId);

        if (existing is not null)
        {
            if (existing.Amount != request.Amount ||
                existing.Date != request.Date ||
                existing.Method != request.Method ||
                existing.Notes != (request.Notes ?? "").Trim())
            {
                return Conflict(new
                {
                    message = "This payment request was already used with different details."
                });
            }

            return Ok(await ToDtoAsync(item));
        }

        var amount = request.Amount!.Value;

        var remaining = Total(item) -
            item.Payments.Sum(payment => payment.Amount);

        if (Round(amount) != amount ||
            amount <= 0 ||
            amount > remaining)
        {
            return BadRequest(new
            {
                message =
                    "Payment must be positive, have at most two decimals, " +
                    $"and not exceed the remaining balance ({remaining:0.00})."
            });
        }

        if (request.Date!.Value == DateOnly.MinValue)
        {
            return BadRequest(new
            {
                message = "Payment date is required."
            });
        }

        item.Payments.Add(new SubscriptionPayment
        {
            RequestId = request.RequestId,
            Amount = amount,
            Date = request.Date.Value,
            Method = request.Method,
            Notes = (request.Notes ?? "").Trim()
        });

        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        return Ok(await ToDtoAsync(item));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await using var transaction =
            await _db.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);

        var item = await _db.Set<ClinicSubscription>()
            .Include(subscription => subscription.Payments)
            .SingleOrDefaultAsync(subscription => subscription.Id == id);

        if (item is null) return NotFound();

        _db.Set<ClinicSubscription>().Remove(item);

        await _db.SaveChangesAsync();
        await RefreshClinicsAsync(_db);
        await transaction.CommitAsync();

        return NoContent();
    }
}
