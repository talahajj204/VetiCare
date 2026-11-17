namespace VetClinic.Core.Entities;

public class HeldSaleItem
{
    public int Id { get; set; }

    public int ClinicId { get; set; }

    public int HeldSaleId { get; set; }

    public HeldSale HeldSale { get; set; } = null!;

    public int ProductId { get; set; }

    public Product Product { get; set; } = null!;

    public string ProductName { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }
}