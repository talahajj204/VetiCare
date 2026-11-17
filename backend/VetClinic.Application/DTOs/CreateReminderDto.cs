using System.ComponentModel.DataAnnotations;

namespace VetClinic.Application.DTOs;

public class CreateReminderDto
{
    [Range(1, int.MaxValue)]
    public int PetId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Type { get; set; } = string.Empty;

    [Required]
    public DateOnly? DueDate { get; set; }

    [Required]
    [MaxLength(4000)]
    public string Message { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Status { get; set; } = "Active";
}