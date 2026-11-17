using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VetClinic.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBillingInvoices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BillingInvoices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClinicId = table.Column<int>(type: "int", nullable: false),
                    RequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InvoiceNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    OwnerName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Total = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    AmountPaid = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BillingInvoices", x => x.Id);
                    table.UniqueConstraint("AK_BillingInvoices_Id_ClinicId", x => new { x.Id, x.ClinicId });
                    table.ForeignKey(
                        name: "FK_BillingInvoices_Clinics_ClinicId",
                        column: x => x.ClinicId,
                        principalTable: "Clinics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BillingInvoiceLines",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClinicId = table.Column<int>(type: "int", nullable: false),
                    BillingInvoiceId = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Total = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BillingInvoiceLines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BillingInvoiceLines_BillingInvoices_BillingInvoiceId_ClinicId",
                        columns: x => new { x.BillingInvoiceId, x.ClinicId },
                        principalTable: "BillingInvoices",
                        principalColumns: new[] { "Id", "ClinicId" },
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BillingPayments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClinicId = table.Column<int>(type: "int", nullable: false),
                    BillingInvoiceId = table.Column<int>(type: "int", nullable: false),
                    RequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    PaymentMethod = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BillingPayments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BillingPayments_BillingInvoices_BillingInvoiceId_ClinicId",
                        columns: x => new { x.BillingInvoiceId, x.ClinicId },
                        principalTable: "BillingInvoices",
                        principalColumns: new[] { "Id", "ClinicId" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BillingInvoiceLines_BillingInvoiceId_ClinicId",
                table: "BillingInvoiceLines",
                columns: new[] { "BillingInvoiceId", "ClinicId" });

            migrationBuilder.CreateIndex(
                name: "IX_BillingInvoiceLines_ClinicId_BillingInvoiceId_SortOrder",
                table: "BillingInvoiceLines",
                columns: new[] { "ClinicId", "BillingInvoiceId", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_BillingInvoices_ClinicId_InvoiceNumber",
                table: "BillingInvoices",
                columns: new[] { "ClinicId", "InvoiceNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BillingInvoices_ClinicId_RequestId",
                table: "BillingInvoices",
                columns: new[] { "ClinicId", "RequestId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BillingPayments_BillingInvoiceId_ClinicId",
                table: "BillingPayments",
                columns: new[] { "BillingInvoiceId", "ClinicId" });

            migrationBuilder.CreateIndex(
                name: "IX_BillingPayments_ClinicId_RequestId",
                table: "BillingPayments",
                columns: new[] { "ClinicId", "RequestId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BillingInvoiceLines");

            migrationBuilder.DropTable(
                name: "BillingPayments");

            migrationBuilder.DropTable(
                name: "BillingInvoices");
        }
    }
}
