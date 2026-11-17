namespace VetClinic.Core.Entities;

public class BillingInvoice
{
    public int Id { get; set; }

    public int ClinicId { get; set; }

    public Clinic Clinic { get; set; } = null!;

    // Prevent duplicate invoices when retrying a request.
    public Guid RequestId { get; set; }

    public string InvoiceNumber { get; set; } = string.Empty;

    public string OwnerName { get; set; } = string.Empty;

    public DateOnly Date { get; set; }

    public string Status { get; set; } = "Unpaid";

    public decimal Total { get; set; }

    public decimal AmountPaid { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Used to detect concurrent changes.
    public byte[] RowVersion { get; set; } = [];

    public ICollection<BillingInvoiceLine> Lines { get; set; }
        = new List<BillingInvoiceLine>();

    public ICollection<BillingPayment> Payments { get; set; }
        = new List<BillingPayment>();
}

public class BillingInvoiceLine
{
    public int Id { get; set; }

    public int ClinicId { get; set; }

    public int BillingInvoiceId { get; set; }

    public BillingInvoice BillingInvoice { get; set; } = null!;

    public string Type { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal Total { get; set; }

    public int SortOrder { get; set; }
}

public class BillingPayment
{
    public int Id { get; set; }

    public int ClinicId { get; set; }

    public int BillingInvoiceId { get; set; }

    public BillingInvoice BillingInvoice { get; set; } = null!;

    // Prevent recording the same payment twice.
    public Guid RequestId { get; set; }

    public decimal Amount { get; set; }

    public string PaymentMethod { get; set; } = string.Empty;

    public string Notes { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}