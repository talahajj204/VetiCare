using System.ComponentModel.DataAnnotations;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Infrastructure.Repositories;

public class FinancialRepository : IFinancialRepository
{
    private readonly AppDbContext _context;

    public FinancialRepository(AppDbContext context)
    {
        _context = context;
    }

    public Task<bool> IsClinicActiveAsync(int clinicId)
    {
        return _context.Clinics
            .AsNoTracking()
            .AnyAsync(clinic =>
                clinic.Id == clinicId &&
                clinic.IsActive);
    }

    public Task<List<FinancialEntry>> GetAllAsync(
        int clinicId)
    {
        return _context.FinancialEntries
            .AsNoTracking()
            .Where(entry => entry.ClinicId == clinicId)
            .OrderBy(entry => entry.Id)
            .ToListAsync();
    }

    public Task<FinancialEntry?> GetByIdAsync(
        int id,
        int clinicId)
    {
        return _context.FinancialEntries
            .FirstOrDefaultAsync(entry =>
                entry.Id == id &&
                entry.ClinicId == clinicId);
    }

    public Task<FinancialEntry?> GetByRequestIdAsync(
        Guid requestId,
        int clinicId)
    {
        return _context.FinancialEntries
            .FirstOrDefaultAsync(entry =>
                entry.RequestId == requestId &&
                entry.ClinicId == clinicId);
    }

    public async Task AddAsync(FinancialEntry entry)
    {
        await _context.FinancialEntries.AddAsync(entry);
    }

    public void Remove(FinancialEntry entry)
    {
        _context.FinancialEntries.Remove(entry);
    }

    public async Task SaveChangesAsync()
    {
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ValidationException(
                "This record changed or was deleted. Refresh the page and try again.");
        }
        catch (DbUpdateException exception)
            when (exception.InnerException is SqlException sql &&
                  (sql.Number == 2601 || sql.Number == 2627))
        {
            throw new ValidationException(
                "This request has already been saved. Refresh the page before trying again.");
        }
    }

    public async Task<T> ExecuteInTransactionAsync<T>(
        Func<Task<T>> operation)
    {
        var strategy =
            _context.Database.CreateExecutionStrategy();

        return await strategy.ExecuteAsync(async () =>
        {
            await using var transaction =
                await _context.Database.BeginTransactionAsync(
                    System.Data.IsolationLevel.Serializable);

            try
            {
                var result = await operation();

                await transaction.CommitAsync();

                return result;
            }
            catch
            {
                await transaction.RollbackAsync();

                _context.ChangeTracker.Clear();

                throw;
            }
        });
    }
}