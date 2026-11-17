using System.ComponentModel.DataAnnotations;

namespace VetClinic.Application.DTOs;

public class UpdateStoreOrderStatusDto
{
    [Required]
    [StringLength(100)]
    public string Status { get; set; } = string.Empty;
}