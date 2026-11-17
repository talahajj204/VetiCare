using VetClinic.Application.DTOs;

namespace VetClinic.Application.Interfaces;

public interface IAuditLogService
{
    Task<List<AuditLogDto>> GetAllAsync(
        int clinicId,
        CancellationToken cancellationToken = default);
}