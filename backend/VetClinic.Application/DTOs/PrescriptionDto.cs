namespace VetClinic.Application.DTOs;

public class PrescriptionDto
{
    public int Id { get; set; }

    public int PetId { get; set; }

    public string Pet { get; set; } = string.Empty;

    public int OwnerId { get; set; }

    public string Owner { get; set; } = string.Empty;

    public string Clinic { get; set; } = string.Empty;

    public DateOnly Date { get; set; }

    public string Veterinarian { get; set; } = string.Empty;

    public string Medication { get; set; } = string.Empty;

    public string Dosage { get; set; } = string.Empty;

    public string Instructions { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}