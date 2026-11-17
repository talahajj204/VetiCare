namespace VetClinic.Core.Entities;

public class Reminder
{
    public int Id { get; set; }

    public int ClinicId { get; set; }

    public Clinic Clinic { get; set; } = null!;

    public int PetId { get; set; }

    public Pet Pet { get; set; } = null!;

    public string Type { get; set; } = string.Empty;

    public DateOnly DueDate { get; set; }

    public string Message { get; set; } = string.Empty;

    public string Status { get; set; } = "Active";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}