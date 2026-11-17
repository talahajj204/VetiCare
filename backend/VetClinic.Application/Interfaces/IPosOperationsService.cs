using VetClinic.Application.DTOs;

namespace VetClinic.Application.Interfaces;

public interface IPosOperationsService
{
    Task<List<HeldSaleDto>> GetHeldSalesAsync(
        int clinicId);

    Task<HeldSaleDto?> GetHeldSaleAsync(
        int id,
        int clinicId);

    Task<HeldSaleDto> HoldSaleAsync(
        int clinicId,
        string userId,
        CreateHeldSaleDto dto);

    Task<List<DeliverySaleDto>> GetPendingDeliveriesAsync(
        int clinicId);

    Task<DeliverySaleDto?> MarkDeliveredAsync(
        int saleId,
        int clinicId);

    Task<List<RefundableSaleDto>> GetRefundableSalesAsync(
        int clinicId);

    Task<SaleRefundDto> RefundSaleAsync(
        int clinicId,
        string userId,
        CreateSaleRefundDto dto);
}