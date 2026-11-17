using VetClinic.Infrastructure.Auditing;
using VetClinic.Core.Interfaces;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Entities;
using VetClinic.Infrastructure.Data.Configurations;
using VetClinic.Infrastructure.Identity;

namespace VetClinic.Infrastructure.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Clinic> Clinics => Set<Clinic>();
    public DbSet<Owner> Owners => Set<Owner>();
    public DbSet<Pet> Pets => Set<Pet>();

    public DbSet<MedicalRecord> MedicalRecords =>
        Set<MedicalRecord>();

    public DbSet<Appointment> Appointments =>
        Set<Appointment>();

    public DbSet<Vaccination> Vaccinations =>
        Set<Vaccination>();

    public DbSet<Reminder> Reminders => Set<Reminder>();
    public DbSet<Medication> Medications => Set<Medication>();

    public DbSet<Prescription> Prescriptions =>
        Set<Prescription>();

    public DbSet<ClinicOption> ClinicOptions =>
        Set<ClinicOption>();

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();

    public DbSet<SupplierInvoice> SupplierInvoices =>
        Set<SupplierInvoice>();

    public DbSet<SupplierInvoiceItem> SupplierInvoiceItems =>
        Set<SupplierInvoiceItem>();

    public DbSet<Sale> Sales => Set<Sale>();
    public DbSet<SaleItem> SaleItems => Set<SaleItem>();
    public DbSet<HeldSale> HeldSales => Set<HeldSale>();

    public DbSet<HeldSaleItem> HeldSaleItems =>
        Set<HeldSaleItem>();

    public DbSet<SaleRefund> SaleRefunds => Set<SaleRefund>();

    public DbSet<SaleRefundItem> SaleRefundItems =>
        Set<SaleRefundItem>();

    public DbSet<StoreOrder> StoreOrders => Set<StoreOrder>();

    public DbSet<StoreOrderItem> StoreOrderItems =>
        Set<StoreOrderItem>();

    public DbSet<StoreSettings> StoreSettings =>
        Set<StoreSettings>();

    public DbSet<BillingInvoice> BillingInvoices =>
        Set<BillingInvoice>();

    public DbSet<BillingInvoiceLine> BillingInvoiceLines =>
        Set<BillingInvoiceLine>();

    public DbSet<BillingPayment> BillingPayments =>
        Set<BillingPayment>();

    public DbSet<FinancialEntry> FinancialEntries =>
        Set<FinancialEntry>();

    public DbSet<AuditLogEntry> AuditLogEntries =>
        Set<AuditLogEntry>();

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfiguration(
            new AuditLogEntryConfiguration());

        modelBuilder.ApplyConfiguration(
            new StoreSettingsConfiguration());

        modelBuilder.ApplyConfiguration(
            new BillingInvoiceConfiguration());

        modelBuilder.ApplyConfiguration(
            new BillingInvoiceLineConfiguration());

        modelBuilder.ApplyConfiguration(
            new BillingPaymentConfiguration());

        modelBuilder.ApplyConfiguration(
            new FinancialEntryConfiguration());

        // Categories.
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(category => category.Id);

            entity.HasAlternateKey(category => new
            {
                category.ClinicId,
                category.Id
            });

            entity.Property(category => category.Title)
                .IsRequired().HasMaxLength(200);

            entity.Property(category => category.Image)
                .IsRequired().HasColumnType("nvarchar(max)");

            entity.Property(category => category.Description)
                .IsRequired().HasMaxLength(4000);

            entity.HasOne(category => category.Clinic)
                .WithMany()
                .HasForeignKey(category => category.ClinicId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(category => new
            {
                category.ClinicId,
                category.Title
            }).IsUnique();

            entity.HasIndex(category => new
            {
                category.ClinicId,
                category.SortOrder
            });
        });

        // Products.
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(product => product.Id);

            entity.HasAlternateKey(product => new
            {
                product.ClinicId,
                product.Id
            });

            entity.Property(product => product.Name)
                .IsRequired().HasMaxLength(200);

            entity.Property(product => product.Description)
                .IsRequired().HasMaxLength(4000);

            entity.Property(product => product.Image)
                .IsRequired().HasColumnType("nvarchar(max)");

            entity.Property(product => product.PurchasePrice)
                .HasPrecision(18, 2);

            entity.Property(product => product.SellingPrice)
                .HasPrecision(18, 2);

            entity.Property(product => product.ExpiryDate)
                .HasColumnType("date");

            entity.HasOne(product => product.Clinic)
                .WithMany()
                .HasForeignKey(product => product.ClinicId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(product => product.Category)
                .WithMany()
                .HasForeignKey(product => new
                {
                    product.ClinicId,
                    product.CategoryId
                })
                .HasPrincipalKey(category => new
                {
                    category.ClinicId,
                    category.Id
                })
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(product => new
            {
                product.ClinicId,
                product.Name
            });

            entity.HasIndex(product => new
            {
                product.ClinicId,
                product.CategoryId
            });
        });

        // Store orders.
        modelBuilder.Entity<StoreOrder>(entity =>
        {
            entity.HasKey(order => order.Id);

            entity.HasAlternateKey(order => new
            {
                order.ClinicId,
                order.Id
            });

            entity.Property(order => order.CustomerName)
                .IsRequired().HasMaxLength(200);

            entity.Property(order => order.CustomerPhone)
                .IsRequired().HasMaxLength(50);

            entity.Property(order => order.DeliveryMethod)
                .IsRequired().HasMaxLength(30);

            entity.Property(order => order.Address)
                .IsRequired().HasMaxLength(500);

            entity.Property(order => order.AddressDetails)
                .IsRequired().HasMaxLength(1000);

            entity.Property(order => order.Notes)
                .IsRequired().HasMaxLength(4000);

            entity.Property(order => order.PaymentMethod)
                .IsRequired().HasMaxLength(100);

            entity.Property(order => order.PaymentStatus)
                .IsRequired().HasMaxLength(30);

            entity.Property(order => order.Status)
                .IsRequired().HasMaxLength(100);

            entity.Property(order => order.DeliveryStatus)
                .IsRequired().HasMaxLength(30);

            entity.Property(order => order.TrackingTokenHash)
                .IsRequired().HasMaxLength(64);

            entity.Property(order => order.Subtotal)
                .HasPrecision(18, 2);

            entity.Property(order => order.DeliveryFee)
                .HasPrecision(18, 2);

            entity.Property(order => order.Total)
                .HasPrecision(18, 2);

            entity.HasOne(order => order.Clinic)
                .WithMany()
                .HasForeignKey(order => order.ClinicId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(order => new
            {
                order.ClinicId,
                order.RequestId
            }).IsUnique();

            entity.HasIndex(order => new
            {
                order.ClinicId,
                order.CreatedAt
            });

            entity.HasIndex(order => new
            {
                order.ClinicId,
                order.Status
            });

            entity.HasIndex(order => new
            {
                order.ClinicId,
                order.DeliveryMethod,
                order.DeliveryStatus
            });
        });

        modelBuilder.Entity<StoreOrderItem>(entity =>
        {
            entity.HasKey(item => item.Id);

            entity.Property(item => item.ProductName)
                .IsRequired().HasMaxLength(200);

            entity.Property(item => item.CategoryName)
                .IsRequired().HasMaxLength(200);

            entity.Property(item => item.Image)
                .IsRequired().HasColumnType("nvarchar(max)");

            entity.Property(item => item.UnitPrice)
                .HasPrecision(18, 2);

            entity.Property(item => item.Total)
                .HasPrecision(18, 2);

            entity.HasOne(item => item.StoreOrder)
                .WithMany(order => order.Items)
                .HasForeignKey(item => new
                {
                    item.ClinicId,
                    item.StoreOrderId
                })
                .HasPrincipalKey(order => new
                {
                    order.ClinicId,
                    order.Id
                })
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(item => item.Product)
                .WithMany()
                .HasForeignKey(item => new
                {
                    item.ClinicId,
                    item.ProductId
                })
                .HasPrincipalKey(product => new
                {
                    product.ClinicId,
                    product.Id
                })
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(item => new
            {
                item.ClinicId,
                item.StoreOrderId,
                item.ProductId
            }).IsUnique();

            entity.HasIndex(item => new
            {
                item.ClinicId,
                item.ProductId
            });
        });

        // Supplier invoices.
        modelBuilder.Entity<SupplierInvoice>(entity =>
        {
            entity.HasKey(invoice => invoice.Id);

            entity.HasAlternateKey(invoice => new
            {
                invoice.ClinicId,
                invoice.Id
            });

            entity.Property(invoice => invoice.SupplierName)
                .IsRequired().HasMaxLength(200);

            entity.Property(invoice => invoice.InvoiceNumber)
                .IsRequired().HasMaxLength(100);

            entity.Property(invoice => invoice.Date)
                .HasColumnType("date");

            entity.Property(invoice => invoice.Notes)
                .IsRequired().HasMaxLength(4000);

            entity.Property(invoice => invoice.TaxRate)
                .HasPrecision(5, 2);

            entity.Property(invoice => invoice.Subtotal)
                .HasPrecision(18, 2);

            entity.Property(invoice => invoice.TaxTotal)
                .HasPrecision(18, 2);

            entity.Property(invoice => invoice.Total)
                .HasPrecision(18, 2);

            entity.HasOne(invoice => invoice.Clinic)
                .WithMany()
                .HasForeignKey(invoice => invoice.ClinicId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(invoice => new
            {
                invoice.ClinicId,
                invoice.SupplierName,
                invoice.InvoiceNumber
            }).IsUnique();

            entity.HasIndex(invoice => new
            {
                invoice.ClinicId,
                invoice.Date
            });
        });

        modelBuilder.Entity<SupplierInvoiceItem>(entity =>
        {
            entity.HasKey(item => item.Id);

            entity.Property(item => item.ProductName)
                .IsRequired().HasMaxLength(200);

            entity.Property(item => item.CategoryName)
                .IsRequired().HasMaxLength(200);

            entity.Property(item => item.PurchasePrice)
                .HasPrecision(18, 2);

            entity.Property(item => item.Subtotal)
                .HasPrecision(18, 2);

            entity.Property(item => item.TaxAmount)
                .HasPrecision(18, 2);

            entity.Property(item => item.Total)
                .HasPrecision(18, 2);

            entity.HasOne(item => item.SupplierInvoice)
                .WithMany(invoice => invoice.Items)
                .HasForeignKey(item => new
                {
                    item.ClinicId,
                    item.SupplierInvoiceId
                })
                .HasPrincipalKey(invoice => new
                {
                    invoice.ClinicId,
                    invoice.Id
                })
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(item => item.Product)
                .WithMany()
                .HasForeignKey(item => new
                {
                    item.ClinicId,
                    item.ProductId
                })
                .HasPrincipalKey(product => new
                {
                    product.ClinicId,
                    product.Id
                })
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(item => new
            {
                item.ClinicId,
                item.SupplierInvoiceId
            });

            entity.HasIndex(item => new
            {
                item.ClinicId,
                item.ProductId
            });
        });

        // POS sales.
        modelBuilder.Entity<Sale>(entity =>
        {
            entity.HasKey(sale => sale.Id);

            entity.HasAlternateKey(sale => new
            {
                sale.ClinicId,
                sale.Id
            });

            entity.Property(sale => sale.CustomerName)
                .IsRequired().HasMaxLength(200);

            entity.Property(sale => sale.PaymentMethod)
                .IsRequired().HasMaxLength(100);

            entity.Property(sale => sale.DeliveryStatus)
                .IsRequired()
                .HasMaxLength(30)
                .HasDefaultValue("NotRequired");

            entity.Property(sale => sale.Subtotal)
                .HasPrecision(18, 2);

            entity.Property(sale => sale.Discount)
                .HasPrecision(18, 2);

            entity.Property(sale => sale.Total)
                .HasPrecision(18, 2);

            entity.Property(sale => sale.ReceivedUsd)
                .HasPrecision(18, 2);

            entity.Property(sale => sale.ReceivedLbp)
                .HasPrecision(18, 2);

            entity.Property(sale => sale.ExchangeRate)
                .HasPrecision(18, 4);

            entity.Property(sale => sale.TotalPaid)
                .HasPrecision(18, 2);

            entity.Property(sale => sale.Change)
                .HasPrecision(18, 2);

            entity.HasOne(sale => sale.Clinic)
                .WithMany()
                .HasForeignKey(sale => sale.ClinicId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(sale => sale.Owner)
                .WithMany()
                .HasForeignKey(sale => new
                {
                    sale.ClinicId,
                    sale.OwnerId
                })
                .HasPrincipalKey(owner => new
                {
                    owner.ClinicId,
                    owner.Id
                })
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(sale => new
            {
                sale.ClinicId,
                sale.RequestId
            }).IsUnique();

            entity.HasIndex(sale => new
            {
                sale.ClinicId,
                sale.CreatedAt
            });

            entity.HasIndex(sale => new
            {
                sale.ClinicId,
                sale.HasDelivery,
                sale.DeliveryStatus
            });
        });

        modelBuilder.Entity<SaleItem>(entity =>
        {
            entity.HasKey(item => item.Id);

            entity.HasAlternateKey(item => new
            {
                item.ClinicId,
                item.Id
            });

            entity.Property(item => item.ProductName)
                .IsRequired().HasMaxLength(200);

            entity.Property(item => item.CategoryName)
                .IsRequired().HasMaxLength(200);

            entity.Property(item => item.UnitPrice)
                .HasPrecision(18, 2);

            entity.Property(item => item.Total)
                .HasPrecision(18, 2);

            entity.HasOne(item => item.Sale)
                .WithMany(sale => sale.Items)
                .HasForeignKey(item => new
                {
                    item.ClinicId,
                    item.SaleId
                })
                .HasPrincipalKey(sale => new
                {
                    sale.ClinicId,
                    sale.Id
                })
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(item => item.Product)
                .WithMany()
                .HasForeignKey(item => new
                {
                    item.ClinicId,
                    item.ProductId
                })
                .HasPrincipalKey(product => new
                {
                    product.ClinicId,
                    product.Id
                })
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(item => new
            {
                item.ClinicId,
                item.SaleId
            });

            entity.HasIndex(item => new
            {
                item.ClinicId,
                item.ProductId
            });
        });

        // Held sales.
        modelBuilder.Entity<HeldSale>(entity =>
        {
            entity.HasKey(held => held.Id);

            entity.HasAlternateKey(held => new
            {
                held.ClinicId,
                held.Id
            });

            entity.Property(held => held.CustomerName)
                .IsRequired().HasMaxLength(200);

            entity.Property(held => held.CreatedByUserId)
                .IsRequired().HasMaxLength(450);

            entity.Property(held => held.Discount)
                .HasPrecision(18, 2);

            entity.HasOne(held => held.Clinic)
                .WithMany()
                .HasForeignKey(held => held.ClinicId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(held => held.Owner)
                .WithMany()
                .HasForeignKey(held => new
                {
                    held.ClinicId,
                    held.OwnerId
                })
                .HasPrincipalKey(owner => new
                {
                    owner.ClinicId,
                    owner.Id
                })
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(held => held.CompletedSale)
                .WithMany()
                .HasForeignKey(held => new
                {
                    held.ClinicId,
                    held.CompletedSaleId
                })
                .HasPrincipalKey(sale => new
                {
                    sale.ClinicId,
                    sale.Id
                })
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(held => new
            {
                held.ClinicId,
                held.RequestId
            }).IsUnique();

            entity.HasIndex(held => new
            {
                held.ClinicId,
                held.CompletedSaleId,
                held.CreatedAt
            });
        });

        modelBuilder.Entity<HeldSaleItem>(entity =>
        {
            entity.HasKey(item => item.Id);

            entity.Property(item => item.ProductName)
                .IsRequired().HasMaxLength(200);

            entity.Property(item => item.UnitPrice)
                .HasPrecision(18, 2);

            entity.HasOne(item => item.HeldSale)
                .WithMany(held => held.Items)
                .HasForeignKey(item => new
                {
                    item.ClinicId,
                    item.HeldSaleId
                })
                .HasPrincipalKey(held => new
                {
                    held.ClinicId,
                    held.Id
                })
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(item => item.Product)
                .WithMany()
                .HasForeignKey(item => new
                {
                    item.ClinicId,
                    item.ProductId
                })
                .HasPrincipalKey(product => new
                {
                    product.ClinicId,
                    product.Id
                })
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(item => new
            {
                item.ClinicId,
                item.HeldSaleId,
                item.ProductId
            }).IsUnique();
        });

        // Sale refunds.
        modelBuilder.Entity<SaleRefund>(entity =>
        {
            entity.HasKey(refund => refund.Id);

            entity.HasAlternateKey(refund => new
            {
                refund.ClinicId,
                refund.Id
            });

            entity.Property(refund => refund.CreatedByUserId)
                .IsRequired().HasMaxLength(450);

            entity.Property(refund => refund.Reason)
                .IsRequired().HasMaxLength(1000);

            entity.Property(refund => refund.Total)
                .HasPrecision(18, 2);

            entity.HasOne(refund => refund.Clinic)
                .WithMany()
                .HasForeignKey(refund => refund.ClinicId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(refund => refund.Sale)
                .WithMany()
                .HasForeignKey(refund => new
                {
                    refund.ClinicId,
                    refund.SaleId
                })
                .HasPrincipalKey(sale => new
                {
                    sale.ClinicId,
                    sale.Id
                })
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(refund => new
            {
                refund.ClinicId,
                refund.RequestId
            }).IsUnique();

            entity.HasIndex(refund => new
            {
                refund.ClinicId,
                refund.SaleId
            });
        });

        modelBuilder.Entity<SaleRefundItem>(entity =>
        {
            entity.HasKey(item => item.Id);

            entity.Property(item => item.Amount)
                .HasPrecision(18, 2);

            entity.HasOne(item => item.SaleRefund)
                .WithMany(refund => refund.Items)
                .HasForeignKey(item => new
                {
                    item.ClinicId,
                    item.SaleRefundId
                })
                .HasPrincipalKey(refund => new
                {
                    refund.ClinicId,
                    refund.Id
                })
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(item => item.SaleItem)
                .WithMany()
                .HasForeignKey(item => new
                {
                    item.ClinicId,
                    item.SaleItemId
                })
                .HasPrincipalKey(saleItem => new
                {
                    saleItem.ClinicId,
                    saleItem.Id
                })
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(item => new
            {
                item.ClinicId,
                item.SaleRefundId,
                item.SaleItemId
            }).IsUnique();

            entity.HasIndex(item => new
            {
                item.ClinicId,
                item.SaleItemId
            });
        });


        // Subscription plans.
        modelBuilder.Entity<SubscriptionPlan>(entity =>
        {
            entity.ToTable("SubscriptionPlans");

            entity.HasKey(plan => plan.Id);

            entity.Property(plan => plan.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.HasIndex(plan => plan.Name).IsUnique();

            entity.Property(plan => plan.Description)
                .IsRequired()
                .HasMaxLength(1000);

            entity.Property(plan => plan.MonthlyPrice)
                .HasPrecision(10, 2);

            entity.Property(plan => plan.YearlyPrice)
                .HasPrecision(10, 2);

            entity.Property(plan => plan.Status)
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(plan => plan.FeaturesJson)
                .IsRequired();

            entity.HasData(
                new SubscriptionPlan
                {
                    Id = 1,
                    Name = "Basic",
                    Description = "Essential tools for small veterinary clinics.",
                    MonthlyPrice = 19m,
                    YearlyPrice = 190m,
                    Status = "Active",
                    FeaturesJson = "[\"Appointments\",\"Medical Records\",\"Pet Management\",\"Vaccinations\"]"
                },
                new SubscriptionPlan
                {
                    Id = 2,
                    Name = "Professional",
                    Description = "Advanced tools for growing veterinary clinics.",
                    MonthlyPrice = 39m,
                    YearlyPrice = 390m,
                    Status = "Active",
                    FeaturesJson = "[\"Appointments\",\"Medical Records\",\"Pet Management\",\"Vaccinations\",\"Inventory\",\"Pharmacy\",\"Staff Management\",\"Reports & Analytics\"]"
                },
                new SubscriptionPlan
                {
                    Id = 3,
                    Name = "Premium",
                    Description = "Complete management for larger clinics.",
                    MonthlyPrice = 69m,
                    YearlyPrice = 690m,
                    Status = "Active",
                    FeaturesJson = "[\"Appointments\",\"Medical Records\",\"Pet Management\",\"Vaccinations\",\"Inventory\",\"Pharmacy\",\"Staff Management\",\"Reports & Analytics\",\"Billing & Invoices\",\"Multi-Branch Access\",\"Export Reports\",\"Priority Support\"]"
                });
        });


        // Clinic subscriptions and recorded payments.
        modelBuilder.Entity<ClinicSubscription>(entity =>
        {
            entity.ToTable("ClinicSubscriptions");

            entity.HasKey(item => item.Id);

            entity.Property(item => item.Clinic)
                .HasMaxLength(200).IsRequired();

            entity.Property(item => item.Admin)
                .HasMaxLength(200).IsRequired();

            entity.Property(item => item.Email)
                .HasMaxLength(254).IsRequired();

            entity.Property(item => item.Billing)
                .HasMaxLength(20).IsRequired();

            entity.Property(item => item.Amount)
                .HasPrecision(10, 2);

            entity.Property(item => item.Discount)
                .HasPrecision(5, 2);

            entity.Property(item => item.Notes)
                .HasMaxLength(4000).IsRequired();

            entity.HasOne<Clinic>()
                .WithMany()
                .HasForeignKey(item => item.ClinicId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne<SubscriptionPlan>()
                .WithMany()
                .HasForeignKey(item => item.PlanId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(item => new
            {
                item.ClinicId,
                item.StartDate,
                item.EndDate
            });

            entity.HasMany(item => item.Payments)
                .WithOne()
                .HasForeignKey(payment => payment.SubscriptionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SubscriptionPayment>(entity =>
        {
            entity.ToTable("SubscriptionPayments");

            entity.HasKey(payment => payment.Id);

            entity.Property(payment => payment.Amount)
                .HasPrecision(10, 2);

            entity.Property(payment => payment.Method)
                .HasMaxLength(50).IsRequired();

            entity.Property(payment => payment.Notes)
                .HasMaxLength(4000).IsRequired();

            entity.HasIndex(payment => new
            {
                payment.SubscriptionId,
                payment.RequestId
            }).IsUnique();
        });

        // Clinics.
        modelBuilder.Entity<Clinic>(entity =>
        {
            entity.HasKey(clinic => clinic.Id);

            entity.Property(clinic => clinic.Name)
                .IsRequired().HasMaxLength(200);

            entity.Property(clinic => clinic.LogoUrl)
                .HasMaxLength(2048);

            entity.Property(clinic => clinic.Email)
                .HasMaxLength(254);

            entity.Property(clinic => clinic.Address)
                .HasMaxLength(500);
        });

        // Identity users.
        modelBuilder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(user => user.FullName)
                .IsRequired().HasMaxLength(200);

            entity.HasOne(user => user.Clinic)
                .WithMany()
                .HasForeignKey(user => user.ClinicId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Owners.
        modelBuilder.Entity<Owner>(entity =>
        {
            entity.HasKey(owner => owner.Id);

            entity.Property(owner => owner.FirstName)
                .IsRequired().HasMaxLength(100);

            entity.Property(owner => owner.LastName)
                .IsRequired().HasMaxLength(100);

            entity.Property(owner => owner.Email)
                .IsRequired().HasMaxLength(254);

            entity.Property(owner => owner.Phone)
                .IsRequired().HasMaxLength(50);

            entity.Property(owner => owner.Address)
                .IsRequired().HasMaxLength(500);

            entity.Property(owner => owner.EmergencyContact)
                .IsRequired().HasMaxLength(100);

            entity.Property(owner => owner.Notes)
                .IsRequired().HasMaxLength(4000);

            entity.Property(owner => owner.Status)
                .IsRequired().HasMaxLength(100);

            entity.HasOne(owner => owner.Clinic)
                .WithMany()
                .HasForeignKey(owner => owner.ClinicId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(owner => new
            {
                owner.ClinicId,
                owner.LastName,
                owner.FirstName
            });

            entity.HasAlternateKey(owner => new
            {
                owner.ClinicId,
                owner.Id
            });
        });

        // Pets.
        modelBuilder.Entity<Pet>(entity =>
        {
            entity.HasKey(pet => pet.Id);

            entity.Property(pet => pet.Name)
                .IsRequired().HasMaxLength(100);

            entity.Property(pet => pet.Species)
                .IsRequired().HasMaxLength(100);

            entity.Property(pet => pet.Breed)
                .IsRequired().HasMaxLength(150);

            entity.Property(pet => pet.Sex)
                .IsRequired().HasMaxLength(30);

            entity.Property(pet => pet.Age)
                .IsRequired().HasMaxLength(100);

            entity.Property(pet => pet.DateOfBirth)
                .HasColumnType("date");

            entity.Property(pet => pet.Color)
                .IsRequired().HasMaxLength(100);

            entity.Property(pet => pet.ColorHex)
                .IsRequired().HasMaxLength(7);

            entity.Property(pet => pet.Weight)
                .HasPrecision(10, 2);

            entity.Property(pet => pet.MicrochipNumber)
                .IsRequired().HasMaxLength(100);

            entity.Property(pet => pet.BloodType)
                .IsRequired().HasMaxLength(100);

            entity.Property(pet => pet.Allergies)
                .IsRequired().HasMaxLength(4000);

            entity.Property(pet => pet.ChronicConditions)
                .IsRequired().HasMaxLength(4000);

            entity.Property(pet => pet.Notes)
                .IsRequired().HasMaxLength(4000);

            entity.Property(pet => pet.ProfilePhoto)
                .IsRequired().HasColumnType("nvarchar(max)");

            entity.HasOne(pet => pet.Clinic)
                .WithMany()
                .HasForeignKey(pet => pet.ClinicId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(pet => pet.Owner)
                .WithMany()
                .HasForeignKey(pet => new
                {
                    pet.ClinicId,
                    pet.OwnerId
                })
                .HasPrincipalKey(owner => new
                {
                    owner.ClinicId,
                    owner.Id
                })
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(pet => new
            {
                pet.ClinicId,
                pet.Name
            });

            entity.HasAlternateKey(pet => new
            {
                pet.ClinicId,
                pet.Id
            });
        });

        // Medical records.
        modelBuilder.Entity<MedicalRecord>(entity =>
        {
            entity.HasKey(record => record.Id);

            entity.Property(record => record.Date)
                .HasColumnType("date");

            entity.Property(record => record.Veterinarian)
                .IsRequired().HasMaxLength(200);

            entity.Property(record => record.ReasonForVisit)
                .IsRequired().HasMaxLength(500);

            entity.Property(record => record.Symptoms)
                .IsRequired().HasMaxLength(4000);

            entity.Property(record => record.Procedures)
                .IsRequired().HasMaxLength(4000);

            entity.Property(record => record.Weight)
                .HasPrecision(10, 2);

            entity.Property(record => record.FollowUpDate)
                .HasColumnType("date");

            entity.Property(record => record.Diagnosis)
                .IsRequired().HasMaxLength(4000);

            entity.Property(record => record.Treatment)
                .IsRequired().HasMaxLength(4000);

            entity.Property(record => record.Notes)
                .IsRequired().HasMaxLength(4000);

            entity.Property(record => record.FileName)
                .IsRequired().HasMaxLength(255);

            entity.Property(record => record.Status)
                .IsRequired().HasMaxLength(100);

            entity.HasOne(record => record.Clinic)
                .WithMany()
                .HasForeignKey(record => record.ClinicId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(record => record.Pet)
                .WithMany()
                .HasForeignKey(record => new
                {
                    record.ClinicId,
                    record.PetId
                })
                .HasPrincipalKey(pet => new
                {
                    pet.ClinicId,
                    pet.Id
                })
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(record => new
            {
                record.ClinicId,
                record.PetId,
                record.Date
            });
        });

        // Appointments.
        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.HasKey(appointment => appointment.Id);

            entity.Property(appointment => appointment.Type)
                .IsRequired().HasMaxLength(100);

            entity.Property(appointment => appointment.Date)
                .HasColumnType("date");

            entity.Property(appointment => appointment.Time)
                .HasColumnType("time").IsRequired();

            entity.Property(
                    appointment => appointment.Veterinarian)
                .IsRequired().HasMaxLength(200);

            entity.Property(appointment => appointment.Reason)
                .IsRequired().HasMaxLength(500);

            entity.Property(appointment => appointment.Status)
                .IsRequired().HasMaxLength(100);

            entity.HasOne(appointment => appointment.Clinic)
                .WithMany()
                .HasForeignKey(
                    appointment => appointment.ClinicId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(appointment => appointment.Pet)
                .WithMany()
                .HasForeignKey(appointment => new
                {
                    appointment.ClinicId,
                    appointment.PetId
                })
                .HasPrincipalKey(pet => new
                {
                    pet.ClinicId,
                    pet.Id
                })
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(appointment => new
            {
                appointment.ClinicId,
                appointment.Date,
                appointment.Time
            });

            entity.HasIndex(appointment => new
            {
                appointment.ClinicId,
                appointment.PetId
            });
        });

        // Vaccinations.
        modelBuilder.Entity<Vaccination>(entity =>
        {
            entity.HasKey(vaccination => vaccination.Id);

            entity.Property(vaccination => vaccination.Vaccine)
                .IsRequired().HasMaxLength(200);

            entity.Property(
                    vaccination => vaccination.DateGiven)
                .HasColumnType("date");

            entity.Property(
                    vaccination => vaccination.NextDueDate)
                .HasColumnType("date");

            entity.Property(vaccination => vaccination.Status)
                .IsRequired().HasMaxLength(100);

            entity.Property(vaccination => vaccination.Notes)
                .IsRequired().HasMaxLength(4000);

            entity.HasOne(vaccination => vaccination.Clinic)
                .WithMany()
                .HasForeignKey(
                    vaccination => vaccination.ClinicId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(vaccination => vaccination.Pet)
                .WithMany()
                .HasForeignKey(vaccination => new
                {
                    vaccination.ClinicId,
                    vaccination.PetId
                })
                .HasPrincipalKey(pet => new
                {
                    pet.ClinicId,
                    pet.Id
                })
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(vaccination => new
            {
                vaccination.ClinicId,
                vaccination.PetId,
                vaccination.DateGiven
            });

            entity.HasIndex(vaccination => new
            {
                vaccination.ClinicId,
                vaccination.NextDueDate
            });
        });

        // Reminders.
        modelBuilder.Entity<Reminder>(entity =>
        {
            entity.HasKey(reminder => reminder.Id);

            entity.Property(reminder => reminder.Type)
                .IsRequired().HasMaxLength(100);

            entity.Property(reminder => reminder.DueDate)
                .HasColumnType("date");

            entity.Property(reminder => reminder.Message)
                .IsRequired().HasMaxLength(4000);

            entity.Property(reminder => reminder.Status)
                .IsRequired().HasMaxLength(100);

            entity.HasOne(reminder => reminder.Clinic)
                .WithMany()
                .HasForeignKey(reminder => reminder.ClinicId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(reminder => reminder.Pet)
                .WithMany()
                .HasForeignKey(reminder => new
                {
                    reminder.ClinicId,
                    reminder.PetId
                })
                .HasPrincipalKey(pet => new
                {
                    pet.ClinicId,
                    pet.Id
                })
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(reminder => new
            {
                reminder.ClinicId,
                reminder.PetId,
                reminder.DueDate
            });

            entity.HasIndex(reminder => new
            {
                reminder.ClinicId,
                reminder.DueDate
            });
        });

        // Medications.
        modelBuilder.Entity<Medication>(entity =>
        {
            entity.HasKey(medication => medication.Id);

            entity.Property(medication => medication.Name)
                .IsRequired().HasMaxLength(200);

            entity.Property(medication => medication.Dosage)
                .IsRequired().HasMaxLength(200);

            entity.Property(medication => medication.Frequency)
                .IsRequired().HasMaxLength(200);

            entity.Property(medication => medication.Route)
                .IsRequired().HasMaxLength(100);

            entity.Property(medication => medication.StartDate)
                .HasColumnType("date");

            entity.Property(medication => medication.EndDate)
                .HasColumnType("date");

            entity.Property(
                    medication => medication.Instructions)
                .IsRequired().HasMaxLength(4000);

            entity.Property(medication => medication.Status)
                .IsRequired().HasMaxLength(100);

            entity.HasOne(medication => medication.Clinic)
                .WithMany()
                .HasForeignKey(
                    medication => medication.ClinicId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(medication => medication.Pet)
                .WithMany()
                .HasForeignKey(medication => new
                {
                    medication.ClinicId,
                    medication.PetId
                })
                .HasPrincipalKey(pet => new
                {
                    pet.ClinicId,
                    pet.Id
                })
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(medication => new
            {
                medication.ClinicId,
                medication.PetId,
                medication.StartDate
            });
        });

        // Prescriptions.
        modelBuilder.Entity<Prescription>(entity =>
        {
            entity.HasKey(prescription => prescription.Id);

            entity.Property(prescription => prescription.Date)
                .HasColumnType("date");

            entity.Property(
                    prescription => prescription.Veterinarian)
                .IsRequired().HasMaxLength(200);

            entity.Property(
                    prescription => prescription.Medication)
                .IsRequired().HasMaxLength(200);

            entity.Property(prescription => prescription.Dosage)
                .IsRequired().HasMaxLength(200);

            entity.Property(
                    prescription => prescription.Instructions)
                .IsRequired().HasMaxLength(4000);

            entity.HasOne(prescription => prescription.Clinic)
                .WithMany()
                .HasForeignKey(
                    prescription => prescription.ClinicId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(prescription => prescription.Pet)
                .WithMany()
                .HasForeignKey(prescription => new
                {
                    prescription.ClinicId,
                    prescription.PetId
                })
                .HasPrincipalKey(pet => new
                {
                    pet.ClinicId,
                    pet.Id
                })
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(prescription => new
            {
                prescription.ClinicId,
                prescription.PetId,
                prescription.Date
            });
        });

        // Clinic option lists.
        modelBuilder.Entity<ClinicOption>(entity =>
        {
            entity.HasKey(option => option.Id);

            entity.Property(option => option.ListKey)
                .IsRequired().HasMaxLength(100);

            entity.Property(option => option.Value)
                .IsRequired().HasMaxLength(200);

            entity.HasOne(option => option.Clinic)
                .WithMany()
                .HasForeignKey(option => option.ClinicId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(option => new
            {
                option.ClinicId,
                option.ListKey,
                option.Value
            }).IsUnique();

            entity.HasIndex(option => new
            {
                option.ClinicId,
                option.ListKey,
                option.IsActive,
                option.SortOrder
            });
        });
    }

    private readonly IAuditActorAccessor? _auditActorAccessor;

    public AppDbContext(
        DbContextOptions<AppDbContext> options,
        IAuditActorAccessor auditActorAccessor)
        : this(options)
    {
        _auditActorAccessor = auditActorAccessor;
    }

    public override int SaveChanges()
    {
        return SaveChanges(true);
    }

    public override int SaveChanges(
        bool acceptAllChangesOnSuccess)
    {
        return SaveChangesAsync(
                acceptAllChangesOnSuccess,
                CancellationToken.None)
            .GetAwaiter()
            .GetResult();
    }

    public override Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        return SaveChangesAsync(
            true,
            cancellationToken);
    }

    public override async Task<int> SaveChangesAsync(
        bool acceptAllChangesOnSuccess,
        CancellationToken cancellationToken = default)
    {
        ChangeTracker.DetectChanges();

        var auditWasChanged = ChangeTracker
            .Entries<AuditLogEntry>()
            .Any(entry =>
                entry.State is EntityState.Added
                    or EntityState.Modified
                    or EntityState.Deleted);

        if (auditWasChanged)
        {
            throw new InvalidOperationException(
                "Audit records are managed automatically.");
        }

        var pending = await AuditLogCapture.PrepareAsync(
            this,
            _auditActorAccessor,
            cancellationToken);

        if (pending.Count == 0)
        {
            return await base.SaveChangesAsync(
                acceptAllChangesOnSuccess,
                cancellationToken);
        }

        if (!acceptAllChangesOnSuccess)
        {
            throw new NotSupportedException(
                "Audited saves require accepting changes on success.");
        }

        IDbContextTransaction? ownedTransaction = null;

        var existingTransaction =
            Database.CurrentTransaction;

        var savepoint =
            Guid.NewGuid().ToString("N");

        var savepointCreated = false;

        try
        {
            if (existingTransaction is null)
            {
                ownedTransaction =
                    await Database.BeginTransactionAsync(
                        cancellationToken);
            }
            else
            {
                if (!existingTransaction.SupportsSavepoints)
                {
                    throw new InvalidOperationException(
                        "The current transaction must support savepoints for audit recording.");
                }

                await existingTransaction.CreateSavepointAsync(
                    savepoint,
                    cancellationToken);

                savepointCreated = true;
            }

            // Save the actual records first to obtain generated IDs.
            var affectedRows = await base.SaveChangesAsync(
                true,
                cancellationToken);

            foreach (var item in pending)
            {
                item.CompleteRecordId();
            }

            AuditLogEntries.AddRange(
                pending.Select(item => item.Log));

            // Call base directly to avoid auditing the audit records.
            await base.SaveChangesAsync(
                true,
                cancellationToken);

            if (ownedTransaction is not null)
            {
                await ownedTransaction.CommitAsync(
                    cancellationToken);
            }
            else if (savepointCreated)
            {
                await existingTransaction!
                    .ReleaseSavepointAsync(
                        savepoint,
                        cancellationToken);
            }

            return affectedRows;
        }
        catch
        {
            try
            {
                if (ownedTransaction is not null)
                {
                    await ownedTransaction.RollbackAsync(
                        CancellationToken.None);
                }
                else if (savepointCreated)
                {
                    await existingTransaction!
                        .RollbackToSavepointAsync(
                            savepoint,
                            CancellationToken.None);
                }
            }
            finally
            {
                ChangeTracker.Clear();
            }

            throw;
        }
        finally
        {
            if (ownedTransaction is not null)
            {
                await ownedTransaction.DisposeAsync();
            }
        }
    }
}
