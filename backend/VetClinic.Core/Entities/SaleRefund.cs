namespace VetClinic.Core.Entities;

public class SaleRefund
{
    public int Id { get; set; }

    public int ClinicId { get; set; }

    public Clinic Clinic { get; set; } = null!;

    public Guid RequestId { get; set; }

    public int SaleId { get; set; }

    public Sale Sale { get; set; } = null!;

    public string CreatedByUserId { get; set; } = string.Empty;

    public string Reason { get; set; } = string.Empty;

    public decimal Total { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<SaleRefundItem> Items { get; set; }
        = new List<SaleRefundItem>();
}