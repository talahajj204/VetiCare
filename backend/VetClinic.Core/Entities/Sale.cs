namespace VetClinic.Core.Entities;

public class Sale
{
    public int Id { get; set; }

    public int ClinicId { get; set; }

    public Clinic Clinic { get; set; } = null!;

    // Prevent creating the same sale twice when retrying.
    public Guid RequestId { get; set; }

    // Null for a walk-in customer.
    public int? OwnerId { get; set; }

    public Owner? Owner { get; set; }

    public string CustomerName { get; set; } = string.Empty;

    public string PaymentMethod { get; set; } = string.Empty;

    public bool HasDelivery { get; set; }

// NotRequired, Pending, or Delivered.
public string DeliveryStatus { get; set; } = "NotRequired";

public DateTime? DeliveredAt { get; set; }

    public decimal Subtotal { get; set; }

    public decimal Discount { get; set; }

    public decimal Total { get; set; }

    public decimal ReceivedUsd { get; set; }

    public decimal ReceivedLbp { get; set; }

    public decimal ExchangeRate { get; set; }

    public decimal TotalPaid { get; set; }

    public decimal Change { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<SaleItem> Items { get; set; }
        = new List<SaleItem>();
}