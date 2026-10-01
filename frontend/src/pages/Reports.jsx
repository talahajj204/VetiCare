import { useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  FaFileExcel,
  FaCalendarAlt,
  FaSortAmountDown,
} from "react-icons/fa";

function Reports() {
  // =========================================================
  // HELPERS
  // =========================================================

  const toInputDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const today = new Date();

  const firstDayOfMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  const lastDayOfMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  );

  // =========================================================
  // DATE RANGE
  // =========================================================

  const [startDate, setStartDate] = useState(
    toInputDate(firstDayOfMonth)
  );

  const [endDate, setEndDate] = useState(
    toInputDate(lastDayOfMonth)
  );

  const [sortBy, setSortBy] = useState("default");

  // =========================================================
  // PAGINATION
  // =========================================================

  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // =========================================================
  // APPOINTMENTS
  // =========================================================

  const appointmentsData = [
    {
      id: 1,
      pet: "Bella",
      owner: "John Smith",
      date: "2026-09-03",
      status: "Completed",
    },
    {
      id: 2,
      pet: "Luna",
      owner: "Emily Johnson",
      date: "2026-09-06",
      status: "Completed",
    },
    {
      id: 3,
      pet: "Max",
      owner: "Daniel Brown",
      date: "2026-09-10",
      status: "Completed",
    },
    {
      id: 4,
      pet: "Charlie",
      owner: "Sophia Wilson",
      date: "2026-09-14",
      status: "Scheduled",
    },
    {
      id: 5,
      pet: "Rocky",
      owner: "James Miller",
      date: "2026-09-18",
      status: "Scheduled",
    },
    {
      id: 6,
      pet: "Milo",
      owner: "Olivia Davis",
      date: "2026-09-22",
      status: "Scheduled",
    },
    {
      id: 7,
      pet: "Lucy",
      owner: "William Taylor",
      date: "2026-09-25",
      status: "Scheduled",
    },
    {
      id: 8,
      pet: "Coco",
      owner: "Emma Anderson",
      date: "2026-09-29",
      status: "Scheduled",
    },
    {
      id: 9,
      pet: "Buddy",
      owner: "Tala El Hajj",
      date: "2026-10-02",
      status: "Confirmed",
    },
    {
      id: 10,
      pet: "Leo",
      owner: "Fatima Abbas",
      date: "2026-10-05",
      status: "Completed",
    },
    {
      id: 11,
      pet: "Nala",
      owner: "Rami Khoury",
      date: "2026-10-09",
      status: "Pending",
    },
    {
      id: 12,
      pet: "Mia",
      owner: "Sarah Haddad",
      date: "2026-10-13",
      status: "Confirmed",
    },
    {
      id: 13,
      pet: "Oscar",
      owner: "Joe Saad",
      date: "2026-10-18",
      status: "Cancelled",
    },
    {
      id: 14,
      pet: "Simba",
      owner: "Maya Nassar",
      date: "2026-10-23",
      status: "Completed",
    },
    {
      id: 15,
      pet: "Loki",
      owner: "Nour Daher",
      date: "2026-10-28",
      status: "Confirmed",
    },
  ];

  // =========================================================
  // VACCINATIONS
  // =========================================================

  const vaccinationsData = [
    {
      id: 1,
      date: "2026-09-06",
      pet: "Luna",
      vaccine: "Rabies",
      status: "Completed",
    },
    {
      id: 2,
      date: "2026-09-22",
      pet: "Milo",
      vaccine: "DHPP",
      status: "Completed",
    },
    {
      id: 3,
      date: "2026-10-03",
      pet: "Buddy",
      vaccine: "Rabies",
      status: "Completed",
    },
    {
      id: 4,
      date: "2026-10-07",
      pet: "Leo",
      vaccine: "DHPP",
      status: "Completed",
    },
    {
      id: 5,
      date: "2026-10-12",
      pet: "Nala",
      vaccine: "Bordetella",
      status: "Completed",
    },
    {
      id: 6,
      date: "2026-10-17",
      pet: "Mia",
      vaccine: "Rabies",
      status: "Completed",
    },
    {
      id: 7,
      date: "2026-10-25",
      pet: "Simba",
      vaccine: "FVRCP",
      status: "Completed",
    },
  ];

  // =========================================================
  // INVOICES
  // =========================================================

  const invoicesData = [
    {
      id: 1,
      invoiceNumber: "INV-001",
      date: "2026-09-29",
      amount: 50,
      status: "Paid",
    },
    {
      id: 2,
      invoiceNumber: "INV-002",
      date: "2026-09-28",
      amount: 35,
      status: "Unpaid",
    },
    {
      id: 3,
      invoiceNumber: "INV-003",
      date: "2026-10-02",
      amount: 55,
      status: "Paid",
    },
    {
      id: 4,
      invoiceNumber: "INV-004",
      date: "2026-10-05",
      amount: 40,
      status: "Paid",
    },
    {
      id: 5,
      invoiceNumber: "INV-005",
      date: "2026-10-09",
      amount: 75,
      status: "Paid",
    },
    {
      id: 6,
      invoiceNumber: "INV-006",
      date: "2026-10-13",
      amount: 35,
      status: "Unpaid",
    },
    {
      id: 7,
      invoiceNumber: "INV-007",
      date: "2026-10-18",
      amount: 90,
      status: "Paid",
    },
    {
      id: 8,
      invoiceNumber: "INV-008",
      date: "2026-10-23",
      amount: 65,
      status: "Paid",
    },
    {
      id: 9,
      invoiceNumber: "INV-009",
      date: "2026-10-28",
      amount: 110,
      status: "Paid",
    },
  ];

  // =========================================================
  // VALID RANGE
  // =========================================================

  const validRange =
    startDate && endDate && startDate <= endDate;

  const isInsideRange = (date) => {
    if (!validRange) return false;

    return date >= startDate && date <= endDate;
  };

  // =========================================================
  // FILTER DATA BY DATE
  // =========================================================

  const filteredAppointments = useMemo(() => {
    if (!validRange) return [];

    return appointmentsData.filter((item) =>
      isInsideRange(item.date)
    );
  }, [startDate, endDate]);

  const filteredVaccinations = useMemo(() => {
    if (!validRange) return [];

    return vaccinationsData.filter((item) =>
      isInsideRange(item.date)
    );
  }, [startDate, endDate]);

  const filteredInvoices = useMemo(() => {
    if (!validRange) return [];

    return invoicesData.filter((item) =>
      isInsideRange(item.date)
    );
  }, [startDate, endDate]);

  // =========================================================
  // TOTALS
  // =========================================================

  const appointmentTotal = filteredAppointments.length;
  const vaccinationTotal = filteredVaccinations.length;
  const invoiceTotal = filteredInvoices.length;

  const revenueTotal = filteredInvoices
    .filter((invoice) => invoice.status === "Paid")
    .reduce(
      (total, invoice) =>
        total + Number(invoice.amount || 0),
      0
    );

  const everythingIsZero =
    appointmentTotal === 0 &&
    vaccinationTotal === 0 &&
    invoiceTotal === 0 &&
    revenueTotal === 0;

  // =========================================================
  // SUMMARY TABLE
  // =========================================================

  const summaryData = useMemo(() => {
    const data = [
      {
        id: 1,
        category: "Appointments",
        total: appointmentTotal,
        description:
          "Appointments in selected date range",
      },
      {
        id: 2,
        category: "Vaccinations",
        total: vaccinationTotal,
        description:
          "Vaccinations in selected date range",
      },
      {
        id: 3,
        category: "Invoices",
        total: invoiceTotal,
        description:
          "Invoices created in selected date range",
      },
      {
        id: 4,
        category: "Revenue",
        total: revenueTotal,
        description: "Revenue from paid invoices",
        money: true,
      },
    ];

    return [...data].sort((a, b) => {
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
  }, [
    appointmentTotal,
    vaccinationTotal,
    invoiceTotal,
    revenueTotal,
    sortBy,
  ]);

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages = Math.max(
    1,
    Math.ceil(summaryData.length / itemsPerPage)
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) * itemsPerPage;

  const paginatedSummaryData = summaryData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((previous) =>
      Math.max(previous - 1, 1)
    );
  };

  const handleNextPage = () => {
    setCurrentPage((previous) =>
      Math.min(previous + 1, totalPages)
    );
  };

  // =========================================================
  // APPOINTMENTS BY STATUS
  // =========================================================

  const appointmentStatusData = useMemo(() => {
    const counts = {};

    filteredAppointments.forEach((appointment) => {
      const status =
        appointment.status || "Unknown";

      counts[status] =
        (counts[status] || 0) + 1;
    });

    return Object.entries(counts).map(
      ([status, total]) => ({
        status,
        total,
      })
    );
  }, [filteredAppointments]);

  const maxStatusTotal = Math.max(
    1,
    ...appointmentStatusData.map(
      (item) => item.total
    )
  );

  // =========================================================
  // REVENUE BY DATE
  // =========================================================

  const revenueByDate = useMemo(() => {
    const revenueMap = {};

    filteredInvoices
      .filter(
        (invoice) => invoice.status === "Paid"
      )
      .forEach((invoice) => {
        revenueMap[invoice.date] =
          (revenueMap[invoice.date] || 0) +
          Number(invoice.amount || 0);
      });

    return Object.entries(revenueMap)
      .sort(([dateA], [dateB]) =>
        dateA.localeCompare(dateB)
      )
      .map(([date, total]) => ({
        date,
        total,
      }));
  }, [filteredInvoices]);

  const maxRevenue = Math.max(
    1,
    ...revenueByDate.map((item) => item.total)
  );

  // =========================================================
  // DATE DISPLAY
  // =========================================================

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";

    const [year, month, day] = dateString
      .split("-")
      .map(Number);

    const date = new Date(
      year,
      month - 1,
      day
    );

    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return "";

    const [year, month, day] = dateString
      .split("-")
      .map(Number);

    const date = new Date(
      year,
      month - 1,
      day
    );

    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  };

  const selectedRangeText = validRange
    ? `${formatDisplayDate(
        startDate
      )} – ${formatDisplayDate(endDate)}`
    : "Choose a valid date range";

  // =========================================================
  // QUICK DATE BUTTONS
  // =========================================================

  const setTodayRange = () => {
    const current = new Date();
    const date = toInputDate(current);

    setStartDate(date);
    setEndDate(date);
    setCurrentPage(1);
  };

  const setLast7Days = () => {
    const current = new Date();

    const previous = new Date(current);
    previous.setDate(current.getDate() - 6);

    setStartDate(toInputDate(previous));
    setEndDate(toInputDate(current));
    setCurrentPage(1);
  };

  const setThisMonth = () => {
    const current = new Date();

    const first = new Date(
      current.getFullYear(),
      current.getMonth(),
      1
    );

    const last = new Date(
      current.getFullYear(),
      current.getMonth() + 1,
      0
    );

    setStartDate(toInputDate(first));
    setEndDate(toInputDate(last));
    setCurrentPage(1);
  };

  const setThisYear = () => {
    const current = new Date();

    const first = new Date(
      current.getFullYear(),
      0,
      1
    );

    const last = new Date(
      current.getFullYear(),
      11,
      31
    );

    setStartDate(toInputDate(first));
    setEndDate(toInputDate(last));
    setCurrentPage(1);
  };

  // =========================================================
  // EXPORT
  // =========================================================

  const escapeCsv = (value) => {
    const safeValue = String(
      value ?? ""
    ).replace(/"/g, '""');

    return `"${safeValue}"`;
  };

  const handleExport = () => {
    if (!validRange) {
      alert(
        "Please select a valid From and To date."
      );
      return;
    }

    const rows = [
      ["VET CLINIC REPORT"],
      [],
      [
        "From",
        formatDisplayDate(startDate),
      ],
      ["To", formatDisplayDate(endDate)],
      [],
      [
        "Category",
        "Total",
        "Description",
      ],
      ...summaryData.map((report) => [
        report.category,
        report.money
          ? `$${report.total.toFixed(2)}`
          : report.total,
        report.description,
      ]),
    ];

    const csvContent = rows
      .map((row) =>
        row
          .map((value) => escapeCsv(value))
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      ["\uFEFF" + csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);
    const link =
      document.createElement("a");

    link.href = url;
    link.download = `clinic-report-${startDate}-to-${endDate}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main reports-page">
        {/* HEADER */}

        <div className="reports-main-header">
          <div className="reports-title-area">
            <h1>Reports</h1>

            <p className="reports-selected-range">
              {selectedRangeText}
            </p>
          </div>

          <button
            type="button"
            className="reports-export-button"
            onClick={handleExport}
          >
            <FaFileExcel />
            <span>Export</span>
          </button>
        </div>

        {/* DATE BOX */}

        <div className="reports-date-box">
          <div className="reports-date-box-left">
            <div className="reports-date-icon-box">
              <FaCalendarAlt />
            </div>

            <div className="reports-date-field">
              <label>From</label>

              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <span className="reports-date-separator">
              —
            </span>

            <div className="reports-date-field">
              <label>To</label>

              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="reports-quick-buttons">
            <button
              type="button"
              onClick={setTodayRange}
            >
              Today
            </button>

            <button
              type="button"
              onClick={setLast7Days}
            >
              Last 7 days
            </button>

            <button
              type="button"
              onClick={setThisMonth}
            >
              This month
            </button>

            <button
              type="button"
              onClick={setThisYear}
            >
              This year
            </button>
          </div>
        </div>

        {!validRange && (
          <div className="reports-date-error">
            From date cannot be after To date.
          </div>
        )}

        {/* SUMMARY CARDS */}

        <div className="reports-summary-grid">
          <div className="reports-summary-card">
            <span className="reports-card-label">
              Appointments
            </span>

            <strong className="reports-card-number">
              {appointmentTotal}
            </strong>

            <span className="reports-card-small">
              Selected dates
            </span>
          </div>

          <div className="reports-summary-card">
            <span className="reports-card-label">
              Vaccinations
            </span>

            <strong className="reports-card-number">
              {vaccinationTotal}
            </strong>

            <span className="reports-card-small">
              Selected dates
            </span>
          </div>

          <div className="reports-summary-card">
            <span className="reports-card-label">
              Invoices
            </span>

            <strong className="reports-card-number">
              {invoiceTotal}
            </strong>

            <span className="reports-card-small">
              Selected dates
            </span>
          </div>

          <div className="reports-summary-card">
            <span className="reports-card-label">
              Revenue
            </span>

            <strong className="reports-card-number">
              ${revenueTotal.toFixed(2)}
            </strong>

            <span className="reports-card-small">
              Paid invoices
            </span>
          </div>
        </div>

        {/* CHARTS */}

        <div className="reports-charts-grid">
          {/* REVENUE */}

          <div className="reports-chart-card">
            <div className="reports-chart-header">
              <div>
                <h2>Revenue</h2>
                <p>{selectedRangeText}</p>
              </div>

              <strong>
                ${revenueTotal.toFixed(2)}
              </strong>
            </div>

            {revenueByDate.length === 0 ? (
              <div className="reports-no-data">
                No data for these dates
              </div>
            ) : (
              <div className="reports-revenue-chart">
                {revenueByDate.map((item) => {
                  const height = Math.max(
                    10,
                    (item.total /
                      maxRevenue) *
                      100
                  );

                  return (
                    <div
                      className="reports-revenue-column"
                      key={item.date}
                    >
                      <div className="reports-bar-value">
                        $
                        {item.total.toFixed(
                          0
                        )}
                      </div>

                      <div className="reports-bar-track">
                        <div
                          className="reports-revenue-bar"
                          style={{
                            height: `${height}%`,
                          }}
                        />
                      </div>

                      <span>
                        {formatShortDate(
                          item.date
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* APPOINTMENTS BY STATUS */}

          <div className="reports-chart-card">
            <div className="reports-chart-header">
              <div>
                <h2>
                  Appointments by Status
                </h2>

                <p>
                  {selectedRangeText}
                </p>
              </div>

              <strong>
                {appointmentTotal}
              </strong>
            </div>

            {appointmentStatusData.length ===
            0 ? (
              <div className="reports-no-data">
                No data for these dates
              </div>
            ) : (
              <div className="reports-status-chart">
                {appointmentStatusData.map(
                  (item) => {
                    const width =
                      (item.total /
                        maxStatusTotal) *
                      100;

                    return (
                      <div
                        className="reports-status-row"
                        key={item.status}
                      >
                        <div className="reports-status-top">
                          <span>
                            {item.status}
                          </span>

                          <strong>
                            {item.total}
                          </strong>
                        </div>

                        <div className="reports-status-track">
                          <div
                            className="reports-status-bar"
                            style={{
                              width: `${width}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            SUMMARY TABLE
        ===================================================== */}

        <div className="reports-summary-section">
          <div className="reports-summary-header">
            <div>
              <h2>Summary</h2>

              <p>
                {selectedRangeText}
              </p>
            </div>

            <div className="reports-sort-box">
              <FaSortAmountDown />

              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(
                    e.target.value
                  );
                  setCurrentPage(1);
                }}
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

          <div className="owners-table-container reports-table-container">
            <table className="owners-table reports-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Total</th>
                  <th>Description</th>
                </tr>
              </thead>

              <tbody>
                {everythingIsZero ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="reports-nothing"
                    >
                      Nothing to show for
                      these dates
                    </td>
                  </tr>
                ) : (
                  paginatedSummaryData.map(
                    (report) => (
                      <tr key={report.id}>
                        <td>
                          {
                            report.category
                          }
                        </td>

                        <td>
                          {report.money
                            ? `$${report.total.toFixed(
                                2
                              )}`
                            : report.total}
                        </td>

                        <td>
                          {
                            report.description
                          }
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* =====================================================
            PAGINATION - LAST THING ON PAGE
        ===================================================== */}

        {!everythingIsZero && (
          <div className="reports-pagination">
            <div className="reports-pagination-left">
              <span className="reports-rows-label">
                Rows per page
              </span>

              <select
                className="reports-rows-select"
                value={itemsPerPage}
                onChange={
                  handleItemsPerPageChange
                }
              >
                <option value={5}>
                  5
                </option>

                <option value={10}>
                  10
                </option>

                <option value={20}>
                  20
                </option>

                <option value={50}>
                  50
                </option>
              </select>
            </div>

            <div className="reports-pagination-right">
              <button
                type="button"
                className="reports-page-navigation"
                onClick={
                  handlePreviousPage
                }
                disabled={
                  safeCurrentPage === 1
                }
              >
                Previous
              </button>

              <div className="reports-page-numbers">
                {pageNumbers.map(
                  (page) => (
                    <button
                      type="button"
                      key={page}
                      className={`reports-page-number ${
                        safeCurrentPage ===
                        page
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setCurrentPage(
                          page
                        )
                      }
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                className="reports-page-navigation"
                onClick={
                  handleNextPage
                }
                disabled={
                  safeCurrentPage ===
                  totalPages
                }
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Reports;