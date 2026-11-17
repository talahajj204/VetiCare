namespace VetClinic.Application.DTOs;

public class DashboardDto
{
    public int TodayAppointments { get; set; }

    public int ActivePets { get; set; }

    public int PetOwners { get; set; }

    public int OutstandingInvoices { get; set; }

    public List<DashboardAppointmentPointDto> Appointments
        { get; set; } = new();

    public List<DashboardPetDistributionDto> PetDistribution
        { get; set; } = new();

    public List<DashboardRevenuePointDto> Revenue
        { get; set; } = new();
}

public class DashboardAppointmentPointDto
{
    public string Month { get; set; } = string.Empty;

    public int Appointments { get; set; }
}

public class DashboardPetDistributionDto
{
    public string Name { get; set; } = string.Empty;

    public int Count { get; set; }

    public decimal Value { get; set; }
}

public class DashboardRevenuePointDto
{
    public string Month { get; set; } = string.Empty;

    public decimal Revenue { get; set; }
}
