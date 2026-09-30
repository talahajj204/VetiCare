import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { FaSortAmountDown } from "react-icons/fa";

function Reports() {
  // =========================
  // REPORT DATA
  // =========================

  const reportData = [
    {
      id: 1,
      category: "Appointments",
      total: 120,
      description: "Total appointments this month",
    },
    {
      id: 2,
      category: "Vaccinations",
      total: 45,
      description: "Vaccinations given this month",
    },
    {
      id: 3,
      category: "Prescriptions",
      total: 62,
      description: "Prescriptions created this month",
    },
    {
      id: 4,
      category: "Invoices",
      total: 85,
      description: "Invoices created this month",
    },
  ];

  // =========================
  // SORTING
  // =========================

  const [sortBy, setSortBy] = useState("default");

  const sortedReports = [...reportData].sort((a, b) => {
    if (sortBy === "category-asc") {
      return a.category.localeCompare(b.category);
    }

    if (sortBy === "category-desc") {
      return b.category.localeCompare(a.category);
    }

    if (sortBy === "total-high") {
      return b.total - a.total;
    }

    if (sortBy === "total-low") {
      return a.total - b.total;
    }

    return a.id - b.id;
  });

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-main">

        {/* =========================
            HEADER
        ========================= */}

        <div className="page-header">
          <div>
            <h1>Reports</h1>
            <p>View clinic statistics and reports</p>
          </div>
        </div>

        {/* =========================
            REPORT CARDS
        ========================= */}

        <div className="reports-grid">

          <div className="report-card">
            <h3>Total Appointments</h3>

            <p className="report-number">
              120
            </p>

            <span>This month</span>
          </div>

          <div className="report-card">
            <h3>Total Pets</h3>

            <p className="report-number">
              156
            </p>

            <span>Registered pets</span>
          </div>

          <div className="report-card">
            <h3>Total Owners</h3>

            <p className="report-number">
              98
            </p>

            <span>Registered owners</span>
          </div>

          <div className="report-card">
            <h3>Total Revenue</h3>

            <p className="report-number">
              $4,250
            </p>

            <span>This month</span>
          </div>

        </div>

        {/* =========================
            MONTHLY SUMMARY
        ========================= */}

        <div className="report-section">

          {/* TITLE + SORT */}

          <div className="report-section-header">

            <h2>Monthly Summary</h2>

            <div className="sort-container">

              <FaSortAmountDown className="sort-icon" />

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="default">
                  Sort By
                </option>

                <option value="category-asc">
                  Category A-Z
                </option>

                <option value="category-desc">
                  Category Z-A
                </option>

                <option value="total-high">
                  Total: High to Low
                </option>

                <option value="total-low">
                  Total: Low to High
                </option>
              </select>

            </div>

          </div>

          {/* =========================
              TABLE
          ========================= */}

          <div className="owners-table-container">

            <table className="owners-table">

              <thead>
                <tr>
                  <th>Category</th>
                  <th>Total</th>
                  <th>Description</th>
                </tr>
              </thead>

              <tbody>

                {sortedReports.map((report) => (

                  <tr key={report.id}>

                    <td>
                      {report.category}
                    </td>

                    <td>
                      {report.total}
                    </td>

                    <td>
                      {report.description}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Reports;