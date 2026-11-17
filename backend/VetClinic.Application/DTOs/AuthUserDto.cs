namespace VetClinic.Application.DTOs;

public class AuthUserDto
{
    public string Id { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public int? ClinicId { get; set; }

    public List<string> Roles { get; set; } = [];
    
    public List<string> Permissions { get; set; } = new();
}