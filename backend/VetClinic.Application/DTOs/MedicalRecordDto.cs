namespace VetClinic.Application.DTOs;

public class MedicalRecordDto
{
    public int Id { get; set; }

    public int ClinicId { get; set; }

    public int PetId { get; set; }

    public string Pet { get; set; } = string.Empty;

    public int OwnerId { get; set; }

    public string Owner { get; set; } = string.Empty;

    public DateOnly Date { get; set; }

    public string Veterinarian { get; set; } = string.Empty;

    public string ReasonForVisit { get; set; } = string.Empty;

    public string Symptoms { get; set; } = string.Empty;

    public string Procedures { get; set; } = string.Empty;

    public decimal? Weight { get; set; }

    public DateOnly? FollowUpDate { get; set; }

    public string Diagnosis { get; set; } = string.Empty;

    public string Treatment { get; set; } = string.Empty;

    public string Notes { get; set; } = string.Empty;

    public string FileName { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}