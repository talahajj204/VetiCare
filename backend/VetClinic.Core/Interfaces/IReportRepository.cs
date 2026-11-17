using VetClinic.Core.Entities;

namespace VetClinic.Core.Interfaces;

public interface IReportRepository
{
    Task<Clinic?> GetClinicAsync(
        int clinicId,
        CancellationToken cancellationToken = default);

    Task<StoreSettings?> GetStoreSettingsAsync(
        int clinicId,
        CancellationToken cancellationToken = default);

    Task<List<Appointment>> GetAppointmentsAsync(
        int clinicId,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken = default);

    Task<List<Vaccination>> GetVaccinationsAsync(
        int clinicId,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken = default);

    Task<List<BillingInvoice>> GetInvoicesAsync(
        int clinicId,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken = default);
}