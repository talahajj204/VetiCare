using System.ComponentModel.DataAnnotations;

namespace VetClinic.Application.DTOs;

public class StoreSettingsDto
{
    [StringLength(200)]
    public string StoreName { get; set; } = string.Empty;

    [StringLength(4000)]
    public string StoreDescription { get; set; } = string.Empty;

    [StringLength(254)]
    [OptionalEmailAddress]
    public string Email { get; set; } = string.Empty;

    [StringLength(50)]
    public string Phone { get; set; } = string.Empty;

    [Required]
    [MaxLength(10)]
    public List<string> PhoneNumbers { get; set; } = [];

    [StringLength(1000)]
    public string Address { get; set; } = string.Empty;

    [StringLength(4_000_000)]
    public string StoreBanner { get; set; } = string.Empty;

    [StringLength(4_000_000)]
    public string HomeBanner { get; set; } = string.Empty;

    [StringLength(200)]
    public string HomeBannerBadge { get; set; } = string.Empty;

    [StringLength(300)]
    public string HomeBannerTitle { get; set; } = string.Empty;

    [StringLength(4000)]
    public string HomeBannerDescription { get; set; } = string.Empty;

    [StringLength(100)]
    public string HomeBannerButtonText { get; set; } = string.Empty;

    [StringLength(300)]
    public string AboutTitle { get; set; } = string.Empty;

    [StringLength(10000)]
    public string AboutDescription { get; set; } = string.Empty;

    [StringLength(4_000_000)]
    public string AboutImage { get; set; } = string.Empty;

    [StringLength(300)]
    public string Timeline1Title { get; set; } = string.Empty;

    [StringLength(4000)]
    public string Timeline1Description { get; set; } = string.Empty;

    [StringLength(300)]
    public string Timeline2Title { get; set; } = string.Empty;

    [StringLength(4000)]
    public string Timeline2Description { get; set; } = string.Empty;

    [StringLength(300)]
    public string Timeline3Title { get; set; } = string.Empty;

    [StringLength(4000)]
    public string Timeline3Description { get; set; } = string.Empty;

    [StringLength(254)]
    [OptionalEmailAddress]
    public string ContactEmail { get; set; } = string.Empty;

    [StringLength(1000)]
    public string ContactAddress { get; set; } = string.Empty;

    [StringLength(4000)]
    public string ContactDescription { get; set; } = string.Empty;

    [StringLength(2048)]
    public string Instagram { get; set; } = string.Empty;

    [StringLength(2048)]
    public string Facebook { get; set; } = string.Empty;

    [StringLength(2048)]
    public string SocialWhatsapp { get; set; } = string.Empty;

    [StringLength(2048)]
    public string Tiktok { get; set; } = string.Empty;

    [Required]
    public StoreColorsDto StoreColors { get; set; } = new();
}

public class UpdateStoreSettingsDto : StoreSettingsDto,
    IValidatableObject
{
    public IEnumerable<ValidationResult> Validate(
        ValidationContext validationContext)
    {
        if (PhoneNumbers is null)
        {
            yield return new ValidationResult(
                "Phone numbers are required.",
                [nameof(PhoneNumbers)]);
        }
        else
        {
            foreach (var phone in PhoneNumbers)
            {
                if (phone is null || phone.Length > 50)
                {
                    yield return new ValidationResult(
                        "Each phone number must be a string of 50 characters or fewer.",
                        [nameof(PhoneNumbers)]);

                    break;
                }
            }
        }

        if (StoreColors is null)
        {
            yield return new ValidationResult(
                "Store colors are required.",
                [nameof(StoreColors)]);
        }
        else
        {
            var results = new List<ValidationResult>();

            Validator.TryValidateObject(
                StoreColors,
                new ValidationContext(StoreColors),
                results,
                validateAllProperties: true);

            foreach (var result in results)
            {
                yield return new ValidationResult(
                    result.ErrorMessage,
                    result.MemberNames.Select(
                        member => $"{nameof(StoreColors)}.{member}"));
            }
        }
    }
}

public class StoreColorsDto
{
    [Required]
    [RegularExpression("^#[0-9a-fA-F]{6}$")]
    public string PrimaryColor { get; set; } = "#1aa6a6";

    [Required]
    [RegularExpression("^#[0-9a-fA-F]{6}$")]
    public string SecondaryColor { get; set; } = "#11797b";

    [Required]
    [RegularExpression("^#[0-9a-fA-F]{6}$")]
    public string LightColor { get; set; } = "#e8f7f7";

    [Required]
    [RegularExpression("^#[0-9a-fA-F]{6}$")]
    public string BorderColor { get; set; } = "#dcebea";

    [Required]
    [RegularExpression("^#[0-9a-fA-F]{6}$")]
    public string BackgroundColor { get; set; } = "#ffffff";

    [Required]
    [RegularExpression("^#[0-9a-fA-F]{6}$")]
    public string TextColor { get; set; } = "#344054";

    [Required]
    [RegularExpression("^#[0-9a-fA-F]{6}$")]
    public string ButtonColor { get; set; } = "#1aa6a6";

    [Required]
    [RegularExpression("^#[0-9a-fA-F]{6}$")]
    public string ButtonTextColor { get; set; } = "#ffffff";

    [Required]
    [RegularExpression("^#[0-9a-fA-F]{6}$")]
    public string FooterColor { get; set; } = "#11797b";
}

[AttributeUsage(AttributeTargets.Property)]
public sealed class OptionalEmailAddressAttribute : ValidationAttribute
{
    public OptionalEmailAddressAttribute()
    {
        ErrorMessage = "Please enter a valid email address.";
    }

    public override bool IsValid(object? value)
    {
        if (value is null)
        {
            return true;
        }

        if (value is not string email)
        {
            return false;
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            return true;
        }

        return new EmailAddressAttribute().IsValid(email.Trim());
    }
}