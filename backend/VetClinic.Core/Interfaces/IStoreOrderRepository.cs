using VetClinic.Core.Entities;

namespace VetClinic.Core.Interfaces;

public interface IStoreOrderRepository
{
    Task<Clinic?> GetClinicAsync(int clinicId);

    Task<List<StoreOrder>> GetAllAsync(int clinicId);

    Task<StoreOrder?> GetByIdAsync(
        int id,
        int clinicId);

    Task<StoreOrder?> GetByRequestIdAsync(
        Guid requestId,
        int clinicId);

    Task<List<StoreOrder>> GetPendingDeliveriesAsync(
        int clinicId);

    Task<Product?> GetProductAsync(
        int productId,
        int clinicId);

    Task<bool> StatusExistsAsync(
        int clinicId,
        string status);

    Task AddAsync(StoreOrder order);

    Task SaveChangesAsync();

    Task<T> ExecuteInTransactionAsync<T>(
        Func<Task<T>> action);
}