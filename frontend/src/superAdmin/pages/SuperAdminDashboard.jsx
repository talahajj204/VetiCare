
import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
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

// ======================================
// HARDCODED DEMO DATA
// ======================================

const stats = [
  {
    title: "Total Users",
    value: 1245,
    growth: "+12%",
    icon: FaUsers,
    color: "blue",
  },
  {
    title: "Total Clinics",
    value: 86,
    growth: "+8%",
    icon: FaBuilding,
    color: "green",
  },
  {
    title: "Active Plans",
    value: 12,
    growth: "+20%",
    icon: FaLayerGroup,
    color: "orange",
  },
  {
    title: "Active Subscriptions",
    value: 482,
    growth: "+15%",
    icon: FaCreditCard,
    color: "purple",
  },
];

const userGrowth = [
  { month: "Jan", users: 45 },
  { month: "Feb", users: 55 },
  { month: "Mar", users: 75 },
  { month: "Apr", users: 102 },
  { month: "May", users: 132 },
  { month: "Jun", users: 150 },
  { month: "Jul", users: 188 },
];

const clinicStatuses = [
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
    date: "Oct 9, 2024",
  },
  {
    id: 2,
    name: "Dr. Sara Ahmed",
    action: "Admin created",
    date: "Oct 9, 2024",
  },
  {
    id: 3,
    name: "Healthy Smile",
    action: "Plan upgraded",
    date: "Oct 8, 2024",
  },
  {
    id: 4,
    name: "Mohammad Ali",
    action: "User registered",
    date: "Oct 8, 2024",
  },
  {
    id: 5,
    name: "Bright Care Clinic",
    action: "Subscription expired",
    date: "Oct 7, 2024",
  },
];

const topPlans = [
  { name: "Basic", subscribers: 180, color: "#39aaa5" },
  { name: "Professional", subscribers: 120, color: "#36a7f7" },
  { name: "Premium", subscribers: 95, color: "#9472f4" },
  { name: "Enterprise", subscribers: 87, color: "#ff9a4b" },
];

