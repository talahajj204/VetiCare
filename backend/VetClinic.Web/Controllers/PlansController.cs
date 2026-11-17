using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Constants;
using VetClinic.Core.Entities;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Web.Controllers;

public class SaveSubscriptionPlanRequest
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = "";

    [MaxLength(1000)]
    public string? Description { get; set; }

    [Required, Range(typeof(decimal), "0", "99999999.99")]
    public decimal? MonthlyPrice { get; set; }

    [Required, Range(typeof(decimal), "0", "99999999.99")]
    public decimal? YearlyPrice { get; set; }

    [Required, RegularExpression("^(Active|Inactive)$")]
    public string Status { get; set; } = "Active";

    [Required]
    public List<string> Features { get; set; } = [];
}

[ApiController]
[Route("api/super-admin/plans")]
[Authorize(Roles = AppRoles.SuperAdmin)]
public class PlansController : ControllerBase
{
    private readonly AppDbContext _db;

    private static readonly HashSet<string> AllowedFeatures =
        new(StringComparer.Ordinal)
        {
            "Appointments",
            "Medical Records",
            "Pet Management",
            "Vaccinations",
            "Inventory",
            "Pharmacy",
            "Staff Management",
            "Reports & Analytics",
            "Billing & Invoices",
            "Multi-Branch Access",
            "Export Reports",
            "Priority Support"
        };

    public PlansController(AppDbContext db)
    {
        _db = db;
    }

    private static object ToDto(SubscriptionPlan plan) => new
    {
        plan.Id,
        plan.Name,
        plan.Description,
        plan.MonthlyPrice,
        plan.YearlyPrice,
        plan.Status,
        Features = JsonSerializer.Deserialize<List<string>>(
            plan.FeaturesJson) ?? []
    };

    private async Task<string?> ValidateAsync(
        SaveSubscriptionPlanRequest request,
        int? id = null)
    {
        var name = request.Name.Trim();

        if (name.Length == 0)
            return "Plan name is required.";

        if (request.MonthlyPrice is not decimal monthly ||
            request.YearlyPrice is not decimal yearly)
            return "Monthly and yearly prices are required.";

        if (decimal.Round(monthly, 2) != monthly ||
            decimal.Round(yearly, 2) != yearly)
            return "Prices must have at most two decimal places.";

        if (request.Features.Any(feature =>
            string.IsNullOrWhiteSpace(feature) ||
            !AllowedFeatures.Contains(feature)))
            return "The plan contains an invalid feature.";

        var duplicate = await _db.Set<SubscriptionPlan>()
            .AnyAsync(plan =>
                (!id.HasValue || plan.Id != id.Value) &&
                plan.Name.Trim().ToUpper() == name.ToUpper());

        return duplicate
            ? "Another plan already uses this name."
            : null;
    }

    private static void Apply(
        SubscriptionPlan plan,
        SaveSubscriptionPlanRequest request)
    {
        plan.Name = request.Name.Trim();
        plan.Description = (request.Description ?? "").Trim();
        plan.MonthlyPrice = request.MonthlyPrice!.Value;
        plan.YearlyPrice = request.YearlyPrice!.Value;
        plan.Status = request.Status;
        plan.FeaturesJson = JsonSerializer.Serialize(
            request.Features.Distinct().ToList());
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var plans = await _db.Set<SubscriptionPlan>()
            .AsNoTracking()
            .OrderBy(plan => plan.Id)
            .ToListAsync();

        return Ok(plans.Select(ToDto));
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        SaveSubscriptionPlanRequest request)
    {
        await using var transaction =
            await _db.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);

        var error = await ValidateAsync(request);

        if (error is not null)
            return BadRequest(new { message = error });

        var plan = new SubscriptionPlan();

        Apply(plan, request);

        _db.Set<SubscriptionPlan>().Add(plan);

        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        return Ok(ToDto(plan));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        SaveSubscriptionPlanRequest request)
    {
        await using var transaction =
            await _db.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);

        var plan = await _db.Set<SubscriptionPlan>().FindAsync(id);

        if (plan is null)
            return NotFound(new { message = "Plan not found." });

        var error = await ValidateAsync(request, id);

        if (error is not null)
            return BadRequest(new { message = error });

        var oldName = plan.Name;

        Apply(plan, request);

        // The existing Clinic model stores the plan name.
        // Keep clinic assignments consistent when a plan is renamed.
        if (!string.Equals(oldName, plan.Name, StringComparison.Ordinal))
        {
            var clinics = await _db.Clinics
                .Where(clinic =>
                    clinic.Plan.ToUpper() == oldName.ToUpper())
                .ToListAsync();

            foreach (var clinic in clinics)
                clinic.Plan = plan.Name;
        }

        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        return Ok(ToDto(plan));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await using var transaction =
            await _db.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);

        var plan = await _db.Set<SubscriptionPlan>().FindAsync(id);

        if (plan is null)
            return NotFound(new { message = "Plan not found." });

        var usedByClinic = await _db.Clinics.AnyAsync(clinic =>
            clinic.Plan.ToUpper() == plan.Name.ToUpper());

        if (usedByClinic)
        {
            return Conflict(new
            {
                message =
                    "This plan is assigned to a clinic and cannot be deleted. " +
                    "You can mark it Inactive instead."
            });
        }

        if (await _db.Set<ClinicSubscription>()
            .AnyAsync(subscription => subscription.PlanId == id))
        {
            return Conflict(new
            {
                message = "This plan has subscription history and cannot be deleted. Mark it Inactive instead."
            });
        }

        _db.Set<SubscriptionPlan>().Remove(plan);

        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        return NoContent();
    }
}
