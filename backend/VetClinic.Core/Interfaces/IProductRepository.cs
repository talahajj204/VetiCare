using VetClinic.Core.Entities;

namespace VetClinic.Core.Interfaces;

public interface IProductRepository
{
    Task<List<Product>> GetAllAsync(int clinicId);

    Task<Product?> GetByIdAsync(
        int id,
        int clinicId);

    Task<bool> ExistsAsync(
        int clinicId,
        string name,
        int? excludeId = null);

    Task AddAsync(Product product);

    void Remove(Product product);

    Task SaveChangesAsync();
}