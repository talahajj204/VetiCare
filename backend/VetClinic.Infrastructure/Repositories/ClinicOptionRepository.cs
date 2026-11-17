using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Infrastructure.Repositories;

public class ClinicOptionRepository : IClinicOptionRepository
{
    private readonly AppDbContext _context;

    public ClinicOptionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ClinicOption>> GetAllAsync(
        int clinicId,
        string? listKey = null,
        bool includeInactive = false)
    {
        var query = _context.ClinicOptions
            .AsNoTracking()
            .Where(option => option.ClinicId == clinicId);

        if (!string.IsNullOrWhiteSpace(listKey))
        {
            var key = listKey.Trim();

            query = query.Where(
                option => option.ListKey == key);
        }

        if (!includeInactive)
        {
            query = query.Where(option => option.IsActive);
        }

        return await query
            .OrderBy(option => option.ListKey)
            .ThenBy(option => option.SortOrder)
            .ThenBy(option => option.Value)
            .ToListAsync();
    }

    public async Task<ClinicOption?> GetByIdAsync(
        int id,
        int clinicId)
    {
        return await _context.ClinicOptions
            .SingleOrDefaultAsync(option =>
                option.Id == id &&
                option.ClinicId == clinicId);
    }

    public async Task<bool> ExistsAsync(
        int clinicId,
        string listKey,
        string value,
        int? excludeId = null)
    {
        var key = listKey.Trim();
        var optionValue = value.Trim();

        return await _context.ClinicOptions
            .AnyAsync(option =>
                option.ClinicId == clinicId &&
                option.ListKey == key &&
                option.Value == optionValue &&
                (!excludeId.HasValue ||
                 option.Id != excludeId.Value));
    }

    public async Task AddAsync(ClinicOption option)
    {
        await _context.ClinicOptions.AddAsync(option);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}