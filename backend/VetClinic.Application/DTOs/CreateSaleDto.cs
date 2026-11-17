using System.ComponentModel.DataAnnotations;

namespace VetClinic.Application.DTOs;

public class CreateSaleDto
{
    public Guid RequestId { get; set; }

    [Range(1, int.MaxValue)]
    public int? OwnerId { get; set; }

    [StringLength(200)]
    public string CustomerName { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string PaymentMethod { get; set; } = string.Empty;

    public bool HasDelivery { get; set; }

    [Range(typeof(decimal), "0", "9999999999999999.99")]
    public decimal Discount { get; set; }

    [Range(typeof(decimal), "0", "9999999999999999.99")]
    public decimal ReceivedUsd { get; set; }

    [Range(typeof(decimal), "0", "9999999999999999.99")]
    public decimal ReceivedLbp { get; set; }

    [Required]
    [MinLength(1)]
    [MaxLength(200)]
    public List<CreateSaleItemDto> Items { get; set; } = new();
    [Range(1, int.MaxValue)]
public int? HeldSaleId { get; set; }
}

