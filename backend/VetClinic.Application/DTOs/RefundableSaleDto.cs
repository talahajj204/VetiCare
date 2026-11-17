namespace VetClinic.Application.DTOs;

public class RefundableSaleDto
{
    public int Id { get; set; }

    public string CustomerName { get; set; } = string.Empty;

    public decimal Total { get; set; }

    public decimal RefundedTotal { get; set; }

    public DateTime CreatedAt { get; set; }

    public List<RefundableSaleItemDto> Items { get; set; }
        = new();
}

public class RefundableSaleItemDto
{
    public int SaleItemId { get; set; }

    public string ProductName { get; set; } = string.Empty;

    public int SoldQuantity { get; set; }

    public int RefundedQuantity { get; set; }

    public int RemainingQuantity { get; set; }

    public decimal UnitPrice { get; set; }
}