namespace VetClinic.Application.DTOs;

public class VaccinationDto
{
    public int Id { get; set; }

    public int PetId { get; set; }

    public string Pet { get; set; } = string.Empty;

    public int OwnerId { get; set; }

    public string Owner { get; set; } = string.Empty;

    public string Vaccine { get; set; } = string.Empty;

    public DateOnly DateGiven { get; set; }

    public DateOnly NextDueDate { get; set; }

    public string Status { get; set; } = string.Empty;

    public string Notes { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}