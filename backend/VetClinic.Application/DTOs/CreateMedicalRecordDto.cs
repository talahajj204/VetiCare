using System.ComponentModel.DataAnnotations;

namespace VetClinic.Application.DTOs;

public class CreateMedicalRecordDto
{
    [Range(1, int.MaxValue)]
    public int PetId { get; set; }

    [Required]
    public DateOnly? Date { get; set; }

    [Required]
    [StringLength(200)]
    public string Veterinarian { get; set; } = string.Empty;

    [Required]
    [StringLength(500)]
    public string ReasonForVisit { get; set; } = string.Empty;

    [StringLength(4000)]
    public string Symptoms { get; set; } = string.Empty;

    [StringLength(4000)]
    public string Procedures { get; set; } = string.Empty;

    [Range(typeof(decimal), "0", "99999999.99")]
    public decimal? Weight { get; set; }

    public DateOnly? FollowUpDate { get; set; }

    [Required]
    [StringLength(4000)]
    public string Diagnosis { get; set; } = string.Empty;

    [Required]
    [StringLength(4000)]
    public string Treatment { get; set; } = string.Empty;

    [StringLength(4000)]
    public string Notes { get; set; } = string.Empty;

    [StringLength(255)]
    public string FileName { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Status { get; set; } = "In Progress";
}