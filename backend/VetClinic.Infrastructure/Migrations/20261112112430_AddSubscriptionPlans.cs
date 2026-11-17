using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace VetClinic.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSubscriptionPlans : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SubscriptionPlans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    MonthlyPrice = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    YearlyPrice = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FeaturesJson = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubscriptionPlans", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "SubscriptionPlans",
                columns: new[] { "Id", "Description", "FeaturesJson", "MonthlyPrice", "Name", "Status", "YearlyPrice" },
                values: new object[,]
                {
                    { 1, "Essential tools for small veterinary clinics.", "[\"Appointments\",\"Medical Records\",\"Pet Management\",\"Vaccinations\"]", 19m, "Basic", "Active", 190m },
                    { 2, "Advanced tools for growing veterinary clinics.", "[\"Appointments\",\"Medical Records\",\"Pet Management\",\"Vaccinations\",\"Inventory\",\"Pharmacy\",\"Staff Management\",\"Reports & Analytics\"]", 39m, "Professional", "Active", 390m },
                    { 3, "Complete management for larger clinics.", "[\"Appointments\",\"Medical Records\",\"Pet Management\",\"Vaccinations\",\"Inventory\",\"Pharmacy\",\"Staff Management\",\"Reports & Analytics\",\"Billing & Invoices\",\"Multi-Branch Access\",\"Export Reports\",\"Priority Support\"]", 69m, "Premium", "Active", 690m }
                });

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionPlans_Name",
                table: "SubscriptionPlans",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SubscriptionPlans");
        }
    }
}
