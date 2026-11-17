using System.ComponentModel.DataAnnotations;
using System.Globalization;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;
using VetClinic.Core.Interfaces;

namespace VetClinic.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _repository;

    public DashboardService(IDashboardRepository repository)
    {
        _repository = repository;
    }

    public async Task<DashboardDto> GetAsync(
        int clinicId,
        DateOnly today,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken = default)
    {
        if (clinicId <= 0)
        {
            throw new ValidationException(
                "A valid clinic is required.");
        }

        if (today == default ||
            startDate == default ||
            endDate == default)
        {
            throw new ValidationException(
                "Choose valid dates.");
        }

        if (startDate > endDate)
        {
            throw new ValidationException(
                "From date cannot be after To date.");
        }

        if (!await _repository.IsClinicActiveAsync(
                clinicId,
                cancellationToken))
        {
            throw new ValidationException(
                "The clinic is unavailable.");
        }

        var todayAppointments =
            await _repository.GetTodayAppointmentsCountAsync(
                clinicId,
                today,
                cancellationToken);

        var pets = await _repository.GetPetsAsync(
            clinicId,
            cancellationToken);

        var ownersCount =
            await _repository.GetOwnersCountAsync(
                clinicId,
                cancellationToken);

        var appointments =
            await _repository.GetAppointmentsAsync(
                clinicId,
                startDate,
                endDate,
                cancellationToken);

        var invoices = await _repository.GetInvoicesAsync(
            clinicId,
            cancellationToken);

        var appointmentTotals = appointments
            .GroupBy(item => new
            {
                item.Date.Year,
                item.Date.Month
            })
            .ToDictionary(
                group => (group.Key.Year, group.Key.Month),
                group => group.Count());

        var revenueTotals = invoices
            .Where(invoice =>
                invoice.Date >= startDate &&
                invoice.Date <= endDate &&
                IsStatus(invoice.Status, "Paid"))
            .GroupBy(invoice => new
            {
                invoice.Date.Year,
                invoice.Date.Month
            })
            .ToDictionary(
                group => (group.Key.Year, group.Key.Month),
                group => group.Sum(invoice => invoice.Total));

        var result = new DashboardDto
        {
            TodayAppointments = todayAppointments,
            ActivePets = pets.Count,
            PetOwners = ownersCount,

            OutstandingInvoices = invoices.Count(invoice =>
                invoice.Total > 0 &&
                !IsStatus(invoice.Status, "Paid") &&
                !IsStatus(invoice.Status, "Cancelled") &&
                !IsStatus(invoice.Status, "Canceled"))
        };

        var month = new DateOnly(
            startDate.Year,
            startDate.Month,
            1);

        var lastMonth = new DateOnly(
            endDate.Year,
            endDate.Month,
            1);

        while (true)
        {
            var key = (month.Year, month.Month);

            var label = month.ToString(
                "MMM yyyy",
                CultureInfo.InvariantCulture);

            result.Appointments.Add(
                new DashboardAppointmentPointDto
                {
                    Month = label,
                    Appointments =
                        appointmentTotals.GetValueOrDefault(key)
                });

            result.Revenue.Add(
                new DashboardRevenuePointDto
                {
                    Month = label,
                    Revenue =
                        revenueTotals.GetValueOrDefault(key)
                });

            if (month == lastMonth)
            {
                break;
            }

            month = month.AddMonths(1);
        }

        result.PetDistribution = pets
            .GroupBy(
                pet => string.IsNullOrWhiteSpace(pet.Species)
                    ? "Other"
                    : pet.Species.Trim(),
                StringComparer.OrdinalIgnoreCase)
            .Select(group => new DashboardPetDistributionDto
            {
                Name = group.Key,
                Count = group.Count(),
                Value = pets.Count == 0
                    ? 0
                    : decimal.Round(
                        group.Count() * 100m / pets.Count,
                        2)
            })
            .OrderByDescending(item => item.Count)
            .ThenBy(item => item.Name)
            .ToList();

        return result;
    }

    private static bool IsStatus(
        string? value,
        string expected)
    {
        return string.Equals(
            value?.Trim(),
            expected,
            StringComparison.OrdinalIgnoreCase);
    }
}
