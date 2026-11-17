using VetClinic.Core.Entities;

namespace VetClinic.Core.Interfaces;

public interface ICategoryRepository
{
    Task<List<Category>> GetAllAsync(int clinicId);

    Task<Category?> GetByIdAsync(
        int id,
        int clinicId);

    Task<bool> ExistsAsync(
        int clinicId,
        string title,
        int? excludeId = null);

    Task AddAsync(Category category);

    void Remove(Category category);

    Task SaveChangesAsync();

    Task<bool> TryReorderAsync(
        int clinicId,
        IReadOnlyList<int> orderedIds);
}