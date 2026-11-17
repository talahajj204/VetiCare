using System.ComponentModel.DataAnnotations;

namespace VetClinic.Application.DTOs;

public class CreateOwnerDto
{
    [Required]
    [StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(254)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Phone { get; set; } = string.Empty;

    [StringLength(500)]
    public string Address { get; set; } = string.Empty;

    [StringLength(100)]
    public string EmergencyContact { get; set; } = string.Empty;

    [StringLength(4000)]
    public string Notes { get; set; } = string.Empty;
}