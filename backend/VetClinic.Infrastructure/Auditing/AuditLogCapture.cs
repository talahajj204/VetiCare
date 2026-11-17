using System.ComponentModel.DataAnnotations;
using System.Globalization;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Infrastructure.Auditing;

internal static class AuditLogCapture
{
    private static readonly Dictionary<string, string> EntityLabels =
        new(StringComparer.Ordinal)
        {
            ["Owner"] = "Owner",
            ["Pet"] = "Pet",
            ["MedicalRecord"] = "Medical Record",
            ["Appointment"] = "Appointment",
            ["Vaccination"] = "Vaccination",
            ["Reminder"] = "Reminder",
            ["Medication"] = "Medication",
            ["Prescription"] = "Prescription",
            ["ClinicOption"] = "Setting Option",
            ["Category"] = "Category",
            ["Product"] = "Product",
            ["SupplierInvoice"] = "Supplier Invoice",
            ["Sale"] = "Sale",
            ["HeldSale"] = "Held Sale",
            ["SaleRefund"] = "Sale Refund",
            ["StoreOrder"] = "Store Order",
            ["StoreSettings"] = "Store Settings",
            ["BillingInvoice"] = "Invoice",
            ["FinancialEntry"] = "Financial Record",
            ["ApplicationUser"] = "User"
        };

    public static async Task<List<PendingAuditLog>> PrepareAsync(
        AppDbContext context,
        IAuditActorAccessor? actorAccessor,
        CancellationToken cancellationToken)
    {
        var result = new List<PendingAuditLog>();

        // Startup seeding and design-time migrations have no HTTP actor.
        if (actorAccessor?.HasHttpRequest != true)
        {
            return result;
        }

        context.ChangeTracker.DetectChanges();

        var entries = context.ChangeTracker
            .Entries()
            .Where(entry =>
                entry.State is EntityState.Added
                    or EntityState.Modified
                    or EntityState.Deleted)
            .Where(entry =>
                EntityLabels.ContainsKey(
                    entry.Metadata.ClrType.Name))
            .ToList();

        if (entries.Count == 0)
        {
            return result;
        }

        var userId = string.Empty;
        var userName = "Guest";
        int? actorClinicId = null;

        if (actorAccessor.IsAuthenticated)
        {
            var currentUserId = actorAccessor.UserId;

            if (string.IsNullOrWhiteSpace(currentUserId))
            {
                throw new ValidationException(
                    "The current user could not be verified.");
            }

            var user = await context.Users
                .AsNoTracking()
                .Where(item => item.Id == currentUserId)
                .Select(item => new
                {
                    item.Id,
                    item.FullName,
                    item.IsActive,
                    item.ClinicId
                })
                .SingleOrDefaultAsync(cancellationToken);

            if (user is null || !user.IsActive)
            {
                throw new ValidationException(
                    "The current user is unavailable.");
            }

            userId = user.Id;
            actorClinicId = user.ClinicId;

            userName = string.IsNullOrWhiteSpace(user.FullName)
                ? "User"
                : user.FullName.Trim();
        }

        foreach (var entry in entries)
        {
            var clinicProperty =
                entry.Metadata.FindProperty("ClinicId");

            if (clinicProperty is null)
            {
                continue;
            }

            var clinicValue = entry.State == EntityState.Deleted
                ? entry.Property("ClinicId").OriginalValue
                : entry.Property("ClinicId").CurrentValue;

            if (clinicValue is not int clinicId || clinicId <= 0)
            {
                continue;
            }

            // A clinic user's entry must belong to their clinic.
            if (actorClinicId.HasValue &&
                actorClinicId.Value != clinicId)
            {
                throw new ValidationException(
                    "The record does not belong to the current clinic.");
            }

            var entityType = entry.Metadata.ClrType.Name;
            var action = GetAction(entry);
            var label = EntityLabels[entityType];
            var description = GetDescription(entry);

            result.Add(new PendingAuditLog(
                entry,
                new AuditLogEntry
                {
                    ClinicId = clinicId,
                    UserId = Limit(userId, 450),
                    UserName = Limit(userName, 200),
                    Action = action,
                    EntityType = Limit(entityType, 100),
                    Record = Limit(
                        string.IsNullOrWhiteSpace(description)
                            ? label
                            : $"{label} - {description}",
                        500),
                    CreatedAt = DateTime.UtcNow
                }));
        }

        return result;
    }

    private static string GetAction(EntityEntry entry)
    {
        if (entry.State == EntityState.Added)
        {
            return "Created";
        }

        if (entry.State == EntityState.Deleted)
        {
            return "Deleted";
        }

        if (entry.Metadata.FindProperty("IsActive") is not null)
        {
            var property = entry.Property("IsActive");

            if (property.IsModified &&
                property.OriginalValue is true &&
                property.CurrentValue is false)
            {
                return "Deactivated";
            }
        }

        return "Updated";
    }

    private static string GetDescription(EntityEntry entry)
    {
        var preferredProperties = new[]
        {
            "InvoiceNumber",
            "Name",
            "Title",
            "FullName",
            "ProductName",
            "Vaccine",
            "StoreName"
        };

        foreach (var propertyName in preferredProperties)
        {
            var value = ReadString(entry, propertyName);

            if (!string.IsNullOrWhiteSpace(value))
            {
                return value.Trim();
            }
        }

        var firstName = ReadString(entry, "FirstName");
        var lastName = ReadString(entry, "LastName");

        return $"{firstName} {lastName}".Trim();
    }

    private static string ReadString(
        EntityEntry entry,
        string propertyName)
    {
        if (entry.Metadata.FindProperty(propertyName) is null)
        {
            return string.Empty;
        }

        var property = entry.Property(propertyName);

        var value = entry.State == EntityState.Deleted
            ? property.OriginalValue
            : property.CurrentValue;

        return value as string ?? string.Empty;
    }

    internal static string Limit(string value, int maximumLength)
    {
        return value.Length <= maximumLength
            ? value
            : value[..maximumLength];
    }
}

internal sealed class PendingAuditLog
{
    private readonly EntityEntry _entry;

    public AuditLogEntry Log { get; }

    public PendingAuditLog(
        EntityEntry entry,
        AuditLogEntry log)
    {
        _entry = entry;
        Log = log;
    }

    public void CompleteRecordId()
    {
        var key = _entry.Metadata.FindPrimaryKey();

        if (key is null)
        {
            return;
        }

        var values = key.Properties.Select(property =>
            Convert.ToString(
                _entry.Property(property.Name).CurrentValue,
                CultureInfo.InvariantCulture)
            ?? string.Empty);

        var recordId = string.Join("/", values);

        Log.RecordId = AuditLogCapture.Limit(recordId, 450);

        if (!string.IsNullOrWhiteSpace(recordId))
        {
            Log.Record = AuditLogCapture.Limit(
                $"{Log.Record} (#{recordId})",
                500);
        }
    }
}