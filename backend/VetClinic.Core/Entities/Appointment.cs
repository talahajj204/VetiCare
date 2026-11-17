namespace VetClinic.Core.Entities;

public class Appointment
{
    public int Id { get; set; }

    public int ClinicId { get; set; }

    public Clinic Clinic { get; set; } = null!;

    public int PetId { get; set; }

    public Pet Pet { get; set; } = null!;

    public string Type { get; set; } = "Consultation";

    public DateOnly Date { get; set; }

    public TimeOnly Time { get; set; }

    public string Veterinarian { get; set; } = string.Empty;

    public string Reason { get; set; } = string.Empty;

    public string Status { get; set; } = "Pending";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}