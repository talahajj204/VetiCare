using System.ComponentModel.DataAnnotations;

namespace VetClinic.Application.DTOs;

public class CreatePetDto
{
    [Range(1, int.MaxValue)]
    public int OwnerId { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Species { get; set; } = string.Empty;

    [Required]
    [StringLength(150)]
    public string Breed { get; set; } = string.Empty;

    [StringLength(30)]
    public string Sex { get; set; } = string.Empty;

    public DateOnly? DateOfBirth { get; set; }

    public bool EstimatedDOB { get; set; }

    [StringLength(100)]
    public string Age { get; set; } = string.Empty;

    [StringLength(100)]
    public string Color { get; set; } = string.Empty;

    [Required]
    [RegularExpression(
        "^#[0-9a-fA-F]{6}$",
        ErrorMessage = "Color must be a valid hexadecimal color.")]
    public string ColorHex { get; set; } = "#55b7b2";

    [Range(typeof(decimal), "0", "99999999.99")]
    public decimal? Weight { get; set; }

    [StringLength(100)]
    public string MicrochipNumber { get; set; } = string.Empty;

    [StringLength(100)]
    public string BloodType { get; set; } = string.Empty;

    [StringLength(4000)]
    public string Allergies { get; set; } = string.Empty;

    [StringLength(4000)]
    public string ChronicConditions { get; set; } = string.Empty;

    [StringLength(4000)]
    public string Notes { get; set; } = string.Empty;

    public string ProfilePhoto { get; set; } = string.Empty;
}