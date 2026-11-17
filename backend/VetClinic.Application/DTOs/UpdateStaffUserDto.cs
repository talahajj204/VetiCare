using System.ComponentModel.DataAnnotations;

namespace VetClinic.Application.DTOs;

public class UpdateStaffUserDto
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(254)]
    public string Email { get; set; } = string.Empty;

    [StringLength(50)]
    public string Phone { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Role { get; set; } = string.Empty;

    [Required]
    public List<string> Permissions { get; set; } = new();
}