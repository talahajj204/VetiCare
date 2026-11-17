using System.ComponentModel.DataAnnotations;

namespace VetClinic.Application.DTOs;

public class UpdateOwnerDto : CreateOwnerDto
{
    [Required]
    [StringLength(100)]
    public string Status { get; set; } = "active";
}