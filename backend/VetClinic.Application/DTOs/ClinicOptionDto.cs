namespace VetClinic.Application.DTOs;

public class ClinicOptionDto
{
    public int Id { get; set; }

    public string ListKey { get; set; } = string.Empty;

    public string Value { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public bool IsActive { get; set; }
}