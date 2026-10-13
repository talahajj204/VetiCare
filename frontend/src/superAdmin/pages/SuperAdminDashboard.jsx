
import React, { useMemo, useState } from "react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

import {
  FaUsers,
  FaBuilding,
  FaLayerGroup,
  FaCreditCard,
  FaDownload,
  FaChevronDown,
} from "react-icons/fa6";

import SuperAdminSidebar from "../components/SuperAdminSidebar";

/* =====================================================
   DEMO DATA
===================================================== */

const stats = [
  {
    title: "Total Users",
    value: "1,245",
    growth: "+12%",
    icon: FaUsers,
    color: "blue",
  },
  {
    title: "Total Clinics",
    value: "86",
    growth: "+8%",
    icon: FaBuilding,
    color: "green",
  },
  {
    title: "Active Plans",
    value: "12",
    growth: "+20%",
    icon: FaLayerGroup,
    color: "orange",
  },
  {
    title: "Active Subscriptions",
    value: "482",
    growth: "+15%",
    icon: FaCreditCard,
    color: "purple",
  },
];

const statuses = [
  { name: "Active", value: 58, color: "#39aaa5" },
  { name: "Pending", value: 12, color: "#ffc857" },
  { name: "Suspended", value: 8, color: "#ff786c" },
  { name: "Inactive", value: 8, color: "#a5b4be" },
];

const recentActivity = [
  {
    id: 1,
    name: "Al Zahraa Clinic",
    action: "New subscription",
    date: "Oct 9, 2026",
  },
  {
    id: 2,
    name: "Dr. Sara Ahmed",
    action: "Admin created",
    date: "Oct 9, 2026",
  },
  {
    id: 3,
    name: "Healthy Smile",
    action: "Plan upgraded",
    date: "Oct 8, 2026",
  },
  {
    id: 4,
    name: "Mohammad Ali",
    action: "User registered",
    date: "Oct 8, 2026",
  },
  {
    id: 5,
    name: "Bright Care Clinic",
    action: "Subscription expired",
    date: "Oct 7, 2026",
  },
];

const plans = [
  { name: "Basic", subscribers: 180 },
  { name: "Professional", subscribers: 120 },
  { name: "Premium", subscribers: 95 },
  { name: "Enterprise", subscribers: 87 },
];

const periods = [
  "Today",
  "Yesterday",
  "Last Month",
  "Last Year",
  "Last 7 Months",
];

const growthSets = {
  Today: {
    labels: [
      "00:00",
      "04:00",
      "08:00",
      "12:00",
      "16:00",
      "20:00",
      "23:00",
    ],
    values: [3, 5, 8, 12, 18, 23, 27],
  },

  Yesterday: {
    labels: [
      "00:00",
      "04:00",
      "08:00",
      "12:00",
      "16:00",
      "20:00",
      "23:00",
    ],
    values: [2, 4, 7, 11, 15, 19, 22],
  },

  "Last Month": {
    labels: ["1", "5", "10", "15", "20", "25", "30"],
    values: [8, 18, 32, 47, 61, 79, 94],
  },

  "Last Year": {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    values: [
      45, 55, 75, 102, 132, 150,
      188, 205, 230, 251, 275, 310,
    ],
  },

  "Last 7 Months": {
    labels: [
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
    ],
    values: [45, 55, 75, 102, 132, 150, 188],
  },
};

function getGrowth(period) {
  const selected =
    growthSets[period] || growthSets["Last 7 Months"];

  return selected.labels.map((label, index) => ({
    label,
    users: selected.values[index],
  }));
}

/* =====================================================
   CSV EXPORT
===================================================== */

