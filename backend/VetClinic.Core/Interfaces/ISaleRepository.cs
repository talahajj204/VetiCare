using VetClinic.Core.Entities;

namespace VetClinic.Core.Interfaces;

public interface ISaleRepository
{
    Task<List<Sale>> GetAllAsync(int clinicId);

    Task<Sale?> GetByIdAsync(
        int id,
        int clinicId);

    Task<Sale?> GetByRequestIdAsync(
        Guid requestId,
        int clinicId);

    Task<Product?> GetProductAsync(
        int productId,
        int clinicId);

    Task<Owner?> GetOwnerAsync(
        int ownerId,
        int clinicId);

    Task<bool> PaymentMethodExistsAsync(
        int clinicId,
        string paymentMethod);

    Task AddAsync(Sale sale);

    Task SaveChangesAsync();

    Task<T> ExecuteInTransactionAsync<T>(
        Func<Task<T>> action);
}