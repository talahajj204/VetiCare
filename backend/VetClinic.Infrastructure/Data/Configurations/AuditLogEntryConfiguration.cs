using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VetClinic.Core.Entities;

namespace VetClinic.Infrastructure.Data.Configurations;

public class AuditLogEntryConfiguration
    : IEntityTypeConfiguration<AuditLogEntry>
{
    public void Configure(
        EntityTypeBuilder<AuditLogEntry> builder)
    {
        builder.ToTable("AuditLogEntries");

        builder.HasKey(entry => entry.Id);

        builder.Property(entry => entry.UserId)
            .HasMaxLength(450)
            .IsRequired();

        builder.Property(entry => entry.UserName)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(entry => entry.Action)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(entry => entry.EntityType)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(entry => entry.RecordId)
            .HasMaxLength(450)
            .IsRequired();

        builder.Property(entry => entry.Record)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(entry => entry.CreatedAt)
            .HasColumnType("datetime2")
            .HasConversion(
                value => value,
                value => DateTime.SpecifyKind(
                    value,
                    DateTimeKind.Utc))
            .IsRequired();

        builder.HasOne(entry => entry.Clinic)
            .WithMany()
            .HasForeignKey(entry => entry.ClinicId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(entry => new
        {
            entry.ClinicId,
            entry.CreatedAt,
            entry.Id
        });

        builder.HasIndex(entry => new
        {
            entry.ClinicId,
            entry.Action
        });

        builder.HasIndex(entry => new
        {
            entry.ClinicId,
            entry.UserId
        });
    }
}