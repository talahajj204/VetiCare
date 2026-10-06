import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import {
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaDollarSign,
  FaStethoscope,
  FaPlus,
  FaTrash,
  FaFileExcel,
  FaXmark,
} from "react-icons/fa6";

import * as XLSX from "xlsx";

function Financial() {
  const location = useLocation();

  // =========================================================
  // PAGE
  // =========================================================

  const financialTab = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");

    if (tab === "revenue") return "revenue";
    if (tab === "expenses") return "expenses";

    return "overview";
  }, [location.search]);

  const isOverview = financialTab === "overview";
  const isRevenue = financialTab === "revenue";
  const isExpenses = financialTab === "expenses";

  // =========================================================
  // REVENUES
  // =========================================================

  const [revenues, setRevenues] = useState(() => {
    const saved = localStorage.getItem("financialRevenues");

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // use default data
      }
    }

    return [
      {
        id: 1,
        date: "2026-05-08",
        type: "Visit",
        description: "General consultation",
        amount: 380,
      },
      {
        id: 2,
        date: "2026-06-12",
        type: "Vaccination",
        description: "Vaccination services",
        amount: 520,
      },
      {
        id: 3,
        date: "2026-07-18",
        type: "Visit",
        description: "Pet examination",
        amount: 430,
      },
      {
        id: 4,
        date: "2026-08-14",
        type: "Surgery",
        description: "Minor surgery",
        amount: 720,
      },
      {
        id: 5,
        date: "2026-09-10",
        type: "Visit",
        description: "General consultation",
        amount: 610,
      },
      {
        id: 6,
        date: "2026-10-04",
        type: "Medication",
        description: "Medication sales",
        amount: 760,
      },
      {
        id: 7,
        date: "2026-11-11",
        type: "Visit",
        description: "Pet examination",
        amount: 840,
      },
      {
        id: 8,
        date: "2026-12-05",
        type: "Vaccination",
        description: "Vaccination services",
        amount: 920,
      },
    ];
  });

  // =========================================================
  // EXPENSES
  // =========================================================

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem("financialExpenses");

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // use default data
      }
    }

    return [
      {
        id: 1,
        date: "2026-05-10",
        type: "Medical Supplies",
        description: "Syringes and gloves",
        amount: 150,
      },
      {
        id: 2,
        date: "2026-06-15",
        type: "Medication",
        description: "Medication stock",
        amount: 210,
      },
      {
        id: 3,
        date: "2026-07-08",
        type: "Utilities",
        description: "Electricity and water",
        amount: 180,
      },
      {
        id: 4,
        date: "2026-08-20",
        type: "Equipment",
        description: "Medical equipment",
        amount: 260,
      },
      {
        id: 5,
        date: "2026-09-13",
        type: "Maintenance",
        description: "Clinic maintenance",
        amount: 200,
      },
      {
        id: 6,
        date: "2026-10-09",
        type: "Medical Supplies",
        description: "Medical supplies",
        amount: 290,
      },
      {
        id: 7,
        date: "2026-11-18",
        type: "Utilities",
        description: "Clinic utilities",
        amount: 240,
      },
      {
        id: 8,
        date: "2026-12-12",
        type: "Medication",
        description: "Medication stock",
        amount: 320,
      },
    ];
  });

  // =========================================================
  // MODALS
  // =========================================================

  const [showRevenueModal, setShowRevenueModal] =
    useState(false);

  const [showExpenseModal, setShowExpenseModal] =
    useState(false);

  // =========================================================
  // CHART
  // =========================================================

  const [chartMetric, setChartMetric] = useState("all");
  const [chartPeriod, setChartPeriod] = useState("month");

  // =========================================================
  // FORMS
  // =========================================================

  const [newRevenue, setNewRevenue] = useState({
    date: "",
    type: "Visit",
    description: "",
    amount: "",
  });

  const [newExpense, setNewExpense] = useState({
    date: "",
    type: "Medical Supplies",
    description: "",
    amount: "",
  });

  // =========================================================
  // PAGINATION
  // =========================================================

  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const totalRows = isRevenue
    ? revenues.length
    : isExpenses
      ? expenses.length
      : 0;

  const totalPages = Math.max(
    1,
    Math.ceil(totalRows / itemsPerPage)
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) * itemsPerPage;

  const endIndex = startIndex + itemsPerPage;

  const paginatedRevenues = revenues.slice(
    startIndex,
    endIndex
  );

  const paginatedExpenses = expenses.slice(
    startIndex,
    endIndex
  );

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [financialTab]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // =========================================================
  // LOCAL STORAGE
  // =========================================================

  useEffect(() => {
    localStorage.setItem(
      "financialRevenues",
      JSON.stringify(revenues)
    );
  }, [revenues]);

  useEffect(() => {
    localStorage.setItem(
      "financialExpenses",
      JSON.stringify(expenses)
    );
  }, [expenses]);

  // =========================================================
  // TOTALS
  // =========================================================

  const totalRevenue = revenues.reduce(
    (total, item) =>
      total + Number(item.amount || 0),
    0
  );

  const totalExpenses = expenses.reduce(
    (total, item) =>
      total + Number(item.amount || 0),
    0
  );

  const netProfit = totalRevenue - totalExpenses;

  const totalVisits = revenues.filter(
    (item) => item.type === "Visit"
  ).length;

  const visitRevenue = revenues
    .filter((item) => item.type === "Visit")
    .reduce(
      (total, item) =>
        total + Number(item.amount || 0),
      0
    );

  const averageVisitRevenue =
    totalVisits > 0
      ? visitRevenue / totalVisits
      : 0;

  // =========================================================
  // MONTHLY DATA
  // =========================================================

  const monthlyData = useMemo(() => {
    const months = [
      { number: "01", label: "Jan" },
      { number: "02", label: "Feb" },
      { number: "03", label: "Mar" },
      { number: "04", label: "Apr" },
      { number: "05", label: "May" },
      { number: "06", label: "Jun" },
      { number: "07", label: "Jul" },
      { number: "08", label: "Aug" },
      { number: "09", label: "Sep" },
      { number: "10", label: "Oct" },
      { number: "11", label: "Nov" },
      { number: "12", label: "Dec" },
    ];

    return months.map((month) => {
      const revenue = revenues
        .filter(
          (item) =>
            item.date?.slice(5, 7) ===
            month.number
        )
        .reduce(
          (total, item) =>
            total + Number(item.amount || 0),
          0
        );

      const expense = expenses
        .filter(
          (item) =>
            item.date?.slice(5, 7) ===
            month.number
        )
        .reduce(
          (total, item) =>
            total + Number(item.amount || 0),
          0
        );

      return {
        month: month.label,
        revenue,
        expense,
        profit: revenue - expense,
      };
    });
  }, [revenues, expenses]);

  const maxChartValue = Math.max(
    ...monthlyData.map((item) =>
      Math.max(
        item.revenue,
        item.expense,
        Math.max(item.profit, 0)
      )
    ),
    100
  );

  const chartHeight = 250;

  const getHeight = (value) => {
    if (value <= 0) return 0;

    return (value / maxChartValue) * 190;
  };

  const getLinePoints = () =>
    monthlyData
      .map((item, index) => {
        const x = 60 + index * 75;

        const y =
          chartHeight -
          35 -
          getHeight(Math.max(item.profit, 0));

        return `${x},${y}`;
      })
      .join(" ");

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleRevenueChange = (event) => {
    const { name, value } = event.target;

    setNewRevenue((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleExpenseChange = (event) => {
    const { name, value } = event.target;

    setNewExpense((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // ADD
  // =========================================================

  const handleAddRevenue = (event) => {
    event.preventDefault();

    const revenue = {
      id: Date.now(),
      ...newRevenue,
      amount: Number(newRevenue.amount),
    };

    setRevenues((previous) => [
      ...previous,
      revenue,
    ]);

    setNewRevenue({
      date: "",
      type: "Visit",
      description: "",
      amount: "",
    });

    setShowRevenueModal(false);
  };

  const handleAddExpense = (event) => {
    event.preventDefault();

    const expense = {
      id: Date.now(),
      ...newExpense,
      amount: Number(newExpense.amount),
    };

    setExpenses((previous) => [
      ...previous,
      expense,
    ]);

    setNewExpense({
      date: "",
      type: "Medical Supplies",
      description: "",
      amount: "",
    });

    setShowExpenseModal(false);
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDeleteRevenue = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this revenue?"
    );

    if (!confirmed) return;

    setRevenues((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  const handleDeleteExpense = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmed) return;

    setExpenses((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  // =========================================================
  // EXPORT
  // =========================================================

  const handleExport = () => {
    const summary = [
      {
        Statistic: "Total Revenue",
        Value: totalRevenue,
      },
      {
        Statistic: "Total Expenses",
        Value: totalExpenses,
      },
      {
        Statistic: "Net Profit",
        Value: netProfit,
      },
      {
        Statistic: "Total Visits",
        Value: totalVisits,
      },
      {
        Statistic: "Visit Revenue",
        Value: visitRevenue,
      },
      {
        Statistic: "Average Revenue / Visit",
        Value: averageVisitRevenue.toFixed(2),
      },
    ];

    const revenueData = revenues.map((item) => ({
      Date: item.date,
      Type: item.type,
      Description: item.description,
      Amount: Number(item.amount || 0),
    }));

    const expenseData = expenses.map((item) => ({
      Date: item.date,
      Type: item.type,
      Description: item.description,
      Amount: Number(item.amount || 0),
    }));

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(summary),
      "Summary"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(revenueData),
      "Revenue"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(expenseData),
      "Expenses"
    );

    XLSX.writeFile(
      workbook,
      "Financial_Report.xlsx"
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="page-header financial-page-header">
          <div>
            <h1>
              {isRevenue
                ? "Revenue"
                : isExpenses
                  ? "Expenses"
                  : "Financial"}
            </h1>

            <p>
              {isRevenue
                ? "Track all clinic revenue and income"
                : isExpenses
                  ? "Track all clinic expenses and spending"
                  : "Manage clinic revenues, expenses and financial performance"}
            </p>
          </div>

          {isOverview && (
            <button
              type="button"
              className="financial-export-button"
              onClick={handleExport}
            >
              <FaFileExcel />
              Export
            </button>
          )}
        </div>

        {/* =====================================================
            FINANCIAL OVERVIEW ONLY
        ===================================================== */}

        {isOverview && (
          <>
            {/* STATS */}

            <div className="financial-stats">
              <div className="financial-stat-card">
                <div className="financial-stat-icon revenue">
                  <FaArrowTrendUp />
                </div>

                <div>
                  <span>Total Revenue</span>

                  <h2>
                    ${totalRevenue.toLocaleString()}
                  </h2>

                  <small>All clinic income</small>
                </div>
              </div>

              <div className="financial-stat-card">
                <div className="financial-stat-icon expense">
                  <FaArrowTrendDown />
                </div>

                <div>
                  <span>Total Expenses</span>

                  <h2>
                    ${totalExpenses.toLocaleString()}
                  </h2>

                  <small>
                    Total clinic spending
                  </small>
                </div>
              </div>

              <div className="financial-stat-card">
                <div className="financial-stat-icon profit">
                  <FaDollarSign />
                </div>

                <div>
                  <span>Net Profit</span>

                  <h2>
                    ${netProfit.toLocaleString()}
                  </h2>

                  <small>
                    Revenue - Expenses
                  </small>
                </div>
              </div>

              <div className="financial-stat-card">
                <div className="financial-stat-icon visits">
                  <FaStethoscope />
                </div>

                <div>
                  <span>Total Visits</span>

                  <h2>{totalVisits}</h2>

                  <small>Revenue visits</small>
                </div>
              </div>
            </div>

            {/* =================================================
                FINANCIAL PERFORMANCE
            ================================================= */}

            <section className="financial-analytics-card">
              <div className="financial-analytics-header">
                <div>
                  <h2>
                    Financial Performance
                  </h2>

                  <p>
                    Track clinic revenue,
                    expenses and profit
                    throughout the year
                  </p>
                </div>

                <div className="financial-chart-controls">
                  <div className="financial-filter-box">
                    <span>Filter by</span>

                    <select
                      value={chartMetric}
                      onChange={(event) =>
                        setChartMetric(
                          event.target.value
                        )
                      }
                    >
                      <option value="all">
                        All Financial Data
                      </option>

                      <option value="revenue">
                        Revenue
                      </option>

                      <option value="expenses">
                        Expenses
                      </option>

                      <option value="profit">
                        Profit
                      </option>
                    </select>
                  </div>

                  <button
                    type="button"
                    className="financial-small-export"
                    onClick={handleExport}
                  >
                    <FaFileExcel />
                    Export
                  </button>
                </div>
              </div>

              <div className="financial-chart-wrapper">
                <svg
                  viewBox="0 0 960 290"
                  className="financial-custom-chart"
                  preserveAspectRatio="none"
                >
                  {[40, 85, 130, 175, 220].map(
                    (y) => (
                      <line
                        key={y}
                        x1="35"
                        y1={y}
                        x2="940"
                        y2={y}
                        className="financial-grid-line"
                      />
                    )
                  )}

                  {monthlyData.map(
                    (item, index) => {
                      const x =
                        48 + index * 75;

                      const revenueHeight =
                        getHeight(
                          item.revenue
                        );

                      const expenseHeight =
                        getHeight(
                          item.expense
                        );

                      return (
                        <g key={item.month}>
                          {(chartMetric ===
                            "all" ||
                            chartMetric ===
                              "revenue") && (
                            <rect
                              x={x}
                              y={
                                chartHeight -
                                35 -
                                revenueHeight
                              }
                              width="22"
                              height={
                                revenueHeight
                              }
                              rx="3"
                              className="financial-revenue-bar"
                            />
                          )}

                          {(chartMetric ===
                            "all" ||
                            chartMetric ===
                              "expenses") && (
                            <rect
                              x={x + 24}
                              y={
                                chartHeight -
                                35 -
                                expenseHeight
                              }
                              width="22"
                              height={
                                expenseHeight
                              }
                              rx="3"
                              className="financial-expense-bar"
                            />
                          )}

                          <text
                            x={x + 22}
                            y="270"
                            textAnchor="middle"
                            className="financial-month-label"
                          >
                            {item.month}
                          </text>
                        </g>
                      );
                    }
                  )}

                  {(chartMetric === "all" ||
                    chartMetric ===
                      "profit") && (
                    <>
                      <polyline
                        points={getLinePoints()}
                        fill="none"
                        className="financial-profit-line"
                      />

                      {monthlyData.map(
                        (item, index) => {
                          const x =
                            60 +
                            index * 75;

                          const y =
                            chartHeight -
                            35 -
                            getHeight(
                              Math.max(
                                item.profit,
                                0
                              )
                            );

                          return (
                            <circle
                              key={`profit-${item.month}`}
                              cx={x}
                              cy={y}
                              r="4"
                              className="financial-profit-dot"
                            />
                          );
                        }
                      )}
                    </>
                  )}
                </svg>
              </div>

              <div className="financial-chart-bottom">
                <div className="financial-chart-legend">
                  <div>
                    <span className="legend-dot revenue" />
                    Revenue
                  </div>

                  <div>
                    <span className="legend-dot expense" />
                    Expenses
                  </div>

                  <div>
                    <span className="legend-line profit" />
                    Profit
                  </div>
                </div>

                <div className="financial-period-switch">
                  <span>Graph by:</span>

                  <button
                    type="button"
                    className={
                      chartPeriod === "day"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setChartPeriod("day")
                    }
                  >
                    Day
                  </button>

                  <button
                    type="button"
                    className={
                      chartPeriod === "week"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setChartPeriod("week")
                    }
                  >
                    Week
                  </button>

                  <button
                    type="button"
                    className={
                      chartPeriod === "month"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setChartPeriod("month")
                    }
                  >
                    Month
                  </button>
                </div>
              </div>
            </section>

            {/* =================================================
                SMALL ANALYTICS
            ================================================= */}

            <div className="financial-bottom-analytics">
              <div className="financial-mini-chart-card">
                <div className="financial-mini-title">
                  <div>
                    <h3>
                      Revenue Overview
                    </h3>

                    <p>Revenue by month</p>
                  </div>

                  <FaArrowTrendUp />
                </div>

                <div className="financial-mini-bars">
                  {monthlyData
                    .slice(4, 12)
                    .map((item) => (
                      <div
                        className="financial-mini-bar-item"
                        key={item.month}
                      >
                        <div className="mini-bar-track">
                          <div
                            className="mini-bar-fill revenue"
                            style={{
                              height: `${Math.max(
                                10,
                                (item.revenue /
                                  maxChartValue) *
                                  100
                              )}%`,
                            }}
                          />
                        </div>

                        <span>
                          {item.month}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="financial-mini-chart-card">
                <div className="financial-mini-title">
                  <div>
                    <h3>
                      Financial Summary
                    </h3>

                    <p>
                      Current clinic
                      performance
                    </p>
                  </div>

                  <FaDollarSign />
                </div>

                <div className="financial-summary-list">
                  <div>
                    <span>
                      Visit Revenue
                    </span>

                    <strong>
                      $
                      {visitRevenue.toLocaleString()}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Average / Visit
                    </span>

                    <strong>
                      $
                      {averageVisitRevenue.toFixed(
                        2
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Revenue</span>

                    <strong className="positive">
                      +$
                      {totalRevenue.toLocaleString()}
                    </strong>
                  </div>

                  <div>
                    <span>Expenses</span>

                    <strong className="negative">
                      -$
                      {totalExpenses.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* =====================================================
            REVENUE TABLE ONLY
        ===================================================== */}

        {isRevenue && (
          <section
            className="financial-section"
            id="revenue-table"
          >
            <div className="financial-section-header">
              <div>
                <h2>Revenue</h2>

                <p>
                  Track all clinic revenue
                  and income
                </p>
              </div>

              <button
                type="button"
                className="add-button"
                onClick={() =>
                  setShowRevenueModal(true)
                }
              >
                <FaPlus />
                Add Revenue
              </button>
            </div>

            <div className="owners-table-container">
              <table className="owners-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedRevenues.length >
                  0 ? (
                    paginatedRevenues.map(
                      (revenue) => (
                        <tr key={revenue.id}>
                          <td>
                            {revenue.date}
                          </td>

                          <td>
                            <span className="financial-type-badge revenue-badge">
                              {revenue.type}
                            </span>
                          </td>

                          <td>
                            {revenue.description ||
                              "—"}
                          </td>

                          <td className="financial-amount revenue-amount">
                            +$
                            {Number(
                              revenue.amount ||
                                0
                            ).toLocaleString()}
                          </td>

                          <td>
                            <button
                              type="button"
                              className="delete-button icon-button"
                              onClick={() =>
                                handleDeleteRevenue(
                                  revenue.id
                                )
                              }
                              title="Delete revenue"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="financial-empty-row"
                      >
                        No revenue records
                        found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* =====================================================
            EXPENSE TABLE ONLY
        ===================================================== */}

        {isExpenses && (
          <section
            className="financial-section"
            id="expenses-table"
          >
            <div className="financial-section-header">
              <div>
                <h2>Expenses</h2>

                <p>
                  Track all clinic expenses
                  and spending
                </p>
              </div>

              <button
                type="button"
                className="add-button"
                onClick={() =>
                  setShowExpenseModal(true)
                }
              >
                <FaPlus />
                Add Expense
              </button>
            </div>

            <div className="owners-table-container">
              <table className="owners-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Expense Type</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedExpenses.length >
                  0 ? (
                    paginatedExpenses.map(
                      (expense) => (
                        <tr key={expense.id}>
                          <td>
                            {expense.date}
                          </td>

                          <td>
                            <span className="financial-type-badge expense-badge">
                              {expense.type}
                            </span>
                          </td>

                          <td>
                            {expense.description ||
                              "—"}
                          </td>

                          <td className="financial-amount expense-amount">
                            -$
                            {Number(
                              expense.amount ||
                                0
                            ).toLocaleString()}
                          </td>

                          <td>
                            <button
                              type="button"
                              className="delete-button icon-button"
                              onClick={() =>
                                handleDeleteExpense(
                                  expense.id
                                )
                              }
                              title="Delete expense"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="financial-empty-row"
                      >
                        No expense records
                        found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* =====================================================
            PAGINATION - TABLE PAGES ONLY
        ===================================================== */}

        {(isRevenue || isExpenses) && (
          <div className="financial-page-pagination">
            <div className="financial-pagination-left">
              <span>Rows per page</span>

              <select
                value={itemsPerPage}
                onChange={(event) => {
                  setItemsPerPage(
                    Number(
                      event.target.value
                    )
                  );

                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
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

            <div className="financial-pagination-right">
              <button
                type="button"
                className="financial-pagination-nav"
                disabled={
                  safeCurrentPage === 1
                }
                onClick={() =>
                  setCurrentPage(
                    (previous) =>
                      Math.max(
                        1,
                        previous - 1
                      )
                  )
                }
              >
                &lt;
              </button>

              {pageNumbers.map((page) => (
                <button
                  type="button"
                  key={page}
                  className={`financial-page-number ${
                    safeCurrentPage === page
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setCurrentPage(page)
                  }
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                className="financial-pagination-nav"
                disabled={
                  safeCurrentPage ===
                  totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (previous) =>
                      Math.min(
                        totalPages,
                        previous + 1
                      )
                  )
                }
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </main>

      {/* =====================================================
          ADD REVENUE MODAL
      ===================================================== */}

      {showRevenueModal && (
        <div
          className="modal-overlay"
          onMouseDown={() =>
            setShowRevenueModal(false)
          }
        >
          <div
            className="modal-container"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <h2>Add Revenue</h2>

                <p>
                  Add a new clinic revenue
                  record
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setShowRevenueModal(false)
                }
                aria-label="Close"
              >
                <FaXmark />
              </button>
            </div>

            <form
              onSubmit={handleAddRevenue}
            >
              <div className="form-row">
                <div className="form-field">
                  <label>Date</label>

                  <input
                    type="date"
                    name="date"
                    value={newRevenue.date}
                    onChange={
                      handleRevenueChange
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <label>
                    Revenue Type
                  </label>

                  <select
                    name="type"
                    value={newRevenue.type}
                    onChange={
                      handleRevenueChange
                    }
                    required
                  >
                    <option value="Visit">
                      Visit
                    </option>

                    <option value="Vaccination">
                      Vaccination
                    </option>

                    <option value="Medication">
                      Medication
                    </option>

                    <option value="Prescription">
                      Prescription
                    </option>

                    <option value="Surgery">
                      Surgery
                    </option>

                    <option value="Laboratory">
                      Laboratory
                    </option>

                    <option value="Grooming">
                      Grooming
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Description</label>

                <input
                  type="text"
                  name="description"
                  value={
                    newRevenue.description
                  }
                  onChange={
                    handleRevenueChange
                  }
                  placeholder="Enter revenue description"
                  required
                />
              </div>

              <div className="form-field">
                <label>Amount ($)</label>

                <input
                  type="number"
                  name="amount"
                  value={newRevenue.amount}
                  onChange={
                    handleRevenueChange
                  }
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={() =>
                    setShowRevenueModal(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                >
                  <FaPlus />
                  Add Revenue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          ADD EXPENSE MODAL
      ===================================================== */}

      {showExpenseModal && (
        <div
          className="modal-overlay"
          onMouseDown={() =>
            setShowExpenseModal(false)
          }
        >
          <div
            className="modal-container"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <h2>Add Expense</h2>

                <p>
                  Add a new clinic expense
                  record
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setShowExpenseModal(false)
                }
                aria-label="Close"
              >
                <FaXmark />
              </button>
            </div>

            <form
              onSubmit={handleAddExpense}
            >
              <div className="form-row">
                <div className="form-field">
                  <label>Date</label>

                  <input
                    type="date"
                    name="date"
                    value={newExpense.date}
                    onChange={
                      handleExpenseChange
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <label>
                    Expense Type
                  </label>

                  <select
                    name="type"
                    value={newExpense.type}
                    onChange={
                      handleExpenseChange
                    }
                    required
                  >
                    <option value="Medical Supplies">
                      Medical Supplies
                    </option>

                    <option value="Medication">
                      Medication
                    </option>

                    <option value="Equipment">
                      Equipment
                    </option>

                    <option value="Salary">
                      Salary
                    </option>

                    <option value="Rent">
                      Rent
                    </option>

                    <option value="Utilities">
                      Utilities
                    </option>

                    <option value="Maintenance">
                      Maintenance
                    </option>

                    <option value="Marketing">
                      Marketing
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Description</label>

                <input
                  type="text"
                  name="description"
                  value={
                    newExpense.description
                  }
                  onChange={
                    handleExpenseChange
                  }
                  placeholder="Enter expense description"
                  required
                />
              </div>

              <div className="form-field">
                <label>Amount ($)</label>

                <input
                  type="number"
                  name="amount"
                  value={newExpense.amount}
                  onChange={
                    handleExpenseChange
                  }
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={() =>
                    setShowExpenseModal(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                >
                  <FaPlus />
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Financial;