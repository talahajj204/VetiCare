namespace VetClinic.Core.Entities;

public class SupplierInvoice
{
    public int Id { get; set; }

    public int ClinicId { get; set; }

    public Clinic Clinic { get; set; } = null!;

    public string SupplierName { get; set; } = string.Empty;

    public string InvoiceNumber { get; set; } = string.Empty;

    public DateOnly Date { get; set; }

    public string Notes { get; set; } = string.Empty;

    public decimal TaxRate { get; set; }

    public decimal Subtotal { get; set; }

    public decimal TaxTotal { get; set; }

    public decimal Total { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<SupplierInvoiceItem> Items { get; set; }
        = new List<SupplierInvoiceItem>();
}