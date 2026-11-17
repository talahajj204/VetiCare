using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VetClinic.Core.Entities;

namespace VetClinic.Infrastructure.Data.Configurations;

public class StoreSettingsConfiguration
    : IEntityTypeConfiguration<StoreSettings>
{
    public void Configure(
        EntityTypeBuilder<StoreSettings> builder)
    {
        builder.ToTable("StoreSettings");

        builder.HasKey(settings => settings.Id);

        // One settings record per clinic.
        builder.HasIndex(settings => settings.ClinicId)
            .IsUnique();

        builder.HasOne(settings => settings.Clinic)
            .WithMany()
            .HasForeignKey(settings => settings.ClinicId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(settings => settings.StoreName)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(settings => settings.StoreDescription)
            .HasMaxLength(4000)
            .IsRequired();

        builder.Property(settings => settings.Email)
            .HasMaxLength(254)
            .IsRequired();

        builder.Property(settings => settings.Phone)
            .HasMaxLength(50)
            .IsRequired();

        builder.PrimitiveCollection(
                settings => settings.PhoneNumbers)
            .HasColumnType("nvarchar(max)");

        builder.Property(settings => settings.Address)
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(settings => settings.StoreBanner)
            .HasColumnType("nvarchar(max)")
            .IsRequired();

        builder.Property(settings => settings.HomeBanner)
            .HasColumnType("nvarchar(max)")
            .IsRequired();

        builder.Property(settings => settings.HomeBannerBadge)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(settings => settings.HomeBannerTitle)
            .HasMaxLength(300)
            .IsRequired();

        builder.Property(
                settings => settings.HomeBannerDescription)
            .HasMaxLength(4000)
            .IsRequired();

        builder.Property(
                settings => settings.HomeBannerButtonText)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(settings => settings.AboutTitle)
            .HasMaxLength(300)
            .IsRequired();

        builder.Property(settings => settings.AboutDescription)
            .HasMaxLength(10000)
            .IsRequired();

        builder.Property(settings => settings.AboutImage)
            .HasColumnType("nvarchar(max)")
            .IsRequired();

        builder.Property(settings => settings.Timeline1Title)
            .HasMaxLength(300)
            .IsRequired();

        builder.Property(
                settings => settings.Timeline1Description)
            .HasMaxLength(4000)
            .IsRequired();

        builder.Property(settings => settings.Timeline2Title)
            .HasMaxLength(300)
            .IsRequired();

        builder.Property(
                settings => settings.Timeline2Description)
            .HasMaxLength(4000)
            .IsRequired();

        builder.Property(settings => settings.Timeline3Title)
            .HasMaxLength(300)
            .IsRequired();

        builder.Property(
                settings => settings.Timeline3Description)
            .HasMaxLength(4000)
            .IsRequired();

        builder.Property(settings => settings.ContactEmail)
            .HasMaxLength(254)
            .IsRequired();

        builder.Property(settings => settings.ContactAddress)
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(
                settings => settings.ContactDescription)
            .HasMaxLength(4000)
            .IsRequired();

        builder.Property(settings => settings.Instagram)
            .HasMaxLength(2048)
            .IsRequired();

        builder.Property(settings => settings.Facebook)
            .HasMaxLength(2048)
            .IsRequired();

        builder.Property(settings => settings.SocialWhatsapp)
            .HasMaxLength(2048)
            .IsRequired();

        builder.Property(settings => settings.Tiktok)
            .HasMaxLength(2048)
            .IsRequired();

        builder.Property(settings => settings.PrimaryColor)
            .HasMaxLength(7)
            .IsRequired();

        builder.Property(settings => settings.SecondaryColor)
            .HasMaxLength(7)
            .IsRequired();

        builder.Property(settings => settings.LightColor)
            .HasMaxLength(7)
            .IsRequired();

        builder.Property(settings => settings.BorderColor)
            .HasMaxLength(7)
            .IsRequired();

        builder.Property(settings => settings.BackgroundColor)
            .HasMaxLength(7)
            .IsRequired();

        builder.Property(settings => settings.TextColor)
            .HasMaxLength(7)
            .IsRequired();

        builder.Property(settings => settings.ButtonColor)
            .HasMaxLength(7)
            .IsRequired();

        builder.Property(settings => settings.ButtonTextColor)
            .HasMaxLength(7)
            .IsRequired();

        builder.Property(settings => settings.FooterColor)
            .HasMaxLength(7)
            .IsRequired();

        builder.Property(settings => settings.CreatedAt)
            .HasColumnType("datetime2");

        builder.Property(settings => settings.UpdatedAt)
            .HasColumnType("datetime2");
    }
}