using VetClinic.Core.Entities;

namespace VetClinic.Core.Interfaces;

public interface IBillingInvoiceRepository
{
    Task<bool> IsClinicActiveAsync(int clinicId);

    Task<List<BillingInvoice>> GetAllAsync(int clinicId);

    Task<BillingInvoice?> GetByIdAsync(
        int id,
        int clinicId);

    Task<BillingInvoice?> GetByRequestIdAsync(
        Guid requestId,
        int clinicId);

    Task<bool> InvoiceNumberExistsAsync(
        int clinicId,
        string invoiceNumber,
        int? excludeId = null);

    Task<bool> LineTypeExistsAsync(
        int clinicId,
        string type);

    Task<bool> StatusExistsAsync(
        int clinicId,
        string status);

    Task<BillingPayment?> GetPaymentByRequestIdAsync(
        Guid requestId,
        int clinicId);

    Task AddAsync(BillingInvoice invoice);

    void Remove(BillingInvoice invoice);

    void RemoveLines(
        IEnumerable<BillingInvoiceLine> lines);

    void SetOriginalRowVersion(
        BillingInvoice invoice,
        byte[] rowVersion);

    Task SaveChangesAsync();

    Task<T> ExecuteInTransactionAsync<T>(
        Func<Task<T>> operation);
}