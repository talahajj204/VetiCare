namespace VetClinic.Core.Entities;

public class Pet
{
    public bool IsArchived { get; set; }

    public int Id { get; set; }

    public int ClinicId { get; set; }

    public Clinic Clinic { get; set; } = null!;

    public int OwnerId { get; set; }

    public Owner Owner { get; set; } = null!;

    public string Name { get; set; } = string.Empty;

    public string Species { get; set; } = string.Empty;

    public string Breed { get; set; } = string.Empty;

    public string Sex { get; set; } = string.Empty;

    public DateOnly? DateOfBirth { get; set; }

    public bool EstimatedDOB { get; set; }

    public string Age { get; set; } = string.Empty;

    public string Color { get; set; } = string.Empty;

    public string ColorHex { get; set; } = "#55b7b2";

    public decimal? Weight { get; set; }

    public string MicrochipNumber { get; set; } = string.Empty;

    public string BloodType { get; set; } = string.Empty;

    public string Allergies { get; set; } = string.Empty;

    public string ChronicConditions { get; set; } = string.Empty;

    public string Notes { get; set; } = string.Empty;

    public string ProfilePhoto { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}