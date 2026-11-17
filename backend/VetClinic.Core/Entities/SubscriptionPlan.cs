namespace VetClinic.Core.Entities;

public class SubscriptionPlan
{
    public int Id { get; set; }

    public string Name { get; set; } = "";

    public string Description { get; set; } = "";

    public decimal MonthlyPrice { get; set; }

    public decimal YearlyPrice { get; set; }

    public string Status { get; set; } = "Active";

    public string FeaturesJson { get; set; } = "[]";
}
