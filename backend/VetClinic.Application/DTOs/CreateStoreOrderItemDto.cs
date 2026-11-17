using System.ComponentModel.DataAnnotations;

namespace VetClinic.Application.DTOs;

public class CreateStoreOrderItemDto
{
    [Range(1, int.MaxValue)]
    public int ProductId { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
}