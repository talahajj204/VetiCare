import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getDashboard } from "../api/dashboardApi";

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

const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getMonthStart = (date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const getMonthEnd = (date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0);

const petColors = [
  "#4db6ac",
  "#81c784",
  "#64b5f6",
  "#ffb74d",
];

function AdminDashboard() {
  const context = useOutletContext();

  const scopeKey = `${context?.user?.id ?? ""}:${
    context?.user?.clinicId ?? ""
  }`;

  const [fromDate, setFromDate] = useState(() =>
    formatDateForInput(getMonthStart(new Date()))
  );

  const [toDate, setToDate] = useState(() =>
    formatDateForInput(getMonthEnd(new Date()))
  );

  const [activeRange, setActiveRange] =
    useState("this-month");

  const [dashboardState, setDashboardState] =
    useState(null);

  const [requestState, setRequestState] =
    useState(null);

  const requestKey = JSON.stringify([
    scopeKey,
    fromDate,
    toDate,
  ]);

  const dashboard =
    dashboardState?.key === requestKey
      ? dashboardState.data
      : null;

  const loadError =
    requestState?.key === requestKey
      ? requestState.error
      : "";

  const isLoading =
    requestState?.key !== requestKey ||
    requestState.loading;

  useEffect(() => {
    let disposed = false;
    let controller;

    const loadDashboard = async () => {
      controller?.abort();

      if (
        !fromDate ||
        !toDate ||
        fromDate > toDate
      ) {
        setDashboardState(null);

        setRequestState({
          key: requestKey,
          loading: false,
          error:
            !fromDate || !toDate
              ? "Choose a From date and a To date."
              : "From date cannot be after To date.",
        });

        return;
      }

      const currentController = new AbortController();
      controller = currentController;

      setRequestState({
        key: requestKey,
        loading: true,
        error: "",
      });

      try {
        const data = await getDashboard(
          {
            today: formatDateForInput(new Date()),
            startDate: fromDate,
            endDate: toDate,
          },
          {
            signal: currentController.signal,
          }
        );

        if (
          disposed ||
          currentController.signal.aborted
        ) {
          return;
        }

        setDashboardState({
          key: requestKey,
          data,
        });

        setRequestState({
          key: requestKey,
          loading: false,
          error: "",
        });
      } catch (error) {
        if (
          disposed ||
          currentController.signal.aborted
        ) {
          return;
        }

        setDashboardState(null);

        setRequestState({
          key: requestKey,
          loading: false,
          error:
            error.message ||
            "Unable to load the dashboard.",
        });
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadDashboard();
      }
    };

    loadDashboard();

    window.addEventListener("focus", loadDashboard);
    window.addEventListener(
      "dashboardUpdated",
      loadDashboard
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      disposed = true;
      controller?.abort();

      window.removeEventListener(
        "focus",
        loadDashboard
      );

      window.removeEventListener(
        "dashboardUpdated",
        loadDashboard
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [fromDate, toDate, requestKey]);

  const appointmentData =
    dashboard?.appointments ?? [];

  const revenueData = dashboard?.revenue ?? [];

  const petData = dashboard?.petDistribution ?? [];

  const getStatValue = (property) => {
    if (dashboard) {
      return dashboard[property];
    }

    return isLoading ? "..." : "—";
  };

  const emptyMessage =
    loadError ||
    (isLoading
      ? "Loading dashboard..."
      : "No data for these dates");

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

    setFromDate(
      formatDateForInput(
        new Date(now.getFullYear(), 0, 1)
      )
    );

    setToDate(
      formatDateForInput(
        new Date(now.getFullYear(), 11, 31)
      )
    );

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
        <div className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back to VetClinic</p>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="stat-card">
            <div className="stat-card-top">
              <div className="stat-icon appointments-icon">
                <FaCalendarCheck />
              </div>

              <h3>Today's Appointments</h3>
            </div>

            <p>{getStatValue("todayAppointments")}</p>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <div className="stat-icon pets-icon">
                <FaPaw />
              </div>

              <h3>Active Pets</h3>
            </div>

            <p>{getStatValue("activePets")}</p>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <div className="stat-icon owners-icon">
                <FaUsers />
              </div>

              <h3>Pet Owners</h3>
            </div>

            <p>{getStatValue("petOwners")}</p>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <div className="stat-icon invoices-icon">
                <FaFileInvoiceDollar />
              </div>

              <h3>Outstanding Invoices</h3>
            </div>

            <p>{getStatValue("outstandingInvoices")}</p>
          </div>
        </div>

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

        <div className="dashboard-charts">
          <div className="chart-card chart-card-large">
            <div className="chart-header">
              <div>
                <h3>Appointments Overview</h3>
                <p>
                  Clinic appointments for selected dates
                </p>
              </div>
            </div>

            <div className="chart-wrapper">
              {appointmentData.length > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart data={appointmentData}>
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
                      allowDecimals={false}
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
                  {emptyMessage}
                </div>
              )}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <div>
                <h3>Pet Distribution</h3>
                <p>Registered pets by type</p>
              </div>
            </div>

            <div className="chart-wrapper pie-wrapper">
              {petData.length > 0 ? (
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

                    <Tooltip
                      formatter={(value) => `${value}%`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="dashboard-no-data">
                  {loadError ||
                    (isLoading
                      ? "Loading dashboard..."
                      : "No registered pets")}
                </div>
              )}
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
                        petColors[
                          index % petColors.length
                        ],
                    }}
                  />

                  <span>{pet.name}</span>

                  <strong>{pet.value}%</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card chart-card-full">
            <div className="chart-header">
              <div>
                <h3>Revenue Overview</h3>
                <p>
                  Clinic revenue for selected dates
                </p>
              </div>
            </div>

            <div className="chart-wrapper">
              {revenueData.length > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart data={revenueData}>
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

                    <Tooltip
                      formatter={(value) => [
                        `$${Number(value).toFixed(2)}`,
                        "Revenue",
                      ]}
                    />

                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#55b7b2"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: "#55b7b2",
                      }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="dashboard-no-data">
                  {emptyMessage}
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