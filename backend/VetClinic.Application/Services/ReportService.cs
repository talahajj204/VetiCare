using System.ComponentModel.DataAnnotations;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;
using VetClinic.Core.Interfaces;

namespace VetClinic.Application.Services;

public class ReportService : IReportService
{
    private readonly IReportRepository _repository;

    public ReportService(IReportRepository repository)
    {
        _repository = repository;
    }

    public async Task<ReportDto> GetAsync(
        int clinicId,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken = default)
    {
        if (clinicId <= 0)
        {
            throw new ValidationException(
                "A valid clinic is required.");
        }

        if (startDate == default || endDate == default)
        {
            throw new ValidationException(
                "Choose a From date and a To date.");
        }

        if (startDate > endDate)
        {
            throw new ValidationException(
                "From date cannot be after To date.");
        }

        var clinic = await _repository.GetClinicAsync(
            clinicId,
            cancellationToken);

        if (clinic is null)
        {
            throw new ValidationException(
                "The clinic is unavailable.");
        }

        var settings =
            await _repository.GetStoreSettingsAsync(
                clinicId,
                cancellationToken);

        var appointments =
            await _repository.GetAppointmentsAsync(
                clinicId,
                startDate,
                endDate,
                cancellationToken);

        var vaccinations =
            await _repository.GetVaccinationsAsync(
                clinicId,
                startDate,
                endDate,
                cancellationToken);

        var invoices =
            await _repository.GetInvoicesAsync(
                clinicId,
                startDate,
                endDate,
                cancellationToken);

        return new ReportDto
        {
            StartDate = startDate,
            EndDate = endDate,

            ClinicName =
                !string.IsNullOrWhiteSpace(settings?.StoreName)
                    ? settings.StoreName
                    : clinic.Name,

            ClinicLogo =
                !string.IsNullOrWhiteSpace(settings?.StoreBanner)
                    ? settings.StoreBanner
                    : clinic.LogoUrl ?? string.Empty,

            Appointments = appointments
                .Select(appointment =>
                {
                    var owner = appointment.Pet?.Owner;

                    var ownerName = owner is null
                        ? string.Empty
                        : $"{owner.FirstName} {owner.LastName}"
                            .Trim();

                    return new ReportAppointmentDto
                    {
                        Id = appointment.Id,
                        Pet = appointment.Pet?.Name
                            ?? string.Empty,
                        Owner = ownerName,
                        Date = appointment.Date,
                        Status = appointment.Status
                    };
                })
                .ToList(),

            Vaccinations = vaccinations
                .Select(vaccination =>
                    new ReportVaccinationDto
                    {
                        Id = vaccination.Id,
                        Pet = vaccination.Pet?.Name
                            ?? string.Empty,
                        Vaccine = vaccination.Vaccine,
                        Date = vaccination.DateGiven,
                        Status = vaccination.Status
                    })
                .ToList(),

            Invoices = invoices
                .Select(invoice =>
                    new ReportInvoiceDto
                    {
                        Id = invoice.Id,
                        InvoiceNumber = invoice.InvoiceNumber,
                        Date = invoice.Date,
                        Amount = invoice.Total,
                        Status = invoice.Status
                    })
                .ToList()
        };
    }
}