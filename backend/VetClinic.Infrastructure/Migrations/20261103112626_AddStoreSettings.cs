using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VetClinic.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStoreSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StoreSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClinicId = table.Column<int>(type: "int", nullable: false),
                    StoreName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    StoreDescription = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(254)", maxLength: 254, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PhoneNumbers = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Address = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    StoreBanner = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HomeBanner = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HomeBannerBadge = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    HomeBannerTitle = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    HomeBannerDescription = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    HomeBannerButtonText = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AboutTitle = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    AboutDescription = table.Column<string>(type: "nvarchar(max)", maxLength: 10000, nullable: false),
                    AboutImage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Timeline1Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Timeline1Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Timeline2Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Timeline2Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Timeline3Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Timeline3Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    ContactEmail = table.Column<string>(type: "nvarchar(254)", maxLength: 254, nullable: false),
                    ContactAddress = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    ContactDescription = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Instagram = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: false),
                    Facebook = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: false),
                    SocialWhatsapp = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: false),
                    Tiktok = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: false),
                    PrimaryColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    SecondaryColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    LightColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    BorderColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    BackgroundColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    TextColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    ButtonColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    ButtonTextColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    FooterColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StoreSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StoreSettings_Clinics_ClinicId",
                        column: x => x.ClinicId,
                        principalTable: "Clinics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StoreSettings_ClinicId",
                table: "StoreSettings",
                column: "ClinicId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StoreSettings");
        }
    }
}
