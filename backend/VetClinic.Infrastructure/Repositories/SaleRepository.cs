using System.Data;
using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Infrastructure.Repositories;

public class SaleRepository : ISaleRepository
{
    private readonly AppDbContext _context;

    public SaleRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Sale>> GetAllAsync(int clinicId)
    {
        return await _context.Sales
            .AsNoTracking()
            .Include(sale => sale.Items)
            .Where(sale => sale.ClinicId == clinicId)
            .OrderByDescending(sale => sale.CreatedAt)
            .ThenByDescending(sale => sale.Id)
            .ToListAsync();
    }

    public async Task<Sale?> GetByIdAsync(
        int id,
        int clinicId)
    {
        return await _context.Sales
            .AsNoTracking()
            .Include(sale => sale.Items)
            .FirstOrDefaultAsync(sale =>
                sale.Id == id &&
                sale.ClinicId == clinicId);
    }

    public async Task<Sale?> GetByRequestIdAsync(
        Guid requestId,
        int clinicId)
    {
        return await _context.Sales
            .AsNoTracking()
            .Include(sale => sale.Items)
            .FirstOrDefaultAsync(sale =>
                sale.RequestId == requestId &&
                sale.ClinicId == clinicId);
    }

    public async Task<Product?> GetProductAsync(
        int productId,
        int clinicId)
    {
        // Tracking is needed to save stock changes.
        return await _context.Products
            .Include(product => product.Category)
            .FirstOrDefaultAsync(product =>
                product.Id == productId &&
                product.ClinicId == clinicId);
    }

    public async Task<Owner?> GetOwnerAsync(
        int ownerId,
        int clinicId)
    {
        return await _context.Owners
            .FirstOrDefaultAsync(owner =>
                owner.Id == ownerId &&
                owner.ClinicId == clinicId);
    }

    public async Task<bool> PaymentMethodExistsAsync(
        int clinicId,
        string paymentMethod)
    {
        return await _context.ClinicOptions
            .AnyAsync(option =>
                option.ClinicId == clinicId &&
                option.ListKey == "pos.paymentMethods" &&
                option.IsActive &&
                option.Value == paymentMethod);
    }

    public async Task AddAsync(Sale sale)
    {
        await _context.Sales.AddAsync(sale);
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