function downloadCSV(filename, rows) {
  if (!rows.length) return;

  const columns = Object.keys(rows[0]);

  const escapeCell = (value) => {
    let text = String(value ?? "");

    // Prevent spreadsheet formula injection.
    if (/^[=+\-@\t\r]/.test(text)) {
      text = "'" + text;
    }

    return `"${text.replace(/"/g, '""')}"`;
  };

  const csv = [
    columns.map(escapeCell).join(","),
    ...rows.map((row) =>
      columns
        .map((column) => escapeCell(row[column]))
        .join(",")
    ),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* =====================================================
   ALL CSS INSIDE JSX
===================================================== */

const styles = `
  /* GLOBAL DASHBOARD RESET */

  .clinic-dashboard,
  .clinic-dashboard * {
    box-sizing: border-box;
  }

  body:has(.clinic-dashboard) {
    overflow: hidden;
  }

  /* ==================================================
     MAIN LAYOUT
  ================================================== */

  .clinic-dashboard {
    --sidebar-size: 235px;

    display: flex;
    flex-direction: row;

    width: 100%;
    max-width: 100%;
    min-width: 0;

    height: 100vh;
    height: 100dvh;

    margin: 0;
    padding: 0;

    overflow: hidden;

    background: #f4f9f8;
    font-family: Inter, Arial, sans-serif;
  }

  .clinic-dashboard.is-collapsed {
    --sidebar-size: 68px;
  }

  .clinic-dashboard-sidebar {
    display: flex;

    flex: 0 0 var(--sidebar-size);

    width: var(--sidebar-size);
    min-width: var(--sidebar-size);
    max-width: var(--sidebar-size);

    height: 100%;
    min-height: 0;

    margin: 0;
    padding: 0;

    overflow: hidden;

    transition:
      flex-basis .2s ease,
      width .2s ease,
      min-width .2s ease,
      max-width .2s ease;
  }

  .clinic-dashboard-main {
    display: block;

    flex: 1 1 0%;
    width: 0;

    min-width: 0;
    min-height: 0;
    max-width: none;

    height: 100%;

    overflow-x: hidden;
    overflow-y: auto;

    overscroll-behavior: contain;

    background: #f4f9f8;
    container-type: inline-size;
  }

  .clinic-dashboard-content {
    display: flex;
    flex-direction: column;

    gap: 19px;

    width: 100%;
    min-width: 0;

    padding: 25px clamp(14px, 2vw, 30px) 40px;
  }

  /* ==================================================
     HEADER
  ================================================== */

  .clinic-dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    flex-wrap: wrap;
    gap: 16px;

    width: 100%;
    min-width: 0;
  }

  .clinic-dashboard-heading {
    flex: 1 1 220px;
    min-width: 0;
  }

  .clinic-dashboard-eyebrow {
    margin: 0 0 9px;

    color: #299e99;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.1px;
  }

  .clinic-dashboard-heading h1 {
    margin: 0 0 9px;

    color: #303737;
    font-size: clamp(22px, 2.2vw, 32px);
    font-weight: 800;
    line-height: 1.2;

    overflow-wrap: anywhere;
  }

  .clinic-dashboard-subtitle {
    margin: 0;

    color: #80929c;
    font-size: 12px;
    line-height: 1.6;
  }

  /* ==================================================
     SELECT CONTROL
  ================================================== */

  .clinic-dashboard-control {
    width: auto !important;
    max-width: 100% !important;
    min-height: 36px !important;

    margin: 0 !important;
    padding: 8px 12px !important;

    border: 1px solid #dcebea !important;
    border-radius: 8px !important;

    background: #ffffff !important;
    color: #536c78 !important;

    font-family: inherit !important;
    font-size: 11px !important;

    cursor: pointer;
  }

  /* ==================================================
     EXPORT BUTTON
  ================================================== */

  .clinic-dashboard-export-wrap {
    position: relative;
    flex-shrink: 0;
    z-index: 10;
  }

  .clinic-dashboard .clinic-dashboard-export-button {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;

    gap: 11px !important;

    width: auto !important;
    min-width: 145px !important;
    min-height: 43px !important;

    margin: 0 !important;
    padding: 11px 15px !important;

    border: 1px solid #36aaa4 !important;
    border-radius: 9px !important;

    background: #36aaa4 !important;
    color: #ffffff !important;

    font-family: inherit !important;
    font-size: 12px !important;
    font-weight: 800 !important;

    box-shadow: none !important;
    cursor: pointer !important;
  }

  .clinic-dashboard .clinic-dashboard-export-button:hover {
    background: #238e8b !important;
  }

  .clinic-dashboard-export-menu {
    position: absolute;

    top: calc(100% + 7px);
    right: 0;

    width: 205px;
    max-width: calc(100vw - 30px);

    padding: 5px;

    border: 1px solid #dcebea;
    border-radius: 10px;

    background: #ffffff;
    box-shadow: 0 12px 28px rgba(20, 60, 65, .13);
  }

  .clinic-dashboard .clinic-dashboard-export-option {
    display: block !important;

    width: 100% !important;
    min-height: 38px !important;

    margin: 0 !important;
    padding: 10px 11px !important;

    border: 0 !important;
    border-radius: 7px !important;

    background: transparent !important;
    color: #35545d !important;

    font-family: inherit !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    text-align: left !important;

    cursor: pointer !important;
  }

  .clinic-dashboard .clinic-dashboard-export-option:hover {
    background: #e8f6f4 !important;
    color: #238e8b !important;
  }

  /* ==================================================
     SMALLER KPI CARDS
  ================================================== */

  .clinic-dashboard-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));

    gap: 12px;

    width: 100%;
    min-width: 0;
  }

  .clinic-dashboard-stat {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    gap: 5px;

    min-width: 0;
    min-height: 118px;

    padding: 12px 14px;

    border: 1px solid rgba(28,75,80,.045);
    border-radius: 12px;

    overflow-wrap: anywhere;
  }

  .clinic-dashboard-stat.blue {
    background: #eaf5fd;
  }

  .clinic-dashboard-stat.green {
    background: #e9f9f1;
  }

  .clinic-dashboard-stat.orange {
    background: #fff3e9;
  }

  .clinic-dashboard-stat.purple {
    background: #f3edfd;
  }

  .clinic-dashboard-stat-icon {
    display: grid;
    place-items: center;

    flex: 0 0 31px;

    width: 31px;
    height: 31px;

    border-radius: 8px;
    background: rgba(255,255,255,.85);

    font-size: 14px;
  }

  .clinic-dashboard-stat.blue .clinic-dashboard-stat-icon {
    color: #168ce6;
  }

  .clinic-dashboard-stat.green .clinic-dashboard-stat-icon {
    color: #15a365;
  }

  .clinic-dashboard-stat.orange .clinic-dashboard-stat-icon {
    color: #fa891e;
  }

  .clinic-dashboard-stat.purple .clinic-dashboard-stat-icon {
    color: #8250e6;
  }

  .clinic-dashboard-stat-title {
    margin: 0;

    color: #71838e;
    font-size: 10px;
    line-height: 1.3;
  }

  .clinic-dashboard-stat-value {
    margin: 0;

    color: #123744;
    font-size: 23px;
    font-weight: 800;
    line-height: 1.1;
  }

  .clinic-dashboard-stat-growth {
    color: #84939c;
    font-size: 9px;
    line-height: 1.3;
  }

  .clinic-dashboard-stat-growth strong {
    color: #13995a;
  }

  /* ==================================================
     TWO COLUMNS - SAME LEVEL
  ================================================== */

  .clinic-dashboard-grid {
    display: grid;

    grid-template-columns:
      minmax(0, 1.35fr)
      minmax(0, 1fr);

    align-items: stretch;
    gap: 18px;

    width: 100%;
    min-width: 0;
  }

  .clinic-dashboard-bottom-grid {
    grid-template-columns:
      minmax(0, 1.25fr)
      minmax(0, 1fr);
  }

  /* ==================================================
     WHITE PANELS - EQUAL HEIGHT
  ================================================== */

  .clinic-dashboard-panel {
    display: flex;
    flex-direction: column;

    width: 100%;
    min-width: 0;
    height: 100%;

    padding: 18px;

    border: 1px solid #dcebea;
    border-radius: 14px;

    background: #ffffff;
    box-shadow: 0 3px 15px rgba(22,55,65,.035);
  }

  .clinic-dashboard-grid:not(.clinic-dashboard-bottom-grid)
    > .clinic-dashboard-panel {
    min-height: 350px;
  }

  .clinic-dashboard-bottom-grid
    > .clinic-dashboard-panel {
    min-height: 350px;
  }

  .clinic-dashboard-panel-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;

    flex-wrap: wrap;
    gap: 10px;

    min-width: 0;
    margin-bottom: 18px;
  }

  .clinic-dashboard-panel-heading h2 {
    margin: 0;
    min-width: 0;

    color: #173944;
    font-size: 15px;
    font-weight: 800;
  }

  /* ==================================================
     RECHARTS
  ================================================== */

  .clinic-dashboard-chart {
    position: relative;

    flex: 1;

    width: 100%;
    min-width: 0;
    min-height: 270px;
    height: 270px;
  }

  .clinic-dashboard-chart .recharts-responsive-container,
  .clinic-dashboard-donut .recharts-responsive-container {
    min-width: 0;
  }

  /* ==================================================
     DONUT
  ================================================== */

  .clinic-dashboard-donut-layout {
    display: grid;

    grid-template-columns:
      minmax(0, 1fr)
      minmax(100px, .8fr);

    align-items: center;
    gap: 10px;

    flex: 1;

    width: 100%;
    min-width: 0;
    min-height: 270px;
  }

  .clinic-dashboard-donut {
    position: relative;

    width: 100%;
    min-width: 0;
    height: 225px;
  }

  .clinic-dashboard-donut-center {
    position: absolute;

    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    display: flex;
    flex-direction: column;
    align-items: center;

    gap: 3px;
    pointer-events: none;
  }

  .clinic-dashboard-donut-center strong {
    color: #173944;
    font-size: 24px;
    line-height: 1;
  }

  .clinic-dashboard-donut-center small {
    color: #91a1a9;
    font-size: 10px;
  }

  .clinic-dashboard-legend {
    display: flex;
    flex-direction: column;

    gap: 15px;
    min-width: 0;
  }

  .clinic-dashboard-legend-row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 8px;
    min-width: 0;

    color: #71838e;
    font-size: 11px;
  }

  .clinic-dashboard-legend-name {
    display: flex;
    align-items: center;

    gap: 8px;
    min-width: 0;
  }

  .clinic-dashboard-legend-dot {
    flex: 0 0 9px;

    width: 9px;
    height: 9px;

    border-radius: 50%;
  }

  .clinic-dashboard-legend-row strong {
    color: #173944;
  }

  /* ==================================================
     RECENT ACTIVITY TABLE
  ================================================== */

  .clinic-dashboard-table {
    width: 100%;
    min-width: 0;

    border-collapse: collapse;
    table-layout: fixed;
  }

  .clinic-dashboard-table th,
  .clinic-dashboard-table td {
    padding: 13px 9px;

    border-bottom: 1px solid #edf1f3;

    color: #526975;
    font-size: 11px;
    text-align: left;

    overflow-wrap: anywhere;
  }

  .clinic-dashboard-table th {
    background: #f5f8fa;
    color: #299e99;
    font-weight: 800;
  }

  .clinic-dashboard-table td strong {
    color: #173944;
  }

  /* ==================================================
     RESPONSIVE
  ================================================== */

  @container (max-width: 1150px) {
    .clinic-dashboard-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @container (max-width: 740px) {
    .clinic-dashboard-grid,
    .clinic-dashboard-bottom-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .clinic-dashboard-donut-layout {
      grid-template-columns:
        minmax(0, 1fr)
        minmax(0, 1fr);
    }
  }

  @container (max-width: 540px) {
    .clinic-dashboard-content {
      gap: 15px;
      padding: 19px 12px 28px;
    }

    .clinic-dashboard-panel {
      padding: 13px;
    }

    .clinic-dashboard-chart {
      min-height: 245px;
      height: 245px;
    }

    .clinic-dashboard-donut-layout {
      grid-template-columns: minmax(0, 1fr);
    }

    .clinic-dashboard-donut {
      height: 215px;
    }

    .clinic-dashboard-legend {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    /* ACTIVITY TABLE BECOMES CARDS */

    .clinic-dashboard-table,
    .clinic-dashboard-table thead,
    .clinic-dashboard-table tbody,
    .clinic-dashboard-table tr,
    .clinic-dashboard-table td {
      display: block;
      width: 100%;
    }

    .clinic-dashboard-table thead {
      display: none;
    }

    .clinic-dashboard-table tbody {
      display: grid;
      gap: 10px;
    }

    .clinic-dashboard-table tr {
      padding: 8px 12px;

      border: 1px solid #e8eff0;
      border-radius: 9px;
    }

    .clinic-dashboard-table td {
      display: flex;
      align-items: center;
      justify-content: space-between;

      gap: 8px;
      padding: 9px 0;

      text-align: right;
    }

    .clinic-dashboard-table td::before {
      content: attr(data-label);

      color: #91a1a9;
      font-size: 10px;
      font-weight: 800;
      text-align: left;
    }
  }

  @container (max-width: 390px) {
    .clinic-dashboard-stats {
      grid-template-columns: minmax(0, 1fr);
    }

    .clinic-dashboard-legend {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (max-width: 600px) {
    .clinic-dashboard {
      --sidebar-size: 68px;
    }
  }
`;

/* =====================================================
   MAIN COMPONENT
===================================================== */

export default function SuperAdminDashboard() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sa_sidebar_collapsed") === "true"
  );

  const [period, setPeriod] = useState("Last 7 Months");

  const [exportOpen, setExportOpen] = useState(false);

  const growthData = useMemo(
    () => getGrowth(period),
    [period]
  );

  const totalClinics = statuses.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const handleSidebarToggle = () => {
    setCollapsed((previous) => {
      const next = !previous;

      localStorage.setItem(
        "sa_sidebar_collapsed",
        String(next)
      );

      return next;
    });
  };

  const exportOptions = [
    {
      label: "Overview CSV",
      filename: "dashboard-overview.csv",
      rows: stats.map(({ title, value, growth }) => ({
        Metric: title,
        Value: value,
        Growth: growth,
      })),
    },
    {
      label: "User Growth CSV",
      filename: "user-growth.csv",
      rows: growthData,
    },
    {
      label: "Clinic Status CSV",
      filename: "clinic-status.csv",
      rows: statuses.map(({ name, value }) => ({
        Status: name,
        Clinics: value,
      })),
    },
    {
      label: "Recent Activity CSV",
      filename: "recent-activity.csv",
      rows: recentActivity,
    },
    {
      label: "Top Plans CSV",
      filename: "top-plans.csv",
      rows: plans,
    },
  ];

  return (
    <>
      <style>{styles}</style>

      <div
        className={`clinic-dashboard ${
          collapsed ? "is-collapsed" : ""
        }`}
      >
        {/* ========================================
            SIDEBAR
        ======================================== */}

        <div className="clinic-dashboard-sidebar">
          <SuperAdminSidebar
            collapsed={collapsed}
            onToggle={handleSidebarToggle}
          />
        </div>

        {/* ========================================
            MAIN CONTENT
        ======================================== */}

        <main className="clinic-dashboard-main">
          <div className="clinic-dashboard-content">

            {/* HEADER */}

            <header className="clinic-dashboard-header">
              <div className="clinic-dashboard-heading">
                <p className="clinic-dashboard-eyebrow">
                  REPORTS & ANALYTICS
                </p>

                <h1>Super Admin Dashboard</h1>

                <p className="clinic-dashboard-subtitle">
                  Overview of clinics, users, plans,
                  subscriptions and system activity.
                </p>
              </div>

              {/* EXPORT BUTTON */}

              <div
                className="clinic-dashboard-export-wrap"
                onBlur={(event) => {
                  if (
                    !event.currentTarget.contains(
                      event.relatedTarget
                    )
                  ) {
                    setExportOpen(false);
                  }
                }}
              >
                <button
                  type="button"
                  className="clinic-dashboard-export-button"
                  onClick={() =>
                    setExportOpen((previous) => !previous)
                  }
                  aria-expanded={exportOpen}
                  aria-haspopup="true"
                >
                  <FaDownload />

                  <span>Export CSV</span>

                  <FaChevronDown size={11} />
                </button>

                {exportOpen && (
                  <div className="clinic-dashboard-export-menu">
                    {exportOptions.map((option) => (
                      <button
                        type="button"
                        key={option.filename}
                        className="clinic-dashboard-export-option"
                        onClick={() => {
                          downloadCSV(
                            option.filename,
                            option.rows
                          );

                          setExportOpen(false);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </header>

            {/* ========================================
                SMALLER KPI CARDS
            ======================================== */}

            <section className="clinic-dashboard-stats">
              {stats.map(
                ({
                  title,
                  value,
                  growth,
                  icon: Icon,
                  color,
                }) => (
                  <article
                    key={title}
                    className={`clinic-dashboard-stat ${color}`}
                  >
                    <div className="clinic-dashboard-stat-icon">
                      <Icon />
                    </div>

                    <p className="clinic-dashboard-stat-title">
                      {title}
                    </p>

                    <h2 className="clinic-dashboard-stat-value">
                      {value}
                    </h2>

                    <div className="clinic-dashboard-stat-growth">
                      <strong>↑ {growth}</strong> vs last month
                    </div>
                  </article>
                )
              )}
            </section>

            {/* ========================================
                USER GROWTH + CLINICS BY STATUS
                SAME ROW AND SAME HEIGHT
            ======================================== */}

            <section className="clinic-dashboard-grid">

              {/* USER GROWTH */}

              <article className="clinic-dashboard-panel">
                <div className="clinic-dashboard-panel-heading">
                  <h2>User Growth</h2>

                  <select
                    className="clinic-dashboard-control"
                    value={period}
                    aria-label="Select user growth period"
                    onChange={(event) =>
                      setPeriod(event.target.value)
                    }
                  >
                    {periods.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="clinic-dashboard-chart">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                    minWidth={0}
                  >
                    <AreaChart
                      data={growthData}
                      margin={{
                        top: 12,
                        right: 12,
                        bottom: 0,
                        left: -22,
                      }}
                    >
                      <defs>
                        <linearGradient
                          id="clinicGrowthGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#39aaa5"
                            stopOpacity={0.23}
                          />

                          <stop
                            offset="100%"
                            stopColor="#39aaa5"
                            stopOpacity={0.015}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        stroke="#edf1f3"
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="label"
                        tick={{
                          fontSize: 10,
                          fill: "#83949c",
                        }}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={10}
                      />

                      <YAxis
                        tick={{
                          fontSize: 10,
                          fill: "#83949c",
                        }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />

                      <Tooltip
                        contentStyle={{
                          border: "1px solid #dcebea",
                          borderRadius: 9,
                          fontSize: 12,
                        }}
                      />

                      <Area
                        type="monotone"
                        dataKey="users"
                        name="Users"
                        stroke="#39aaa5"
                        strokeWidth={3}
                        fill="url(#clinicGrowthGradient)"
                        dot={{
                          r: 3,
                          fill: "#ffffff",
                          stroke: "#39aaa5",
                          strokeWidth: 2,
                        }}
                        activeDot={{ r: 6 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </article>

              {/* CLINICS BY STATUS */}

              <article className="clinic-dashboard-panel">
                <div className="clinic-dashboard-panel-heading">
                  <h2>Clinics by Status</h2>
                </div>

                <div className="clinic-dashboard-donut-layout">
                  <div className="clinic-dashboard-donut">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                      minWidth={0}
                    >
                      <PieChart>
                        <Pie
                          data={statuses}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius="54%"
                          outerRadius="76%"
                          paddingAngle={3}
                          stroke="#ffffff"
                          strokeWidth={2}
                        >
                          {statuses.map((item) => (
                            <Cell
                              key={item.name}
                              fill={item.color}
                            />
                          ))}
                        </Pie>

                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="clinic-dashboard-donut-center">
                      <strong>{totalClinics}</strong>

                      <small>Clinics</small>
                    </div>
                  </div>

                  <div className="clinic-dashboard-legend">
                    {statuses.map((item) => (
                      <div
                        key={item.name}
                        className="clinic-dashboard-legend-row"
                      >
                        <span className="clinic-dashboard-legend-name">
                          <span
                            className="clinic-dashboard-legend-dot"
                            style={{
                              background: item.color,
                            }}
                          />

                          {item.name}
                        </span>

                        <strong>{item.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            </section>

            {/* ========================================
                RECENT ACTIVITY + TOP PLANS
                SAME ROW AND SAME HEIGHT
            ======================================== */}

            <section className="clinic-dashboard-grid clinic-dashboard-bottom-grid">

              {/* RECENT ACTIVITY */}

              <article className="clinic-dashboard-panel">
                <div className="clinic-dashboard-panel-heading">
                  <h2>Recent Activity</h2>
                </div>

                <table className="clinic-dashboard-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Action</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentActivity.map((item) => (
                      <tr key={item.id}>
                        <td data-label="Name">
                          <strong>{item.name}</strong>
                        </td>

                        <td data-label="Action">
                          {item.action}
                        </td>

                        <td data-label="Date">
                          {item.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </article>

              {/* TOP PLANS */}

              <article className="clinic-dashboard-panel">
                <div className="clinic-dashboard-panel-heading">
                  <h2>Top Plans</h2>
                </div>

                <div className="clinic-dashboard-chart">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                    minWidth={0}
                  >
                    <BarChart
                      data={plans}
                      margin={{
                        top: 12,
                        right: 8,
                        bottom: 0,
                        left: -22,
                      }}
                    >
                      <CartesianGrid
                        stroke="#edf1f3"
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        tick={{
                          fontSize: 10,
                          fill: "#83949c",
                        }}
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                        minTickGap={3}
                      />

                      <YAxis
                        tick={{
                          fontSize: 10,
                          fill: "#83949c",
                        }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="subscribers"
                        name="Subscribers"
                        fill="#39aaa5"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={45}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </article>
            </section>

          </div>
        </main>
      </div>
    </>
  );
}
