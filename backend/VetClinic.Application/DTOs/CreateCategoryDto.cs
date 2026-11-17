using System.ComponentModel.DataAnnotations;

namespace VetClinic.Application.DTOs;

public class CreateCategoryDto
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    public string Image { get; set; } = string.Empty;

    [StringLength(4000)]
    public string Description { get; set; } = string.Empty;

    [Range(0, int.MaxValue)]
    public int SortOrder { get; set; }
}
