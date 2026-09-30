import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { FaEye, FaPen, FaTrash } from "react-icons/fa";

function Reminders() {
  // =========================
  // DATA
  // =========================

  const [reminders, setReminders] = useState([
    {
      id: 1,
      pet: "Bella",
      type: "Vaccination",
      dueDate: "2027-05-10",
      message: "Rabies vaccine due",
      status: "Active",
    },
    {
      id: 2,
      pet: "Luna",
      type: "Checkup",
      dueDate: "2026-10-15",
      message: "Annual checkup",
      status: "Due Soon",
    },
  ]);

  // =========================
  // SEARCH
  // =========================

  const [search, setSearch] = useState("");

  // =========================
  // MODALS
  // =========================

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedReminder, setSelectedReminder] = useState(null);

  // =========================
  // NEW REMINDER
  // =========================

  const [newReminder, setNewReminder] = useState({
    pet: "",
    type: "",
    dueDate: "",
    message: "",
    status: "Active",
  });

  // =========================
  // SEARCH FILTER
  // =========================

  const filteredReminders = reminders.filter((reminder) => {
    const searchText = search.trim().toLowerCase();

    return (
      reminder.pet.toLowerCase().includes(searchText) ||
      reminder.type.toLowerCase().includes(searchText) ||
      reminder.dueDate.toLowerCase().includes(searchText) ||
      reminder.message.toLowerCase().includes(searchText) ||
      reminder.status.toLowerCase().includes(searchText)
    );
  });

  // =========================
  // NEW REMINDER CHANGE
  // =========================

  const handleNewReminderChange = (e) => {
    const { name, value } = e.target;

    setNewReminder({
      ...newReminder,
      [name]: value,
    });
  };

  // =========================
  // ADD REMINDER
  // =========================

  const handleAddReminder = (e) => {
    e.preventDefault();

    const reminder = {
      id: Date.now(),
      ...newReminder,
    };

    setReminders([...reminders, reminder]);

    setNewReminder({
      pet: "",
      type: "",
      dueDate: "",
      message: "",
      status: "Active",
    });

    setShowAddModal(false);
  };

  // =========================
  // VIEW
  // =========================

  const handleViewReminder = (reminder) => {
    setSelectedReminder(reminder);
    setShowViewModal(true);
  };

  // =========================
  // OPEN EDIT
  // =========================

  const handleOpenEdit = (reminder) => {
    setSelectedReminder({ ...reminder });
    setShowEditModal(true);
  };

  // =========================
  // EDIT CHANGE
  // =========================

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setSelectedReminder({
      ...selectedReminder,
      [name]: value,
    });
  };

  // =========================
  // UPDATE REMINDER
  // =========================

  const handleUpdateReminder = (e) => {
    e.preventDefault();

    setReminders(
      reminders.map((reminder) =>
        reminder.id === selectedReminder.id
          ? selectedReminder
          : reminder
      )
    );

    setShowEditModal(false);
    setSelectedReminder(null);
  };

  // =========================
  // DELETE
  // =========================

  const handleDeleteReminder = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this reminder?"
    );

    if (confirmDelete) {
      setReminders(
        reminders.filter((reminder) => reminder.id !== id)
      );
    }
  };

  // =========================
  // DATE FORMAT
  // =========================

  const formatDate = (date) => {
    if (!date) return "";

    const [year, month, day] = date.split("-");

    return `${day}/${month}/${year}`;
  };

  // =========================
  // STATUS CLASS
  // =========================

  const getStatusClass = (status) => {
    if (status === "Active") {
      return "status confirmed";
    }

    if (status === "Due Soon") {
      return "status pending";
    }

    return "status cancelled";
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">

        {/* HEADER */}

        <div className="page-header">
          <div>
            <h1>Reminders</h1>
            <p>Manage clinic reminders</p>
          </div>

          <button
            type="button"
            className="add-button"
            onClick={() => setShowAddModal(true)}
          >
            + Add Reminder
          </button>
        </div>

        {/* SEARCH */}

        <div className="search-container">
          <input
            type="text"
            placeholder="Search reminders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* TABLE */}

        <div className="owners-table-container">
          <table className="owners-table">

            <thead>
              <tr>
                <th>Pet Name</th>
                <th>Reminder Type</th>
                <th>Due Date</th>
                <th>Message</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredReminders.length > 0 ? (
                filteredReminders.map((reminder) => (
                  <tr key={reminder.id}>

                    <td>{reminder.pet}</td>

                    <td>{reminder.type}</td>

                    <td>{formatDate(reminder.dueDate)}</td>

                    <td>{reminder.message}</td>

                    <td>
                      <span className={getStatusClass(reminder.status)}>
                        {reminder.status}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions">

                        {/* VIEW */}

                        <button
                          type="button"
                          className="view-button icon-button"
                          onClick={() =>
                            handleViewReminder(reminder)
                          }
                          title="View"
                          aria-label="View reminder"
                        >
                          <FaEye />
                        </button>

                        {/* EDIT */}

                        <button
                          type="button"
                          className="edit-button icon-button"
                          onClick={() =>
                            handleOpenEdit(reminder)
                          }
                          title="Edit"
                          aria-label="Edit reminder"
                        >
                          <FaPen />
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          className="delete-button icon-button"
                          onClick={() =>
                            handleDeleteReminder(reminder.id)
                          }
                          title="Delete"
                          aria-label="Delete reminder"
                        >
                          <FaTrash />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-results">
                    No reminders found
                  </td>
                </tr>
              )}

            </tbody>

          </table>
        </div>

      </main>

      {/* =========================================
          ADD REMINDER MODAL
      ========================================= */}

      {showAddModal && (
        <div className="modal-overlay">

          <div className="modal-container">

            <div className="modal-header">
              <div>
                <h2>Add Reminder</h2>
                <p>Enter reminder information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddReminder}>

              <div className="form-row">

                <div className="form-field">
                  <label>Pet Name</label>

                  <input
                    type="text"
                    name="pet"
                    placeholder="Enter pet name"
                    value={newReminder.pet}
                    onChange={handleNewReminderChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Reminder Type</label>

                  <input
                    type="text"
                    name="type"
                    placeholder="Vaccination, Checkup..."
                    value={newReminder.type}
                    onChange={handleNewReminderChange}
                    required
                  />
                </div>

              </div>

              <div className="form-row">

                <div className="form-field">
                  <label>Due Date</label>

                  <input
                    type="date"
                    name="dueDate"
                    value={newReminder.dueDate}
                    onChange={handleNewReminderChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Status</label>

                  <select
                    name="status"
                    value={newReminder.status}
                    onChange={handleNewReminderChange}
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Due Soon">
                      Due Soon
                    </option>

                    <option value="Completed">
                      Completed
                    </option>
                  </select>
                </div>

              </div>

              <div className="form-field">
                <label>Message</label>

                <textarea
                  name="message"
                  rows="4"
                  placeholder="Enter reminder message"
                  value={newReminder.message}
                  onChange={handleNewReminderChange}
                  required
                />
              </div>

              <div className="form-actions">

                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                >
                  Add Reminder
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =========================================
          VIEW REMINDER MODAL
      ========================================= */}

      {showViewModal && selectedReminder && (
        <div className="modal-overlay">

          <div className="modal-container">

            <div className="modal-header">
              <div>
                <h2>Reminder Details</h2>
                <p>View reminder information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedReminder(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="detail-row">
              <span>Pet Name</span>
              <strong>{selectedReminder.pet}</strong>
            </div>

            <div className="detail-row">
              <span>Reminder Type</span>
              <strong>{selectedReminder.type}</strong>
            </div>

            <div className="detail-row">
              <span>Due Date</span>
              <strong>
                {formatDate(selectedReminder.dueDate)}
              </strong>
            </div>

            <div className="detail-row">
              <span>Message</span>
              <strong>{selectedReminder.message}</strong>
            </div>

            <div className="detail-row">
              <span>Status</span>

              <strong>
                <span
                  className={getStatusClass(
                    selectedReminder.status
                  )}
                >
                  {selectedReminder.status}
                </span>
              </strong>
            </div>

            <div className="form-actions">

              <button
                type="button"
                className="modal-cancel-button"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedReminder(null);
                }}
              >
                Close
              </button>

              <button
                type="button"
                className="edit-button"
                onClick={() => {
                  setShowViewModal(false);
                  setShowEditModal(true);
                }}
              >
                <FaPen />

                <span style={{ marginLeft: "7px" }}>
                  Edit Reminder
                </span>
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =========================================
          EDIT REMINDER MODAL
      ========================================= */}

      {showEditModal && selectedReminder && (
        <div className="modal-overlay">

          <div className="modal-container">

            <div className="modal-header">
              <div>
                <h2>Edit Reminder</h2>
                <p>Update reminder information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedReminder(null);
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateReminder}>

              <div className="form-row">

                <div className="form-field">
                  <label>Pet Name</label>

                  <input
                    type="text"
                    name="pet"
                    value={selectedReminder.pet}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Reminder Type</label>

                  <input
                    type="text"
                    name="type"
                    value={selectedReminder.type}
                    onChange={handleEditChange}
                    required
                  />
                </div>

              </div>

              <div className="form-row">

                <div className="form-field">
                  <label>Due Date</label>

                  <input
                    type="date"
                    name="dueDate"
                    value={selectedReminder.dueDate}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Status</label>

                  <select
                    name="status"
                    value={selectedReminder.status}
                    onChange={handleEditChange}
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Due Soon">
                      Due Soon
                    </option>

                    <option value="Completed">
                      Completed
                    </option>
                  </select>
                </div>

              </div>

              <div className="form-field">
                <label>Message</label>

                <textarea
                  name="message"
                  rows="4"
                  value={selectedReminder.message}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="form-actions">

                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedReminder(null);
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

export default Reminders;