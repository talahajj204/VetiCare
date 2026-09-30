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
} from "react-icons/fa6";

function Appointments() {
  // =========================================
  // APPOINTMENTS DATA
  // =========================================

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

  // =========================================
  // SEARCH / SORT / VIEW
  // =========================================

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("calendar");

  // =========================================
  // MODALS
  // =========================================

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedAppointment, setSelectedAppointment] =
    useState(null);

  // =========================================
  // NEW APPOINTMENT
  // =========================================

  const [newAppointment, setNewAppointment] = useState({
    pet: "",
    date: "",
    time: "",
    veterinarian: "",
    reason: "",
    status: "Pending",
  });

  // =========================================
  // CALENDAR DATE
  // =========================================

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

  // =========================================
  // SEARCH + SORT
  // =========================================

  const filteredAppointments = appointments
    .filter((appointment) => {
      const value = search.trim().toLowerCase();

      return (
        appointment.pet.toLowerCase().includes(value) ||
        appointment.veterinarian
          .toLowerCase()
          .includes(value) ||
        appointment.reason.toLowerCase().includes(value) ||
        appointment.status.toLowerCase().includes(value) ||
        appointment.date.includes(value) ||
        appointment.time.includes(value)
      );
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);

        return dateB - dateA;
      }

      if (sortBy === "oldest") {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);

        return dateA - dateB;
      }

      if (sortBy === "pet") {
        return a.pet.localeCompare(b.pet);
      }

      if (sortBy === "time") {
        return a.time.localeCompare(b.time);
      }

      return 0;
    });

  // =========================================
  // CALENDAR FUNCTIONS
  // =========================================

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

  // =========================================
  // ADD
  // =========================================

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

  // =========================================
  // VIEW
  // =========================================

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowViewModal(true);
  };

  // =========================================
  // EDIT
  // =========================================

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

    if (selectedAppointment.date) {
      const [appointmentYear, appointmentMonth] =
        selectedAppointment.date.split("-");

      setCurrentDate(
        new Date(
          Number(appointmentYear),
          Number(appointmentMonth) - 1,
          1
        )
      );
    }

    setShowEditModal(false);
    setSelectedAppointment(null);
  };

  // =========================================
  // DELETE
  // =========================================

  const handleDeleteAppointment = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this appointment?"
    );

    if (!confirmDelete) {
      return;
    }

    setAppointments((previous) =>
      previous.filter(
        (appointment) => appointment.id !== id
      )
    );

    setShowViewModal(false);
    setShowEditModal(false);
    setSelectedAppointment(null);
  };

  // =========================================
  // FORMAT DATE
  // =========================================

  const formatDate = (date) => {
    if (!date) return "";

    const [y, m, d] = date.split("-");

    return `${d}/${m}/${y}`;
  };

  // =========================================
  // FORMAT TIME
  // =========================================

  const formatTime = (time) => {
    if (!time) return "";

    const [hours, minutes] = time.split(":");

    let hour = Number(hours);

    const period = hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12;

    return `${hour}:${minutes} ${period}`;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">

        {/* =====================================
            PAGE HEADER
        ===================================== */}

        <div className="page-header">
          <div>
            <h1>Appointments</h1>
            <p>Manage clinic appointments</p>
          </div>

          <button
            type="button"
            className="add-button"
            onClick={() => openAddModal()}
          >
            + New Appointment
          </button>
        </div>

        {/* =====================================
            TOOLBAR
        ===================================== */}

        <div className="appointments-toolbar">

          {/* SEARCH */}

          <div className="appointments-search">
            <input
              type="text"
              placeholder="Search appointments..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <div className="appointments-toolbar-right">

            {/* SORT */}

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

            {/* VIEW SWITCH */}

            <div className="appointment-view-switch">

              <button
                type="button"
                title="List View"
                className={
                  viewMode === "list"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setViewMode("list")
                }
              >
                <FaList />
              </button>

              <button
                type="button"
                title="Calendar View"
                className={
                  viewMode === "calendar"
                    ? "active"
                    : ""
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

        {/* =====================================
            CALENDAR VIEW
        ===================================== */}

        {viewMode === "calendar" && (
          <div className="compact-calendar">

            {/* HEADER */}

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

            {/* WEEKDAYS */}

            <div className="compact-calendar-weekdays">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* GRID */}

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
                      isToday(day)
                        ? "today"
                        : ""
                    }`}
                  >

                    {/* DAY NUMBER */}

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

                    {/* EVENTS */}

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
                          +
                          {dayAppointments.length - 3}{" "}
                          more
                        </span>
                      )}

                    </div>

                  </div>
                );
              })}

            </div>

            {/* LEGEND */}

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

        {/* =====================================
            LIST VIEW
        ===================================== */}

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
                          {
                            appointment.veterinarian
                          }
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

      {/* =========================================
          ADD APPOINTMENT MODAL
      ========================================= */}

      {showAddModal && (
        <div className="modal-overlay">

          <div className="modal-container">

            <div className="modal-header">

              <div>
                <h2>New Appointment</h2>
                <p>
                  Enter appointment information
                </p>
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
                    placeholder="Enter pet name"
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
                    placeholder="Enter veterinarian"
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
                  placeholder="Reason for visit"
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

      {/* =========================================
          VIEW APPOINTMENT MODAL
      ========================================= */}

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

              <div className="appointment-view-status">
                <span
                  className={`status ${selectedAppointment.status.toLowerCase()}`}
                >
                  {
                    selectedAppointment.status
                  }
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
                  {
                    selectedAppointment.reason
                  }
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
                    setSelectedAppointment(
                      null
                    );
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

      {/* =========================================
          EDIT APPOINTMENT MODAL
      ========================================= */}

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
                    <label>
                      Veterinarian
                    </label>

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

                <div className="form-actions">

                  <button
                    type="button"
                    className="modal-cancel-button"
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