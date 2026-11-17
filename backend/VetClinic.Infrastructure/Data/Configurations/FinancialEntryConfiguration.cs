using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VetClinic.Core.Entities;

namespace VetClinic.Infrastructure.Data.Configurations;

public class FinancialEntryConfiguration
    : IEntityTypeConfiguration<FinancialEntry>
{
    public void Configure(
        EntityTypeBuilder<FinancialEntry> builder)
    {
        builder.ToTable("FinancialEntries", table =>
        {
            table.HasCheckConstraint(
                "CK_FinancialEntries_Kind",
                "[Kind] IN ('Revenue', 'Expense')");

            table.HasCheckConstraint(
                "CK_FinancialEntries_Amount",
                "[Amount] >= 0");
        });

        builder.HasKey(entry => entry.Id);

        builder.Property(entry => entry.Kind)
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(entry => entry.Date)
            .HasColumnType("date")
            .IsRequired();

        builder.Property(entry => entry.Type)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(entry => entry.Description)
            .HasMaxLength(4000)
            .IsRequired();

        builder.Property(entry => entry.Amount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(entry => entry.RequestId)
            .IsRequired();

        builder.Property(entry => entry.CreatedAt)
            .IsRequired();

        builder.HasOne(entry => entry.Clinic)
            .WithMany()
            .HasForeignKey(entry => entry.ClinicId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(entry => new
        {
            entry.ClinicId,
            entry.RequestId
        })
        .IsUnique();

        builder.HasIndex(entry => new
        {
            entry.ClinicId,
            entry.Kind,
            entry.Date
        });
    }
}