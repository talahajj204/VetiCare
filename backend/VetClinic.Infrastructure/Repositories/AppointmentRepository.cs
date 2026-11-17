using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Infrastructure.Repositories;

public class AppointmentRepository : IAppointmentRepository
{
    private readonly AppDbContext _context;

    public AppointmentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Appointment>> GetAllAsync(
        int clinicId,
        int? petId = null)
    {
        var query = _context.Appointments
            .AsNoTracking()
            .Include(appointment => appointment.Pet)
                .ThenInclude(pet => pet.Owner)
            .Where(appointment =>
                appointment.ClinicId == clinicId);

        if (petId.HasValue)
        {
            query = query.Where(appointment =>
                appointment.PetId == petId.Value);
        }

        return await query
            .OrderByDescending(appointment => appointment.Date)
            .ThenByDescending(appointment => appointment.Time)
            .ThenByDescending(appointment => appointment.Id)
            .ToListAsync();
    }

    public async Task<Appointment?> GetByIdAsync(
        int id,
        int clinicId)
    {
        return await _context.Appointments
            .Include(appointment => appointment.Pet)
                .ThenInclude(pet => pet.Owner)
            .FirstOrDefaultAsync(appointment =>
                appointment.Id == id &&
                appointment.ClinicId == clinicId);
    }

    public async Task<Appointment> AddAsync(
        Appointment appointment)
    {
        _context.Appointments.Add(appointment);

        await _context.SaveChangesAsync();

        return appointment;
    }

    public async Task UpdateAsync(
        Appointment appointment)
    {
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(
        Appointment appointment)
    {
        _context.Appointments.Remove(appointment);

        await _context.SaveChangesAsync();
    }
}