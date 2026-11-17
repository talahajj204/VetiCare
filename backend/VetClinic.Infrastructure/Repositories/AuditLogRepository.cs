using Microsoft.EntityFrameworkCore;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;
using VetClinic.Infrastructure.Data;

namespace VetClinic.Infrastructure.Repositories;

public class AuditLogRepository : IAuditLogRepository
{
    private readonly AppDbContext _context;

    public AuditLogRepository(AppDbContext context)
    {
        _context = context;
    }

    public Task<bool> IsClinicActiveAsync(
        int clinicId,
        CancellationToken cancellationToken = default)
    {
        return _context.Clinics
            .AsNoTracking()
            .AnyAsync(
                clinic =>
                    clinic.Id == clinicId &&
                    clinic.IsActive,
                cancellationToken);
    }

    public Task<List<AuditLogEntry>> GetAllAsync(
        int clinicId,
        CancellationToken cancellationToken = default)
    {
        return _context.Set<AuditLogEntry>()
            .AsNoTracking()
            .Where(entry => entry.ClinicId == clinicId)
            .OrderByDescending(entry => entry.CreatedAt)
            .ThenByDescending(entry => entry.Id)
            .ToListAsync(cancellationToken);
    }
}