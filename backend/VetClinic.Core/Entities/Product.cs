namespace VetClinic.Core.Entities;

public class Product
{
    public int Id { get; set; }

    public int ClinicId { get; set; }

    public Clinic Clinic { get; set; } = null!;

    public int CategoryId { get; set; }

    public Category Category { get; set; } = null!;

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public int MinimumStock { get; set; }

    public decimal PurchasePrice { get; set; }

    public decimal SellingPrice { get; set; }

    public DateOnly? ExpiryDate { get; set; }

    public string Image { get; set; } = string.Empty;

    public bool ShowOnStore { get; set; }

    public bool ShowOnPOS { get; set; }

    public bool Featured { get; set; }

    public bool IsArchived { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}