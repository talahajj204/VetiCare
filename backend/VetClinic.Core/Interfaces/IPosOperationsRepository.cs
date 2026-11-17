using VetClinic.Core.Entities;

namespace VetClinic.Core.Interfaces;

public interface IPosOperationsRepository
{
    Task<List<HeldSale>> GetHeldSalesAsync(int clinicId);

    Task<HeldSale?> GetHeldSaleAsync(
        int id,
        int clinicId);

    Task<HeldSale?> GetHeldSaleByRequestIdAsync(
        Guid requestId,
        int clinicId);

    Task AddHeldSaleAsync(HeldSale heldSale);

    Task<List<Sale>> GetPendingDeliveriesAsync(int clinicId);

    Task<Sale?> GetSaleAsync(
        int id,
        int clinicId);

    Task<List<Sale>> GetSalesForRefundAsync(int clinicId);

    Task<List<SaleRefundItem>> GetRefundItemsAsync(
        int saleId,
        int clinicId);

    Task<SaleRefund?> GetRefundByRequestIdAsync(
        Guid requestId,
        int clinicId);

    Task AddRefundAsync(SaleRefund refund);

    Task<Product?> GetProductAsync(
        int productId,
        int clinicId);

    Task<Owner?> GetOwnerAsync(
        int ownerId,
        int clinicId);

    Task SaveChangesAsync();

    Task<T> ExecuteInTransactionAsync<T>(
        Func<Task<T>> action);
}