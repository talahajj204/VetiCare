using VetClinic.Core.Entities;

namespace VetClinic.Core.Interfaces;

public interface IClinicOptionRepository
{
    Task<List<ClinicOption>> GetAllAsync(
        int clinicId,
        string? listKey = null,
        bool includeInactive = false);

    Task<ClinicOption?> GetByIdAsync(
        int id,
        int clinicId);

    Task<bool> ExistsAsync(
        int clinicId,
        string listKey,
        string value,
        int? excludeId = null);

    Task AddAsync(ClinicOption option);

    Task SaveChangesAsync();
}