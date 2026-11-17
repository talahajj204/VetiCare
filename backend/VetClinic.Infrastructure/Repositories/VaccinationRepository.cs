using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Infrastructure.Repositories;

public class VaccinationRepository : IVaccinationRepository
{
    private readonly AppDbContext _context;

    public VaccinationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Vaccination>> GetAllAsync(
        int clinicId,
        int? petId = null)
    {
        var query = _context.Vaccinations
            .AsNoTracking()
            .Include(vaccination => vaccination.Pet)
                .ThenInclude(pet => pet.Owner)
            .Where(vaccination =>
                vaccination.ClinicId == clinicId);

        if (petId.HasValue)
        {
            query = query.Where(vaccination =>
                vaccination.PetId == petId.Value);
        }

        return await query
            .OrderByDescending(vaccination =>
                vaccination.DateGiven)
            .ThenByDescending(vaccination =>
                vaccination.Id)
            .ToListAsync();
    }

    public async Task<Vaccination?> GetByIdAsync(
        int id,
        int clinicId)
    {
        return await _context.Vaccinations
            .Include(vaccination => vaccination.Pet)
                .ThenInclude(pet => pet.Owner)
            .FirstOrDefaultAsync(vaccination =>
                vaccination.Id == id &&
                vaccination.ClinicId == clinicId);
    }

    public async Task<Vaccination> AddAsync(
        Vaccination vaccination)
    {
        _context.Vaccinations.Add(vaccination);

        await _context.SaveChangesAsync();

        return vaccination;
    }

    public async Task UpdateAsync(
        Vaccination vaccination)
    {
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(
        Vaccination vaccination)
    {
        _context.Vaccinations.Remove(vaccination);

        await _context.SaveChangesAsync();
    }
}