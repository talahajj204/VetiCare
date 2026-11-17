using VetClinic.Application.DTOs;

namespace VetClinic.Application.Interfaces;

public interface ISaleService
{
    Task<List<SaleDto>> GetAllAsync(int clinicId);

    Task<SaleDto?> GetByIdAsync(
        int id,
        int clinicId);

    Task<SaleDto> CreateAsync(
        int clinicId,
        CreateSaleDto dto);
}