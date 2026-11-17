using System.Data;
using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Infrastructure.Repositories;

public class SupplierInvoiceRepository
    : ISupplierInvoiceRepository
{
    private readonly AppDbContext _context;

    public SupplierInvoiceRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<SupplierInvoice>> GetAllAsync(
        int clinicId)
    {
        return await _context.SupplierInvoices
            .AsNoTracking()
            .Include(invoice => invoice.Items)
            .Where(invoice => invoice.ClinicId == clinicId)
            .OrderByDescending(invoice => invoice.Date)
            .ThenByDescending(invoice => invoice.Id)
            .ToListAsync();
    }

    public async Task<SupplierInvoice?> GetByIdAsync(
        int id,
        int clinicId)
    {
        return await _context.SupplierInvoices
            .AsNoTracking()
            .Include(invoice => invoice.Items)
            .FirstOrDefaultAsync(invoice =>
                invoice.Id == id &&
                invoice.ClinicId == clinicId);
    }

    public async Task<bool> InvoiceExistsAsync(
        int clinicId,
        string supplierName,
        string invoiceNumber)
    {
        return await _context.SupplierInvoices
            .AnyAsync(invoice =>
                invoice.ClinicId == clinicId &&
                invoice.SupplierName == supplierName &&
                invoice.InvoiceNumber == invoiceNumber);
    }

    public async Task<Product?> GetProductAsync(
        int productId,
        int clinicId)
    {
        // Keep tracking enabled so stock changes can be saved.
        return await _context.Products
            .Include(product => product.Category)
            .FirstOrDefaultAsync(product =>
                product.Id == productId &&
                product.ClinicId == clinicId);
    }

    public async Task<Category?> GetCategoryAsync(
        int categoryId,
        int clinicId)
    {
        return await _context.Categories
            .FirstOrDefaultAsync(category =>
                category.Id == categoryId &&
                category.ClinicId == clinicId);
    }

    public async Task<bool> ProductNameExistsAsync(
        int clinicId,
        string productName)
    {
        return await _context.Products
            .AnyAsync(product =>
                product.ClinicId == clinicId &&
                product.Name == productName);
    }

    public async Task AddProductAsync(Product product)
    {
        await _context.Products.AddAsync(product);
    }

    public async Task AddAsync(SupplierInvoice invoice)
    {
        await _context.SupplierInvoices.AddAsync(invoice);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task<T> ExecuteInTransactionAsync<T>(
        Func<Task<T>> action)
    {
        await using var transaction =
            await _context.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);

        try
        {
            var result = await action();

            await transaction.CommitAsync();

            return result;
        }
        catch
        {
            await transaction.RollbackAsync();

            _context.ChangeTracker.Clear();

            throw;
        }
    }
}