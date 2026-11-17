using System.ComponentModel.DataAnnotations;

namespace VetClinic.Application.DTOs;

public class CreatePrescriptionDto
{
    [Range(1, int.MaxValue, ErrorMessage = "Please select a pet.")]
    public int PetId { get; set; }

    [Required(ErrorMessage = "Please select a date.")]
    public DateOnly? Date { get; set; }

    [Required]
    [MaxLength(200)]
    public string Veterinarian { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Medication { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Dosage { get; set; } = string.Empty;

    [MaxLength(4000)]
    public string Instructions { get; set; } = string.Empty;
}