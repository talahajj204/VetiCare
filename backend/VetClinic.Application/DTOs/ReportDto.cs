namespace VetClinic.Application.DTOs;

public class ReportDto
{
    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    public string ClinicName { get; set; } = string.Empty;

    public string ClinicLogo { get; set; } = string.Empty;

    public List<ReportAppointmentDto> Appointments { get; set; }
        = [];

    public List<ReportVaccinationDto> Vaccinations { get; set; }
        = [];

    public List<ReportInvoiceDto> Invoices { get; set; }
        = [];
}

public class ReportAppointmentDto
{
    public int Id { get; set; }

    public string Pet { get; set; } = string.Empty;

    public string Owner { get; set; } = string.Empty;

    public DateOnly Date { get; set; }

    public string Status { get; set; } = string.Empty;
}

public class ReportVaccinationDto
{
    public int Id { get; set; }

    public string Pet { get; set; } = string.Empty;

    public string Vaccine { get; set; } = string.Empty;

    public DateOnly Date { get; set; }

    public string Status { get; set; } = string.Empty;
}

public class ReportInvoiceDto
{
    public int Id { get; set; }

    public string InvoiceNumber { get; set; } = string.Empty;

    public DateOnly Date { get; set; }

    public decimal Amount { get; set; }

    public string Status { get; set; } = string.Empty;
}