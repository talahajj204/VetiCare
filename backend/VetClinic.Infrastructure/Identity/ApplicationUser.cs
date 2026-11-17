using Microsoft.AspNetCore.Identity;
using VetClinic.Core.Entities;

namespace VetClinic.Infrastructure.Identity;

public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public int? ClinicId { get; set; }

    public Clinic? Clinic { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}