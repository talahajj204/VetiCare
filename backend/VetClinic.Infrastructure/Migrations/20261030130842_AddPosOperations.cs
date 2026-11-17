using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VetClinic.Infrastructure.Migrations
{
    public partial class AddPosOperations : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DeliveredAt",
                table: "Sales",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeliveryStatus",
                table: "Sales",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "NotRequired");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_SaleItems_ClinicId_Id",
                table: "SaleItems",
                columns: new[] { "ClinicId", "Id" });

            migrationBuilder.CreateTable(
                name: "HeldSales",
                columns: table => new
                {
                    Id = table.Column<int>(
                        type: "int",
                        nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),

                    ClinicId = table.Column<int>(
                        type: "int",
                        nullable: false),

                    RequestId = table.Column<Guid>(
                        type: "uniqueidentifier",
                        nullable: false),

                    OwnerId = table.Column<int>(
                        type: "int",
                        nullable: true),

                    CustomerName = table.Column<string>(
                        type: "nvarchar(200)",
                        maxLength: 200,
                        nullable: false),

                    CreatedByUserId = table.Column<string>(
                        type: "nvarchar(450)",
                        maxLength: 450,
                        nullable: false),

                    HasDelivery = table.Column<bool>(
                        type: "bit",
                        nullable: false),

                    Discount = table.Column<decimal>(
                        type: "decimal(18,2)",
                        precision: 18,
                        scale: 2,
                        nullable: false),

                    CreatedAt = table.Column<DateTime>(
                        type: "datetime2",
                        nullable: false),

                    CompletedSaleId = table.Column<int>(
                        type: "int",
                        nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey(
                        "PK_HeldSales",
                        x => x.Id);

                    table.UniqueConstraint(
                        "AK_HeldSales_ClinicId_Id",
                        x => new { x.ClinicId, x.Id });

                    table.ForeignKey(
                        name: "FK_HeldSales_Clinics_ClinicId",
                        column: x => x.ClinicId,
                        principalTable: "Clinics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);

                    table.ForeignKey(
                        name: "FK_HeldSales_Owners_ClinicId_OwnerId",
                        columns: x => new
                        {
                            x.ClinicId,
                            x.OwnerId
                        },
                        principalTable: "Owners",
                        principalColumns: new[] { "ClinicId", "Id" },
                        onDelete: ReferentialAction.Restrict);

                    table.ForeignKey(
                        name: "FK_HeldSales_Sales_ClinicId_CompletedSaleId",
                        columns: x => new
                        {
                            x.ClinicId,
                            x.CompletedSaleId
                        },
                        principalTable: "Sales",
                        principalColumns: new[] { "ClinicId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SaleRefunds",
                columns: table => new
                {
                    Id = table.Column<int>(
                        type: "int",
                        nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),

                    ClinicId = table.Column<int>(
                        type: "int",
                        nullable: false),

                    RequestId = table.Column<Guid>(
                        type: "uniqueidentifier",
                        nullable: false),

                    SaleId = table.Column<int>(
                        type: "int",
                        nullable: false),

                    CreatedByUserId = table.Column<string>(
                        type: "nvarchar(450)",
                        maxLength: 450,
                        nullable: false),

                    Reason = table.Column<string>(
                        type: "nvarchar(1000)",
                        maxLength: 1000,
                        nullable: false),

                    Total = table.Column<decimal>(
                        type: "decimal(18,2)",
                        precision: 18,
                        scale: 2,
                        nullable: false),

                    CreatedAt = table.Column<DateTime>(
                        type: "datetime2",
                        nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey(
                        "PK_SaleRefunds",
                        x => x.Id);

                    table.UniqueConstraint(
                        "AK_SaleRefunds_ClinicId_Id",
                        x => new { x.ClinicId, x.Id });

                    table.ForeignKey(
                        name: "FK_SaleRefunds_Clinics_ClinicId",
                        column: x => x.ClinicId,
                        principalTable: "Clinics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);

                    table.ForeignKey(
                        name: "FK_SaleRefunds_Sales_ClinicId_SaleId",
                        columns: x => new
                        {
                            x.ClinicId,
                            x.SaleId
                        },
                        principalTable: "Sales",
                        principalColumns: new[] { "ClinicId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HeldSaleItems",
                columns: table => new
                {
                    Id = table.Column<int>(
                        type: "int",
                        nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),

                    ClinicId = table.Column<int>(
                        type: "int",
                        nullable: false),

                    HeldSaleId = table.Column<int>(
                        type: "int",
                        nullable: false),

                    ProductId = table.Column<int>(
                        type: "int",
                        nullable: false),

                    ProductName = table.Column<string>(
                        type: "nvarchar(200)",
                        maxLength: 200,
                        nullable: false),

                    Quantity = table.Column<int>(
                        type: "int",
                        nullable: false),

                    UnitPrice = table.Column<decimal>(
                        type: "decimal(18,2)",
                        precision: 18,
                        scale: 2,
                        nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey(
                        "PK_HeldSaleItems",
                        x => x.Id);

                    table.ForeignKey(
                        name: "FK_HeldSaleItems_HeldSales_ClinicId_HeldSaleId",
                        columns: x => new
                        {
                            x.ClinicId,
                            x.HeldSaleId
                        },
                        principalTable: "HeldSales",
                        principalColumns: new[] { "ClinicId", "Id" },
                        onDelete: ReferentialAction.Restrict);

                    table.ForeignKey(
                        name: "FK_HeldSaleItems_Products_ClinicId_ProductId",
                        columns: x => new
                        {
                            x.ClinicId,
                            x.ProductId
                        },
                        principalTable: "Products",
                        principalColumns: new[] { "ClinicId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SaleRefundItems",
                columns: table => new
                {
                    Id = table.Column<int>(
                        type: "int",
                        nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),

                    ClinicId = table.Column<int>(
                        type: "int",
                        nullable: false),

                    SaleRefundId = table.Column<int>(
                        type: "int",
                        nullable: false),

                    SaleItemId = table.Column<int>(
                        type: "int",
                        nullable: false),

                    Quantity = table.Column<int>(
                        type: "int",
                        nullable: false),

                    Amount = table.Column<decimal>(
                        type: "decimal(18,2)",
                        precision: 18,
                        scale: 2,
                        nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey(
                        "PK_SaleRefundItems",
                        x => x.Id);

                    table.ForeignKey(
                        name: "FK_SaleRefundItems_SaleItems_ClinicId_SaleItemId",
                        columns: x => new
                        {
                            x.ClinicId,
                            x.SaleItemId
                        },
                        principalTable: "SaleItems",
                        principalColumns: new[] { "ClinicId", "Id" },
                        onDelete: ReferentialAction.Restrict);

                    table.ForeignKey(
                        name: "FK_SaleRefundItems_SaleRefunds_ClinicId_SaleRefundId",
                        columns: x => new
                        {
                            x.ClinicId,
                            x.SaleRefundId
                        },
                        principalTable: "SaleRefunds",
                        principalColumns: new[] { "ClinicId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Sales_ClinicId_HasDelivery_DeliveryStatus",
                table: "Sales",
                columns: new[]
                {
                    "ClinicId",
                    "HasDelivery",
                    "DeliveryStatus"
                });

            migrationBuilder.CreateIndex(
                name: "IX_HeldSaleItems_ClinicId_HeldSaleId_ProductId",
                table: "HeldSaleItems",
                columns: new[]
                {
                    "ClinicId",
                    "HeldSaleId",
                    "ProductId"
                },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HeldSaleItems_ClinicId_ProductId",
                table: "HeldSaleItems",
                columns: new[] { "ClinicId", "ProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_HeldSales_ClinicId_CompletedSaleId_CreatedAt",
                table: "HeldSales",
                columns: new[]
                {
                    "ClinicId",
                    "CompletedSaleId",
                    "CreatedAt"
                });

            migrationBuilder.CreateIndex(
                name: "IX_HeldSales_ClinicId_OwnerId",
                table: "HeldSales",
                columns: new[] { "ClinicId", "OwnerId" });

            migrationBuilder.CreateIndex(
                name: "IX_HeldSales_ClinicId_RequestId",
                table: "HeldSales",
                columns: new[] { "ClinicId", "RequestId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SaleRefundItems_ClinicId_SaleItemId",
                table: "SaleRefundItems",
                columns: new[] { "ClinicId", "SaleItemId" });

            migrationBuilder.CreateIndex(
                name: "IX_SaleRefundItems_ClinicId_SaleRefundId_SaleItemId",
                table: "SaleRefundItems",
                columns: new[]
                {
                    "ClinicId",
                    "SaleRefundId",
                    "SaleItemId"
                },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SaleRefunds_ClinicId_RequestId",
                table: "SaleRefunds",
                columns: new[] { "ClinicId", "RequestId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SaleRefunds_ClinicId_SaleId",
                table: "SaleRefunds",
                columns: new[] { "ClinicId", "SaleId" });

            migrationBuilder.Sql("""
                UPDATE [Sales]
                SET [DeliveryStatus] =
                    CASE
                        WHEN [HasDelivery] = 1 THEN N'Pending'
                        ELSE N'NotRequired'
                    END;
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HeldSaleItems");

            migrationBuilder.DropTable(
                name: "SaleRefundItems");

            migrationBuilder.DropTable(
                name: "HeldSales");

            migrationBuilder.DropTable(
                name: "SaleRefunds");

            migrationBuilder.DropIndex(
                name: "IX_Sales_ClinicId_HasDelivery_DeliveryStatus",
                table: "Sales");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_SaleItems_ClinicId_Id",
                table: "SaleItems");

            migrationBuilder.DropColumn(
                name: "DeliveredAt",
                table: "Sales");

            migrationBuilder.DropColumn(
                name: "DeliveryStatus",
                table: "Sales");
        }
    }
}