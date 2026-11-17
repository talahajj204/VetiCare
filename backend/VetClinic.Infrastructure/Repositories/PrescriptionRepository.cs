using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Infrastructure.Repositories;

public class PrescriptionRepository : IPrescriptionRepository
{
    private readonly AppDbContext _context;

    public PrescriptionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Prescription>> GetAllAsync(
        int clinicId,
        int? petId = null)
    {
        var query = _context.Prescriptions
            .AsNoTracking()
            .Include(prescription => prescription.Clinic)
            .Include(prescription => prescription.Pet)
                .ThenInclude(pet => pet.Owner)
            .Where(prescription => prescription.ClinicId == clinicId);

        if (petId.HasValue)
        {
            query = query.Where(
                prescription => prescription.PetId == petId.Value);
        }

        return await query
            .OrderByDescending(prescription => prescription.Date)
            .ThenByDescending(prescription => prescription.Id)
            .ToListAsync();
    }

    public async Task<Prescription?> GetByIdAsync(
        int id,
        int clinicId)
    {
        return await _context.Prescriptions
            .Include(prescription => prescription.Clinic)
            .Include(prescription => prescription.Pet)
                .ThenInclude(pet => pet.Owner)
            .FirstOrDefaultAsync(prescription =>
                prescription.Id == id &&
                prescription.ClinicId == clinicId);
    }

    public async Task<Prescription> AddAsync(
        Prescription prescription)
    {
        _context.Prescriptions.Add(prescription);

        await _context.SaveChangesAsync();

        return prescription;
    }

    public async Task UpdateAsync(
        Prescription prescription)
    {
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(
        Prescription prescription)
    {
        _context.Prescriptions.Remove(prescription);

        await _context.SaveChangesAsync();
    }
}