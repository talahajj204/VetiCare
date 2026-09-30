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
  // ==============================
  // SAMPLE DATA
  // Backend later
  // ==============================

  const appointmentData = [
    { month: "May", appointments: 18 },
    { month: "Jun", appointments: 25 },
    { month: "Jul", appointments: 21 },
    { month: "Aug", appointments: 32 },
    { month: "Sep", appointments: 28 },
    { month: "Oct", appointments: 35 },
  ];

  const petData = [
    { name: "Dogs", value: 45 },
    { name: "Cats", value: 30 },
    { name: "Birds", value: 15 },
    { name: "Other", value: 10 },
  ];

  const revenueData = [
    { month: "May", revenue: 1200 },
    { month: "Jun", revenue: 1800 },
    { month: "Jul", revenue: 1500 },
    { month: "Aug", revenue: 2200 },
    { month: "Sep", revenue: 1950 },
    { month: "Oct", revenue: 2600 },
  ];

  const petColors = [
    "#4db6ac",
    "#81c784",
    "#64b5f6",
    "#ffb74d",
  ];

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-main">

        {/* =========================
            HEADER
        ========================= */}

        <header className="dashboard-header">
          <div className="dashboard-title">
            <h1>Dashboard</h1>
            <p>Welcome back to VetClinic</p>
          </div>
        </header>

        {/* =========================
            STATISTICS
        ========================= */}

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

        {/* =========================
            CHARTS
        ========================= */}

        <div className="dashboard-charts">

          {/* APPOINTMENTS */}

          <div className="chart-card chart-card-large">

            <div className="chart-header">
              <div>
                <h3>Appointments Overview</h3>
                <p>Monthly clinic appointments</p>
              </div>
            </div>

            <div className="chart-wrapper">

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
                <p>Monthly clinic revenue</p>
              </div>
            </div>

            <div className="chart-wrapper">

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

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default AdminDashboard;