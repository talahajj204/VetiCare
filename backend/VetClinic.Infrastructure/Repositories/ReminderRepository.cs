using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Infrastructure.Repositories;

public class ReminderRepository : IReminderRepository
{
    private readonly AppDbContext _context;

    public ReminderRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Reminder>> GetAllAsync(
        int clinicId,
        int? petId = null)
    {
        var query = _context.Reminders
            .AsNoTracking()
            .Include(reminder => reminder.Pet)
                .ThenInclude(pet => pet.Owner)
            .Where(reminder =>
                reminder.ClinicId == clinicId);

        if (petId.HasValue)
        {
            query = query.Where(reminder =>
                reminder.PetId == petId.Value);
        }

        return await query
            .OrderByDescending(reminder => reminder.DueDate)
            .ThenByDescending(reminder => reminder.Id)
            .ToListAsync();
    }

    public async Task<Reminder?> GetByIdAsync(
        int id,
        int clinicId)
    {
        return await _context.Reminders
            .Include(reminder => reminder.Pet)
                .ThenInclude(pet => pet.Owner)
            .FirstOrDefaultAsync(reminder =>
                reminder.Id == id &&
                reminder.ClinicId == clinicId);
    }

    public async Task<Reminder> AddAsync(
        Reminder reminder)
    {
        _context.Reminders.Add(reminder);

        await _context.SaveChangesAsync();

        return reminder;
    }

    public async Task UpdateAsync(
        Reminder reminder)
    {
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(
        Reminder reminder)
    {
        _context.Reminders.Remove(reminder);

        await _context.SaveChangesAsync();
    }
}