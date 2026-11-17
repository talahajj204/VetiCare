namespace VetClinic.Core.Entities;

public class StoreSettings
{
    public int Id { get; set; }

    public int ClinicId { get; set; }

    public Clinic Clinic { get; set; } = null!;

    public string StoreName { get; set; } = string.Empty;

    public string StoreDescription { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public List<string> PhoneNumbers { get; set; } = [];

    public string Address { get; set; } = string.Empty;

    public string StoreBanner { get; set; } = string.Empty;

    public string HomeBanner { get; set; } = string.Empty;

    public string HomeBannerBadge { get; set; } = string.Empty;

    public string HomeBannerTitle { get; set; } = string.Empty;

    public string HomeBannerDescription { get; set; } = string.Empty;

    public string HomeBannerButtonText { get; set; } = string.Empty;

    public string AboutTitle { get; set; } = string.Empty;

    public string AboutDescription { get; set; } = string.Empty;

    public string AboutImage { get; set; } = string.Empty;

    public string Timeline1Title { get; set; } = string.Empty;

    public string Timeline1Description { get; set; } = string.Empty;

    public string Timeline2Title { get; set; } = string.Empty;

    public string Timeline2Description { get; set; } = string.Empty;

    public string Timeline3Title { get; set; } = string.Empty;

    public string Timeline3Description { get; set; } = string.Empty;

    public string ContactEmail { get; set; } = string.Empty;

    public string ContactAddress { get; set; } = string.Empty;

    public string ContactDescription { get; set; } = string.Empty;

    public string Instagram { get; set; } = string.Empty;

    public string Facebook { get; set; } = string.Empty;

    public string SocialWhatsapp { get; set; } = string.Empty;

    public string Tiktok { get; set; } = string.Empty;

    public string PrimaryColor { get; set; } = "#1aa6a6";

    public string SecondaryColor { get; set; } = "#11797b";

    public string LightColor { get; set; } = "#e8f7f7";

    public string BorderColor { get; set; } = "#dcebea";

    public string BackgroundColor { get; set; } = "#ffffff";

    public string TextColor { get; set; } = "#344054";

    public string ButtonColor { get; set; } = "#1aa6a6";

    public string ButtonTextColor { get; set; } = "#ffffff";

    public string FooterColor { get; set; } = "#11797b";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}