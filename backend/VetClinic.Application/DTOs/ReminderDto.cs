namespace VetClinic.Application.DTOs;

public class ReminderDto
{
    public int Id { get; set; }

    public int PetId { get; set; }

    public string Pet { get; set; } = string.Empty;

    public int OwnerId { get; set; }

    public string Owner { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty;

    public DateOnly DueDate { get; set; }

    public string Message { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}