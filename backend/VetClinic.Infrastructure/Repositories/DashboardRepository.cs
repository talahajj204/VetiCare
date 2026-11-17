using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Infrastructure.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly AppDbContext _context;

    public DashboardRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> IsClinicActiveAsync(
        int clinicId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Clinics
            .AsNoTracking()
            .AnyAsync(
                clinic =>
                    clinic.Id == clinicId &&
                    clinic.IsActive,
                cancellationToken);
    }

    public async Task<int> GetTodayAppointmentsCountAsync(
        int clinicId,
        DateOnly today,
        CancellationToken cancellationToken = default)
    {
        return await _context.Appointments
            .AsNoTracking()
            .CountAsync(
                appointment =>
                    appointment.ClinicId == clinicId &&
                    appointment.Date == today,
                cancellationToken);
    }

    public async Task<List<Pet>> GetPetsAsync(
        int clinicId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Pets
            .AsNoTracking()
            .Where(pet => pet.ClinicId == clinicId)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetOwnersCountAsync(
        int clinicId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Owners
            .AsNoTracking()
            .CountAsync(
                owner => owner.ClinicId == clinicId,
                cancellationToken);
    }

    public async Task<List<Appointment>> GetAppointmentsAsync(
        int clinicId,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken = default)
    {
        return await _context.Appointments
            .AsNoTracking()
            .Where(appointment =>
                appointment.ClinicId == clinicId &&
                appointment.Date >= startDate &&
                appointment.Date <= endDate)
            .OrderBy(appointment => appointment.Date)
            .ThenBy(appointment => appointment.Id)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<BillingInvoice>> GetInvoicesAsync(
        int clinicId,
        CancellationToken cancellationToken = default)
    {
        return await _context.BillingInvoices
            .AsNoTracking()
            .Where(invoice => invoice.ClinicId == clinicId)
            .OrderBy(invoice => invoice.Date)
            .ThenBy(invoice => invoice.Id)
            .ToListAsync(cancellationToken);
    }
}