const styles = `
.sa-dashboard,
.sa-dashboard * {
  box-sizing: border-box;
}

.sa-dashboard {
  display: flex !important;
  flex-direction: row !important;
  width: 100% !important;
  max-width: none !important;
  min-height: 100vh;
  padding: 0 !important;
  margin: 0 !important;
  background: #f5f8fa;
}

.sa-dashboard-main {
  flex: 1 1 0% !important;
  width: auto !important;
  min-width: 0 !important;
  max-width: none !important;
  padding: 32px !important;
}

.sa-dashboard-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 25px;
}

.sa-dashboard-header-text {
  flex: 1;
  min-width: 0;
}

.sa-dashboard-eyebrow {
  margin: 0 0 10px;
  color: #299d99;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1px;
}

.sa-dashboard-header h1 {
  margin: 0 0 10px;
  color: #143743;
  font-size: clamp(24px, 2.6vw, 32px);
  line-height: 1.3;
}

.sa-dashboard-subtitle {
  margin: 0;
  color: #71838e;
  font-size: 14px;
  line-height: 1.6;
}

.sa-dashboard-export-wrapper {
  position: relative;
  flex: 0 0 auto;
}

.sa-dashboard .sa-dashboard-export {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: auto !important;
  min-width: 140px;
  height: 44px;
  padding: 0 18px !important;
  border: 0;
  border-radius: 10px;
  background: #39aaa5;
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.sa-dashboard .sa-dashboard-export:hover {
  background: #258f8a;
}

.sa-dashboard-export-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 20;
  min-width: 185px;
  padding: 7px;
  background: white;
  border: 1px solid #e7edef;
  border-radius: 11px;
  box-shadow: 0 12px 30px rgba(0,0,0,.12);
}

.sa-dashboard .sa-dashboard-export-option {
  display: block;
  width: 100% !important;
  padding: 11px 12px !important;
  border: 0;
  border-radius: 7px;
  background: white;
  color: #254550;
  text-align: left;
  font-size: 13px;
  cursor: pointer;
}

.sa-dashboard .sa-dashboard-export-option:hover {
  background: #edf8f7;
}

.sa-dashboard-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 18px;
}

.sa-dashboard-stat {
  min-width: 0;
  padding: 22px;
  border-radius: 14px;
  box-shadow: 0 4px 20px rgba(22,55,65,.035);
}

.sa-dashboard-stat.blue {
  background: #edf7ff;
}

.sa-dashboard-stat.green {
  background: #eefbf4;
}

.sa-dashboard-stat.orange {
  background: #fff5ec;
}

.sa-dashboard-stat.purple {
  background: #f5efff;
}

.sa-dashboard-stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-bottom: 17px;
  border-radius: 12px;
  background: rgba(255,255,255,.75);
  font-size: 20px;
}

.sa-dashboard-stat.blue .sa-dashboard-stat-icon {
  color: #168ce6;
}

.sa-dashboard-stat.green .sa-dashboard-stat-icon {
  color: #15a365;
}

.sa-dashboard-stat.orange .sa-dashboard-stat-icon {
  color: #fa891e;
}

.sa-dashboard-stat.purple .sa-dashboard-stat-icon {
  color: #8250e6;
}

.sa-dashboard-stat-value {
  margin: 0 0 6px;
  color: #123744;
  font-size: 30px;
  font-weight: 800;
}

.sa-dashboard-stat-title {
  margin: 0 0 12px;
  color: #71838e;
  font-size: 13px;
}

.sa-dashboard-stat-growth {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #13995a;
  font-size: 12px;
  font-weight: 700;
}

.sa-dashboard-stat-growth span {
  color: #84939c;
  font-weight: 400;
}

.sa-dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 18px;
  margin-bottom: 18px;
}

.sa-dashboard-bottom-grid {
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
}

.sa-dashboard-panel {
  min-width: 0;
  padding: 22px;
  border-radius: 14px;
  background: white;
  box-shadow: 0 4px 20px rgba(22,55,65,.035);
}

.sa-dashboard-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.sa-dashboard-panel-title {
  margin: 0;
  color: #173944;
  font-size: 17px;
  font-weight: 700;
}

.sa-dashboard-period {
  padding: 9px 12px;
  border: 1px solid #e7edef;
  border-radius: 9px;
  background: white;
  color: #71838e;
  font-size: 12px;
}

.sa-dashboard-chart {
  width: 100%;
  height: 250px;
}

.sa-dashboard-pie-layout {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sa-dashboard-pie {
  flex: 1 1 55%;
  min-width: 0;
  height: 250px;
}

.sa-dashboard-legend {
  flex: 1 1 45%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.sa-dashboard-legend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: #627783;
  font-size: 12px;
}

.sa-dashboard-legend-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sa-dashboard-legend-dot {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  border-radius: 50%;
}

.sa-dashboard-table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.sa-dashboard-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.sa-dashboard-table th,
.sa-dashboard-table td {
  padding: 13px 11px;
  border-bottom: 1px solid #edf1f3;
  font-size: 12px;
  text-align: left;
}

.sa-dashboard-table th {
  color: #7a8a94;
  background: #f5f8fa;
  font-weight: 700;
}

.sa-dashboard-table td {
  color: #344e5a;
}

.sa-dashboard-table tbody tr:hover {
  background: #f8fbfb;
}

.sa-dashboard-activity-name {
  color: #173944;
  font-weight: 700;
}

.sa-dashboard .sa-dashboard-view-all {
  width: auto !important;
  padding: 0 !important;
  border: 0;
  background: transparent !important;
  color: #71838e;
  font-size: 12px;
  cursor: pointer;
}

.sa-dashboard .sa-dashboard-view-all:hover {
  color: #299d99;
}

@media (max-width: 1250px) {
  .sa-dashboard-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .sa-dashboard-grid,
  .sa-dashboard-bottom-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .sa-dashboard {
    display: block !important;
  }

  .sa-dashboard-main {
    width: 100% !important;
    padding: 84px 18px 28px !important;
  }

  .sa-dashboard-header {
    flex-direction: column;
  }

  .sa-dashboard-pie-layout {
    flex-direction: column;
  }

  .sa-dashboard-pie,
  .sa-dashboard-legend {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .sa-dashboard-stats {
    grid-template-columns: 1fr;
  }

  .sa-dashboard-main {
    padding: 84px 14px 24px !important;
  }

  .sa-dashboard-panel {
    padding: 16px;
  }
}
`;

// ======================================
// CSV EXPORT
// ======================================

