import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";

import {
  FaEye,
  FaPen,
  FaTrash,
  FaSearch,
  FaTimes,
  FaFileExport,
} from "react-icons/fa";

function Reminders() {
  // =====================================================
  // DATA
  // =====================================================

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

  // =====================================================
  // FILTERS
  // =====================================================

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // =====================================================
  // PAGINATION
  // =====================================================

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // =====================================================
  // MODALS
  // =====================================================

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedReminder, setSelectedReminder] = useState(null);
  const [reminderToDelete, setReminderToDelete] = useState(null);

  // =====================================================
  // NEW REMINDER
  // =====================================================

  const [newReminder, setNewReminder] = useState({
    pet: "",
    type: "",
    dueDate: "",
    message: "",
    status: "Active",
  });

  // =====================================================
  // TYPES
  // =====================================================

  const reminderTypes = useMemo(() => {
    return [...new Set(reminders.map((reminder) => reminder.type))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [reminders]);

  // =====================================================
  // FILTER + SORT
  // =====================================================

  const filteredReminders = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    let result = reminders.filter((reminder) => {
      const matchesSearch =
        !searchText ||
        reminder.pet.toLowerCase().includes(searchText) ||
        reminder.type.toLowerCase().includes(searchText) ||
        reminder.dueDate.toLowerCase().includes(searchText) ||
        reminder.message.toLowerCase().includes(searchText) ||
        reminder.status.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" || reminder.status === statusFilter;

      const matchesType =
        typeFilter === "All" || reminder.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }

      if (sortBy === "petAZ") {
        return a.pet.localeCompare(b.pet);
      }

      if (sortBy === "petZA") {
        return b.pet.localeCompare(a.pet);
      }

      return new Date(b.dueDate) - new Date(a.dueDate);
    });

    return result;
  }, [reminders, search, statusFilter, typeFilter, sortBy]);

  // =====================================================
  // PAGINATION CALCULATIONS
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReminders.length / rowsPerPage)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, typeFilter, sortBy, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * rowsPerPage;

  const paginatedReminders = filteredReminders.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setTypeFilter("All");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const hasFilters =
    search !== "" ||
    statusFilter !== "All" ||
    typeFilter !== "All" ||
    sortBy !== "newest";

  // =====================================================
  // NEW REMINDER CHANGE
  // =====================================================

  const handleNewReminderChange = (e) => {
    const { name, value } = e.target;

    setNewReminder((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // ADD REMINDER
  // =====================================================

  const handleAddReminder = (e) => {
    e.preventDefault();

    const reminder = {
      id: Date.now(),
      ...newReminder,
    };

    setReminders((previous) => [...previous, reminder]);

    setNewReminder({
      pet: "",
      type: "",
      dueDate: "",
      message: "",
      status: "Active",
    });

    setShowAddModal(false);
  };

  // =====================================================
  // VIEW
  // =====================================================

  const handleViewReminder = (reminder) => {
    setSelectedReminder(reminder);
    setShowViewModal(true);
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleOpenEdit = (reminder) => {
    setSelectedReminder({ ...reminder });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setSelectedReminder((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleUpdateReminder = (e) => {
    e.preventDefault();

    setReminders((previous) =>
      previous.map((reminder) =>
        reminder.id === selectedReminder.id
          ? selectedReminder
          : reminder
      )
    );

    setShowEditModal(false);
    setSelectedReminder(null);
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleOpenDelete = (reminder) => {
    setReminderToDelete(reminder);
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setReminderToDelete(null);
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = () => {
    if (!reminderToDelete) return;

    setReminders((previous) =>
      previous.filter(
        (reminder) => reminder.id !== reminderToDelete.id
      )
    );

    setReminderToDelete(null);
    setShowDeleteModal(false);
  };

  // =====================================================
  // EXPORT CSV
  // =====================================================

  const handleExport = () => {
    const headers = [
      "Pet Name",
      "Reminder Type",
      "Due Date",
      "Message",
      "Status",
    ];

    const escapeCSV = (value) => {
      const stringValue = String(value ?? "");
      return `"${stringValue.replace(/"/g, '""')}"`;
    };

    const rows = filteredReminders.map((reminder) => [
      reminder.pet,
      reminder.type,
      reminder.dueDate,
      reminder.message,
      reminder.status,
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "reminders.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "";

    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    if (status === "Active") {
      return "status confirmed";
    }

    if (status === "Due Soon") {
      return "status pending";
    }

    return "status cancelled";
  };

  // =====================================================
  // PAGINATION STYLES
  // SAME STANDARD STYLE: < 1 >
  // =====================================================

  const paginationButtonStyle = {
    width: "34px",
    minWidth: "34px",
    maxWidth: "34px",
    height: "34px",
    minHeight: "34px",
    maxHeight: "34px",
    padding: "0",
    margin: "0",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "0 0 34px",
    boxSizing: "border-box",
    border: "1px solid #c9dddd",
    borderRadius: "7px",
    backgroundColor: "#ffffff",
    color: "#455757",
    fontSize: "14px",
    fontWeight: "700",
    lineHeight: "1",
    boxShadow: "none",
    cursor: "pointer",
  };

  const paginationActiveStyle = {
    ...paginationButtonStyle,
    backgroundColor: "#54b7b5",
    borderColor: "#54b7b5",
    color: "#ffffff",
  };

  const paginationDisabledStyle = {
    ...paginationButtonStyle,
    backgroundColor: "#edf3f2",
    borderColor: "#d7e5e3",
    color: "#9aadaa",
    cursor: "not-allowed",
    opacity: 1,
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main reminders-page">
        {/* HEADER */}

        <div className="reminders-page-header">
          <h1>Reminders</h1>
          <p>Manage clinic reminders</p>
        </div>

        {/* FILTERS */}

        <div className="reminders-filters-row">
          <div className="reminders-search-box">
            <FaSearch className="reminders-search-icon" />

            <input
              type="text"
              placeholder="Search reminders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {hasFilters && (
              <button
                type="button"
                className="reminders-clear-button"
                onClick={clearFilters}
                title="Clear filters"
                aria-label="Clear filters"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <select
            className="reminders-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Due Soon">Due Soon</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            className="reminders-filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Types</option>

            {reminderTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            className="reminders-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Sort by Newest</option>
            <option value="oldest">Sort by Oldest</option>
            <option value="petAZ">Pet A - Z</option>
            <option value="petZA">Pet Z - A</option>
          </select>
        </div>

        {/* TOOLBAR BUTTONS */}

        <div className="reminders-toolbar-buttons">
          <button
            type="button"
            className="reminders-export-button"
            onClick={handleExport}
          >
            <FaFileExport />
            Export
          </button>

          <button
            type="button"
            className="reminders-add-button"
            onClick={() => setShowAddModal(true)}
          >
            + Add Reminder
          </button>
        </div>

        {/* TABLE */}

        <div className="owners-table-container reminders-table-container">
          <div className="reminders-table-scroll">
            <table className="owners-table reminders-table">
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
                {paginatedReminders.length > 0 ? (
                  paginatedReminders.map((reminder) => (
                    <tr key={reminder.id}>
                      <td>{reminder.pet}</td>
                      <td>{reminder.type}</td>
                      <td>{formatDate(reminder.dueDate)}</td>
                      <td>{reminder.message}</td>

                      <td>
                        <span
                          className={getStatusClass(reminder.status)}
                        >
                          {reminder.status}
                        </span>
                      </td>

                      <td>
                        <div className="table-actions">
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

                          <button
                            type="button"
                            className="delete-button icon-button"
                            onClick={() =>
                              handleOpenDelete(reminder)
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
        </div>

        {/* PAGINATION */}

        <div className="reminders-pagination">
          <div className="reminders-rows-per-page">
            <span>Rows per page:</span>

            <select
              value={rowsPerPage}
              onChange={(e) =>
                setRowsPerPage(Number(e.target.value))
              }
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div
            className="reminders-page-controls"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "6px",
            }}
          >
            {/* < */}

            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.max(page - 1, 1)
                )
              }
              aria-label="Previous page"
              style={
                currentPage === 1
                  ? paginationDisabledStyle
                  : paginationButtonStyle
              }
            >
              &lt;
            </button>

            {/* PAGE NUMBERS */}

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => {
              const isActive = currentPage === page;

              return (
                <button
                  type="button"
                  key={page}
                  className={
                    isActive
                      ? "reminders-page-active"
                      : ""
                  }
                  onClick={() => setCurrentPage(page)}
                  aria-current={
                    isActive ? "page" : undefined
                  }
                  style={
                    isActive
                      ? paginationActiveStyle
                      : paginationButtonStyle
                  }
                >
                  {page}
                </button>
              );
            })}

            {/* > */}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(page + 1, totalPages)
                )
              }
              aria-label="Next page"
              style={
                currentPage === totalPages
                  ? paginationDisabledStyle
                  : paginationButtonStyle
              }
            >
              &gt;
            </button>
          </div>
        </div>
      </main>

      {/* =====================================================
          ADD REMINDER MODAL
      ===================================================== */}

      {showAddModal && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddModal(false);
            }
          }}
        >
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
                    <option value="Active">Active</option>
                    <option value="Due Soon">Due Soon</option>
                    <option value="Completed">Completed</option>
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

      {/* =====================================================
          VIEW REMINDER MODAL
      ===================================================== */}

      {showViewModal && selectedReminder && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowViewModal(false);
              setSelectedReminder(null);
            }
          }}
        >
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
                className="edit-button reminders-modal-edit"
                onClick={() => {
                  setShowViewModal(false);
                  setShowEditModal(true);
                }}
              >
                <FaPen />
                <span>Edit Reminder</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          EDIT REMINDER MODAL
      ===================================================== */}

      {showEditModal && selectedReminder && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModal(false);
              setSelectedReminder(null);
            }
          }}
        >
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
                    <option value="Active">Active</option>
                    <option value="Due Soon">Due Soon</option>
                    <option value="Completed">Completed</option>
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

      {/* =====================================================
          DELETE CONFIRMATION
      ===================================================== */}

      {showDeleteModal && reminderToDelete && (
        <div
          className="reminders-delete-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              handleCancelDelete();
            }
          }}
        >
          <div className="reminders-delete-dialog">
            <div className="reminders-delete-icon">
              <FaTrash />
            </div>

            <h3>Delete Reminder</h3>

            <p>Are you sure you want to delete this?</p>

            <div className="reminders-delete-actions">
              <button
                type="button"
                className="reminders-delete-cancel"
                onClick={handleCancelDelete}
              >
                Cancel
              </button>

              <button
                type="button"
                className="reminders-delete-confirm"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reminders;