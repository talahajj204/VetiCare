using System.ComponentModel.DataAnnotations;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;

namespace VetClinic.Application.Services;

public class StoreSettingsService : IStoreSettingsService
{
    private readonly IStoreSettingsRepository _repository;

    public StoreSettingsService(
        IStoreSettingsRepository repository)
    {
        _repository = repository;
    }

    public async Task<StoreSettingsDto> GetAsync(
        int clinicId)
    {
        ValidateClinicId(clinicId);

        var settings = await _repository.GetAsync(clinicId);

        return settings is null
            ? new StoreSettingsDto()
            : ToDto(settings);
    }

    public async Task<StoreSettingsDto> UpdateAsync(
        int clinicId,
        UpdateStoreSettingsDto dto)
    {
        ValidateClinicId(clinicId);
        ArgumentNullException.ThrowIfNull(dto);

        Validator.ValidateObject(
            dto,
            new ValidationContext(dto),
            validateAllProperties: true);

        if (dto.StoreColors is null)
        {
            throw new ValidationException(
                "Store colors are required.");
        }

        Validator.ValidateObject(
            dto.StoreColors,
            new ValidationContext(dto.StoreColors),
            validateAllProperties: true);

        ValidateImage(dto.StoreBanner, "Store logo");
        ValidateImage(dto.HomeBanner, "Home banner");
        ValidateImage(dto.AboutImage, "About image");

        ValidateLink(dto.Instagram, "Instagram");
        ValidateLink(dto.Facebook, "Facebook");
        ValidateLink(dto.SocialWhatsapp, "WhatsApp");
        ValidateLink(dto.Tiktok, "TikTok");

        var settings = await _repository.GetAsync(clinicId);

        var isNew = settings is null;

        settings ??= new StoreSettings
        {
            ClinicId = clinicId,
            CreatedAt = DateTime.UtcNow
        };

        settings.StoreName = Clean(dto.StoreName);
        settings.StoreDescription = Clean(dto.StoreDescription);
        settings.Email = Clean(dto.Email);
        settings.Address = Clean(dto.Address);

        settings.PhoneNumbers = (dto.PhoneNumbers ?? [])
            .Select(Clean)
            .Where(phone => phone.Length > 0)
            .Distinct(StringComparer.Ordinal)
            .ToList();

        if (settings.PhoneNumbers.Count > 10 ||
            settings.PhoneNumbers.Any(
                phone => phone.Length > 50))
        {
            throw new ValidationException(
                "Enter up to 10 phone numbers, each with 50 characters or fewer.");
        }

        settings.Phone = settings.PhoneNumbers.FirstOrDefault()
            ?? Clean(dto.Phone);

        settings.StoreBanner = Clean(dto.StoreBanner);
        settings.HomeBanner = Clean(dto.HomeBanner);
        settings.HomeBannerBadge = Clean(dto.HomeBannerBadge);
        settings.HomeBannerTitle = Clean(dto.HomeBannerTitle);
        settings.HomeBannerDescription =
            Clean(dto.HomeBannerDescription);
        settings.HomeBannerButtonText =
            Clean(dto.HomeBannerButtonText);

        settings.AboutTitle = Clean(dto.AboutTitle);
        settings.AboutDescription = Clean(dto.AboutDescription);
        settings.AboutImage = Clean(dto.AboutImage);

        settings.Timeline1Title = Clean(dto.Timeline1Title);
        settings.Timeline1Description =
            Clean(dto.Timeline1Description);

        settings.Timeline2Title = Clean(dto.Timeline2Title);
        settings.Timeline2Description =
            Clean(dto.Timeline2Description);

        settings.Timeline3Title = Clean(dto.Timeline3Title);
        settings.Timeline3Description =
            Clean(dto.Timeline3Description);

        settings.ContactEmail = Clean(dto.ContactEmail);
        settings.ContactAddress = Clean(dto.ContactAddress);
        settings.ContactDescription =
            Clean(dto.ContactDescription);

        settings.Instagram = Clean(dto.Instagram);
        settings.Facebook = Clean(dto.Facebook);
        settings.SocialWhatsapp = Clean(dto.SocialWhatsapp);
        settings.Tiktok = Clean(dto.Tiktok);

        settings.PrimaryColor = dto.StoreColors.PrimaryColor;
        settings.SecondaryColor = dto.StoreColors.SecondaryColor;
        settings.LightColor = dto.StoreColors.LightColor;
        settings.BorderColor = dto.StoreColors.BorderColor;
        settings.BackgroundColor =
            dto.StoreColors.BackgroundColor;
        settings.TextColor = dto.StoreColors.TextColor;
        settings.ButtonColor = dto.StoreColors.ButtonColor;
        settings.ButtonTextColor =
            dto.StoreColors.ButtonTextColor;
        settings.FooterColor = dto.StoreColors.FooterColor;

        settings.UpdatedAt = DateTime.UtcNow;

        if (isNew)
        {
            await _repository.AddAsync(settings);
        }

        await _repository.SaveChangesAsync();

        return ToDto(settings);
    }

