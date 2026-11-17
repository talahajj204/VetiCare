namespace VetClinic.Application.DTOs;

public class AppointmentDto
{
    public int Id { get; set; }

    public int PetId { get; set; }

    public string Pet { get; set; } = string.Empty;

    public int OwnerId { get; set; }

    public string Owner { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty;

    public DateOnly Date { get; set; }

    public TimeOnly? Time { get; set; }

    public string Veterinarian { get; set; } = string.Empty;

    public string Reason { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}