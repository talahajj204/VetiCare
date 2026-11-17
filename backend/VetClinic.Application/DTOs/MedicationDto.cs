namespace VetClinic.Application.DTOs;

public class MedicationDto
{
    public int Id { get; set; }

    public int PetId { get; set; }

    public string Pet { get; set; } = string.Empty;

    public int OwnerId { get; set; }

    public string Owner { get; set; } = string.Empty;

    public string Medication { get; set; } = string.Empty;

    public string Dosage { get; set; } = string.Empty;

    public string Frequency { get; set; } = string.Empty;

    public string Route { get; set; } = string.Empty;

    public DateOnly StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public string Instructions { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}