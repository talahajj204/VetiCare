import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";

import {
  FaEye,
  FaPen,
  FaTrash,
  FaSortAmountDown,
  FaSearch,
  FaTimes,
  FaFileExport,
} from "react-icons/fa";

function Vaccinations() {
  // =====================================================
  // DATA
  // =====================================================

  const [vaccinations, setVaccinations] = useState([
    {
      id: 1,
      pet: "Bella",
      vaccine: "Rabies",
      dateGiven: "2026-05-10",
      nextDueDate: "2027-05-10",
      status: "Completed",
      notes: "Annual rabies vaccination",
    },
    {
      id: 2,
      pet: "Luna",
      vaccine: "FVRCP",
      dateGiven: "2025-10-15",
      nextDueDate: "2026-10-15",
      status: "Due",
      notes: "Next vaccination is due soon",
    },
    {
      id: 3,
      pet: "Max",
      vaccine: "DHPP",
      dateGiven: "2025-08-20",
      nextDueDate: "2026-08-20",
      status: "Overdue",
      notes: "Vaccination is overdue",
    },
  ]);

  // =====================================================
  // SEARCH + FILTER + SORT
  // =====================================================

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");

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

  const [selectedVaccination, setSelectedVaccination] = useState(null);
  const [vaccinationToDelete, setVaccinationToDelete] = useState(null);

  // =====================================================
  // NEW VACCINATION
  // =====================================================

  const [newVaccination, setNewVaccination] = useState({
    pet: "",
    vaccine: "",
    dateGiven: "",
    nextDueDate: "",
    status: "Completed",
    notes: "",
  });

  // =====================================================
  // FILTER
  // =====================================================

  const filteredVaccinations = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return vaccinations.filter((vaccination) => {
      const matchesSearch =
        vaccination.pet.toLowerCase().includes(searchText) ||
        vaccination.vaccine.toLowerCase().includes(searchText) ||
        vaccination.dateGiven.toLowerCase().includes(searchText) ||
        vaccination.nextDueDate.toLowerCase().includes(searchText) ||
        vaccination.status.toLowerCase().includes(searchText) ||
        vaccination.notes.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        vaccination.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [vaccinations, search, statusFilter]);

  // =====================================================
  // SORT
  // =====================================================

  const sortedVaccinations = useMemo(() => {
    return [...filteredVaccinations].sort((a, b) => {
      if (sortBy === "pet-asc") {
        return a.pet.localeCompare(b.pet);
      }

      if (sortBy === "pet-desc") {
        return b.pet.localeCompare(a.pet);
      }

      if (sortBy === "vaccine-asc") {
        return a.vaccine.localeCompare(b.vaccine);
      }

      if (sortBy === "vaccine-desc") {
        return b.vaccine.localeCompare(a.vaccine);
      }

      if (sortBy === "date-newest") {
        return new Date(b.dateGiven) - new Date(a.dateGiven);
      }

      if (sortBy === "date-oldest") {
        return new Date(a.dateGiven) - new Date(b.dateGiven);
      }

      if (sortBy === "due-soonest") {
        return new Date(a.nextDueDate) - new Date(b.nextDueDate);
      }

      if (sortBy === "due-latest") {
        return new Date(b.nextDueDate) - new Date(a.nextDueDate);
      }

      if (sortBy === "status") {
        const statusOrder = {
          Overdue: 1,
          Due: 2,
          Completed: 3,
        };

        return (
          (statusOrder[a.status] || 99) -
          (statusOrder[b.status] || 99)
        );
      }

      return a.id - b.id;
    });
  }, [filteredVaccinations, sortBy]);

  // =====================================================
  // PAGINATION CALCULATIONS
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(sortedVaccinations.length / rowsPerPage)
  );

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const currentVaccinations = sortedVaccinations.slice(
    startIndex,
    endIndex
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, sortBy, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSortBy("default");
    setCurrentPage(1);
  };

  // =====================================================
  // ADD CHANGE
  // =====================================================

  const handleNewVaccinationChange = (e) => {
    const { name, value } = e.target;

    setNewVaccination((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // ADD
  // =====================================================

  const handleAddVaccination = (e) => {
    e.preventDefault();

    const vaccination = {
      id: Date.now(),
      ...newVaccination,
    };

    setVaccinations((prev) => [...prev, vaccination]);

    setNewVaccination({
      pet: "",
      vaccine: "",
      dateGiven: "",
      nextDueDate: "",
      status: "Completed",
      notes: "",
    });

    setShowAddModal(false);
  };

  // =====================================================
  // VIEW
  // =====================================================

  const handleViewVaccination = (vaccination) => {
    setSelectedVaccination(vaccination);
    setShowViewModal(true);
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleOpenEdit = (vaccination) => {
    setSelectedVaccination({ ...vaccination });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setSelectedVaccination((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateVaccination = (e) => {
    e.preventDefault();

    setVaccinations((prev) =>
      prev.map((vaccination) =>
        vaccination.id === selectedVaccination.id
          ? selectedVaccination
          : vaccination
      )
    );

    setShowEditModal(false);
    setSelectedVaccination(null);
  };

  // =====================================================
  // DELETE POPUP
  // =====================================================

  const handleDeleteVaccination = (vaccination) => {
    setVaccinationToDelete(vaccination);
    setShowDeleteModal(true);
  };

  const confirmDeleteVaccination = () => {
    if (!vaccinationToDelete) return;

    setVaccinations((prev) =>
      prev.filter(
        (vaccination) => vaccination.id !== vaccinationToDelete.id
      )
    );

    setVaccinationToDelete(null);
    setShowDeleteModal(false);
  };

  const cancelDeleteVaccination = () => {
    setVaccinationToDelete(null);
    setShowDeleteModal(false);
  };

  // =====================================================
  // EXPORT CSV
  // =====================================================

  const handleExport = () => {
    const dataToExport = sortedVaccinations;

    const headers = [
      "Pet",
      "Vaccine",
      "Date Given",
      "Next Due Date",
      "Status",
      "Notes",
    ];

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = dataToExport.map((vaccination) => [
      vaccination.pet,
      vaccination.vaccine,
      vaccination.dateGiven,
      vaccination.nextDueDate,
      vaccination.status,
      vaccination.notes,
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
    link.setAttribute("download", "vaccinations.csv");

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
    if (status === "Completed") {
      return "status confirmed";
    }

    if (status === "Due") {
      return "status pending";
    }

    return "status cancelled";
  };

  // =====================================================
  // PAGINATION STYLE
  // STANDARD STYLE: < 1 >
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

      <main className="dashboard-main vaccinations-page">
        {/* HEADER */}

        <div className="page-header">
          <div>
            <h1>Vaccinations</h1>
            <p>Manage pet vaccination records</p>
          </div>
        </div>

        {/* =================================================
            SEARCH / FILTERS
        ================================================= */}

        <div className="vaccinations-toolbar">
          <div className="vaccinations-filter-row">
            {/* SEARCH */}

            <div className="vaccinations-search">
              <FaSearch className="vaccinations-search-icon" />

              <input
                type="text"
                placeholder="Search vaccinations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {(search ||
                statusFilter !== "all" ||
                sortBy !== "default") && (
                <button
                  type="button"
                  className="vaccinations-clear-button"
                  onClick={handleClearFilters}
                  title="Clear filters"
                  aria-label="Clear filters"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {/* STATUS FILTER */}

            <select
              className="vaccinations-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Due">Due</option>
              <option value="Overdue">Overdue</option>
            </select>

            {/* SORT */}

            <div className="vaccinations-sort">
              <FaSortAmountDown className="vaccinations-sort-icon" />

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Sort By</option>
                <option value="pet-asc">Pet A-Z</option>
                <option value="pet-desc">Pet Z-A</option>
                <option value="vaccine-asc">Vaccine A-Z</option>
                <option value="vaccine-desc">Vaccine Z-A</option>

                <option value="date-newest">
                  Date Given: Newest
                </option>

                <option value="date-oldest">
                  Date Given: Oldest
                </option>

                <option value="due-soonest">
                  Next Due: Soonest
                </option>

                <option value="due-latest">
                  Next Due: Latest
                </option>

                <option value="status">Status</option>
              </select>
            </div>
          </div>

          {/* BUTTONS */}

          <div className="vaccinations-toolbar-buttons">
            <button
              type="button"
              className="vaccinations-export-button"
              onClick={handleExport}
            >
              <FaFileExport />
              <span>Export</span>
            </button>

            <button
              type="button"
              className="add-button"
              onClick={() => setShowAddModal(true)}
            >
              + Add Vaccination
            </button>
          </div>
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="owners-table-container">
          <table className="owners-table">
            <thead>
              <tr>
                <th>Pet</th>
                <th>Vaccine</th>
                <th>Date Given</th>
                <th>Next Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentVaccinations.length > 0 ? (
                currentVaccinations.map((vaccination) => (
                  <tr key={vaccination.id}>
                    <td>{vaccination.pet}</td>

                    <td>{vaccination.vaccine}</td>

                    <td>{formatDate(vaccination.dateGiven)}</td>

                    <td>{formatDate(vaccination.nextDueDate)}</td>

                    <td>
                      <span
                        className={getStatusClass(
                          vaccination.status
                        )}
                      >
                        {vaccination.status}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="view-button icon-button"
                          onClick={() =>
                            handleViewVaccination(vaccination)
                          }
                          title="View"
                          aria-label="View vaccination"
                        >
                          <FaEye />
                        </button>

                        <button
                          type="button"
                          className="edit-button icon-button"
                          onClick={() =>
                            handleOpenEdit(vaccination)
                          }
                          title="Edit"
                          aria-label="Edit vaccination"
                        >
                          <FaPen />
                        </button>

                        <button
                          type="button"
                          className="delete-button icon-button"
                          onClick={() =>
                            handleDeleteVaccination(vaccination)
                          }
                          title="Delete"
                          aria-label="Delete vaccination"
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
                    No vaccinations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* =================================================
            PAGINATION
            STANDARD: < 1 >
        ================================================= */}

        <div className="vaccinations-pagination">
          <div className="vaccinations-page-size">
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
            className="vaccinations-page-controls"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "6px",
            }}
          >
            {/* PREVIOUS < */}

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
                      ? "vaccinations-page-active"
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

            {/* NEXT > */}

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
          ADD VACCINATION
      ===================================================== */}

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>Add Vaccination</h2>
                <p>Enter vaccination information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddVaccination}>
              <div className="form-row">
                <div className="form-field">
                  <label>Pet Name</label>

                  <input
                    type="text"
                    name="pet"
                    placeholder="Enter pet name"
                    value={newVaccination.pet}
                    onChange={handleNewVaccinationChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Vaccine Name</label>

                  <input
                    type="text"
                    name="vaccine"
                    placeholder="Enter vaccine name"
                    value={newVaccination.vaccine}
                    onChange={handleNewVaccinationChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Date Given</label>

                  <input
                    type="date"
                    name="dateGiven"
                    value={newVaccination.dateGiven}
                    onChange={handleNewVaccinationChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Next Due Date</label>

                  <input
                    type="date"
                    name="nextDueDate"
                    value={newVaccination.nextDueDate}
                    onChange={handleNewVaccinationChange}
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Status</label>

                <select
                  name="status"
                  value={newVaccination.status}
                  onChange={handleNewVaccinationChange}
                >
                  <option value="Completed">Completed</option>
                  <option value="Due">Due</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              <div className="form-field">
                <label>Notes</label>

                <textarea
                  name="notes"
                  rows="3"
                  placeholder="Additional notes..."
                  value={newVaccination.notes}
                  onChange={handleNewVaccinationChange}
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
                  Add Vaccination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          VIEW VACCINATION
      ===================================================== */}

      {showViewModal && selectedVaccination && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>Vaccination Details</h2>
                <p>View pet vaccination information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedVaccination(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="detail-row">
              <span>Pet Name</span>
              <strong>{selectedVaccination.pet}</strong>
            </div>

            <div className="detail-row">
              <span>Vaccine Name</span>
              <strong>{selectedVaccination.vaccine}</strong>
            </div>

            <div className="detail-row">
              <span>Date Given</span>
              <strong>
                {formatDate(selectedVaccination.dateGiven)}
              </strong>
            </div>

            <div className="detail-row">
              <span>Next Due Date</span>
              <strong>
                {formatDate(selectedVaccination.nextDueDate)}
              </strong>
            </div>

            <div className="detail-row">
              <span>Status</span>
              <strong>{selectedVaccination.status}</strong>
            </div>

            <div className="detail-row">
              <span>Notes</span>
              <strong>
                {selectedVaccination.notes || "—"}
              </strong>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="modal-cancel-button"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedVaccination(null);
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
                  Edit Vaccination
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          EDIT VACCINATION
      ===================================================== */}

      {showEditModal && selectedVaccination && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>Edit Vaccination</h2>
                <p>Update vaccination information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedVaccination(null);
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateVaccination}>
              <div className="form-row">
                <div className="form-field">
                  <label>Pet Name</label>

                  <input
                    type="text"
                    name="pet"
                    value={selectedVaccination.pet}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Vaccine Name</label>

                  <input
                    type="text"
                    name="vaccine"
                    value={selectedVaccination.vaccine}
                    onChange={handleEditChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Date Given</label>

                  <input
                    type="date"
                    name="dateGiven"
                    value={selectedVaccination.dateGiven}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Next Due Date</label>

                  <input
                    type="date"
                    name="nextDueDate"
                    value={selectedVaccination.nextDueDate}
                    onChange={handleEditChange}
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Status</label>

                <select
                  name="status"
                  value={selectedVaccination.status}
                  onChange={handleEditChange}
                >
                  <option value="Completed">Completed</option>
                  <option value="Due">Due</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              <div className="form-field">
                <label>Notes</label>

                <textarea
                  name="notes"
                  rows="3"
                  value={selectedVaccination.notes}
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedVaccination(null);
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
          DELETE POPUP
      ===================================================== */}

      {showDeleteModal && vaccinationToDelete && (
        <div className="vaccinations-delete-overlay">
          <div className="vaccinations-delete-dialog">
            <div className="vaccinations-delete-icon">
              <FaTrash />
            </div>

            <h3>Delete Vaccination</h3>

            <p>Are you sure you want to delete this?</p>

            <div className="vaccinations-delete-actions">
              <button
                type="button"
                className="vaccinations-delete-cancel"
                onClick={cancelDeleteVaccination}
              >
                Cancel
              </button>

              <button
                type="button"
                className="vaccinations-delete-confirm"
                onClick={confirmDeleteVaccination}
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

export default Vaccinations;