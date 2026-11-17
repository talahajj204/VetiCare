using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;

namespace VetClinic.Web.Controllers;

[ApiController]
[Route("api/store/{clinicId:int}/orders")]
[AllowAnonymous]
[ResponseCache(
    NoStore = true,
    Location = ResponseCacheLocation.None)]
public class StoreOrdersController : ControllerBase
{
    private readonly IStoreOrderService _service;

    public StoreOrdersController(IStoreOrderService service)
    {
        _service = service;
    }

    [HttpPost]
    [Consumes("application/json")]
    public async Task<ActionResult<StoreOrderDto>> Create(
        int clinicId,
        [FromBody] CreateStoreOrderDto dto,
        [FromHeader(Name = "X-Order-Token")] string? trackingToken)
    {
        try
        {
            var order = await _service.CreateAsync(
                clinicId,
                trackingToken ?? string.Empty,
                dto);

            return CreatedAtAction(
                nameof(GetById),
                new
                {
                    clinicId,
                    id = order.Id
                },
                order);
        }
        catch (ValidationException exception)
        {
            return InvalidData(exception);
        }
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<StoreOrderDto>> GetById(
        int clinicId,
        int id,
        [FromHeader(Name = "X-Order-Token")] string? trackingToken)
    {
        try
        {
            var order = await _service.GetCustomerOrderAsync(
                id,
                clinicId,
                trackingToken ?? string.Empty);

            if (order is null)
            {
                return NotFound();
            }

            return Ok(order);
        }
        catch (ValidationException exception)
        {
            return InvalidData(exception);
        }
    }

    private ActionResult InvalidData(
        ValidationException exception)
    {
        ModelState.AddModelError(
            string.Empty,
            exception.Message);

        return ValidationProblem(ModelState);
    }
}