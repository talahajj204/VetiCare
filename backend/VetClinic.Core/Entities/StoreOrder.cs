namespace VetClinic.Core.Entities;

public class StoreOrder
{
    public int Id { get; set; }

    public int ClinicId { get; set; }

    public Clinic Clinic { get; set; } = null!;

    public Guid RequestId { get; set; }

    public string CustomerName { get; set; } = string.Empty;

    public string CustomerPhone { get; set; } = string.Empty;

    public string DeliveryMethod { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public string AddressDetails { get; set; } = string.Empty;

    public string Notes { get; set; } = string.Empty;

    public string PaymentMethod { get; set; } = string.Empty;

    public string PaymentStatus { get; set; } = "Unpaid";

    public string Status { get; set; } = "Pending";

    public string DeliveryStatus { get; set; } = "NotRequired";

    public decimal Subtotal { get; set; }

    public decimal DeliveryFee { get; set; }

    public decimal Total { get; set; }

    // Used to verify guest access to this order.
    public string TrackingTokenHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? StatusUpdatedAt { get; set; }

    public DateTime? DeliveredAt { get; set; }

    public DateTime? CancelledAt { get; set; }

    public ICollection<StoreOrderItem> Items { get; set; }
        = new List<StoreOrderItem>();
}