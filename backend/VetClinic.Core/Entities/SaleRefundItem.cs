namespace VetClinic.Core.Entities;

public class SaleRefundItem
{
    public int Id { get; set; }

    public int ClinicId { get; set; }

    public int SaleRefundId { get; set; }

    public SaleRefund SaleRefund { get; set; } = null!;

    public int SaleItemId { get; set; }

    public SaleItem SaleItem { get; set; } = null!;

    public int Quantity { get; set; }

    public decimal Amount { get; set; }
}