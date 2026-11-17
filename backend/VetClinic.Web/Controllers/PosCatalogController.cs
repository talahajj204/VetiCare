using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VetClinic.Application.Interfaces;
using VetClinic.Core.Constants;
using VetClinic.Infrastructure.Data;
using VetClinic.Infrastructure.Identity;

namespace VetClinic.Web.Controllers;

[ApiController]
[Route("api/pos/catalog")]
[Authorize(Roles = AppRoles.ClinicAdmin + "," + AppRoles.Staff)]
[Authorize(Policy = AppPermissions.PosAccess)]
[ResponseCache(
    NoStore = true,
    Location = ResponseCacheLocation.None)]
public class PosCatalogController : ControllerBase
{
    private readonly IProductService _products;
    private readonly ICategoryService _categories;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _context;

    public PosCatalogController(
        IProductService products,
        ICategoryService categories,
        UserManager<ApplicationUser> userManager,
        AppDbContext context)
    {
        _products = products;
        _categories = categories;
        _userManager = userManager;
        _context = context;
    }

    [HttpGet("products")]
    public async Task<IActionResult> GetProducts()
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        var products = await _products.GetAllAsync(
            clinicId.Value);

        return Ok(products
            .Where(product => product.ShowOnPOS)
            .Select(product => new
            {
                product.Id,
                product.Name,
                product.Category,
                product.SellingPrice,
                product.Quantity,
                product.Image,
                product.ShowOnPOS
            })
            .ToList());
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        var categories = await _categories.GetAllAsync(
            clinicId.Value);

        return Ok(categories
            .Select(category => new
            {
                category.Id,
                category.Title,
                category.SortOrder
            })
            .ToList());
    }

    private async Task<int?> GetClinicIdAsync()
    {
        var user = await _userManager.GetUserAsync(User);

        if (user is null ||
            !user.IsActive ||
            user.ClinicId is not int clinicId ||
            clinicId <= 0)
        {
            return null;
        }

        if (await _userManager.IsInRoleAsync(
                user,
                AppRoles.SuperAdmin))
        {
            return null;
        }

        var isAdmin = await _userManager.IsInRoleAsync(
            user,
            AppRoles.ClinicAdmin);

        var isStaff = await _userManager.IsInRoleAsync(
            user,
            AppRoles.Staff);

        if (!isAdmin && !isStaff)
        {
            return null;
        }

        var active = await _context.Clinics
            .AsNoTracking()
            .AnyAsync(clinic =>
                clinic.Id == clinicId &&
                clinic.IsActive);

        return active ? clinicId : null;
    }
}