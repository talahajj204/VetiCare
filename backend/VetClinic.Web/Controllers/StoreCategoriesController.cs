using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Web.Controllers;

[ApiController]
[Route("api/store/{clinicId:int}/categories")]
[AllowAnonymous]
[ResponseCache(
    NoStore = true,
    Location = ResponseCacheLocation.None)]
public class StoreCategoriesController : ControllerBase
{
    private readonly ICategoryService _service;
    private readonly AppDbContext _context;

    public StoreCategoriesController(
        ICategoryService service,
        AppDbContext context)
    {
        _service = service;
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<StoreCategoryResponse>>> GetAll(
        int clinicId)
    {
        if (!await ClinicIsActiveAsync(clinicId))
        {
            return NotFound();
        }

        var categories = await _service.GetAllAsync(
            clinicId);

        var result = categories
            .OrderBy(category => category.SortOrder)
            .ThenBy(category => category.Title)
            .ThenBy(category => category.Id)
            .Select(category => ToResponse(
                category,
                clinicId))
            .ToList();

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<StoreCategoryResponse>> GetById(
        int clinicId,
        int id)
    {
        if (id <= 0 ||
            !await ClinicIsActiveAsync(clinicId))
        {
            return NotFound();
        }

        var category = await _service.GetByIdAsync(
            id,
            clinicId);

        if (category is null)
        {
            return NotFound();
        }

        return Ok(ToResponse(category, clinicId));
    }

    private async Task<bool> ClinicIsActiveAsync(
        int clinicId)
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

    private static StoreCategoryResponse ToResponse(
        CategoryDto category,
        int clinicId)
    {
        return new StoreCategoryResponse
        {
            Id = category.Id,
            ClinicId = clinicId,
            Title = category.Title,
            Image = category.Image,
            Description = category.Description,
            SortOrder = category.SortOrder
        };
    }
}

public sealed class StoreCategoryResponse
{
    public int Id { get; init; }

    public int ClinicId { get; init; }

    public string Title { get; init; } = string.Empty;

    public string Image { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;

    public int SortOrder { get; init; }
}