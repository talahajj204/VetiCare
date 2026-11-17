namespace VetClinic.Application.DTOs;

public class HeldSaleDto
{
    public int Id { get; set; }

    public Guid RequestId { get; set; }

    public int? OwnerId { get; set; }

    public string CustomerName { get; set; } = string.Empty;

    public bool HasDelivery { get; set; }

    public decimal Discount { get; set; }

    public DateTime CreatedAt { get; set; }

    public int? CompletedSaleId { get; set; }

    public List<HeldSaleItemDto> Items { get; set; } = new();
}

public class HeldSaleItemDto
{
    public int ProductId { get; set; }

    public string ProductName { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }
}