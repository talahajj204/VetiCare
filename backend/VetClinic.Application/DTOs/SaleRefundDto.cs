namespace VetClinic.Application.DTOs;

public class SaleRefundDto
{
    public int Id { get; set; }

    public Guid RequestId { get; set; }

    public int SaleId { get; set; }

    public string Reason { get; set; } = string.Empty;

    public decimal Total { get; set; }

    public DateTime CreatedAt { get; set; }

    public List<SaleRefundItemDto> Items { get; set; } = new();
}

public class SaleRefundItemDto
{
    public int SaleItemId { get; set; }

    public string ProductName { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public decimal Amount { get; set; }
}