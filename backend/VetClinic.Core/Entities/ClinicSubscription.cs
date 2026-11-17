namespace VetClinic.Core.Entities;

public class ClinicSubscription
{
    public int Id { get; set; }
    public int ClinicId { get; set; }
    public int PlanId { get; set; }

    public string Clinic { get; set; } = "";
    public string Admin { get; set; } = "";
    public string Email { get; set; } = "";
    public string Billing { get; set; } = "Monthly";

    public decimal Amount { get; set; }
    public decimal Discount { get; set; }

    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }

    public string Notes { get; set; } = "";

    public List<SubscriptionPayment> Payments { get; set; } = [];
}

public class SubscriptionPayment
{
    public int Id { get; set; }
    public int SubscriptionId { get; set; }
    public Guid RequestId { get; set; }

    public decimal Amount { get; set; }
    public DateOnly Date { get; set; }

    public string Method { get; set; } = "Cash";
    public string Notes { get; set; } = "";
}
