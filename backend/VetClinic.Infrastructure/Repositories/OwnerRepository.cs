using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Infrastructure.Repositories;

public class OwnerRepository : IOwnerRepository
{
    private readonly AppDbContext _context;

    public OwnerRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Owner>> GetAllAsync(int clinicId)
    {
        return await _context.Owners
            .AsNoTracking()
            .Where(owner => owner.ClinicId == clinicId && !owner.IsArchived)
            .OrderBy(owner => owner.LastName)
            .ThenBy(owner => owner.FirstName)
            .ToListAsync();
    }

    public async Task<Owner?> GetByIdAsync(
        int id,
        int clinicId)
    {
        return await _context.Owners
            .SingleOrDefaultAsync(owner =>
                owner.Id == id &&
                owner.ClinicId == clinicId &&
                !owner.IsArchived);
    }

    public async Task<Owner> AddAsync(Owner owner)
    {
        _context.Owners.Add(owner);

        await _context.SaveChangesAsync();

        return owner;
    }

    public async Task UpdateAsync(Owner owner)
    {
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Owner owner)
    {
        owner.IsArchived = true;

        await _context.SaveChangesAsync();
    }
}