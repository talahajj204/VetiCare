using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;
using VetClinic.Core.Constants;

namespace VetClinic.Web.Controllers;

[ApiController]
[Route("api/clinics")]
[Authorize(Roles = AppRoles.SuperAdmin)]
public class ClinicsController : ControllerBase
{
    private readonly IClinicService _service;

    public ClinicsController(IClinicService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<ClinicDto>>> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ClinicDto>> GetById(int id)
    {
        var clinic = await _service.GetByIdAsync(id);

        if (clinic is null)
        {
            return NotFound();
        }

        return Ok(clinic);
    }

    [HttpPost]
    public async Task<ActionResult<ClinicDto>> Create(
        [FromBody] CreateClinicDto dto)
    {
        try
        {
            var clinic = await _service.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = clinic.Id },
                clinic
            );
        }
        catch (ValidationException exception)
        {
            ModelState.AddModelError(
                string.Empty,
                exception.Message
            );

            return ValidationProblem(ModelState);
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ClinicDto>> Update(
        int id,
        [FromBody] UpdateClinicDto dto)
    {
        try
        {
            var clinic = await _service.UpdateAsync(id, dto);

            if (clinic is null)
            {
                return NotFound();
            }

            return Ok(clinic);
        }
        catch (ValidationException exception)
        {
            ModelState.AddModelError(
                string.Empty,
                exception.Message
            );

            return ValidationProblem(ModelState);
        }
    }
}