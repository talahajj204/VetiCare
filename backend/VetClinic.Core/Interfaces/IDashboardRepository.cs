using VetClinic.Core.Entities;

namespace VetClinic.Core.Interfaces;

public interface IDashboardRepository
{
    Task<bool> IsClinicActiveAsync(
        int clinicId,
        CancellationToken cancellationToken = default);

    Task<int> GetTodayAppointmentsCountAsync(
        int clinicId,
        DateOnly today,
        CancellationToken cancellationToken = default);

    Task<List<Pet>> GetPetsAsync(
        int clinicId,
        CancellationToken cancellationToken = default);

    Task<int> GetOwnersCountAsync(
        int clinicId,
        CancellationToken cancellationToken = default);

    Task<List<Appointment>> GetAppointmentsAsync(
        int clinicId,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken = default);

    Task<List<BillingInvoice>> GetInvoicesAsync(
        int clinicId,
        CancellationToken cancellationToken = default);
}
