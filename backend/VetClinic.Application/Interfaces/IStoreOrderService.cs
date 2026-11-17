using VetClinic.Application.DTOs;

namespace VetClinic.Application.Interfaces;

public interface IStoreOrderService
{
    Task<List<StoreOrderDto>> GetAllAsync(int clinicId);

    Task<StoreOrderDto?> GetByIdAsync(
        int id,
        int clinicId);

    Task<StoreOrderDto> CreateAsync(
        int clinicId,
        string trackingToken,
        CreateStoreOrderDto dto);

    Task<StoreOrderDto?> GetCustomerOrderAsync(
        int id,
        int clinicId,
        string trackingToken);

    Task<StoreOrderDto?> UpdateStatusAsync(
        int id,
        int clinicId,
        UpdateStoreOrderStatusDto dto);

    Task<List<StoreOrderDto>> GetPendingDeliveriesAsync(
        int clinicId);

    Task<StoreOrderDto?> MarkDeliveredAsync(
        int id,
        int clinicId);
}