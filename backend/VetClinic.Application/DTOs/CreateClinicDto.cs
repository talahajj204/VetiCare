using System.ComponentModel.DataAnnotations;

namespace VetClinic.Application.DTOs;

public class CreateClinicDto
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [StringLength(2048)]
    public string? LogoUrl { get; set; }

    [EmailAddress]
    [StringLength(254)]
    public string? Email { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }
}