using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VetClinic.Core.Entities;

namespace VetClinic.Infrastructure.Data.Configurations;

public class BillingInvoiceConfiguration
    : IEntityTypeConfiguration<BillingInvoice>
{
    public void Configure(
        EntityTypeBuilder<BillingInvoice> builder)
    {
        builder.ToTable("BillingInvoices");

        builder.HasKey(invoice => invoice.Id);

        // Used by child records to enforce the same clinic.
        builder.HasAlternateKey(invoice => new
        {
            invoice.Id,
            invoice.ClinicId
        });

        builder.Property(invoice => invoice.InvoiceNumber)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(invoice => invoice.OwnerName)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(invoice => invoice.Date)
            .HasColumnType("date");

        builder.Property(invoice => invoice.Status)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(invoice => invoice.Total)
            .HasPrecision(18, 2);

        builder.Property(invoice => invoice.AmountPaid)
            .HasPrecision(18, 2);

        builder.Property(invoice => invoice.RowVersion)
            .IsRowVersion();

        builder.HasIndex(invoice => new
        {
            invoice.ClinicId,
            invoice.InvoiceNumber
        })
        .IsUnique();

        builder.HasIndex(invoice => new
        {
            invoice.ClinicId,
            invoice.RequestId
        })
        .IsUnique();

        builder.HasOne(invoice => invoice.Clinic)
            .WithMany()
            .HasForeignKey(invoice => invoice.ClinicId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(invoice => invoice.Lines)
            .WithOne(line => line.BillingInvoice)
            .HasForeignKey(line => new
            {
                line.BillingInvoiceId,
                line.ClinicId
            })
            .HasPrincipalKey(invoice => new
            {
                invoice.Id,
                invoice.ClinicId
            })
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(invoice => invoice.Payments)
            .WithOne(payment => payment.BillingInvoice)
            .HasForeignKey(payment => new
            {
                payment.BillingInvoiceId,
                payment.ClinicId
            })
            .HasPrincipalKey(invoice => new
            {
                invoice.Id,
                invoice.ClinicId
            })
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class BillingInvoiceLineConfiguration
    : IEntityTypeConfiguration<BillingInvoiceLine>
{
    public void Configure(
        EntityTypeBuilder<BillingInvoiceLine> builder)
    {
        builder.ToTable("BillingInvoiceLines");

        builder.HasKey(line => line.Id);

        builder.Property(line => line.Type)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(line => line.Description)
            .HasMaxLength(4000)
            .IsRequired();

        builder.Property(line => line.UnitPrice)
            .HasPrecision(18, 2);

        builder.Property(line => line.Total)
            .HasPrecision(18, 2);

        builder.HasIndex(line => new
        {
            line.ClinicId,
            line.BillingInvoiceId,
            line.SortOrder
        });
    }
}

public class BillingPaymentConfiguration
    : IEntityTypeConfiguration<BillingPayment>
{
    public void Configure(
        EntityTypeBuilder<BillingPayment> builder)
    {
        builder.ToTable("BillingPayments");

        builder.HasKey(payment => payment.Id);

        builder.Property(payment => payment.Amount)
            .HasPrecision(18, 2);

        builder.Property(payment => payment.PaymentMethod)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(payment => payment.Notes)
            .HasMaxLength(4000)
            .IsRequired();

        builder.HasIndex(payment => new
        {
            payment.ClinicId,
            payment.RequestId
        })
        .IsUnique();
    }
}