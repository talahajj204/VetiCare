namespace VetClinic.Core.Entities;

public class Vaccination
{
    public int Id { get; set; }

    public int ClinicId { get; set; }

    public Clinic Clinic { get; set; } = null!;

    public int PetId { get; set; }

    public Pet Pet { get; set; } = null!;

    public string Vaccine { get; set; } = string.Empty;

    public DateOnly DateGiven { get; set; }

    public DateOnly NextDueDate { get; set; }

    public string Status { get; set; } = "Completed";

    public string Notes { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}