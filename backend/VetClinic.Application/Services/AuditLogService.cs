using System.ComponentModel.DataAnnotations;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;
using VetClinic.Core.Interfaces;

namespace VetClinic.Application.Services;

public class AuditLogService : IAuditLogService
{
    private readonly IAuditLogRepository _repository;

    public AuditLogService(IAuditLogRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<AuditLogDto>> GetAllAsync(
        int clinicId,
        CancellationToken cancellationToken = default)
    {
        if (clinicId <= 0)
        {
            throw new ValidationException(
                "A valid clinic is required.");
        }

        var clinicIsActive =
            await _repository.IsClinicActiveAsync(
                clinicId,
                cancellationToken);

        if (!clinicIsActive)
        {
            throw new ValidationException(
                "The clinic is unavailable.");
        }

        var entries = await _repository.GetAllAsync(
            clinicId,
            cancellationToken);

        return entries
            .Select(entry => new AuditLogDto
            {
                Id = entry.Id,
                User = entry.UserName,
                Action = entry.Action,
                Record = entry.Record,
                CreatedAt = DateTime.SpecifyKind(
                    entry.CreatedAt,
                    DateTimeKind.Utc)
            })
            .ToList();
    }
}