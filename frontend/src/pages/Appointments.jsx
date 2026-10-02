import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import {
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaPen,
  FaTrash,
  FaClock,
  FaUserDoctor,
  FaList,
  FaTableCellsLarge,
  FaMagnifyingGlass,
  FaFileExport,
} from "react-icons/fa6";

function Appointments() {
  const navigate = useNavigate();

  /* =====================================================
     DATA
  ===================================================== */

  const [appointments, setAppointments] = useState([
    {
      id: 1,
      pet: "Bella",
      owner: "Omar Hassan",
      type: "Consultation",
      date: "2026-09-29",
      time: "10:00",
      veterinarian: "Dr. Ahmad",
      reason: "General Checkup",
      status: "Confirmed",
    },
    {
      id: 2,
      pet: "Luna",
      owner: "Maya Khalil",
      type: "Vaccination",
      date: "2026-09-29",
      time: "12:30",
      veterinarian: "Dr. Sarah",
      reason: "Vaccination",
      status: "Pending",
    },
  ]);

  /* =====================================================
     FILTERS
  ===================================================== */

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("calendar");

  /* =====================================================
     MODALS
  ===================================================== */

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedAppointment, setSelectedAppointment] = useState(null);

  /* =====================================================
     NEW APPOINTMENT
  ===================================================== */

  const [newAppointment, setNewAppointment] = useState({
    pet: "",
    owner: "",
    type: "Consultation",
    date: "",
    time: "",
    veterinarian: "",
    reason: "",
    status: "Pending",
  });

  /* =====================================================
     CALENDAR
  ===================================================== */

  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthTitle = currentDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  /* =====================================================
     FILTER + SORT
  ===================================================== */

  const filteredAppointments = appointments
    .filter((appointment) => {
      const value = search.trim().toLowerCase();

      const matchesSearch =
        appointment.pet.toLowerCase().includes(value) ||
        (appointment.owner || "").toLowerCase().includes(value) ||
        (appointment.type || "").toLowerCase().includes(value) ||
        appointment.veterinarian.toLowerCase().includes(value) ||
        appointment.reason.toLowerCase().includes(value) ||
        appointment.status.toLowerCase().includes(value) ||
        appointment.date.includes(value) ||
        appointment.time.includes(value);

      const matchesStatus =
        statusFilter === "All" || appointment.status === statusFilter;

      const matchesFromDate = !fromDate || appointment.date >= fromDate;
      const matchesToDate = !toDate || appointment.date <= toDate;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesFromDate &&
        matchesToDate
      );
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(`${b.date}T${b.time}`) -
          new Date(`${a.date}T${a.time}`)
        );
      }

      if (sortBy === "oldest") {
        return (
          new Date(`${a.date}T${a.time}`) -
          new Date(`${b.date}T${b.time}`)
        );
      }

      if (sortBy === "pet") {
        return a.pet.localeCompare(b.pet);
      }

      if (sortBy === "time") {
        return a.time.localeCompare(b.time);
      }

      return 0;
    });

  /* =====================================================
     SUMMARY
  ===================================================== */

  const totalThisView = filteredAppointments.length;

  const confirmedCount = filteredAppointments.filter(
    (appointment) => appointment.status === "Confirmed"
  ).length;

  const pendingCount = filteredAppointments.filter(
    (appointment) => appointment.status === "Pending"
  ).length;

  /* =====================================================
     CLEAR FILTERS
  ===================================================== */

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setFromDate("");
    setToDate("");
    setSortBy("newest");
  };

  const filtersActive =
    search !== "" ||
    statusFilter !== "All" ||
    fromDate !== "" ||
    toDate !== "" ||
    sortBy !== "newest";

  /* =====================================================
     EXPORT
  ===================================================== */

  const handleExport = () => {
    const headers = [
      "Pet",
      "Owner",
      "Type",
      "Date",
      "Time",
      "Veterinarian",
      "Reason",
      "Status",
    ];

    const rows = filteredAppointments.map((appointment) => [
      appointment.pet,
      appointment.owner || "",
      appointment.type || "",
      appointment.date,
      appointment.time,
      appointment.veterinarian,
      appointment.reason,
      appointment.status,
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "appointments.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* =====================================================
     CALENDAR FUNCTIONS
  ===================================================== */

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDateString = (day) => {
    const monthNumber = String(month + 1).padStart(2, "0");
    const dayNumber = String(day).padStart(2, "0");

    return `${year}-${monthNumber}-${dayNumber}`;
  };

  const getAppointmentsForDay = (day) => {
    const date = getDateString(day);

    return filteredAppointments.filter(
      (appointment) => appointment.date === date
    );
  };

  const isToday = (day) => {
    const today = new Date();

    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  /* =====================================================
     ADD APPOINTMENT
  ===================================================== */

  const openAddModal = (date = "") => {
    setNewAppointment({
      pet: "",
      owner: "",
      type: "Consultation",
      date,
      time: "",
      veterinarian: "",
      reason: "",
      status: "Pending",
    });

    setShowAddModal(true);
  };

  const handleNewAppointmentChange = (e) => {
    const { name, value } = e.target;

    setNewAppointment((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const createAppointment = () => {
    const appointment = {
      id: Date.now(),
      ...newAppointment,
    };

    setAppointments((previous) => [...previous, appointment]);

    if (appointment.date) {
      const [appointmentYear, appointmentMonth] =
        appointment.date.split("-");

      setCurrentDate(
        new Date(
          Number(appointmentYear),
          Number(appointmentMonth) - 1,
          1
        )
      );
    }

    setShowAddModal(false);

    setNewAppointment({
      pet: "",
      owner: "",
      type: "Consultation",
      date: "",
      time: "",
      veterinarian: "",
      reason: "",
      status: "Pending",
    });

    return appointment;
  };

  const handleAddAppointment = (e) => {
    e.preventDefault();
    createAppointment();
  };

  /* =====================================================
     MAIN VISIT FLOW
  ===================================================== */

  const handleSaveAndStartVisit = () => {
    const appointment = createAppointment();

    navigate("/medical-records", {
      state: {
        openAddMedicalRecord: true,
        fromVisitFlow: true,

        appointment,

        pet: appointment.pet,
        owner: appointment.owner,
        veterinarian: appointment.veterinarian,

        appointmentType: appointment.type,
        appointmentDate: appointment.date,
        appointmentTime: appointment.time,
        reason: appointment.reason,
      },
    });
  };

  const handleStartVisit = (appointment) => {
    setShowViewModal(false);

    navigate("/medical-records", {
      state: {
        openAddMedicalRecord: true,
        fromVisitFlow: true,

        appointment,

        pet: appointment.pet,
        owner: appointment.owner,
        veterinarian: appointment.veterinarian,

        appointmentType: appointment.type,
        appointmentDate: appointment.date,
        appointmentTime: appointment.time,
        reason: appointment.reason,
      },
    });
  };

  /* =====================================================
     VIEW / EDIT / DELETE
  ===================================================== */

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowViewModal(true);
  };

  const handleOpenEdit = (appointment) => {
    setSelectedAppointment({ ...appointment });
    setShowViewModal(false);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setSelectedAppointment((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleUpdateAppointment = (e) => {
    e.preventDefault();

    setAppointments((previous) =>
      previous.map((appointment) =>
        appointment.id === selectedAppointment.id
          ? selectedAppointment
          : appointment
      )
    );

    setShowEditModal(false);
    setSelectedAppointment(null);
  };

  const handleDeleteAppointment = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this appointment?"
    );

    if (!confirmDelete) return;

    setAppointments((previous) =>
      previous.filter((appointment) => appointment.id !== id)
    );

    setShowViewModal(false);
    setShowEditModal(false);
    setSelectedAppointment(null);
  };

  /* =====================================================
     FORMAT
  ===================================================== */

  const formatDate = (date) => {
    if (!date) return "";

    const [, m, d] = date.split("-");
    return `${d}/${m}/${date.split("-")[0]}`;
  };

  const formatTime = (time) => {
    if (!time) return "";

    const [hours, minutes] = time.split(":");

    let hour = Number(hours);
    const period = hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12;

    return `${hour}:${minutes} ${period}`;
  };

  /* =====================================================
     HEADER STYLES
  ===================================================== */

  const headerStyle = {
    width: "100%",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "28px",
  };

  const headerActionsStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "10px",
    marginLeft: "auto",
  };

  const exportButtonStyle = {
    height: "42px",
    minWidth: "115px",
    padding: "0 16px",
    margin: 0,
    border: "1px solid #55b7b3",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#319c97",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    whiteSpace: "nowrap",
    boxSizing: "border-box",
  };

  const addButtonStyle = {
    height: "42px",
    minWidth: "170px",
    padding: "0 18px",
    margin: 0,
    border: "1px solid #55b7b3",
    borderRadius: "8px",
    background: "#55b7b3",
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    whiteSpace: "nowrap",
    boxSizing: "border-box",
  };

  return (
    <div className="dashboard-layout">
      <style>{`
        .workflow-actions {
          display: flex !important;
          align-items: center !important;
          justify-content: flex-end !important;
          gap: 8px !important;
          flex-wrap: wrap !important;
          margin-top: 20px !important;
        }

        .modal-container .workflow-actions .workflow-button {
          width: auto !important;
          min-width: 0 !important;
          max-width: none !important;

          height: 34px !important;
          min-height: 34px !important;
          max-height: 34px !important;

          padding: 0 12px !important;
          margin: 0 !important;

          flex: 0 0 auto !important;

          border-radius: 7px !important;

          font-size: 12px !important;
          font-weight: 600 !important;
          line-height: 1 !important;

          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;

          white-space: nowrap !important;
          box-sizing: border-box !important;

          cursor: pointer !important;
          box-shadow: none !important;

          font-family: inherit !important;
        }

        .modal-container
          .workflow-actions
          .workflow-button-secondary {
          background: #ffffff !important;
          color: #52605f !important;
          border: 1px solid #d5e5e3 !important;
        }

        .modal-container
          .workflow-actions
          .workflow-button-secondary:hover {
          background: #f7fbfa !important;
          border-color: #bdd8d5 !important;
        }

        .modal-container
          .workflow-actions
          .workflow-button-primary {
          background: #55b7b3 !important;
          color: #ffffff !important;
          border: 1px solid #55b7b3 !important;
        }

        .modal-container
          .workflow-actions
          .workflow-button-primary:hover {
          background: #319c97 !important;
          border-color: #319c97 !important;
        }

        @media (max-width: 640px) {
          .workflow-actions {
            justify-content: flex-end !important;
          }

          .modal-container
            .workflow-actions
            .workflow-button {
            width: auto !important;
            flex: 0 0 auto !important;
          }
        }
      `}</style>

      <Sidebar />

      <main className="dashboard-main">
        {/* HEADER */}

        <div style={headerStyle}>
          <div>
            <h1 style={{ margin: "0 0 5px" }}>Appointments</h1>

            <p
              style={{
                margin: 0,
                color: "#718481",
              }}
            >
              Manage clinic appointments
            </p>
          </div>

          <div style={headerActionsStyle}>
            <button
              type="button"
              onClick={handleExport}
              style={exportButtonStyle}
            >
              <FaFileExport />
              Export
            </button>

            <button
              type="button"
              onClick={() => openAddModal()}
              style={addButtonStyle}
            >
              <FaPlus />
              New Appointment
            </button>
          </div>
        </div>

        {/* FILTERS */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "nowrap",
            width: "100%",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              position: "relative",
              flex: "1 1 auto",
              minWidth: "260px",
            }}
          >
            <FaMagnifyingGlass
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#7b9693",
                fontSize: "14px",
                pointerEvents: "none",
                zIndex: 2,
              }}
            />

            <input
              type="text"
              placeholder="Search appointments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                height: "44px",
                padding: "0 44px 0 42px",
                border: "1px solid #d5e5e3",
                borderRadius: "8px",
                outline: "none",
                boxSizing: "border-box",
                background: "#ffffff",
                fontSize: "14px",
              }}
            />

            {filtersActive && (
              <button
                type="button"
                onClick={clearFilters}
                title="Clear filters"
                aria-label="Clear filters"
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "28px",
                  minWidth: "28px",
                  height: "28px",
                  padding: 0,
                  margin: 0,
                  border: "none",
                  borderRadius: "50%",
                  background: "transparent",
                  color: "#319c97",
                  fontSize: "20px",
                  lineHeight: 1,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "none",
                }}
              >
                ×
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              width: "165px",
              minWidth: "165px",
              height: "44px",
              padding: "0 12px",
              border: "1px solid #d5e5e3",
              borderRadius: "8px",
              background: "#ffffff",
              outline: "none",
              cursor: "pointer",
              boxSizing: "border-box",
            }}
          >
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <input
            type="date"
            value={fromDate}
            title="From Date"
            onChange={(e) => setFromDate(e.target.value)}
            style={{
              width: "165px",
              minWidth: "165px",
              height: "44px",
              padding: "0 10px",
              border: "1px solid #d5e5e3",
              borderRadius: "8px",
              outline: "none",
              boxSizing: "border-box",
              background: "#ffffff",
            }}
          />

          <input
            type="date"
            value={toDate}
            title="To Date"
            onChange={(e) => setToDate(e.target.value)}
            style={{
              width: "165px",
              minWidth: "165px",
              height: "44px",
              padding: "0 10px",
              border: "1px solid #d5e5e3",
              borderRadius: "8px",
              outline: "none",
              boxSizing: "border-box",
              background: "#ffffff",
            }}
          />
        </div>

        {/* SORT + VIEW */}

        <div className="appointments-toolbar">
          <div />

          <div className="appointments-toolbar-right">
            <div className="appointment-sort">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Sort by Newest</option>
                <option value="oldest">Sort by Oldest</option>
                <option value="pet">Sort by Pet Name</option>
                <option value="time">Sort by Time</option>
              </select>
            </div>

            <div className="appointment-view-switch">
              <button
                type="button"
                title="List View"
                className={viewMode === "list" ? "active" : ""}
                onClick={() => setViewMode("list")}
              >
                <FaList />
              </button>

              <button
                type="button"
                title="Calendar View"
                className={viewMode === "calendar" ? "active" : ""}
                onClick={() => setViewMode("calendar")}
              >
                <FaTableCellsLarge />
              </button>
            </div>
          </div>
        </div>

        {/* SUMMARY */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(180px, 1fr))",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #dceae8",
              borderRadius: "12px",
              padding: "17px 20px",
            }}
          >
            <p
              style={{
                margin: "0 0 7px",
                color: "#718481",
                fontSize: "13px",
              }}
            >
              Total This View
            </p>

            <h2 style={{ margin: 0 }}>{totalThisView}</h2>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #dceae8",
              borderRadius: "12px",
              padding: "17px 20px",
            }}
          >
            <p
              style={{
                margin: "0 0 7px",
                color: "#718481",
                fontSize: "13px",
              }}
            >
              Confirmed
            </p>

            <h2
              style={{
                margin: 0,
                color: "#319c97",
              }}
            >
              {confirmedCount}
            </h2>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #dceae8",
              borderRadius: "12px",
              padding: "17px 20px",
            }}
          >
            <p
              style={{
                margin: "0 0 7px",
                color: "#718481",
                fontSize: "13px",
              }}
            >
              Pending
            </p>

            <h2
              style={{
                margin: 0,
                color: "#d89b37",
              }}
            >
              {pendingCount}
            </h2>
          </div>
        </div>
                {/* CALENDAR */}

                {viewMode === "calendar" && (
          <div className="compact-calendar">
            <div className="compact-calendar-header">
              <div>
                <h2>{monthTitle}</h2>

                <p>
                  {filteredAppointments.length} appointment
                  {filteredAppointments.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="compact-calendar-navigation">
                <button
                  type="button"
                  onClick={previousMonth}
                  title="Previous month"
                >
                  <FaChevronLeft />
                </button>

                <button
                  type="button"
                  className="calendar-today-btn"
                  onClick={goToToday}
                >
                  Today
                </button>

                <button
                  type="button"
                  onClick={nextMonth}
                  title="Next month"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>

            <div className="compact-calendar-weekdays">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            <div className="compact-calendar-grid">
              {Array.from({
                length: firstDay,
              }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="compact-calendar-day empty"
                />
              ))}

              {Array.from({
                length: daysInMonth,
              }).map((_, index) => {
                const day = index + 1;

                const dayAppointments =
                  getAppointmentsForDay(day);

                return (
                  <div
                    key={day}
                    className={`compact-calendar-day ${
                      isToday(day) ? "today" : ""
                    }`}
                  >
                    <div className="compact-day-header">
                      <span className="compact-day-number">
                        {day}
                      </span>

                      <button
                        type="button"
                        className="compact-day-add"
                        title="Add appointment"
                        onClick={() =>
                          openAddModal(getDateString(day))
                        }
                      >
                        <FaPlus />
                      </button>
                    </div>

                    <div className="compact-events">
                      {dayAppointments
                        .slice(0, 3)
                        .map((appointment) => (
                          <button
                            type="button"
                            key={appointment.id}
                            className={`compact-event ${appointment.status.toLowerCase()}`}
                            onClick={() =>
                              handleViewAppointment(
                                appointment
                              )
                            }
                          >
                            <span className="compact-event-time">
                              {formatTime(
                                appointment.time
                              )}
                            </span>

                            <span className="compact-event-name">
                              {appointment.pet}
                            </span>
                          </button>
                        ))}

                      {dayAppointments.length > 3 && (
                        <span className="more-appointments">
                          +{dayAppointments.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="calendar-legend">
              <span>
                <i className="legend-dot confirmed" />
                Confirmed
              </span>

              <span>
                <i className="legend-dot pending" />
                Pending
              </span>

              <span>
                <i className="legend-dot completed" />
                Completed
              </span>

              <span>
                <i className="legend-dot cancelled" />
                Cancelled
              </span>
            </div>
          </div>
        )}

        {/* LIST VIEW */}

        {viewMode === "list" && (
          <div className="owners-table-container appointment-list-table">
            <table className="owners-table">
              <thead>
                <tr>
                  <th>Pet</th>
                  <th>Owner</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Veterinarian</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                      }}
                    >
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map(
                    (appointment) => (
                      <tr key={appointment.id}>
                        <td>
                          <strong>
                            {appointment.pet}
                          </strong>
                        </td>

                        <td>
                          {appointment.owner || "—"}
                        </td>

                        <td>
                          {appointment.type || "—"}
                        </td>

                        <td>
                          {formatDate(
                            appointment.date
                          )}
                        </td>

                        <td>
                          {formatTime(
                            appointment.time
                          )}
                        </td>

                        <td>
                          {appointment.veterinarian}
                        </td>

                        <td>
                          {appointment.reason}
                        </td>

                        <td>
                          <span
                            className={`status ${appointment.status.toLowerCase()}`}
                          >
                            {appointment.status}
                          </span>
                        </td>

                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="view-button"
                              onClick={() =>
                                handleViewAppointment(
                                  appointment
                                )
                              }
                            >
                              View
                            </button>

                            <button
                              type="button"
                              className="edit-button"
                              onClick={() =>
                                handleOpenEdit(
                                  appointment
                                )
                              }
                            >
                              <FaPen />
                            </button>

                            <button
                              type="button"
                              className="delete-button"
                              onClick={() =>
                                handleDeleteAppointment(
                                  appointment.id
                                )
                              }
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* =====================================================
          ADD APPOINTMENT MODAL
      ===================================================== */}

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>New Appointment</h2>
                <p>Enter appointment information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setShowAddModal(false)
                }
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddAppointment}>
              {/* PET + OWNER */}

              <div className="form-row">
                <div className="form-field">
                  <label>Pet Name</label>

                  <input
                    type="text"
                    name="pet"
                    value={newAppointment.pet}
                    onChange={
                      handleNewAppointmentChange
                    }
                    placeholder="Enter pet name"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Owner</label>

                  <input
                    type="text"
                    name="owner"
                    value={newAppointment.owner}
                    onChange={
                      handleNewAppointmentChange
                    }
                    placeholder="Enter owner name"
                    required
                  />
                </div>
              </div>

              {/* VETERINARIAN + APPOINTMENT TYPE */}

              <div className="form-row">
                <div className="form-field">
                  <label>Veterinarian</label>

                  <input
                    type="text"
                    name="veterinarian"
                    value={
                      newAppointment.veterinarian
                    }
                    onChange={
                      handleNewAppointmentChange
                    }
                    placeholder="Enter veterinarian"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Appointment Type</label>

                  <select
                    name="type"
                    value={newAppointment.type}
                    onChange={
                      handleNewAppointmentChange
                    }
                    required
                  >
                    <option value="Consultation">
                      Consultation
                    </option>

                    <option value="Vaccination">
                      Vaccination
                    </option>

                    <option value="Surgery">
                      Surgery
                    </option>

                    <option value="Follow-up">
                      Follow-up
                    </option>

                    <option value="Dental">
                      Dental
                    </option>

                    <option value="Emergency">
                      Emergency
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>
              </div>

              {/* DATE + TIME */}

              <div className="form-row">
                <div className="form-field">
                  <label>Date</label>

                  <input
                    type="date"
                    name="date"
                    value={newAppointment.date}
                    onChange={
                      handleNewAppointmentChange
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Time</label>

                  <input
                    type="time"
                    name="time"
                    value={newAppointment.time}
                    onChange={
                      handleNewAppointmentChange
                    }
                    required
                  />
                </div>
              </div>

              {/* REASON */}

              <div className="form-field">
                <label>Reason</label>

                <input
                  type="text"
                  name="reason"
                  value={newAppointment.reason}
                  onChange={
                    handleNewAppointmentChange
                  }
                  placeholder="Enter reason for appointment"
                  required
                />
              </div>

              {/* STATUS */}

              <div className="form-field">
                <label>Status</label>

                <select
                  name="status"
                  value={newAppointment.status}
                  onChange={
                    handleNewAppointmentChange
                  }
                >
                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Confirmed">
                    Confirmed
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                  <option value="Cancelled">
                    Cancelled
                  </option>
                </select>
              </div>

              {/* SMALL WORKFLOW BUTTONS */}

              <div className="workflow-actions">
                <button
                  type="button"
                  className="workflow-button workflow-button-secondary"
                  onClick={() =>
                    setShowAddModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="workflow-button workflow-button-primary"
                >
                  Add Appointment
                </button>

                <button
                  type="button"
                  className="workflow-button workflow-button-primary"
                  onClick={
                    handleSaveAndStartVisit
                  }
                >
                  Save & Start Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          VIEW / OPEN APPOINTMENT MODAL
      ===================================================== */}

      {showViewModal &&
        selectedAppointment && (
          <div className="modal-overlay">
            <div className="modal-container appointment-view-modal">
              <div className="modal-header">
                <div>
                  <h2>
                    {selectedAppointment.pet}
                  </h2>

                  <p>Appointment details</p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedAppointment(
                      null
                    );
                  }}
                >
                  ×
                </button>
              </div>

              {/* STATUS */}

              <div className="appointment-view-status">
                <span
                  className={`status ${selectedAppointment.status.toLowerCase()}`}
                >
                  {selectedAppointment.status}
                </span>
              </div>

              {/* OWNER */}

              <div className="detail-row">
                <span>Owner</span>

                <strong>
                  {selectedAppointment.owner ||
                    "—"}
                </strong>
              </div>

              {/* APPOINTMENT TYPE */}

              <div className="detail-row">
                <span>Appointment Type</span>

                <strong>
                  {selectedAppointment.type ||
                    "—"}
                </strong>
              </div>

              {/* DATE */}

              <div className="detail-row">
                <span>Date</span>

                <strong>
                  {formatDate(
                    selectedAppointment.date
                  )}
                </strong>
              </div>

              {/* TIME */}

              <div className="detail-row">
                <span>
                  <FaClock /> Time
                </span>

                <strong>
                  {formatTime(
                    selectedAppointment.time
                  )}
                </strong>
              </div>

              {/* VETERINARIAN */}

              <div className="detail-row">
                <span>
                  <FaUserDoctor /> Veterinarian
                </span>

                <strong>
                  {
                    selectedAppointment.veterinarian
                  }
                </strong>
              </div>

              {/* REASON */}

              <div className="detail-row">
                <span>Reason</span>

                <strong>
                  {selectedAppointment.reason}
                </strong>
              </div>

              {/* OPEN APPOINTMENT ACTIONS */}

              <div className="workflow-actions">
                <button
                  type="button"
                  className="delete-button"
                  onClick={() =>
                    handleDeleteAppointment(
                      selectedAppointment.id
                    )
                  }
                >
                  <FaTrash />
                </button>

                <button
                  type="button"
                  className="workflow-button workflow-button-secondary"
                  onClick={() =>
                    handleOpenEdit(
                      selectedAppointment
                    )
                  }
                >
                  <FaPen />
                  Edit
                </button>

                {/* NEW REQUIRED BUTTON */}

                <button
                  type="button"
                  className="workflow-button workflow-button-primary"
                  onClick={() =>
                    handleStartVisit(
                      selectedAppointment
                    )
                  }
                >
                  Start Visit
                </button>
              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          EDIT APPOINTMENT MODAL
      ===================================================== */}

      {showEditModal &&
        selectedAppointment && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <div>
                  <h2>Edit Appointment</h2>
                  <p>
                    Update appointment information
                  </p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedAppointment(
                      null
                    );
                  }}
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={
                  handleUpdateAppointment
                }
              >
                {/* PET + OWNER */}

                <div className="form-row">
                  <div className="form-field">
                    <label>Pet Name</label>

                    <input
                      type="text"
                      name="pet"
                      value={
                        selectedAppointment.pet
                      }
                      onChange={
                        handleEditChange
                      }
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>Owner</label>

                    <input
                      type="text"
                      name="owner"
                      value={
                        selectedAppointment.owner ||
                        ""
                      }
                      onChange={
                        handleEditChange
                      }
                      required
                    />
                  </div>
                </div>

                {/* VETERINARIAN + TYPE */}

                <div className="form-row">
                  <div className="form-field">
                    <label>Veterinarian</label>

                    <input
                      type="text"
                      name="veterinarian"
                      value={
                        selectedAppointment.veterinarian
                      }
                      onChange={
                        handleEditChange
                      }
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>
                      Appointment Type
                    </label>

                    <select
                      name="type"
                      value={
                        selectedAppointment.type ||
                        "Consultation"
                      }
                      onChange={
                        handleEditChange
                      }
                      required
                    >
                      <option value="Consultation">
                        Consultation
                      </option>

                      <option value="Vaccination">
                        Vaccination
                      </option>

                      <option value="Surgery">
                        Surgery
                      </option>

                      <option value="Follow-up">
                        Follow-up
                      </option>

                      <option value="Dental">
                        Dental
                      </option>

                      <option value="Emergency">
                        Emergency
                      </option>

                      <option value="Other">
                        Other
                      </option>
                    </select>
                  </div>
                </div>

                {/* DATE + TIME */}

                <div className="form-row">
                  <div className="form-field">
                    <label>Date</label>

                    <input
                      type="date"
                      name="date"
                      value={
                        selectedAppointment.date
                      }
                      onChange={
                        handleEditChange
                      }
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>Time</label>

                    <input
                      type="time"
                      name="time"
                      value={
                        selectedAppointment.time
                      }
                      onChange={
                        handleEditChange
                      }
                      required
                    />
                  </div>
                </div>

                {/* REASON */}

                <div className="form-field">
                  <label>Reason</label>

                  <input
                    type="text"
                    name="reason"
                    value={
                      selectedAppointment.reason
                    }
                    onChange={
                      handleEditChange
                    }
                    required
                  />
                </div>

                {/* STATUS */}

                <div className="form-field">
                  <label>Status</label>

                  <select
                    name="status"
                    value={
                      selectedAppointment.status
                    }
                    onChange={
                      handleEditChange
                    }
                  >
                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Confirmed">
                      Confirmed
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                    <option value="Cancelled">
                      Cancelled
                    </option>
                  </select>
                </div>

                <div className="workflow-actions">
                  <button
                    type="button"
                    className="workflow-button workflow-button-secondary"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedAppointment(
                        null
                      );
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="workflow-button workflow-button-primary"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}

export default Appointments;