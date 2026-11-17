using System.Data;
using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Infrastructure.Repositories;

public class PosOperationsRepository : IPosOperationsRepository
{
    private readonly AppDbContext _context;

    public PosOperationsRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<HeldSale>> GetHeldSalesAsync(
        int clinicId)
    {
        return await _context.HeldSales
            .AsNoTracking()
            .Include(held => held.Items)
            .Where(held =>
                held.ClinicId == clinicId &&
                held.CompletedSaleId == null)
            .OrderByDescending(held => held.CreatedAt)
            .ThenByDescending(held => held.Id)
            .ToListAsync();
    }

    public async Task<HeldSale?> GetHeldSaleAsync(
        int id,
        int clinicId)
    {
        return await _context.HeldSales
            .Include(held => held.Items)
            .FirstOrDefaultAsync(held =>
                held.Id == id &&
                held.ClinicId == clinicId);
    }

    public async Task<HeldSale?> GetHeldSaleByRequestIdAsync(
        Guid requestId,
        int clinicId)
    {
        return await _context.HeldSales
            .Include(held => held.Items)
            .FirstOrDefaultAsync(held =>
                held.RequestId == requestId &&
                held.ClinicId == clinicId);
    }

    public async Task AddHeldSaleAsync(HeldSale heldSale)
    {
        await _context.HeldSales.AddAsync(heldSale);
    }

    public async Task<List<Sale>> GetPendingDeliveriesAsync(
        int clinicId)
    {
        return await _context.Sales
            .AsNoTracking()
            .Where(sale =>
                sale.ClinicId == clinicId &&
                sale.HasDelivery &&
                sale.DeliveryStatus == "Pending")
            .OrderBy(sale => sale.CreatedAt)
            .ThenBy(sale => sale.Id)
            .ToListAsync();
    }

    public async Task<Sale?> GetSaleAsync(
        int id,
        int clinicId)
    {
        return await _context.Sales
            .Include(sale => sale.Items)
            .FirstOrDefaultAsync(sale =>
                sale.Id == id &&
                sale.ClinicId == clinicId);
    }

    public async Task<List<Sale>> GetSalesForRefundAsync(
        int clinicId)
    {
        return await _context.Sales
            .AsNoTracking()
            .Include(sale => sale.Items)
            .Where(sale => sale.ClinicId == clinicId)
            .OrderByDescending(sale => sale.CreatedAt)
            .ThenByDescending(sale => sale.Id)
            .ToListAsync();
    }

    public async Task<List<SaleRefundItem>> GetRefundItemsAsync(
        int saleId,
        int clinicId)
    {
        return await _context.SaleRefundItems
            .AsNoTracking()
            .Include(item => item.SaleRefund)
            .Include(item => item.SaleItem)
            .Where(item =>
                item.ClinicId == clinicId &&
                item.SaleRefund.ClinicId == clinicId &&
                item.SaleRefund.SaleId == saleId)
            .ToListAsync();
    }

    public async Task<SaleRefund?> GetRefundByRequestIdAsync(
        Guid requestId,
        int clinicId)
    {
        return await _context.SaleRefunds
            .Include(refund => refund.Items)
                .ThenInclude(item => item.SaleItem)
            .FirstOrDefaultAsync(refund =>
                refund.RequestId == requestId &&
                refund.ClinicId == clinicId);
    }

    public async Task AddRefundAsync(SaleRefund refund)
    {
        await _context.SaleRefunds.AddAsync(refund);
    }

    public async Task<Product?> GetProductAsync(
        int productId,
        int clinicId)
    {
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