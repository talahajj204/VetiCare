import { useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";

import {
  FaCalendarCheck,
  FaPaw,
  FaUsers,
  FaFileInvoiceDollar,
} from "react-icons/fa";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Cell,
  Pie,
  LineChart,
  Line,
} from "recharts";

function AdminDashboard() {
  // =========================================================
  // DATE HELPERS
  // =========================================================

  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getMonthStart = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const getMonthEnd = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  const today = new Date();

  const defaultFrom = formatDateForInput(getMonthStart(today));
  const defaultTo = formatDateForInput(getMonthEnd(today));

  // =========================================================
  // DATE FILTER
  // =========================================================

  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [activeRange, setActiveRange] = useState("this-month");

  // =========================================================
  // SAMPLE DATA
  // Backend later
  // =========================================================

  const appointmentData = [
    {
      date: "2026-05-10",
      month: "May",
      appointments: 18,
    },
    {
      date: "2026-06-10",
      month: "Jun",
      appointments: 25,
    },
    {
      date: "2026-07-10",
      month: "Jul",
      appointments: 21,
    },
    {
      date: "2026-08-10",
      month: "Aug",
      appointments: 32,
    },
    {
      date: "2026-09-10",
      month: "Sep",
      appointments: 28,
    },
    {
      date: "2026-10-10",
      month: "Oct",
      appointments: 35,
    },
  ];

  const petData = [
    { name: "Dogs", value: 45 },
    { name: "Cats", value: 30 },
    { name: "Birds", value: 15 },
    { name: "Other", value: 10 },
  ];

  const revenueData = [
    {
      date: "2026-05-10",
      month: "May",
      revenue: 1200,
    },
    {
      date: "2026-06-10",
      month: "Jun",
      revenue: 1800,
    },
    {
      date: "2026-07-10",
      month: "Jul",
      revenue: 1500,
    },
    {
      date: "2026-08-10",
      month: "Aug",
      revenue: 2200,
    },
    {
      date: "2026-09-10",
      month: "Sep",
      revenue: 1950,
    },
    {
      date: "2026-10-10",
      month: "Oct",
      revenue: 2600,
    },
  ];

  const petColors = [
    "#4db6ac",
    "#81c784",
    "#64b5f6",
    "#ffb74d",
  ];

  // =========================================================
  // FILTER FUNCTIONS
  // =========================================================

  const isDateInRange = (date) => {
    if (!date) return false;

    if (fromDate && date < fromDate) {
      return false;
    }

    if (toDate && date > toDate) {
      return false;
    }

    return true;
  };

  const filteredAppointmentData = useMemo(() => {
    return appointmentData.filter((item) =>
      isDateInRange(item.date)
    );
  }, [fromDate, toDate]);

  const filteredRevenueData = useMemo(() => {
    return revenueData.filter((item) =>
      isDateInRange(item.date)
    );
  }, [fromDate, toDate]);

  // =========================================================
  // QUICK DATE FILTERS
  // =========================================================

  const handleThisMonth = () => {
    const now = new Date();

    setFromDate(
      formatDateForInput(getMonthStart(now))
    );

    setToDate(
      formatDateForInput(getMonthEnd(now))
    );

    setActiveRange("this-month");
  };

  const handleLastMonth = () => {
    const now = new Date();

    const lastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    setFromDate(
      formatDateForInput(getMonthStart(lastMonth))
    );

    setToDate(
      formatDateForInput(getMonthEnd(lastMonth))
    );

    setActiveRange("last-month");
  };

  const handleThisYear = () => {
    const now = new Date();

    const firstDay = new Date(
      now.getFullYear(),
      0,
      1
    );

    const lastDay = new Date(
      now.getFullYear(),
      11,
      31
    );

    setFromDate(formatDateForInput(firstDay));
    setToDate(formatDateForInput(lastDay));

    setActiveRange("this-year");
  };

  const handleFromChange = (event) => {
    setFromDate(event.target.value);
    setActiveRange("");
  };

  const handleToChange = (event) => {
    setToDate(event.target.value);
    setActiveRange("");
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back to VetClinic</p>
          </div>
        </div>

        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <div className="dashboard-content">
          {/* TODAY'S APPOINTMENTS */}

          <div className="stat-card">
            <div className="stat-card-top">
              <div className="stat-icon appointments-icon">
                <FaCalendarCheck />
              </div>

              <h3>Today's Appointments</h3>
            </div>

            <p>8</p>
          </div>

          {/* ACTIVE PETS */}

          <div className="stat-card">
            <div className="stat-card-top">
              <div className="stat-icon pets-icon">
                <FaPaw />
              </div>

              <h3>Active Pets</h3>
            </div>

            <p>75</p>
          </div>

          {/* PET OWNERS */}

          <div className="stat-card">
            <div className="stat-card-top">
              <div className="stat-icon owners-icon">
                <FaUsers />
              </div>

              <h3>Pet Owners</h3>
            </div>

            <p>48</p>
          </div>

          {/* OUTSTANDING INVOICES */}

          <div className="stat-card">
            <div className="stat-card-top">
              <div className="stat-icon invoices-icon">
                <FaFileInvoiceDollar />
              </div>

              <h3>Outstanding Invoices</h3>
            </div>

            <p>6</p>
          </div>
        </div>

        {/* =====================================================
            DATE FILTER
        ===================================================== */}

        <div className="dashboard-date-filter">
          <div className="dashboard-date-fields">
            <div className="dashboard-date-field">
              <label htmlFor="dashboard-from-date">
                From
              </label>

              <input
                id="dashboard-from-date"
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={handleFromChange}
              />
            </div>

            <div className="dashboard-date-field">
              <label htmlFor="dashboard-to-date">
                To
              </label>

              <input
                id="dashboard-to-date"
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={handleToChange}
              />
            </div>
          </div>

          <div className="dashboard-date-buttons">
            <button
              type="button"
              className={
                activeRange === "this-month"
                  ? "active"
                  : ""
              }
              onClick={handleThisMonth}
            >
              This month
            </button>

            <button
              type="button"
              className={
                activeRange === "last-month"
                  ? "active"
                  : ""
              }
              onClick={handleLastMonth}
            >
              Last month
            </button>

            <button
              type="button"
              className={
                activeRange === "this-year"
                  ? "active"
                  : ""
              }
              onClick={handleThisYear}
            >
              This year
            </button>
          </div>
        </div>

        {/* =====================================================
            CHARTS
        ===================================================== */}

        <div className="dashboard-charts">
          {/* APPOINTMENTS */}

          <div className="chart-card chart-card-large">
            <div className="chart-header">
              <div>
                <h3>Appointments Overview</h3>
                <p>Clinic appointments for selected dates</p>
              </div>
            </div>

            <div className="chart-wrapper">
              {filteredAppointmentData.length > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={filteredAppointmentData}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#edf2f2"
                    />

                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 12,
                        fill: "#718181",
                      }}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 12,
                        fill: "#718181",
                      }}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="appointments"
                      fill="#55b7b2"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="dashboard-no-data">
                  No data for these dates
                </div>
              )}
            </div>
          </div>

          {/* PET DISTRIBUTION */}

          <div className="chart-card">
            <div className="chart-header">
              <div>
                <h3>Pet Distribution</h3>
                <p>Registered pets by type</p>
              </div>
            </div>

            <div className="chart-wrapper pie-wrapper">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={petData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {petData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={
                          petColors[
                            index % petColors.length
                          ]
                        }
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="pet-chart-legend">
              {petData.map((pet, index) => (
                <div
                  className="pet-legend-item"
                  key={pet.name}
                >
                  <span
                    className="pet-legend-color"
                    style={{
                      backgroundColor:
                        petColors[index],
                    }}
                  />

                  <span>{pet.name}</span>

                  <strong>{pet.value}%</strong>
                </div>
              ))}
            </div>
          </div>

          {/* REVENUE */}

          <div className="chart-card chart-card-full">
            <div className="chart-header">
              <div>
                <h3>Revenue Overview</h3>
                <p>Clinic revenue for selected dates</p>
              </div>
            </div>

            <div className="chart-wrapper">
              {filteredRevenueData.length > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart
                    data={filteredRevenueData}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#edf2f2"
                    />

                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 12,
                        fill: "#718181",
                      }}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 12,
                        fill: "#718181",
                      }}
                    />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#55b7b2"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: "#55b7b2",
                      }}
                      activeDot={{
                        r: 6,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="dashboard-no-data">
                  No data for these dates
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;