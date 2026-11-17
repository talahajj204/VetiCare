using System.Reflection;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using VetClinic.Application.Interfaces;
using VetClinic.Application.Services;
using VetClinic.Core.Constants;
using VetClinic.Core.Interfaces;
using VetClinic.Infrastructure.Authorization;
using VetClinic.Infrastructure.Data;
using VetClinic.Infrastructure.Identity;
using VetClinic.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<
    VetClinic.Web.Services.ClinicSubscriptionAccess>();

builder.Services.AddControllers(options =>
{
    options.Filters.Add<
        VetClinic.Web.Services.ClinicSubscriptionFilter>();
});
builder.Services.AddOpenApi();

var connectionString = builder.Configuration
    .GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "Connection string 'DefaultConnection' was not found.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services
    .AddIdentityCore<ApplicationUser>(options =>
    {
        options.User.RequireUniqueEmail = true;

        options.Password.RequiredLength = 12;
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = true;

        options.Lockout.DefaultLockoutTimeSpan =
            TimeSpan.FromMinutes(15);

        options.Lockout.MaxFailedAccessAttempts = 5;
        options.Lockout.AllowedForNewUsers = true;
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddSignInManager();

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultScheme =
            IdentityConstants.ApplicationScheme;

        options.DefaultSignInScheme =
            IdentityConstants.ExternalScheme;
    })
    .AddIdentityCookies();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.Name = "VetClinic.Auth";
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;

    options.Cookie.SecurePolicy =
        builder.Environment.IsDevelopment()
            ? CookieSecurePolicy.SameAsRequest
            : CookieSecurePolicy.Always;

    options.ExpireTimeSpan = TimeSpan.FromHours(8);
    options.SlidingExpiration = true;


    options.Events.OnValidatePrincipal = async context =>
    {
        await SecurityStampValidator.ValidatePrincipalAsync(context);

        if (context.Principal?.Identity?.IsAuthenticated != true)
        {
            return;
        }

        var users = context.HttpContext.RequestServices
            .GetRequiredService<UserManager<ApplicationUser>>();

        var user = await users.GetUserAsync(context.Principal);

        var allowed = user is not null && user.IsActive;

        if (allowed && user!.ClinicId is int clinicId)
        {
            var db = context.HttpContext.RequestServices
                .GetRequiredService<AppDbContext>();

            allowed = await db.Clinics
                .AsNoTracking()
                .AnyAsync(clinic =>
                    clinic.Id == clinicId &&
                    clinic.IsActive);
        }

        if (!allowed)
        {
            context.RejectPrincipal();

            await context.HttpContext.SignOutAsync(
                IdentityConstants.ApplicationScheme);
        }
    };

    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode =
            StatusCodes.Status401Unauthorized;

        return Task.CompletedTask;
    };

    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode =
            StatusCodes.Status403Forbidden;

        return Task.CompletedTask;
    };
});

// Register one policy for each permission.
var permissionCodes = typeof(AppPermissions)
    .GetFields(BindingFlags.Public | BindingFlags.Static)
    .Where(field =>
        field.IsLiteral &&
        !field.IsInitOnly &&
        field.FieldType == typeof(string))
    .Select(field => (string)field.GetRawConstantValue()!)
    .Distinct(StringComparer.Ordinal)
    .ToArray();

builder.Services.AddAuthorization(options =>
{
    foreach (var permission in permissionCodes)
    {
        options.AddPolicy(permission, policy =>
        {
            policy.RequireAuthenticatedUser();

            policy.AddRequirements(
                new PermissionRequirement(permission));
        });
    }
});

builder.Services.AddScoped<
    IAuthorizationHandler,
    PermissionAuthorizationHandler>();

builder.Services.AddScoped<
    IClinicRepository,
    ClinicRepository>();

builder.Services.AddScoped<
    IClinicService,
    ClinicService>();

builder.Services.AddScoped<
    IAuthService,
    AuthService>();

builder.Services.AddScoped<
    IOwnerRepository,
    OwnerRepository>();

builder.Services.AddScoped<
    IOwnerService,
    OwnerService>();

builder.Services.AddScoped<
    IPetRepository,
    PetRepository>();

builder.Services.AddScoped<
    IPetService,
    PetService>();

builder.Services.AddScoped<
    IMedicalRecordRepository,
    MedicalRecordRepository>();

builder.Services.AddScoped<
    IMedicalRecordService,
    MedicalRecordService>();

builder.Services.AddScoped<
    IAppointmentRepository,
    AppointmentRepository>();

builder.Services.AddScoped<
    IAppointmentService,
    AppointmentService>();

builder.Services.AddScoped<
    IVaccinationRepository,
    VaccinationRepository>();

builder.Services.AddScoped<
    IVaccinationService,
    VaccinationService>();

builder.Services.AddScoped<
    IReminderRepository,
    ReminderRepository>();

builder.Services.AddScoped<
    IReminderService,
    ReminderService>();

builder.Services.AddScoped<
    IMedicationRepository,
    MedicationRepository>();

builder.Services.AddScoped<
    IMedicationService,
    MedicationService>();

builder.Services.AddScoped<
    IPrescriptionRepository,
    PrescriptionRepository>();

builder.Services.AddScoped<
    IPrescriptionService,
    PrescriptionService>();

