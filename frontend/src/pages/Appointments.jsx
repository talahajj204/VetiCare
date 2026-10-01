import { useState } from "react";
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
  /* =====================================================
     DATA
  ===================================================== */

  const [appointments, setAppointments] = useState([
    {
      id: 1,
      pet: "Bella",
      date: "2026-09-29",
      time: "10:00",
      veterinarian: "Dr. Ahmad",
      reason: "General Checkup",
      status: "Confirmed",
    },
    {
      id: 2,
      pet: "Luna",
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

  const [selectedAppointment, setSelectedAppointment] =
    useState(null);

  /* =====================================================
     NEW APPOINTMENT
  ===================================================== */

  const [newAppointment, setNewAppointment] = useState({
    pet: "",
    date: "",
    time: "",
    veterinarian: "",
    reason: "",
    status: "Pending",
  });

  /* =====================================================
     CALENDAR
  ===================================================== */

  const [currentDate, setCurrentDate] = useState(
    new Date(2026, 8, 1)
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthTitle = currentDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  /* =====================================================
     FILTER + SORT
  ===================================================== */

  const filteredAppointments = appointments
    .filter((appointment) => {
      const value = search.trim().toLowerCase();

      const matchesSearch =
        appointment.pet.toLowerCase().includes(value) ||
        appointment.veterinarian
          .toLowerCase()
          .includes(value) ||
        appointment.reason.toLowerCase().includes(value) ||
        appointment.status.toLowerCase().includes(value) ||
        appointment.date.includes(value) ||
        appointment.time.includes(value);

      const matchesStatus =
        statusFilter === "All" ||
        appointment.status === statusFilter;

      const matchesFromDate =
        !fromDate || appointment.date >= fromDate;

      const matchesToDate =
        !toDate || appointment.date <= toDate;

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
      "Date",
      "Time",
      "Veterinarian",
      "Reason",
      "Status",
    ];

    const rows = filteredAppointments.map((appointment) => [
      appointment.pet,
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
      ...rows.map((row) =>
        row.map(escapeCSV).join(",")
      ),
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
     ADD
  ===================================================== */

  const openAddModal = (date = "") => {
    setNewAppointment({
      pet: "",
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

  const handleAddAppointment = (e) => {
    e.preventDefault();

    const appointment = {
      id: Date.now(),
      ...newAppointment,
    };

    setAppointments((previous) => [
      ...previous,
      appointment,
    ]);

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
      date: "",
      time: "",
      veterinarian: "",
      reason: "",
      status: "Pending",
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
      previous.filter(
        (appointment) => appointment.id !== id
      )
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

    const [y, m, d] = date.split("-");
    return `${d}/${m}/${y}`;
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
     STYLES USED ONLY FOR NEW TOP AREA
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

  /* =====================================================
     RETURN
  ===================================================== */

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">

        {/* =================================================
            HEADER
        ================================================= */}

        <div style={headerStyle}>
          <div>
            <h1 style={{ margin: "0 0 5px" }}>
              Appointments
            </h1>

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

            {/* EXPORT FIRST */}
            <button
              type="button"
              onClick={handleExport}
              style={exportButtonStyle}
            >
              <FaFileExport />
              Export
            </button>

            {/* ADD SECOND */}
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

        {/* =================================================
            FILTERS
        ================================================= */}

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

          {/* SEARCH */}
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

            {/* X INSIDE SEARCH */}
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

          {/* STATUS */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
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
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* FROM */}
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

          {/* TO */}
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

        {/* =================================================
            SORT + VIEW
        ================================================= */}

        <div className="appointments-toolbar">
          <div />

          <div className="appointments-toolbar-right">
            <div className="appointment-sort">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
              >
                <option value="newest">
                  Sort by Newest
                </option>

                <option value="oldest">
                  Sort by Oldest
                </option>

                <option value="pet">
                  Sort by Pet Name
                </option>

                <option value="time">
                  Sort by Time
                </option>
              </select>
            </div>

            <div className="appointment-view-switch">
              <button
                type="button"
                title="List View"
                className={
                  viewMode === "list" ? "active" : ""
                }
                onClick={() => setViewMode("list")}
              >
                <FaList />
              </button>

              <button
                type="button"
                title="Calendar View"
                className={
                  viewMode === "calendar" ? "active" : ""
                }
                onClick={() =>
                  setViewMode("calendar")
                }
              >
                <FaTableCellsLarge />
              </button>
            </div>
          </div>
        </div>

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(180px, 1fr))",
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

            <h2 style={{ margin: 0 }}>
              {totalThisView}
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

        {/* =================================================
            CALENDAR
        ================================================= */}

        {viewMode === "calendar" && (
          <div className="compact-calendar">
            <div className="compact-calendar-header">
              <div>
                <h2>{monthTitle}</h2>

                <p>
                  {filteredAppointments.length} appointment
                  {filteredAppointments.length !== 1
                    ? "s"
                    : ""}
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
                          openAddModal(
                            getDateString(day)
                          )
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

        {/* =================================================
            LIST VIEW
        ================================================= */}

        {viewMode === "list" && (
          <div className="owners-table-container appointment-list-table">
            <table className="owners-table">
              <thead>
                <tr>
                  <th>Pet</th>
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
                      colSpan="7"
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

                        <td>{appointment.reason}</td>

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

      {/* =================================================
          ADD MODAL
      ================================================= */}

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
                    required
                  />
                </div>

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
                    required
                  />
                </div>
              </div>

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

              <div className="form-field">
                <label>Reason</label>

                <input
                  type="text"
                  name="reason"
                  value={newAppointment.reason}
                  onChange={
                    handleNewAppointmentChange
                  }
                  required
                />
              </div>

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

              <div className="form-actions">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={() =>
                    setShowAddModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                >
                  Add Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================
          VIEW MODAL
      ================================================= */}

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
                    setSelectedAppointment(null);
                  }}
                >
                  ×
                </button>
              </div>

              <div className="appointment-view-status">
                <span
                  className={`status ${selectedAppointment.status.toLowerCase()}`}
                >
                  {selectedAppointment.status}
                </span>
              </div>

              <div className="detail-row">
                <span>Date</span>
                <strong>
                  {formatDate(
                    selectedAppointment.date
                  )}
                </strong>
              </div>

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

              <div className="detail-row">
                <span>Reason</span>
                <strong>
                  {selectedAppointment.reason}
                </strong>
              </div>

              <div className="form-actions">
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
                  <span>Delete</span>
                </button>

                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedAppointment(null);
                  }}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="edit-button"
                  onClick={() =>
                    handleOpenEdit(
                      selectedAppointment
                    )
                  }
                >
                  <FaPen />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>
        )}

      {/* =================================================
          EDIT MODAL
      ================================================= */}

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
                    setSelectedAppointment(null);
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
                <div className="form-row">
                  <div className="form-field">
                    <label>Pet Name</label>

                    <input
                      type="text"
                      name="pet"
                      value={
                        selectedAppointment.pet
                      }
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>Veterinarian</label>

                    <input
                      type="text"
                      name="veterinarian"
                      value={
                        selectedAppointment.veterinarian
                      }
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>Date</label>

                    <input
                      type="date"
                      name="date"
                      value={
                        selectedAppointment.date
                      }
                      onChange={handleEditChange}
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
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Reason</label>

                  <input
                    type="text"
                    name="reason"
                    value={
                      selectedAppointment.reason
                    }
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Status</label>

                  <select
                    name="status"
                    value={
                      selectedAppointment.status
                    }
                    onChange={handleEditChange}
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

                <div className="form-actions">
                  <button
                    type="button"
                    className="modal-cancel-button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedAppointment(null);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-button"
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