using System.ComponentModel.DataAnnotations;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;

namespace VetClinic.Application.Services;

public class CategoryService : ICategoryService
{
    public async Task<List<CategoryDto>> ReorderAsync(
    int clinicId,
    List<int> orderedIds)
{
    ValidateClinicId(clinicId);

    if (orderedIds is null ||
        orderedIds.Count == 0 ||
        orderedIds.Count > 10000)
    {
        throw new ValidationException(
            "Please provide the complete category order.");
    }

    if (orderedIds.Any(id => id <= 0) ||
        orderedIds.Distinct().Count() != orderedIds.Count)
    {
        throw new ValidationException(
            "The category order contains invalid or duplicate IDs.");
    }

    var saved = await _repository.TryReorderAsync(
        clinicId,
        orderedIds);

    if (!saved)
    {
        throw new ValidationException(
            "The category list has changed. " +
            "Refresh the page and try again.");
    }

    return await GetAllAsync(clinicId);
}

    private readonly ICategoryRepository _repository;

    public CategoryService(ICategoryRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<CategoryDto>> GetAllAsync(
        int clinicId)
    {
        ValidateClinicId(clinicId);

        var categories = await _repository.GetAllAsync(
            clinicId);

        return categories.Select(ToDto).ToList();
    }

    public async Task<CategoryDto?> GetByIdAsync(
        int id,
        int clinicId)
    {
        ValidateClinicId(clinicId);

        var category = await _repository.GetByIdAsync(
            id,
            clinicId);

        return category is null ? null : ToDto(category);
    }

    public async Task<CategoryDto> CreateAsync(
        int clinicId,
        CreateCategoryDto dto)
    {
        ValidateClinicId(clinicId);
        ValidateDto(dto);

        var title = ValidateTitle(dto.Title);

        if (await _repository.ExistsAsync(clinicId, title))
        {
            throw new ValidationException(
                "A category with this title already exists.");
        }

        var category = new Category
        {
            ClinicId = clinicId,
            Title = title,
            Image = dto.Image?.Trim() ?? string.Empty,
            Description = dto.Description?.Trim()
                ?? string.Empty,
            SortOrder = dto.SortOrder,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(category);
        await _repository.SaveChangesAsync();

        return ToDto(category);
    }

    public async Task<CategoryDto?> UpdateAsync(
        int id,
        int clinicId,
        UpdateCategoryDto dto)
    {
        ValidateClinicId(clinicId);
        ValidateDto(dto);

        var category = await _repository.GetByIdAsync(
            id,
            clinicId);

        if (category is null)
        {
            return null;
        }

        var title = ValidateTitle(dto.Title);

        if (await _repository.ExistsAsync(
            clinicId,
            title,
            excludeId: id))
        {
            throw new ValidationException(
                "A category with this title already exists.");
        }

        category.Title = title;
        category.Image = dto.Image?.Trim()
            ?? string.Empty;
        category.Description = dto.Description?.Trim()
            ?? string.Empty;
        category.SortOrder = dto.SortOrder;

        await _repository.SaveChangesAsync();

        return ToDto(category);
    }

    public async Task<bool> DeleteAsync(
        int id,
        int clinicId)
    {
        ValidateClinicId(clinicId);

        var category = await _repository.GetByIdAsync(
            id,
            clinicId);

        if (category is null)
        {
            return false;
        }

        _repository.Remove(category);
        await _repository.SaveChangesAsync();

        return true;
    }

    private static void ValidateClinicId(int clinicId)
    {
        if (clinicId <= 0)
        {
            throw new ValidationException(
                "A valid clinic is required.");
        }
    }

    private static void ValidateDto(object dto)
    {
        Validator.ValidateObject(
            dto,
            new ValidationContext(dto),
            validateAllProperties: true);
    }

    private static string ValidateTitle(string? title)
    {
        var value = title?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(value))
        {
            throw new ValidationException(
                "Please enter a category title.");
        }

        if (value.Length > 200)
        {
            throw new ValidationException(
                "Category title must not exceed 200 characters.");
        }

        return value;
    }

    private static CategoryDto ToDto(Category category)
    {
        return new CategoryDto
        {
            Id = category.Id,
            Title = category.Title,
            Image = category.Image,
            Description = category.Description,
            SortOrder = category.SortOrder,
            CreatedAt = category.CreatedAt
        };
    }
}