using System.ComponentModel.DataAnnotations;

namespace VetClinic.Application.DTOs;

public class BillingInvoiceDto
{
    public int Id { get; set; }

    public Guid RequestId { get; set; }

    public string InvoiceNumber { get; set; } = string.Empty;

    public string OwnerName { get; set; } = string.Empty;

    public DateOnly Date { get; set; }

    public string Status { get; set; } = string.Empty;

    public decimal Total { get; set; }

    public decimal AmountPaid { get; set; }

    public decimal Balance { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public byte[] RowVersion { get; set; } = [];

    public List<BillingInvoiceLineDto> Lines { get; set; } = [];

    public List<BillingPaymentDto> Payments { get; set; } = [];
}

public class BillingInvoiceLineDto
{
    public int Id { get; set; }

    public string Type { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal Total { get; set; }

    public int SortOrder { get; set; }
}

public class BillingPaymentDto
{
    public int Id { get; set; }

    public Guid RequestId { get; set; }

    public decimal Amount { get; set; }

    public string PaymentMethod { get; set; } = string.Empty;

    public string Notes { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}

public class BillingInvoiceInputDto
{
    [Required]
    [StringLength(100)]
    public string InvoiceNumber { get; set; } = string.Empty;

    [Required]
    [StringLength(200)]
    public string OwnerName { get; set; } = string.Empty;

    public DateOnly Date { get; set; }

    [Required]
    [StringLength(100)]
    public string Status { get; set; } = string.Empty;

    [Required]
    [MinLength(1)]
    [MaxLength(200)]
    public List<BillingInvoiceLineInputDto> Lines { get; set; } = [];
}

public class CreateBillingInvoiceDto : BillingInvoiceInputDto
{
    public Guid RequestId { get; set; }
}

public class UpdateBillingInvoiceDto : BillingInvoiceInputDto
{
    [Required]
    [MinLength(8)]
    [MaxLength(8)]
    public byte[] RowVersion { get; set; } = [];
}

public class BillingInvoiceLineInputDto
{
    [Range(1, int.MaxValue)]
    public int? Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Type { get; set; } = string.Empty;

    [Required]
    [StringLength(4000)]
    public string Description { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; } = 1;

    [Range(typeof(decimal), "0", "9999999999999999.99")]
    public decimal UnitPrice { get; set; }
}

// Kept to remain compatible with the existing controller.
public class RecordBillingPaymentDto
{
    public Guid RequestId { get; set; }

    [Range(typeof(decimal), "0.01", "9999999999999999.99")]
    public decimal Amount { get; set; }

    [Required]
    [StringLength(100)]
    public string PaymentMethod { get; set; } = string.Empty;

    [StringLength(4000)]
    public string Notes { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    [MaxLength(8)]
    public byte[] RowVersion { get; set; } = [];
}