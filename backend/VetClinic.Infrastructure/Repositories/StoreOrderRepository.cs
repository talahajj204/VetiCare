using System.Data;
using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Infrastructure.Repositories;

public class StoreOrderRepository : IStoreOrderRepository
{
    private readonly AppDbContext _context;

    public StoreOrderRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Clinic?> GetClinicAsync(int clinicId)
    {
        return await _context.Clinics
            .AsNoTracking()
            .FirstOrDefaultAsync(clinic =>
                clinic.Id == clinicId &&
                clinic.IsActive);
    }

    public async Task<List<StoreOrder>> GetAllAsync(
        int clinicId)
    {
        return await _context.StoreOrders
            .AsNoTracking()
            .Include(order => order.Items)
            .Where(order => order.ClinicId == clinicId)
            .OrderByDescending(order => order.CreatedAt)
            .ThenByDescending(order => order.Id)
            .ToListAsync();
    }

    public async Task<StoreOrder?> GetByIdAsync(
        int id,
        int clinicId)
    {
        return await _context.StoreOrders
            .Include(order => order.Items)
            .FirstOrDefaultAsync(order =>
                order.Id == id &&
                order.ClinicId == clinicId);
    }

    public async Task<StoreOrder?> GetByRequestIdAsync(
        Guid requestId,
        int clinicId)
    {
        return await _context.StoreOrders
            .Include(order => order.Items)
            .FirstOrDefaultAsync(order =>
                order.RequestId == requestId &&
                order.ClinicId == clinicId);
    }

    public async Task<List<StoreOrder>>
        GetPendingDeliveriesAsync(int clinicId)
    {
        return await _context.StoreOrders
            .AsNoTracking()
            .Include(order => order.Items)
            .Where(order =>
                order.ClinicId == clinicId &&
                order.DeliveryMethod == "delivery" &&
                order.DeliveryStatus == "Pending" &&
                order.CancelledAt == null)
            .OrderBy(order => order.CreatedAt)
            .ThenBy(order => order.Id)
            .ToListAsync();
    }

    public async Task<Product?> GetProductAsync(
        int productId,
        int clinicId)
    {
        // Tracking is required to save stock changes.
        return await _context.Products
            .Include(product => product.Category)
            .FirstOrDefaultAsync(product =>
                product.Id == productId &&
                product.ClinicId == clinicId);
    }

    public async Task<bool> StatusExistsAsync(
        int clinicId,
        string status)
    {
        return await _context.ClinicOptions
            .AnyAsync(option =>
                option.ClinicId == clinicId &&
                option.ListKey == "ordersSalesBilling" &&
                option.IsActive &&
                option.Value == status);
    }

    public async Task AddAsync(StoreOrder order)
    {
        await _context.StoreOrders.AddAsync(order);
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