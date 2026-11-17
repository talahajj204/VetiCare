using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Infrastructure.Repositories;

public class StoreSettingsRepository
    : IStoreSettingsRepository
{
    private readonly AppDbContext _context;

    public StoreSettingsRepository(AppDbContext context)
    {
        _context = context;
    }

    public Task<StoreSettings?> GetAsync(int clinicId)
    {
        return _context.StoreSettings
            .SingleOrDefaultAsync(
                settings => settings.ClinicId == clinicId);
    }

    public async Task AddAsync(StoreSettings settings)
    {
        await _context.StoreSettings.AddAsync(settings);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}