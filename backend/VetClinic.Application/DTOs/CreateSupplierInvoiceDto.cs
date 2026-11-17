using System.ComponentModel.DataAnnotations;

namespace VetClinic.Application.DTOs;

public class CreateSupplierInvoiceDto
{
    [Required]
    [StringLength(200)]
    public string SupplierName { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string InvoiceNumber { get; set; } = string.Empty;

    [Required]
    public DateOnly? Date { get; set; }

    [StringLength(4000)]
    public string Notes { get; set; } = string.Empty;

    [Range(typeof(decimal), "0", "100")]
    public decimal TaxRate { get; set; }

    [Required]
    [MinLength(1)]
    [MaxLength(200)]
    public List<CreateSupplierInvoiceItemDto> Items { get; set; }
        = new();
}