using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Infrastructure.Repositories;

public class ClinicRepository : IClinicRepository
{
    private readonly AppDbContext _context;

    public ClinicRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Clinic>> GetAllAsync()
    {
        return await _context.Clinics
            .AsNoTracking()
            .OrderBy(clinic => clinic.Name)
            .ToListAsync();
    }

    public async Task<Clinic?> GetByIdAsync(int id)
    {
        return await _context.Clinics.FindAsync(id);
    }

    public async Task<Clinic> AddAsync(Clinic clinic)
    {
        _context.Clinics.Add(clinic);

        await _context.SaveChangesAsync();

        return clinic;
    }

    public async Task UpdateAsync(Clinic clinic)
    {
        _context.Clinics.Update(clinic);

        await _context.SaveChangesAsync();
    }
}
