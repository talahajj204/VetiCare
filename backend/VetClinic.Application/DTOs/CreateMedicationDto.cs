using System.ComponentModel.DataAnnotations;

namespace VetClinic.Application.DTOs;

public class CreateMedicationDto
{
    [Range(1, int.MaxValue)]
    public int PetId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Medication { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Dosage { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Frequency { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Route { get; set; } = "Oral";

    [Required]
    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    [MaxLength(4000)]
    public string Instructions { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Status { get; set; } = "Active";
}