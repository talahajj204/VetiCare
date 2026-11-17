using VetClinic.Application.DTOs;

namespace VetClinic.Application.Interfaces;

public interface IBillingInvoiceService
{
    Task<List<BillingInvoiceDto>> GetAllAsync(int clinicId);

    Task<BillingInvoiceDto?> GetByIdAsync(
        int id,
        int clinicId);

    Task<BillingInvoiceDto> CreateAsync(
        int clinicId,
        CreateBillingInvoiceDto dto);

    Task<BillingInvoiceDto?> UpdateAsync(
        int id,
        int clinicId,
        UpdateBillingInvoiceDto dto);

    Task<BillingInvoiceDto?> RecordPaymentAsync(
        int id,
        int clinicId,
        RecordBillingPaymentDto dto);

    Task<bool> DeleteAsync(
        int id,
        int clinicId,
        byte[] rowVersion);
}