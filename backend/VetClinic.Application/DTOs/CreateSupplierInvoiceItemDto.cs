using System.ComponentModel.DataAnnotations;

namespace VetClinic.Application.DTOs;

public class CreateSupplierInvoiceItemDto
{
    // Existing product: provide ProductId.
    // New product: provide CategoryId and ProductName.
    [Range(1, int.MaxValue)]
    public int? ProductId { get; set; }

    [Range(1, int.MaxValue)]
    public int? CategoryId { get; set; }

    [StringLength(200)]
    public string ProductName { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [Range(typeof(decimal), "0", "9999999999999999.99")]
    public decimal PurchasePrice { get; set; }

    public bool IsTaxable { get; set; }
}