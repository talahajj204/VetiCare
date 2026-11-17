using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;
using VetClinic.Core.Constants;
using VetClinic.Infrastructure.Data;
using VetClinic.Infrastructure.Identity;

namespace VetClinic.Web.Controllers;

[ApiController]
[Route("api/categories")]
[Authorize(Roles = AppRoles.ClinicAdmin + "," + AppRoles.Staff)]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _service;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _context;

    public CategoriesController(
        ICategoryService service,
        UserManager<ApplicationUser> userManager,
        AppDbContext context)
    {
        _service = service;
        _userManager = userManager;
        _context = context;
    }

    [HttpGet]
    [Authorize(Policy = AppPermissions.CategoriesView)]
    public async Task<ActionResult<List<CategoryDto>>> GetAll()
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        return Ok(await _service.GetAllAsync(clinicId.Value));
    }

    [HttpGet("{id:int}")]
    [Authorize(Policy = AppPermissions.CategoriesView)]
    public async Task<ActionResult<CategoryDto>> GetById(int id)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        var category = await _service.GetByIdAsync(
            id,
            clinicId.Value);

        if (category is null)
        {
            return NotFound();
        }

        return Ok(category);
    }

    [HttpPost]
    [Authorize(Policy = AppPermissions.CategoriesCreate)]
    public async Task<ActionResult<CategoryDto>> Create(
        [FromBody] CreateCategoryDto dto)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            var category = await _service.CreateAsync(
                clinicId.Value,
                dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = category.Id },
                category);
        }
        catch (ValidationException exception)
        {
            return ValidationError(exception);
        }
    }

    [HttpPut("reorder")]
    [Authorize(Policy = AppPermissions.CategoriesUpdate)]
    public async Task<ActionResult<List<CategoryDto>>> Reorder(
        [FromBody] List<int> orderedIds)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            var categories = await _service.ReorderAsync(
                clinicId.Value,
                orderedIds);

            return Ok(categories);
        }
        catch (ValidationException exception)
        {
            return ValidationError(exception);
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = AppPermissions.CategoriesUpdate)]
    public async Task<ActionResult<CategoryDto>> Update(
        int id,
        [FromBody] UpdateCategoryDto dto)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            var category = await _service.UpdateAsync(
                id,
                clinicId.Value,
                dto);

            if (category is null)
            {
                return NotFound();
            }

            return Ok(category);
        }
        catch (ValidationException exception)
        {
            return ValidationError(exception);
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = AppPermissions.CategoriesDelete)]
    public async Task<IActionResult> Delete(int id)
    {
        var clinicId = await GetClinicIdAsync();

        if (clinicId is null)
        {
            return Forbid();
        }

        try
        {
            var deleted = await _service.DeleteAsync(
                id,
                clinicId.Value);

            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }
        catch (ValidationException exception)
        {
            return ValidationError(exception);
        }
    }

    private ActionResult ValidationError(
        ValidationException exception)
    {
        ModelState.AddModelError(
            string.Empty,
            exception.Message);

        return ValidationProblem(ModelState);
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

        var isClinicAdmin = await _userManager.IsInRoleAsync(
            user,
            AppRoles.ClinicAdmin);

        var isStaff = await _userManager.IsInRoleAsync(
            user,
            AppRoles.Staff);

        if (!isClinicAdmin && !isStaff)
        {
            return null;
        }

        var clinicIsActive = await _context.Clinics
            .AnyAsync(clinic =>
                clinic.Id == clinicId &&
                clinic.IsActive);

        return clinicIsActive ? clinicId : null;
    }
}