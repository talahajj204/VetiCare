using System.ComponentModel.DataAnnotations;

namespace VetClinic.Application.DTOs;

public class CreateStoreOrderDto
{
    public Guid RequestId { get; set; }

    [Required]
    [StringLength(200)]
    public string CustomerName { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string CustomerPhone { get; set; } = string.Empty;

    [Required]
    [RegularExpression(
        "^(delivery|pickup)$",
        ErrorMessage = "Choose delivery or pickup.")]
    public string DeliveryMethod { get; set; } = string.Empty;

    [StringLength(500)]
    public string Address { get; set; } = string.Empty;

    [StringLength(1000)]
    public string AddressDetails { get; set; } = string.Empty;

    [StringLength(4000)]
    public string Notes { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string PaymentMethod { get; set; } = string.Empty;

    [Required]
    [MinLength(1)]
    [MaxLength(200)]
    public List<CreateStoreOrderItemDto> Items { get; set; }
        = new();
}