using System.ComponentModel.DataAnnotations;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Infrastructure.Repositories;

public class BillingInvoiceRepository : IBillingInvoiceRepository
{
    private readonly AppDbContext _context;

    public BillingInvoiceRepository(AppDbContext context)
    {
        _context = context;
    }

    public Task<bool> IsClinicActiveAsync(int clinicId)
    {
        return _context.Clinics
            .AsNoTracking()
            .AnyAsync(clinic =>
                clinic.Id == clinicId &&
                clinic.IsActive);
    }

    private IQueryable<BillingInvoice> Invoices(int clinicId)
    {
        return _context.BillingInvoices
            .AsTracking()
            .Where(invoice => invoice.ClinicId == clinicId)
            .Include(invoice => invoice.Lines)
            .Include(invoice => invoice.Payments)
            .AsSingleQuery();
    }

    public Task<List<BillingInvoice>> GetAllAsync(int clinicId)
    {
        return Invoices(clinicId)
            .AsNoTracking()
            .OrderByDescending(invoice => invoice.Date)
            .ThenByDescending(invoice => invoice.Id)
            .ToListAsync();
    }

    public Task<BillingInvoice?> GetByIdAsync(
        int id,
        int clinicId)
    {
        return Invoices(clinicId)
            .FirstOrDefaultAsync(invoice => invoice.Id == id);
    }

    public Task<BillingInvoice?> GetByRequestIdAsync(
        Guid requestId,
        int clinicId)
    {
        return Invoices(clinicId)
            .FirstOrDefaultAsync(invoice =>
                invoice.RequestId == requestId);
    }

    public Task<bool> InvoiceNumberExistsAsync(
        int clinicId,
        string invoiceNumber,
        int? excludeId = null)
    {
        return _context.BillingInvoices
            .AnyAsync(invoice =>
                invoice.ClinicId == clinicId &&
                invoice.InvoiceNumber == invoiceNumber &&
                (!excludeId.HasValue ||
                 invoice.Id != excludeId.Value));
    }

    public Task<bool> LineTypeExistsAsync(
        int clinicId,
        string type)
    {
        return _context.ClinicOptions
            .AsNoTracking()
            .AnyAsync(option =>
                option.ClinicId == clinicId &&
                option.ListKey == "billing.consultations" &&
                option.Value == type &&
                option.IsActive);
    }

    public Task<bool> StatusExistsAsync(
        int clinicId,
        string status)
    {
        return _context.ClinicOptions
            .AsNoTracking()
            .AnyAsync(option =>
                option.ClinicId == clinicId &&
                option.ListKey == "billing.statuses" &&
                option.Value == status &&
                option.IsActive);
    }

    public Task<BillingPayment?> GetPaymentByRequestIdAsync(
        Guid requestId,
        int clinicId)
    {
        return _context.BillingPayments
            .AsNoTracking()
            .FirstOrDefaultAsync(payment =>
                payment.ClinicId == clinicId &&
                payment.RequestId == requestId);
    }

    public async Task AddAsync(BillingInvoice invoice)
    {
        await _context.BillingInvoices.AddAsync(invoice);
    }

    public void Remove(BillingInvoice invoice)
    {
        _context.BillingInvoices.Remove(invoice);
    }

    public void RemoveLines(
        IEnumerable<BillingInvoiceLine> lines)
    {
        _context.BillingInvoiceLines.RemoveRange(lines);
    }

    public void SetOriginalRowVersion(
        BillingInvoice invoice,
        byte[] rowVersion)
    {
        _context.Entry(invoice)
            .Property(item => item.RowVersion)
            .OriginalValue = rowVersion.ToArray();
    }

    public async Task SaveChangesAsync()
    {
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ValidationException(
                "This invoice changed. Refresh it and reopen it before trying again.");
        }
        catch (DbUpdateException exception)
            when (exception.InnerException is SqlException sql &&
                  (sql.Number == 2601 || sql.Number == 2627))
        {
            throw new ValidationException(
                "The invoice number or request ID already exists. Refresh the invoice list.");
        }
    }

    public async Task<T> ExecuteInTransactionAsync<T>(
        Func<Task<T>> operation)
    {
        var strategy = _context.Database.CreateExecutionStrategy();

        return await strategy.ExecuteAsync(async () =>
        {
            await using var transaction =
                await _context.Database.BeginTransactionAsync(
                    System.Data.IsolationLevel.Serializable);

            try
            {
                var result = await operation();

                await transaction.CommitAsync();

                return result;
            }
            catch
            {
                await transaction.RollbackAsync();

                _context.ChangeTracker.Clear();

                throw;
            }
        });
    }
}