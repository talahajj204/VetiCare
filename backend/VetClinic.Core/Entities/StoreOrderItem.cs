namespace VetClinic.Core.Entities;

public class StoreOrderItem
{
    public int Id { get; set; }

    public int ClinicId { get; set; }

    public int StoreOrderId { get; set; }

    public StoreOrder StoreOrder { get; set; } = null!;

    public int ProductId { get; set; }

    public Product Product { get; set; } = null!;

    public string ProductName { get; set; } = string.Empty;

    public string CategoryName { get; set; } = string.Empty;

    public string Image { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal Total { get; set; }
}