builder.Services.AddScoped<
    IStaffUserService,
    StaffUserService>();

builder.Services.AddScoped<
    IClinicOptionRepository,
    ClinicOptionRepository>();

builder.Services.AddScoped<
    IClinicOptionService,
    ClinicOptionService>();

builder.Services.AddScoped<
    ICategoryRepository,
    CategoryRepository>();

builder.Services.AddScoped<
    ICategoryService,
    CategoryService>();

builder.Services.AddScoped<
    IProductRepository,
    ProductRepository>();

builder.Services.AddScoped<
    IProductService,
    ProductService>();

builder.Services.AddScoped<
    ISupplierInvoiceRepository,
    SupplierInvoiceRepository>();

builder.Services.AddScoped<
    ISupplierInvoiceService,
    SupplierInvoiceService>();

builder.Services.AddScoped<
    ISaleRepository,
    SaleRepository>();

builder.Services.AddScoped<
    ISaleService,
    SaleService>();

builder.Services.AddScoped<
    IPosOperationsRepository,
    PosOperationsRepository>();

builder.Services.AddScoped<
    IPosOperationsService,
    PosOperationsService>();

// Store orders.
builder.Services.AddScoped<
    IStoreOrderRepository,
    StoreOrderRepository>();

builder.Services.AddScoped<
    IStoreSettingsRepository,
    StoreSettingsRepository>();

builder.Services.AddScoped<
    IStoreSettingsService,
    StoreSettingsService>();

// Billing.
builder.Services.AddScoped<
    IBillingInvoiceRepository,
    BillingInvoiceRepository>();

builder.Services.AddScoped<
    IBillingInvoiceService,
    BillingInvoiceService>();

// Financial.
builder.Services.AddScoped<
    IFinancialRepository,
    FinancialRepository>();

builder.Services.AddScoped<
    IFinancialService,
    FinancialService>();

// Reports.
builder.Services.AddScoped<
    IReportRepository,
    ReportRepository>();

builder.Services.AddScoped<
    IReportService,
    ReportService>();

builder.Services.AddScoped<IStoreOrderService>(provider =>
{
    var repository = provider
        .GetRequiredService<IStoreOrderRepository>();

    var configuration = provider
        .GetRequiredService<IConfiguration>();

    return new StoreOrderService(
        repository,
        clinicId =>
        {
            var fee = configuration.GetValue<decimal?>(
                $"Stores:{clinicId}:DeliveryFee");

            if (!fee.HasValue)
            {
                throw new System.ComponentModel.DataAnnotations
                    .ValidationException(
                        "Delivery is not configured for this clinic. " +
                        "Please choose clinic pickup.");
            }

            return fee.Value;
        });
});

// Audit Log registrations.
builder.Services.AddHttpContextAccessor();

builder.Services.AddScoped<
    IAuditActorAccessor,
    VetClinic.Web.Services.HttpAuditActorAccessor>();

builder.Services.AddScoped<
    IAuditLogRepository,
    AuditLogRepository>();

builder.Services.AddScoped<
    IAuditLogService,
    AuditLogService>();

// Explicitly use the constructor that receives the audit actor.
builder.Services.AddScoped<AppDbContext>(provider =>
    new AppDbContext(
        provider.GetRequiredService<DbContextOptions<AppDbContext>>(),
        provider.GetRequiredService<IAuditActorAccessor>()));

// Dashboard registrations.
builder.Services.AddScoped<
    VetClinic.Core.Interfaces.IDashboardRepository,
    VetClinic.Infrastructure.Repositories.DashboardRepository>();

builder.Services.AddScoped<
    VetClinic.Application.Interfaces.IDashboardService,
    VetClinic.Application.Services.DashboardService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider
        .GetRequiredService<RoleManager<IdentityRole>>();

    await IdentitySeeder.SeedRolesAsync(roleManager);

    if (app.Environment.IsDevelopment())
    {
        var userManager = scope.ServiceProvider
            .GetRequiredService<UserManager<ApplicationUser>>();

        var email = app.Configuration["Seed:SuperAdmin:Email"]
            ?? throw new InvalidOperationException(
                "Super Admin email is missing.");

        var password = app.Configuration["Seed:SuperAdmin:Password"]
            ?? throw new InvalidOperationException(
                "Super Admin password is missing.");

        await IdentitySeeder.SeedSuperAdminAsync(
            userManager,
            email,
            password);

        var clinicAdminEmail =
            app.Configuration["Seed:ClinicAdmin:Email"]
            ?? throw new InvalidOperationException(
                "Clinic Admin email is missing.");

        var clinicAdminPassword =
            app.Configuration["Seed:ClinicAdmin:Password"]
            ?? throw new InvalidOperationException(
                "Clinic Admin password is missing.");

        var clinicIdValue =
            app.Configuration["Seed:ClinicAdmin:ClinicId"];

        if (!int.TryParse(clinicIdValue, out var clinicId) ||
            clinicId <= 0)
        {
            throw new InvalidOperationException(
                "Clinic Admin ClinicId is missing or invalid.");
        }

        var dbContext = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        await IdentitySeeder.SeedClinicAdminAsync(
            userManager,
            dbContext,
            clinicAdminEmail,
            clinicAdminPassword,
            clinicId);
    }
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();