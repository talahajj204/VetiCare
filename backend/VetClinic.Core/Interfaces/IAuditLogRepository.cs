using VetClinic.Core.Entities;

namespace VetClinic.Core.Interfaces;

public interface IAuditLogRepository
{
    Task<bool> IsClinicActiveAsync(
        int clinicId,
        CancellationToken cancellationToken = default);

    Task<List<AuditLogEntry>> GetAllAsync(
        int clinicId,
        CancellationToken cancellationToken = default);
}