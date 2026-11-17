namespace VetClinic.Core.Entities;

public class MedicalRecord
{
    public int Id { get; set; }

    public int ClinicId { get; set; }

    public Clinic Clinic { get; set; } = null!;

    public int PetId { get; set; }

    public Pet Pet { get; set; } = null!;

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

    public string Status { get; set; } = "In Progress";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}