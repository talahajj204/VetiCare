using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Infrastructure.Repositories;

public class MedicationRepository : IMedicationRepository
{
    private readonly AppDbContext _context;

    public MedicationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Medication>> GetAllAsync(
        int clinicId,
        int? petId = null)
    {
        var query = _context.Medications
            .AsNoTracking()
            .Include(medication => medication.Pet)
                .ThenInclude(pet => pet.Owner)
            .Where(medication =>
                medication.ClinicId == clinicId);

        if (petId.HasValue)
        {
            query = query.Where(medication =>
                medication.PetId == petId.Value);
        }

        return await query
            .OrderByDescending(medication => medication.StartDate)
            .ThenByDescending(medication => medication.Id)
            .ToListAsync();
    }

    public async Task<Medication?> GetByIdAsync(
        int id,
        int clinicId)
    {
        return await _context.Medications
            .Include(medication => medication.Pet)
                .ThenInclude(pet => pet.Owner)
            .FirstOrDefaultAsync(medication =>
                medication.Id == id &&
                medication.ClinicId == clinicId);
    }

    public async Task<Medication> AddAsync(
        Medication medication)
    {
        _context.Medications.Add(medication);

        await _context.SaveChangesAsync();

        return medication;
    }

    public async Task UpdateAsync(
        Medication medication)
    {
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(
        Medication medication)
    {
        _context.Medications.Remove(medication);

        await _context.SaveChangesAsync();
    }
}