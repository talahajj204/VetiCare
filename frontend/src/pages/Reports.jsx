import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { getReport, getReportForPrint } from "../api/reportsApi";
import Sidebar from "../components/Sidebar";

import {
  FaFileExcel,
  FaCalendarAlt,
  FaSortAmountDown,
  FaPrint,
} from "react-icons/fa";

const escapePrintText = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });

function Reports() {
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

  const [startDate, setStartDate] = useState(
    toInputDate(firstDayOfMonth)
  );

  const [endDate, setEndDate] = useState(
    toInputDate(lastDayOfMonth)
  );

  const [sortBy, setSortBy] = useState("default");
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const context = useOutletContext();

  const scopeKey =
    `${context?.user?.id ?? ""}:${context?.user?.clinicId ?? ""}`;

  const requestKey = `${scopeKey}:${startDate}:${endDate}`;

  const [reportData, setReportData] = useState(null);
  const [loadError, setLoadError] = useState("");

  const dataReady = reportData?.requestKey === requestKey;

  const appointmentsData = dataReady
    ? reportData.appointments
    : [];

  const vaccinationsData = dataReady
    ? reportData.vaccinations
    : [];

  const invoicesData = dataReady
    ? reportData.invoices
    : [];

  const validRange =
    startDate && endDate && startDate <= endDate;

  const isInsideRange = (date) => {
    if (!validRange) return false;

    return date >= startDate && date <= endDate;
  };

  useEffect(() => {
    if (!validRange) return;

    let disposed = false;
    let controller;

    const load = async () => {
      controller?.abort();
      controller = new AbortController();

      const signal = controller.signal;

      setLoadError("");

      try {
        const report = await getReport(
          startDate,
          endDate,
          { signal }
        );

        if (!disposed && !signal.aborted) {
          setReportData({
            ...report,
            requestKey,
          });
        }
      } catch (error) {
        if (!disposed && !signal.aborted) {
          setReportData(null);
          setLoadError(
            error.message || "Unable to load the report."
          );
        }
      }
    };

    void load();

    window.addEventListener("focus", load);
    window.addEventListener("billingUpdated", load);
    window.addEventListener("reportsUpdated", load);

    return () => {
      disposed = true;
      controller?.abort();

      window.removeEventListener("focus", load);
      window.removeEventListener("billingUpdated", load);
      window.removeEventListener("reportsUpdated", load);
    };
  }, [
    startDate,
    endDate,
    scopeKey,
    requestKey,
    validRange,
  ]);

  const filteredAppointments = useMemo(() => {
    if (!validRange) return [];

    return appointmentsData.filter((item) =>
      isInsideRange(item.date)
    );
  }, [startDate, endDate, appointmentsData]);

  const filteredVaccinations = useMemo(() => {
    if (!validRange) return [];

    return vaccinationsData.filter((item) =>
      isInsideRange(item.date)
    );
  }, [startDate, endDate, vaccinationsData]);

  const filteredInvoices = useMemo(() => {
    if (!validRange) return [];

    return invoicesData.filter((item) =>
      isInsideRange(item.date)
    );
  }, [startDate, endDate, invoicesData]);

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

  const summaryData = useMemo(() => {
    const data = [
      {
        id: 1,
        category: "Appointments",
        total: appointmentTotal,
        description: "Appointments in selected date range",
      },
      {
        id: 2,
        category: "Vaccinations",
        total: vaccinationTotal,
        description: "Vaccinations in selected date range",
      },
      {
        id: 3,
        category: "Invoices",
        total: invoiceTotal,
        description: "Invoices created in selected date range",
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

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value));
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

  const appointmentStatusData = useMemo(() => {
    const counts = Object.create(null);

    filteredAppointments.forEach((appointment) => {
      const status = appointment.status || "Unknown";

      counts[status] = (counts[status] || 0) + 1;
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
    ...appointmentStatusData.map((item) => item.total)
  );

  const revenueByDate = useMemo(() => {
    const revenueMap = Object.create(null);

    filteredInvoices
      .filter((invoice) => invoice.status === "Paid")
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

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";

    const [year, month, day] = dateString
      .split("-")
      .map(Number);

    const date = new Date(year, month - 1, day);

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

    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  };

  const selectedRangeText = validRange
    ? `${formatDisplayDate(startDate)} – ${formatDisplayDate(endDate)}`
    : "Choose a valid date range";

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

  const escapeCsv = (value) => {
    const safeValue = String(value ?? "")
      .replace(/"/g, '""');

    return `"${safeValue}"`;
  };

  const handleExport = () => {
    if (!dataReady) {
      alert(
        loadError ||
          "Wait for the report to load before exporting."
      );
      return;
    }

    if (!validRange) {
      alert("Please select a valid From and To date.");
      return;
    }

    const rows = [
      ["VET CLINIC REPORT"],
      [],
      ["From", formatDisplayDate(startDate)],
      ["To", formatDisplayDate(endDate)],
      [],
      ["Category", "Total", "Description"],
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
        row.map((value) => escapeCsv(value)).join(",")
      )
      .join("\n");

    const blob = new Blob(
      ["\uFEFF" + csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download =
      `clinic-report-${startDate}-to-${endDate}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };  const handlePrintReport = async (report) => {
    if (!validRange || !dataReady) {
      alert(
        loadError ||
          "Wait for a valid report to load before printing."
      );
      return;
    }

    const printWindow = window.open(
      "",
      "_blank",
      "width=1000,height=800"
    );

    if (!printWindow) {
      alert("Please allow pop-ups to print the report.");
      return;
    }

    let fresh;

    try {
      fresh = await getReportForPrint(startDate, endDate);
    } catch (error) {
      printWindow.close();
      alert(
        error.message ||
          "Unable to load the report for printing."
      );
      return;
    }

    if (printWindow.closed) return;

    const printAppointments = fresh.appointments;
    const printVaccinations = fresh.vaccinations;
    const printInvoices = fresh.invoices;

    const paidInvoices = printInvoices.filter(
      (invoice) => invoice.status === "Paid"
    );

    const totals = {
      Appointments: printAppointments.length,
      Vaccinations: printVaccinations.length,
      Invoices: printInvoices.length,
      Revenue: paidInvoices.reduce(
        (total, invoice) => total + invoice.amount,
        0
      ),
    };

    const printedReport = {
      ...report,
      total: totals[report.category],
    };

    const printClinicName = fresh.clinicName;
    const imageValue = fresh.clinicLogo.trim();

    const printLogo =
      /^data:image\/(?:png|jpeg|jpg|webp|gif);base64,/i.test(
        imageValue
      ) ||
      /^https?:\/\//i.test(imageValue) ||
      /^\/(?!\/)/.test(imageValue)
        ? imageValue
        : "";

    let detailsHtml = "";

    if (report.category === "Appointments") {
      detailsHtml = `
        <table>
          <thead>
            <tr>
              <th>Pet</th>
              <th>Owner</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${printAppointments
              .map(
                (item) => `
                  <tr>
                    <td>${escapePrintText(item.pet)}</td>
                    <td>${escapePrintText(item.owner)}</td>
                    <td>${formatDisplayDate(item.date)}</td>
                    <td>${escapePrintText(item.status)}</td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      `;
    }

    if (report.category === "Vaccinations") {
      detailsHtml = `
        <table>
          <thead>
            <tr>
              <th>Pet</th>
              <th>Vaccine</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${printVaccinations
              .map(
                (item) => `
                  <tr>
                    <td>${escapePrintText(item.pet)}</td>
                    <td>${escapePrintText(item.vaccine)}</td>
                    <td>${formatDisplayDate(item.date)}</td>
                    <td>${escapePrintText(item.status)}</td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      `;
    }

    if (
      report.category === "Invoices" ||
      report.category === "Revenue"
    ) {
      const invoiceRows =
        report.category === "Revenue"
          ? paidInvoices
          : printInvoices;

      detailsHtml = `
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceRows
              .map(
                (item) => `
                  <tr>
                    <td>${escapePrintText(item.invoiceNumber)}</td>
                    <td>${formatDisplayDate(item.date)}</td>
                    <td>$${Number(item.amount).toFixed(2)}</td>
                    <td>${escapePrintText(item.status)}</td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      `;
    }

    const totalValue = printedReport.money
      ? `$${Number(printedReport.total).toFixed(2)}`
      : printedReport.total;

    const logoHtml = printLogo
      ? `<img
          class="print-clinic-logo"
          src="${escapePrintText(printLogo)}"
          alt="${escapePrintText(printClinicName)}"
        />`
      : "";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>${escapePrintText(report.category)} Report</title>

          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 35px;
              color: #263238;
            }

            .print-clinic-header {
              display: flex;
              align-items: center;
              gap: 15px;
              margin-bottom: 15px;
            }

            .print-clinic-logo {
              display: block;
              width: 70px;
              height: 70px;
              flex-shrink: 0;
              object-fit: contain;
            }

            h1 {
              color: #55b7b2;
              margin-bottom: 5px;
            }

            .print-clinic-header h1 {
              margin: 0;
              overflow-wrap: anywhere;
            }

            h2 {
              margin-top: 0;
            }

            .range {
              color: #687b7e;
              margin-bottom: 30px;
            }

            .summary {
              padding: 18px;
              margin-bottom: 25px;
              background: #f3fbfa;
              border: 1px solid #d3eae8;
            }

            .total {
              font-size: 24px;
              font-weight: bold;
              color: #55b7b2;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            th,
            td {
              padding: 11px;
              text-align: left;
              border: 1px solid #dce7e6;
            }

            th {
              background: #55b7b2;
              color: white;
            }

            @media print {
              @page {
                margin: 15mm;
              }
            }
          </style>
        </head>

        <body>
          <div class="print-clinic-header">
            ${logoHtml}
            <h1>${escapePrintText(printClinicName)}</h1>
          </div>

          <h2>${escapePrintText(report.category)} Report</h2>

          <div class="range">
            ${formatDisplayDate(startDate)}
            —
            ${formatDisplayDate(endDate)}
          </div>

          <div class="summary">
            <strong>${escapePrintText(report.category)}</strong>
            <br /><br />

            Total:
            <span class="total">${totalValue}</span>

            <br /><br />
            ${escapePrintText(report.description)}
          </div>

          ${detailsHtml}
        </body>
      </html>
    `);

    printWindow.document.close();

    const startPrinting = async () => {
      const images = Array.from(
        printWindow.document.images
      );

      await Promise.all(
        images.map(
          (image) =>
            new Promise((resolve) => {
              if (image.complete) {
                resolve();
                return;
              }

              image.addEventListener("load", resolve, {
                once: true,
              });

              image.addEventListener("error", resolve, {
                once: true,
              });
            })
        )
      );

      if (printWindow.closed) return;

      printWindow.focus();

      setTimeout(() => {
        if (printWindow.closed) return;

        printWindow.print();
        printWindow.close();
      }, 300);
    };

    void startPrinting();
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main reports-page">
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
            disabled={!dataReady || !validRange}
          >
            <FaFileExcel />
            <span>Export</span>
          </button>
        </div>

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
                onChange={(event) => {
                  setStartDate(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <span className="reports-date-separator">—</span>

            <div className="reports-date-field">
              <label>To</label>

              <input
                type="date"
                value={endDate}
                onChange={(event) => {
                  setEndDate(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="reports-quick-buttons">
            <button
              type="button"
              className="reports-quick-date-button"
              onClick={setTodayRange}
            >
              Today
            </button>

            <button
              type="button"
              className="reports-quick-date-button"
              onClick={setLast7Days}
            >
              Last 7 days
            </button>

            <button
              type="button"
              className="reports-quick-date-button"
              onClick={setThisMonth}
            >
              This month
            </button>

            <button
              type="button"
              className="reports-quick-date-button"
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

        {validRange && (loadError || !dataReady) && (
          <div className="reports-date-error">
            {loadError || "Loading report..."}
          </div>
        )}

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

        <div className="reports-charts-grid">
          <div className="reports-chart-card">
            <div className="reports-chart-header">
              <div>
                <h2>Revenue</h2>
                <p>{selectedRangeText}</p>
              </div>

              <strong>${revenueTotal.toFixed(2)}</strong>
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
                    (item.total / maxRevenue) * 100
                  );

                  return (
                    <div
                      className="reports-revenue-column"
                      key={item.date}
                    >
                      <div className="reports-bar-value">
                        ${item.total.toFixed(0)}
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
                        {formatShortDate(item.date)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="reports-chart-card">
            <div className="reports-chart-header">
              <div>
                <h2>Appointments by Status</h2>
                <p>{selectedRangeText}</p>
              </div>

              <strong>{appointmentTotal}</strong>
            </div>

            {appointmentStatusData.length === 0 ? (
              <div className="reports-no-data">
                No data for these dates
              </div>
            ) : (
              <div className="reports-status-chart">
                {appointmentStatusData.map((item) => {
                  const width =
                    (item.total / maxStatusTotal) * 100;

                  return (
                    <div
                      className="reports-status-row"
                      key={item.status}
                    >
                      <div className="reports-status-top">
                        <span>{item.status}</span>
                        <strong>{item.total}</strong>
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
                })}
              </div>
            )}
          </div>
        </div>

        <div className="reports-summary-section">
          <div className="reports-summary-header">
            <div>
              <h2>Summary</h2>
              <p>{selectedRangeText}</p>
            </div>

            <div className="reports-sort-box">
              <FaSortAmountDown />

              <select
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="default">Sort By</option>
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
                  <th>Print</th>
                </tr>
              </thead>

              <tbody>
                {everythingIsZero ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="reports-nothing"
                    >
                      Nothing to show for these dates
                    </td>
                  </tr>
                ) : (
                  paginatedSummaryData.map((report) => (
                    <tr key={report.id}>
                      <td>{report.category}</td>

                      <td>
                        {report.money
                          ? `$${report.total.toFixed(2)}`
                          : report.total}
                      </td>

                      <td>{report.description}</td>

                      <td>
                        <button
                          type="button"
                          className="reports-print-icon-button"
                          disabled={!dataReady || !validRange}
                          onClick={() =>
                            handlePrintReport(report)
                          }
                          title="Print Report"
                          aria-label={`Print ${report.category} report`}
                        >
                          <FaPrint />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!everythingIsZero && (
          <div className="reports-pagination">
            <div className="reports-pagination-left">
              <span className="reports-rows-label">
                Rows per page
              </span>

              <select
                className="reports-rows-select"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="reports-pagination-right">
              <button
                type="button"
                className="reports-page-navigation"
                onClick={handlePreviousPage}
                disabled={safeCurrentPage === 1}
              >
                Previous
              </button>

              <div className="reports-page-numbers">
                {pageNumbers.map((page) => (
                  <button
                    type="button"
                    key={page}
                    className={`reports-page-number ${
                      safeCurrentPage === page
                        ? "active"
                        : ""
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="reports-page-navigation"
                onClick={handleNextPage}
                disabled={safeCurrentPage === totalPages}
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