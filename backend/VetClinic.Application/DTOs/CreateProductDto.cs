using System.ComponentModel.DataAnnotations;

namespace VetClinic.Application.DTOs;

public class CreateProductDto
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int CategoryId { get; set; }

    [StringLength(4000)]
    public string Description { get; set; } = string.Empty;

    [Range(0, int.MaxValue)]
    public int Quantity { get; set; }

    [Range(0, int.MaxValue)]
    public int MinimumStock { get; set; }

    [Range(typeof(decimal), "0", "9999999999999999.99")]
    public decimal PurchasePrice { get; set; }

    [Range(typeof(decimal), "0", "9999999999999999.99")]
    public decimal SellingPrice { get; set; }

    public DateOnly? ExpiryDate { get; set; }

    public string Image { get; set; } = string.Empty;

    public bool ShowOnStore { get; set; }

    public bool ShowOnPOS { get; set; }

    public bool Featured { get; set; }
}