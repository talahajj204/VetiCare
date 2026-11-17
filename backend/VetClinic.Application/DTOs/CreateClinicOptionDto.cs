using System.ComponentModel.DataAnnotations;

namespace VetClinic.Application.DTOs;

public class CreateClinicOptionDto
{
    [Required]
    [StringLength(100)]
    public string ListKey { get; set; } = string.Empty;

    [Required]
    [StringLength(200)]
    public string Value { get; set; } = string.Empty;

    [Range(0, int.MaxValue)]
    public int SortOrder { get; set; }

    public bool IsActive { get; set; } = true;
}