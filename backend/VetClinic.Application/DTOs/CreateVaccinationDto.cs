using System.ComponentModel.DataAnnotations;

namespace VetClinic.Application.DTOs;

public class CreateVaccinationDto
{
    [Range(1, int.MaxValue)]
    public int PetId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Vaccine { get; set; } = string.Empty;

    [Required]
    public DateOnly? DateGiven { get; set; }

    [Required]
    public DateOnly? NextDueDate { get; set; }

    [Required]
    [MaxLength(100)]
    public string Status { get; set; } = "Completed";

    [MaxLength(4000)]
    public string Notes { get; set; } = string.Empty;
}