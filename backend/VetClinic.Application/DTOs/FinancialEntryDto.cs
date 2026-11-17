using System.ComponentModel.DataAnnotations;

namespace VetClinic.Application.DTOs;

public class FinancialEntryDto
{
    public int Id { get; set; }

    public Guid RequestId { get; set; }

    public string Kind { get; set; } = string.Empty;

    public DateOnly Date { get; set; }

    public string Type { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public DateTime CreatedAt { get; set; }
}

public class CreateFinancialEntryDto : IValidatableObject
{
    public Guid RequestId { get; set; }

    [Required]
    [RegularExpression(
        "^(Revenue|Expense)$",
        ErrorMessage = "Choose Revenue or Expense.")]
    public string Kind { get; set; } = string.Empty;

    public DateOnly Date { get; set; }

    [Required]
    [StringLength(100)]
    public string Type { get; set; } = string.Empty;

    [Required]
    [StringLength(4000)]
    public string Description { get; set; } = string.Empty;

    [Range(typeof(decimal), "0", "9999999999999999.99")]
    public decimal Amount { get; set; }

    public IEnumerable<ValidationResult> Validate(
        ValidationContext validationContext)
    {
        if (RequestId == Guid.Empty)
        {
            yield return new ValidationResult(
                "A valid request ID is required.",
                [nameof(RequestId)]);
        }

        if (Date == default)
        {
            yield return new ValidationResult(
                "Choose a date.",
                [nameof(Date)]);
        }

        if (string.IsNullOrWhiteSpace(Type))
        {
            yield return new ValidationResult(
                "Choose a type.",
                [nameof(Type)]);
        }

        if (string.IsNullOrWhiteSpace(Description))
        {
            yield return new ValidationResult(
                "Enter a description.",
                [nameof(Description)]);
        }

        if (decimal.Round(Amount, 2) != Amount)
        {
            yield return new ValidationResult(
                "Amount must have at most two decimal places.",
                [nameof(Amount)]);
        }
    }
}