function downloadCSV(filename, rows) {
  if (!rows.length) return;

  const columns = Object.keys(rows[0]);

  const escapeValue = (value) => {
    const raw = String(value ?? "");
    const safe = /^[=+\-@\t\r]/.test(raw) ? "'" + raw : raw;
    return `"${safe.replace(/"/g, '""')}"`;
  };

  const csv = [
    columns.map(escapeValue).join(","),
    ...rows.map((row) =>
      columns.map((key) => escapeValue(row[key])).join(",")
    ),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

// ======================================
// COMPONENT
// ======================================

export default function SuperAdminDashboard() {
  const [exportOpen, setExportOpen] = useState(false);

  const totalClinics = clinicStatuses.reduce(
    (sum, clinic) => sum + clinic.value,
    0
  );

  const exportOptions = [
    {
      label: "Overview CSV",
      filename: "dashboard-overview.csv",
      rows: stats.map((item) => ({
        Metric: item.title,
        Value: item.value,
        Growth: item.growth,
      })),
    },
    {
      label: "User Growth CSV",
      filename: "user-growth.csv",
      rows: userGrowth,
    },
    {
      label: "Clinic Status CSV",
      filename: "clinic-status.csv",
      rows: clinicStatuses.map(({ name, value }) => ({
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
      rows: topPlans.map(({ name, subscribers }) => ({
        Plan: name,
        Subscribers: subscribers,
      })),
    },
  ];

  return (
    <>
      <style>{styles}</style>

      <div className="sa-dashboard">
        <SuperAdminSidebar />

        <main className="sa-dashboard-main">
          <header className="sa-dashboard-header">
            <div className="sa-dashboard-header-text">
              <p className="sa-dashboard-eyebrow">
                REPORTS & ANALYTICS
              </p>

              <h1>Super Admin Dashboard</h1>

              <p className="sa-dashboard-subtitle">
                Overview of clinics, users, plans,
                subscriptions and system activity.
              </p>
            </div>

            <div className="sa-dashboard-export-wrapper">
              <button
                type="button"
                className="sa-dashboard-export"
                onClick={() => setExportOpen((open) => !open)}
                aria-expanded={exportOpen}
              >
                <FaDownload />
                Export
                <FaChevronDown />
              </button>

              {exportOpen && (
                <div className="sa-dashboard-export-menu">
                  {exportOptions.map((option) => (
                    <button
                      type="button"
                      key={option.filename}
                      className="sa-dashboard-export-option"
                      onClick={() => {
                        downloadCSV(option.filename, option.rows);
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

          {/* KPI CARDS */}
          <section className="sa-dashboard-stats">
            {stats.map(({ title, value, growth, icon: Icon, color }) => (
              <article
                key={title}
                className={`sa-dashboard-stat ${color}`}
              >
                <div className="sa-dashboard-stat-icon">
                  <Icon />
                </div>

                <h2 className="sa-dashboard-stat-value">
                  {value.toLocaleString()}
                </h2>

                <p className="sa-dashboard-stat-title">
                  {title}
                </p>

                <div className="sa-dashboard-stat-growth">
                  ↑ {growth}
                  <span>vs last month</span>
                </div>
              </article>
            ))}
          </section>

          {/* TOP CHARTS */}
          <section className="sa-dashboard-grid">
            <article className="sa-dashboard-panel">
              <div className="sa-dashboard-panel-header">
                <h2 className="sa-dashboard-panel-title">
                  User Growth
                </h2>

                <span className="sa-dashboard-period">
                  Last 7 Months
                </span>
              </div>

              <div className="sa-dashboard-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowth}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#edf1f3"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#39aaa5"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="sa-dashboard-panel">
              <div className="sa-dashboard-panel-header">
                <h2 className="sa-dashboard-panel-title">
                  Clinics by Status
                </h2>
              </div>

              <div className="sa-dashboard-pie-layout">
                <div className="sa-dashboard-pie">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={clinicStatuses}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="55%"
                        outerRadius="78%"
                        paddingAngle={2}
                      >
                        {clinicStatuses.map((item) => (
                          <Cell
                            key={item.name}
                            fill={item.color}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="sa-dashboard-legend">
                  {clinicStatuses.map((item) => (
                    <div
                      key={item.name}
                      className="sa-dashboard-legend-item"
                    >
                      <span className="sa-dashboard-legend-name">
                        <span
                          className="sa-dashboard-legend-dot"
                          style={{ background: item.color }}
                        />
                        {item.name}
                      </span>

                      <span>
                        {item.value} (
                        {Math.round(
                          (item.value / totalClinics) * 100
                        )}
                        %)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </section>

          {/* BOTTOM REPORTS */}
          <section className="sa-dashboard-grid sa-dashboard-bottom-grid">
            <article className="sa-dashboard-panel">
              <div className="sa-dashboard-panel-header">
                <h2 className="sa-dashboard-panel-title">
                  Recent Activity
                </h2>
              </div>

              <div className="sa-dashboard-table-wrapper">
                <table className="sa-dashboard-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>User / Clinic</th>
                      <th>Action</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentActivity.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>

                        <td>
                          <span className="sa-dashboard-activity-name">
                            {item.name}
                          </span>
                        </td>

                        <td>{item.action}</td>
                        <td>{item.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="sa-dashboard-panel">
              <div className="sa-dashboard-panel-header">
                <h2 className="sa-dashboard-panel-title">
                  Top Plans by Subscribers
                </h2>

                <span className="sa-dashboard-period">
                  Overview
                </span>
              </div>

              <div className="sa-dashboard-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topPlans}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar
                      dataKey="subscribers"
                      radius={[6, 6, 0, 0]}
                    >
                      {topPlans.map((item) => (
                        <Cell
                          key={item.name}
                          fill={item.color}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>
        </main>
      </div>
    </>
  );
}
