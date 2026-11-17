using VetClinic.Core.Entities;

namespace VetClinic.Core.Interfaces;

public interface ISupplierInvoiceRepository
{
    Task<List<SupplierInvoice>> GetAllAsync(int clinicId);

    Task<SupplierInvoice?> GetByIdAsync(
        int id,
        int clinicId);

    Task<bool> InvoiceExistsAsync(
        int clinicId,
        string supplierName,
        string invoiceNumber);

    Task<Product?> GetProductAsync(
        int productId,
        int clinicId);

    Task<Category?> GetCategoryAsync(
        int categoryId,
        int clinicId);

    Task<bool> ProductNameExistsAsync(
        int clinicId,
        string productName);

    Task AddProductAsync(Product product);

    Task AddAsync(SupplierInvoice invoice);

    Task SaveChangesAsync();

    Task<T> ExecuteInTransactionAsync<T>(
        Func<Task<T>> action);
}