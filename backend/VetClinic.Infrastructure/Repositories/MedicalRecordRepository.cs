using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Infrastructure.Repositories;

public class MedicalRecordRepository : IMedicalRecordRepository
{
    private readonly AppDbContext _context;

    public MedicalRecordRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<MedicalRecord>> GetAllAsync(
        int clinicId,
        int? petId = null)
    {
        var query = _context.MedicalRecords
            .AsNoTracking()
            .Include(record => record.Pet)
                .ThenInclude(pet => pet.Owner)
            .Where(record => record.ClinicId == clinicId);

        if (petId.HasValue)
        {
            query = query.Where(record =>
                record.PetId == petId.Value);
        }

        return await query
            .OrderByDescending(record => record.Date)
            .ThenByDescending(record => record.Id)
            .ToListAsync();
    }

    public async Task<MedicalRecord?> GetByIdAsync(
        int id,
        int clinicId)
    {
        return await _context.MedicalRecords
            .Include(record => record.Pet)
                .ThenInclude(pet => pet.Owner)
            .SingleOrDefaultAsync(record =>
                record.Id == id &&
                record.ClinicId == clinicId);
    }

    public async Task<MedicalRecord> AddAsync(
        MedicalRecord record)
    {
        _context.MedicalRecords.Add(record);

        await _context.SaveChangesAsync();

        return record;
    }

    public async Task UpdateAsync(MedicalRecord record)
    {
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(MedicalRecord record)
    {
        _context.MedicalRecords.Remove(record);

        await _context.SaveChangesAsync();
    }
}