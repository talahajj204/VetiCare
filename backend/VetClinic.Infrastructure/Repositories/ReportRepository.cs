using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Infrastructure.Repositories;

public class ReportRepository : IReportRepository
{
    private readonly AppDbContext _context;

    public ReportRepository(AppDbContext context)
    {
        _context = context;
    }

    public Task<Clinic?> GetClinicAsync(
        int clinicId,
        CancellationToken cancellationToken = default)
    {
        return _context.Clinics
            .AsNoTracking()
            .FirstOrDefaultAsync(
                clinic =>
                    clinic.Id == clinicId &&
                    clinic.IsActive,
                cancellationToken);
    }

    public Task<StoreSettings?> GetStoreSettingsAsync(
        int clinicId,
        CancellationToken cancellationToken = default)
    {
        return _context.StoreSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(
                settings => settings.ClinicId == clinicId,
                cancellationToken);
    }

    public Task<List<Appointment>> GetAppointmentsAsync(
        int clinicId,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken = default)
    {
        return _context.Appointments
            .AsNoTracking()
            .Where(appointment =>
                appointment.ClinicId == clinicId &&
                appointment.Date >= startDate &&
                appointment.Date <= endDate)
            .Include(appointment => appointment.Pet)
                .ThenInclude(pet => pet.Owner)
            .OrderBy(appointment => appointment.Date)
            .ThenBy(appointment => appointment.Time)
            .ThenBy(appointment => appointment.Id)
            .ToListAsync(cancellationToken);
    }

    public Task<List<Vaccination>> GetVaccinationsAsync(
        int clinicId,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken = default)
    {
        return _context.Vaccinations
            .AsNoTracking()
            .Where(vaccination =>
                vaccination.ClinicId == clinicId &&
                vaccination.DateGiven >= startDate &&
                vaccination.DateGiven <= endDate)
            .Include(vaccination => vaccination.Pet)
            .OrderBy(vaccination => vaccination.DateGiven)
            .ThenBy(vaccination => vaccination.Id)
            .ToListAsync(cancellationToken);
    }

    public Task<List<BillingInvoice>> GetInvoicesAsync(
        int clinicId,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken = default)
    {
        return _context.BillingInvoices
            .AsNoTracking()
            .Where(invoice =>
                invoice.ClinicId == clinicId &&
                invoice.Date >= startDate &&
                invoice.Date <= endDate)
            .OrderBy(invoice => invoice.Date)
            .ThenBy(invoice => invoice.Id)
            .ToListAsync(cancellationToken);
    }
}