using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VetClinic.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitializeClinicManagementDefaults : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE [Clinics]
                SET [Plan] = N'Basic'
                WHERE [Plan] = N'';

                UPDATE [Clinics]
                SET [Subscription] = N'Pending'
                WHERE [Subscription] = N'';

                UPDATE [Clinics]
                SET [AccountStatus] =
                    CASE WHEN [IsActive] = 1
                         THEN N'Active'
                         ELSE N'Suspended'
                    END
                WHERE [AccountStatus] = N'';
            ");


        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
