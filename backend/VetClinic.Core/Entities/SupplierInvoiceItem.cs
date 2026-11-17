namespace VetClinic.Core.Entities;

public class SupplierInvoiceItem
{
    public int Id { get; set; }

    public int ClinicId { get; set; }

    public int SupplierInvoiceId { get; set; }

    public SupplierInvoice SupplierInvoice { get; set; } = null!;

    public int ProductId { get; set; }

    public Product Product { get; set; } = null!;

    public string ProductName { get; set; } = string.Empty;

    public string CategoryName { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public decimal PurchasePrice { get; set; }

    public bool IsTaxable { get; set; }

    public decimal Subtotal { get; set; }

    public decimal TaxAmount { get; set; }

    public decimal Total { get; set; }
}