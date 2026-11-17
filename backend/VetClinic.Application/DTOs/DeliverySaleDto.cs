namespace VetClinic.Application.DTOs;

public class DeliverySaleDto
{
    public int Id { get; set; }

    public string CustomerName { get; set; } = string.Empty;

    public decimal Total { get; set; }

    public string DeliveryStatus { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? DeliveredAt { get; set; }
}