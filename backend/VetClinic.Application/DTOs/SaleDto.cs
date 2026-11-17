namespace VetClinic.Application.DTOs;

public class SaleDto
{
    public int Id { get; set; }

    public Guid RequestId { get; set; }

    public int? OwnerId { get; set; }

    public string CustomerName { get; set; } = string.Empty;

    public string PaymentMethod { get; set; } = string.Empty;

    public bool HasDelivery { get; set; }

    public decimal Subtotal { get; set; }

    public decimal Discount { get; set; }

    public decimal Total { get; set; }

    public decimal ReceivedUsd { get; set; }

    public decimal ReceivedLbp { get; set; }

    public decimal ExchangeRate { get; set; }

    public decimal TotalPaid { get; set; }

    public decimal Change { get; set; }

    public DateTime CreatedAt { get; set; }

    public List<SaleItemDto> Items { get; set; } = new();
    public string DeliveryStatus { get; set; } = string.Empty;

public DateTime? DeliveredAt { get; set; }
}