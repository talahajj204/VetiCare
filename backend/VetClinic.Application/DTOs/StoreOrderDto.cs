namespace VetClinic.Application.DTOs;

public class StoreOrderDto
{
    public int Id { get; set; }

    public Guid RequestId { get; set; }

    public StoreOrderCustomerDto Customer { get; set; } = new();

    public string DeliveryMethod { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public string AddressDetails { get; set; } = string.Empty;

    public string Notes { get; set; } = string.Empty;

    public string PaymentMethod { get; set; } = string.Empty;

    public string PaymentStatus { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string DeliveryStatus { get; set; } = string.Empty;

    public decimal Subtotal { get; set; }

    public decimal DeliveryFee { get; set; }

    public decimal Total { get; set; }

    public DateTime Date { get; set; }

    public DateTime? StatusUpdatedAt { get; set; }

    public DateTime? DeliveredAt { get; set; }

    public List<StoreOrderItemDto> Items { get; set; } = new();
}

public class StoreOrderCustomerDto
{
    public string FullName { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;
}

public class StoreOrderItemDto
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string Image { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public decimal Price { get; set; }

    public decimal Total { get; set; }
}