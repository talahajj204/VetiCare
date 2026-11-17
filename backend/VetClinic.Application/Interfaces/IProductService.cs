using VetClinic.Application.DTOs;

namespace VetClinic.Application.Interfaces;

public interface IProductService
{
    Task<List<ProductDto>> GetAllAsync(int clinicId);

    Task<ProductDto?> GetByIdAsync(
        int id,
        int clinicId);

    Task<ProductDto> CreateAsync(
        int clinicId,
        CreateProductDto dto);

    Task<ProductDto?> UpdateAsync(
        int id,
        int clinicId,
        UpdateProductDto dto);

    Task<bool> DeleteAsync(
        int id,
        int clinicId);
}