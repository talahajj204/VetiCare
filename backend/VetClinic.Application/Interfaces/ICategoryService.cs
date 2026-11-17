using VetClinic.Application.DTOs;

namespace VetClinic.Application.Interfaces;

public interface ICategoryService
{
    Task<List<CategoryDto>> ReorderAsync(
    int clinicId,
    List<int> orderedIds);

    Task<List<CategoryDto>> GetAllAsync(int clinicId);

    Task<CategoryDto?> GetByIdAsync(
        int id,
        int clinicId);

    Task<CategoryDto> CreateAsync(
        int clinicId,
        CreateCategoryDto dto);

    Task<CategoryDto?> UpdateAsync(
        int id,
        int clinicId,
        UpdateCategoryDto dto);

    Task<bool> DeleteAsync(
        int id,
        int clinicId);
}