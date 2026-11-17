using System.ComponentModel.DataAnnotations;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;

namespace VetClinic.Application.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _repository;
    private readonly ICategoryRepository _categoryRepository;

    public ProductService(
        IProductRepository repository,
        ICategoryRepository categoryRepository)
    {
        _repository = repository;
        _categoryRepository = categoryRepository;
    }

    public async Task<List<ProductDto>> GetAllAsync(
        int clinicId)
    {
        ValidateClinicId(clinicId);

        var products = await _repository.GetAllAsync(
            clinicId);

        return products.Select(ToDto).ToList();
    }

    public async Task<ProductDto?> GetByIdAsync(
        int id,
        int clinicId)
    {
        ValidateClinicId(clinicId);

        var product = await _repository.GetByIdAsync(
            id,
            clinicId);

        return product is null ? null : ToDto(product);
    }

    public async Task<ProductDto> CreateAsync(
        int clinicId,
        CreateProductDto dto)
    {
        ValidateClinicId(clinicId);
        ValidateDto(dto);

        var name = ValidateName(dto.Name);

        if (await _repository.ExistsAsync(clinicId, name))
        {
            throw new ValidationException(
                "A product with this name already exists.");
        }

        var category = await GetCategoryAsync(
            dto.CategoryId,
            clinicId);

        var product = new Product
        {
            ClinicId = clinicId,
            CreatedAt = DateTime.UtcNow
        };

        ApplyChanges(product, dto, name, category);

        await _repository.AddAsync(product);
        await _repository.SaveChangesAsync();

        return ToDto(product);
    }

    public async Task<ProductDto?> UpdateAsync(
        int id,
        int clinicId,
        UpdateProductDto dto)
    {
        ValidateClinicId(clinicId);
        ValidateDto(dto);

        var product = await _repository.GetByIdAsync(
            id,
            clinicId);

        if (product is null)
        {
            return null;
        }

        var name = ValidateName(dto.Name);

        if (await _repository.ExistsAsync(
            clinicId,
            name,
            excludeId: id))
        {
            throw new ValidationException(
                "A product with this name already exists.");
        }

        var category = await GetCategoryAsync(
            dto.CategoryId,
            clinicId);

        ApplyChanges(product, dto, name, category);

        await _repository.SaveChangesAsync();

        return ToDto(product);
    }

    public async Task<bool> DeleteAsync(
        int id,
        int clinicId)
    {
        ValidateClinicId(clinicId);

        var product = await _repository.GetByIdAsync(
            id,
            clinicId);

        if (product is null)
        {
            return false;
        }

        _repository.Remove(product);
        await _repository.SaveChangesAsync();

        return true;
    }

    private async Task<Category> GetCategoryAsync(
        int categoryId,
        int clinicId)
    {
        var category = await _categoryRepository
            .GetByIdAsync(categoryId, clinicId);

        if (category is null)
        {
            throw new ValidationException(
                "Please select a category belonging to your clinic.");
        }

        return category;
    }

    private static void ApplyChanges(
        Product product,
        CreateProductDto dto,
        string name,
        Category category)
    {
        product.Name = name;
        product.CategoryId = category.Id;
        product.Category = category;
        product.Description = dto.Description?.Trim()
            ?? string.Empty;
        product.Quantity = dto.Quantity;
        product.MinimumStock = dto.MinimumStock;
        product.PurchasePrice = dto.PurchasePrice;
        product.SellingPrice = dto.SellingPrice;
        product.ExpiryDate = dto.ExpiryDate;
        product.Image = dto.Image?.Trim()
            ?? string.Empty;
        product.ShowOnStore = dto.ShowOnStore;
        product.ShowOnPOS = dto.ShowOnPOS;
        product.Featured = dto.Featured;
    }

    private static void ValidateClinicId(int clinicId)
    {
        if (clinicId <= 0)
        {
            throw new ValidationException(
                "A valid clinic is required.");
        }
    }

    private static void ValidateDto(CreateProductDto dto)
    {
        Validator.ValidateObject(
            dto,
            new ValidationContext(dto),
            validateAllProperties: true);

        if (
            decimal.Round(dto.PurchasePrice, 2)
                != dto.PurchasePrice ||
            decimal.Round(dto.SellingPrice, 2)
                != dto.SellingPrice)
        {
            throw new ValidationException(
                "Prices must have no more than two decimal places.");
        }
    }

    private static string ValidateName(string? name)
    {
        var value = name?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(value))
        {
            throw new ValidationException(
                "Please enter a product name.");
        }

        if (value.Length > 200)
        {
            throw new ValidationException(
                "Product name must not exceed 200 characters.");
        }

        return value;
    }

    private static ProductDto ToDto(Product product)
    {
        return new ProductDto
        {
            Id = product.Id,
            CategoryId = product.CategoryId,
            Category = product.Category.Title,
            Name = product.Name,
            Description = product.Description,
            Quantity = product.Quantity,
            MinimumStock = product.MinimumStock,
            PurchasePrice = product.PurchasePrice,
            SellingPrice = product.SellingPrice,
            ExpiryDate = product.ExpiryDate,
            Image = product.Image,
            ShowOnStore = product.ShowOnStore,
            ShowOnPOS = product.ShowOnPOS,
            Featured = product.Featured,
            CreatedAt = product.CreatedAt
        };
    }
}