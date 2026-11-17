using System.ComponentModel.DataAnnotations;

namespace VetClinic.Application.DTOs;

public class CreateAppointmentDto
{
    [Range(1, int.MaxValue)]
    public int PetId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Type { get; set; } = "Consultation";

    [Required]
    public DateOnly? Date { get; set; }

    [Required]
    public TimeOnly? Time { get; set; }

    [Required]
    [MaxLength(200)]
    public string Veterinarian { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Reason { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Status { get; set; } = "Pending";
}