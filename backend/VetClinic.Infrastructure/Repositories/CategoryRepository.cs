using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Infrastructure.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly AppDbContext _context;

    public CategoryRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Category>> GetAllAsync(int clinicId)
    {
        return await _context.Categories
            .AsNoTracking()
            .Where(category => category.ClinicId == clinicId)
            .OrderBy(category => category.SortOrder)
            .ThenBy(category => category.Title)
            .ToListAsync();
    }

    public async Task<Category?> GetByIdAsync(
        int id,
        int clinicId)
    {
        return await _context.Categories
            .FirstOrDefaultAsync(category =>
                category.Id == id &&
                category.ClinicId == clinicId);
    }

    public async Task<bool> ExistsAsync(
        int clinicId,
        string title,
        int? excludeId = null)
    {
        return await _context.Categories
            .AnyAsync(category =>
                category.ClinicId == clinicId &&
                category.Title == title &&
                (!excludeId.HasValue ||
                 category.Id != excludeId.Value));
    }

    public async Task AddAsync(Category category)
    {
        await _context.Categories.AddAsync(category);
    }

    public void Remove(Category category)
    {
        _context.Categories.Remove(category);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
    public async Task<bool> TryReorderAsync(
    int clinicId,
    IReadOnlyList<int> orderedIds)
{
    var strategy = _context.Database.CreateExecutionStrategy();

    return await strategy.ExecuteAsync(async () =>
    {
        await using var transaction =
            await _context.Database.BeginTransactionAsync(
                System.Data.IsolationLevel.Serializable);

        var categories = await _context.Categories
            .AsTracking()
            .Where(category => category.ClinicId == clinicId)
            .OrderBy(category => category.Id)
            .ToListAsync();

        var byId = categories.ToDictionary(
            category => category.Id);

        // Require the complete category list for this clinic.
        // A stale list or an ID from another clinic is rejected.
        if (categories.Count != orderedIds.Count ||
            orderedIds.Distinct().Count() != orderedIds.Count ||
            orderedIds.Any(id => !byId.ContainsKey(id)))
        {
            return false;
        }

        for (var index = 0; index < orderedIds.Count; index++)
        {
            byId[orderedIds[index]].SortOrder = index + 1;
        }

        // Save all positions together.
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return true;
    });
}
}