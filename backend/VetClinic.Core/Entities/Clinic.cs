namespace VetClinic.Core.Entities;

public class Clinic
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? LogoUrl { get; set; }

    public string? Email { get; set; }

    public string? Address { get; set; }

    public string Phone { get; set; } = string.Empty;

    public string Plan { get; set; } = "Basic";

    public string Subscription { get; set; } = "Pending";

    public string AccountStatus { get; set; } = "Active";

    public string Instagram { get; set; } = string.Empty;

    public string Facebook { get; set; } = string.Empty;

    public string Website { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}