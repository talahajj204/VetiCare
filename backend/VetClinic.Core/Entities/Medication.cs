namespace VetClinic.Core.Entities;

public class Medication
{
    public int Id { get; set; }

    public int ClinicId { get; set; }

    public Clinic Clinic { get; set; } = null!;

    public int PetId { get; set; }

    public Pet Pet { get; set; } = null!;

    public string Name { get; set; } = string.Empty;

    public string Dosage { get; set; } = string.Empty;

    public string Frequency { get; set; } = string.Empty;

    public string Route { get; set; } = "Oral";

    public DateOnly StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public string Instructions { get; set; } = string.Empty;

    public string Status { get; set; } = "Active";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}