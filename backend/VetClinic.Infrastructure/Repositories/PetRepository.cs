using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Infrastructure.Repositories;

public class PetRepository : IPetRepository
{
    private readonly AppDbContext _context;

    public PetRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Pet>> GetAllAsync(int clinicId)
    {
        return await _context.Pets
            .AsNoTracking()
            .Include(pet => pet.Owner)
            .Where(pet => pet.ClinicId == clinicId)
            .OrderBy(pet => pet.Name)
            .ThenBy(pet => pet.Id)
            .ToListAsync();
    }

    public async Task<Pet?> GetByIdAsync(
        int id,
        int clinicId)
    {
        return await _context.Pets
            .Include(pet => pet.Owner)
            .SingleOrDefaultAsync(pet =>
                pet.Id == id &&
                pet.ClinicId == clinicId);
    }

    public async Task<Pet> AddAsync(Pet pet)
    {
        _context.Pets.Add(pet);

        await _context.SaveChangesAsync();

        return pet;
    }

    public async Task UpdateAsync(Pet pet)
    {
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Pet pet)
    {
        _context.Pets.Remove(pet);

        await _context.SaveChangesAsync();
    }
}