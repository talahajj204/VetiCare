using VetClinic.Application.DTOs;

namespace VetClinic.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardDto> GetAsync(
        int clinicId,
        DateOnly today,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken = default);
}
