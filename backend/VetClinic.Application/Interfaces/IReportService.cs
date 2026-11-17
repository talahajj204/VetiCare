using VetClinic.Application.DTOs;

namespace VetClinic.Application.Interfaces;

public interface IReportService
{
    Task<ReportDto> GetAsync(
        int clinicId,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken = default);
}