    private static string Clean(string? value)
    {
        return value?.Trim() ?? string.Empty;
    }

    private static void ValidateClinicId(int clinicId)
    {
        if (clinicId <= 0)
        {
            throw new ValidationException(
                "A valid clinic is required.");
        }
    }

    private static void ValidateLink(
        string? value,
        string label)
    {
        var link = Clean(value);

        if (link.Length == 0)
        {
            return;
        }

        if (!Uri.TryCreate(
                link,
                UriKind.Absolute,
                out var uri) ||
            (uri.Scheme != Uri.UriSchemeHttps &&
             uri.Scheme != Uri.UriSchemeHttp))
        {
            throw new ValidationException(
                $"{label} must be a valid HTTP or HTTPS URL.");
        }
    }

    private static void ValidateImage(
        string? value,
        string label)
    {
        var image = Clean(value);

        if (image.Length == 0)
        {
            return;
        }

        if (image.Length > 4_000_000)
        {
            throw new ValidationException(
                $"{label} is too large. Please choose a smaller image.");
        }

        var prefixes = new[]
        {
            "data:image/png;base64,",
            "data:image/jpeg;base64,",
            "data:image/jpg;base64,",
            "data:image/webp;base64,",
            "data:image/gif;base64,",
            "data:image/avif;base64,"
        };

        foreach (var prefix in prefixes)
        {
            if (!image.StartsWith(
                    prefix,
                    StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            try
            {
                var bytes = Convert.FromBase64String(
                    image[prefix.Length..]);

                if (bytes.Length == 0)
                {
                    throw new FormatException();
                }

                return;
            }
            catch (FormatException)
            {
                throw new ValidationException(
                    $"{label} contains invalid image data.");
            }
        }

        if (Uri.TryCreate(
                image,
                UriKind.Absolute,
                out var uri) &&
            (uri.Scheme == Uri.UriSchemeHttps ||
             uri.Scheme == Uri.UriSchemeHttp))
        {
            return;
        }

        if (image.StartsWith("/", StringComparison.Ordinal) &&
            !image.StartsWith("//", StringComparison.Ordinal) &&
            !image.Contains('\\'))
        {
            return;
        }

        throw new ValidationException(
            $"{label} must be a PNG, JPEG, WebP, GIF or AVIF image, or a valid image URL.");
    }

    private static StoreSettingsDto ToDto(
        StoreSettings settings)
    {
        return new StoreSettingsDto
        {
            StoreName = settings.StoreName,
            StoreDescription = settings.StoreDescription,
            Email = settings.Email,
            Phone = settings.Phone,
            PhoneNumbers = settings.PhoneNumbers.ToList(),
            Address = settings.Address,

            StoreBanner = settings.StoreBanner,
            HomeBanner = settings.HomeBanner,
            HomeBannerBadge = settings.HomeBannerBadge,
            HomeBannerTitle = settings.HomeBannerTitle,
            HomeBannerDescription =
                settings.HomeBannerDescription,
            HomeBannerButtonText =
                settings.HomeBannerButtonText,

            AboutTitle = settings.AboutTitle,
            AboutDescription = settings.AboutDescription,
            AboutImage = settings.AboutImage,

            Timeline1Title = settings.Timeline1Title,
            Timeline1Description =
                settings.Timeline1Description,
            Timeline2Title = settings.Timeline2Title,
            Timeline2Description =
                settings.Timeline2Description,
            Timeline3Title = settings.Timeline3Title,
            Timeline3Description =
                settings.Timeline3Description,

            ContactEmail = settings.ContactEmail,
            ContactAddress = settings.ContactAddress,
            ContactDescription = settings.ContactDescription,

            Instagram = settings.Instagram,
            Facebook = settings.Facebook,
            SocialWhatsapp = settings.SocialWhatsapp,
            Tiktok = settings.Tiktok,

            StoreColors = new StoreColorsDto
            {
                PrimaryColor = settings.PrimaryColor,
                SecondaryColor = settings.SecondaryColor,
                LightColor = settings.LightColor,
                BorderColor = settings.BorderColor,
                BackgroundColor = settings.BackgroundColor,
                TextColor = settings.TextColor,
                ButtonColor = settings.ButtonColor,
                ButtonTextColor = settings.ButtonTextColor,
                FooterColor = settings.FooterColor
            }
        };
    }
}