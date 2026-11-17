using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Infrastructure.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly AppDbContext _context;

    public ProductRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Product>> GetAllAsync(
        int clinicId)
    {
        return await _context.Products
            .AsNoTracking()
            .Include(product => product.Category)
            .Where(product => product.ClinicId == clinicId)
            .OrderBy(product => product.Name)
            .ThenBy(product => product.Id)
            .ToListAsync();
    }

    public async Task<Product?> GetByIdAsync(
        int id,
        int clinicId)
    {
        return await _context.Products
            .Include(product => product.Category)
            .FirstOrDefaultAsync(product =>
                product.Id == id &&
                product.ClinicId == clinicId);
    }

    public async Task<bool> ExistsAsync(
        int clinicId,
        string name,
        int? excludeId = null)
    {
        return await _context.Products
            .AnyAsync(product =>
                product.ClinicId == clinicId &&
                product.Name == name &&
                (!excludeId.HasValue ||
                 product.Id != excludeId.Value));
    }

    public async Task AddAsync(Product product)
    {
        await _context.Products.AddAsync(product);
    }

    public void Remove(Product product)
    {
        _context.Products.Remove(product);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}