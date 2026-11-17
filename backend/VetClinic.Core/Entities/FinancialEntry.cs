namespace VetClinic.Core.Entities;

public class FinancialEntry
{
    public int Id { get; set; }

    public int ClinicId { get; set; }

    public Clinic Clinic { get; set; } = null!;

    public Guid RequestId { get; set; }

    // Revenue or Expense.
    public string Kind { get; set; } = string.Empty;

    public DateOnly Date { get; set; }

    public string Type { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}