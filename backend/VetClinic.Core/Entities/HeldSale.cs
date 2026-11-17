namespace VetClinic.Core.Entities;

public class HeldSale
{
    public int Id { get; set; }

    public int ClinicId { get; set; }

    public Clinic Clinic { get; set; } = null!;

    public Guid RequestId { get; set; }

    public int? OwnerId { get; set; }

    public Owner? Owner { get; set; }

    public string CustomerName { get; set; } = string.Empty;

    public string CreatedByUserId { get; set; } = string.Empty;

    public bool HasDelivery { get; set; }

    public decimal Discount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Set when this held cart becomes a completed sale.
    public int? CompletedSaleId { get; set; }

    public Sale? CompletedSale { get; set; }

    public ICollection<HeldSaleItem> Items { get; set; }
        = new List<HeldSaleItem>();
}