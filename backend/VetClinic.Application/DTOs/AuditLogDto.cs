namespace VetClinic.Application.DTOs;

public class AuditLogDto
{
    public long Id { get; set; }

    public string User { get; set; } = string.Empty;

    public string Action { get; set; } = string.Empty;

    public string Record { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}