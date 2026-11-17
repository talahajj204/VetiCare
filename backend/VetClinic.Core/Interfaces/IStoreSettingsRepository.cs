using VetClinic.Core.Entities;

namespace VetClinic.Core.Interfaces;

public interface IStoreSettingsRepository
{
    Task<StoreSettings?> GetAsync(int clinicId);

    Task AddAsync(StoreSettings settings);

    Task SaveChangesAsync();
}