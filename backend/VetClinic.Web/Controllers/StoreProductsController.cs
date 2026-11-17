using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Web.Controllers;

[ApiController]
[Route("api/store/{clinicId:int}/products")]
[AllowAnonymous]
[ResponseCache(
    NoStore = true,
    Location = ResponseCacheLocation.None)]
public class StoreProductsController : ControllerBase
{
    private readonly IProductService _service;
    private readonly AppDbContext _context;

    public StoreProductsController(
        IProductService service,
        AppDbContext context)
    {
        _service = service;
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<StoreProductResponse>>> GetAll(
        int clinicId)
    {
        if (!await ClinicIsActiveAsync(clinicId))
        {
            return NotFound();
        }

        var products = await _service.GetAllAsync(clinicId);

        var result = products
            .Where(product => product.ShowOnStore)
            .Select(product => ToResponse(product, clinicId))
            .ToList();

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<StoreProductResponse>> GetById(
        int clinicId,
        int id)
    {
        if (id <= 0 ||
            !await ClinicIsActiveAsync(clinicId))
        {
            return NotFound();
        }

        var product = await _service.GetByIdAsync(
            id,
            clinicId);

        if (product is null || !product.ShowOnStore)
        {
            return NotFound();
        }

        return Ok(ToResponse(product, clinicId));
    }

    private async Task<bool> ClinicIsActiveAsync(int clinicId)
    {
        if (clinicId <= 0)
        {
            return false;
        }

        return await _context.Clinics
            .AsNoTracking()
            .AnyAsync(
                clinic =>
                    clinic.Id == clinicId &&
                    clinic.IsActive,
                HttpContext.RequestAborted);
    }

    private static StoreProductResponse ToResponse(
        ProductDto product,
        int clinicId)
    {
        return new StoreProductResponse
        {
            Id = product.Id,
            ClinicId = clinicId,
            CategoryId = product.CategoryId,
            Category = product.Category,
            Name = product.Name,
            Description = product.Description,
            Quantity = product.Quantity,
            SellingPrice = product.SellingPrice,
            Image = product.Image,
            ShowOnStore = product.ShowOnStore,
            Featured = product.Featured
        };
    }
}

public sealed class StoreProductResponse
{
    public int Id { get; init; }

    public int ClinicId { get; init; }

    public int CategoryId { get; init; }

    public string Category { get; init; } = string.Empty;

    public string Name { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;

    public int Quantity { get; init; }

    public decimal SellingPrice { get; init; }

    public string Image { get; init; } = string.Empty;

    public bool ShowOnStore { get; init; }

    public bool Featured { get; init; }
}