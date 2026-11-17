using System.ComponentModel.DataAnnotations;

namespace VetClinic.Application.DTOs;

public class CreateSaleRefundDto
{
    public Guid RequestId { get; set; }

    [Range(1, int.MaxValue)]
    public int SaleId { get; set; }

    [Required]
    [StringLength(1000)]
    public string Reason { get; set; } = string.Empty;

    [Required]
    [MinLength(1)]
    [MaxLength(200)]
    public List<CreateSaleRefundItemDto> Items { get; set; }
        = new();
}

public class CreateSaleRefundItemDto
{
    [Range(1, int.MaxValue)]
    public int SaleItemId { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
}