namespace VetClinic.Application.DTOs;

public class SupplierInvoiceDto
{
    public int Id { get; set; }

    public string SupplierName { get; set; } = string.Empty;

    public string InvoiceNumber { get; set; } = string.Empty;

    public DateOnly Date { get; set; }

    public string Notes { get; set; } = string.Empty;

    public decimal TaxRate { get; set; }

    public decimal Subtotal { get; set; }

    public decimal TaxTotal { get; set; }

    public decimal Total { get; set; }

    public DateTime CreatedAt { get; set; }

    public List<SupplierInvoiceItemDto> Items { get; set; }
        = new();
}