using VetClinic.Application.DTOs;

namespace VetClinic.Application.Interfaces;

public interface ISupplierInvoiceService
{
    Task<List<SupplierInvoiceDto>> GetAllAsync(
        int clinicId);

    Task<SupplierInvoiceDto?> GetByIdAsync(
        int id,
        int clinicId);

    Task<SupplierInvoiceDto> CreateAsync(
        int clinicId,
        CreateSupplierInvoiceDto dto);
}