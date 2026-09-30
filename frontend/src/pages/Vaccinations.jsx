import { useState } from "react";
import Sidebar from "../components/Sidebar";

import {
  FaEye,
  FaPen,
  FaTrash,
  FaSortAmountDown,
} from "react-icons/fa";

function Vaccinations() {
  // =========================
  // DATA
  // =========================

  const [vaccinations, setVaccinations] = useState([
    {
      id: 1,
      pet: "Bella",
      vaccine: "Rabies",
      dateGiven: "2026-05-10",
      nextDueDate: "2027-05-10",
      status: "Up to Date",
      notes: "Annual rabies vaccination",
    },
    {
      id: 2,
      pet: "Luna",
      vaccine: "FVRCP",
      dateGiven: "2025-10-15",
      nextDueDate: "2026-10-15",
      status: "Due Soon",
      notes: "Next vaccination is due soon",
    },
  ]);

  // =========================
  // SEARCH + SORT
  // =========================

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // =========================
  // MODALS
  // =========================

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedVaccination, setSelectedVaccination] =
    useState(null);

  // =========================
  // NEW VACCINATION
  // =========================

  const [newVaccination, setNewVaccination] = useState({
    pet: "",
    vaccine: "",
    dateGiven: "",
    nextDueDate: "",
    status: "Up to Date",
    notes: "",
  });

  // =========================
  // SEARCH FILTER
  // =========================

  const filteredVaccinations = vaccinations.filter(
    (vaccination) => {
      const searchText = search.trim().toLowerCase();

      return (
        vaccination.pet.toLowerCase().includes(searchText) ||
        vaccination.vaccine.toLowerCase().includes(searchText) ||
        vaccination.dateGiven.toLowerCase().includes(searchText) ||
        vaccination.nextDueDate
          .toLowerCase()
          .includes(searchText) ||
        vaccination.status.toLowerCase().includes(searchText) ||
        vaccination.notes.toLowerCase().includes(searchText)
      );
    }
  );

  // =========================
  // SORT
  // =========================

  const sortedVaccinations = [...filteredVaccinations].sort(
    (a, b) => {
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
        return (
          new Date(b.dateGiven) -
          new Date(a.dateGiven)
        );
      }

      if (sortBy === "date-oldest") {
        return (
          new Date(a.dateGiven) -
          new Date(b.dateGiven)
        );
      }

      if (sortBy === "due-soonest") {
        return (
          new Date(a.nextDueDate) -
          new Date(b.nextDueDate)
        );
      }

      if (sortBy === "due-latest") {
        return (
          new Date(b.nextDueDate) -
          new Date(a.nextDueDate)
        );
      }

      if (sortBy === "status") {
        const statusOrder = {
          Overdue: 1,
          "Due Soon": 2,
          "Up to Date": 3,
        };

        return (
          (statusOrder[a.status] || 99) -
          (statusOrder[b.status] || 99)
        );
      }

      return a.id - b.id;
    }
  );

  // =========================
  // ADD CHANGE
  // =========================

  const handleNewVaccinationChange = (e) => {
    const { name, value } = e.target;

    setNewVaccination({
      ...newVaccination,
      [name]: value,
    });
  };

  // =========================
  // ADD VACCINATION
  // =========================

  const handleAddVaccination = (e) => {
    e.preventDefault();

    const vaccination = {
      id: Date.now(),
      ...newVaccination,
    };

    setVaccinations([
      ...vaccinations,
      vaccination,
    ]);

    setNewVaccination({
      pet: "",
      vaccine: "",
      dateGiven: "",
      nextDueDate: "",
      status: "Up to Date",
      notes: "",
    });

    setShowAddModal(false);
  };

  // =========================
  // VIEW
  // =========================

  const handleViewVaccination = (vaccination) => {
    setSelectedVaccination(vaccination);
    setShowViewModal(true);
  };

  // =========================
  // OPEN EDIT
  // =========================

  const handleOpenEdit = (vaccination) => {
    setSelectedVaccination({
      ...vaccination,
    });

    setShowEditModal(true);
  };

  // =========================
  // EDIT CHANGE
  // =========================

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setSelectedVaccination({
      ...selectedVaccination,
      [name]: value,
    });
  };

  // =========================
  // UPDATE
  // =========================

  const handleUpdateVaccination = (e) => {
    e.preventDefault();

    setVaccinations(
      vaccinations.map((vaccination) =>
        vaccination.id === selectedVaccination.id
          ? selectedVaccination
          : vaccination
      )
    );

    setShowEditModal(false);
    setSelectedVaccination(null);
  };

  // =========================
  // DELETE
  // =========================

  const handleDeleteVaccination = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this vaccination?"
    );

    if (confirmDelete) {
      setVaccinations(
        vaccinations.filter(
          (vaccination) => vaccination.id !== id
        )
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

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-main">

        {/* HEADER */}

        <div className="page-header">
          <div>
            <h1>Vaccinations</h1>
            <p>Manage pet vaccination records</p>
          </div>
        </div>

        {/* SEARCH + SORT + ADD */}

        <div className="inventory-toolbar">

          <div className="search-container inventory-search">
            <input
              type="text"
              placeholder="Search vaccinations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="inventory-toolbar-actions">

            {/* SORT */}

            <div className="sort-container">

              <FaSortAmountDown className="sort-icon" />

              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
              >
                <option value="default">
                  Sort By
                </option>

                <option value="pet-asc">
                  Pet A-Z
                </option>

                <option value="pet-desc">
                  Pet Z-A
                </option>

                <option value="vaccine-asc">
                  Vaccine A-Z
                </option>

                <option value="vaccine-desc">
                  Vaccine Z-A
                </option>

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

                <option value="status">
                  Status
                </option>

              </select>

            </div>

            {/* ADD */}

            <button
              type="button"
              className="add-button"
              onClick={() => setShowAddModal(true)}
            >
              + Add Vaccination
            </button>

          </div>

        </div>

        {/* TABLE */}

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

              {sortedVaccinations.length > 0 ? (

                sortedVaccinations.map(
                  (vaccination) => (

                    <tr key={vaccination.id}>

                      <td>{vaccination.pet}</td>

                      <td>{vaccination.vaccine}</td>

                      <td>
                        {formatDate(
                          vaccination.dateGiven
                        )}
                      </td>

                      <td>
                        {formatDate(
                          vaccination.nextDueDate
                        )}
                      </td>

                      <td>

                        <span
                          className={
                            vaccination.status ===
                            "Up to Date"
                              ? "status confirmed"
                              : vaccination.status ===
                                "Due Soon"
                              ? "status pending"
                              : "status cancelled"
                          }
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
                              handleViewVaccination(
                                vaccination
                              )
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
                              handleOpenEdit(
                                vaccination
                              )
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
                              handleDeleteVaccination(
                                vaccination.id
                              )
                            }
                            title="Delete"
                            aria-label="Delete vaccination"
                          >
                            <FaTrash />
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>
                  <td
                    colSpan="6"
                    className="no-results"
                  >
                    No vaccinations found
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </main>

      {/* ==========================================
          ADD VACCINATION
      ========================================== */}

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
                onClick={() =>
                  setShowAddModal(false)
                }
              >
                ×
              </button>

            </div>

            <form onSubmit={handleAddVaccination}>

              {/* PET + VACCINE */}

              <div className="form-row">

                <div className="form-field">

                  <label>Pet Name</label>

                  <input
                    type="text"
                    name="pet"
                    placeholder="Enter pet name"
                    value={newVaccination.pet}
                    onChange={
                      handleNewVaccinationChange
                    }
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
                    onChange={
                      handleNewVaccinationChange
                    }
                    required
                  />

                </div>

              </div>

              {/* DATES */}

              <div className="form-row">

                <div className="form-field">

                  <label>Date Given</label>

                  <input
                    type="date"
                    name="dateGiven"
                    value={newVaccination.dateGiven}
                    onChange={
                      handleNewVaccinationChange
                    }
                    required
                  />

                </div>

                <div className="form-field">

                  <label>Next Due Date</label>

                  <input
                    type="date"
                    name="nextDueDate"
                    value={newVaccination.nextDueDate}
                    onChange={
                      handleNewVaccinationChange
                    }
                    required
                  />

                </div>

              </div>

              {/* STATUS */}

              <div className="form-field">

                <label>Status</label>

                <select
                  name="status"
                  value={newVaccination.status}
                  onChange={
                    handleNewVaccinationChange
                  }
                >

                  <option value="Up to Date">
                    Up to Date
                  </option>

                  <option value="Due Soon">
                    Due Soon
                  </option>

                  <option value="Overdue">
                    Overdue
                  </option>

                </select>

              </div>

              {/* NOTES */}

              <div className="form-field">

                <label>Notes</label>

                <textarea
                  name="notes"
                  rows="3"
                  placeholder="Additional notes..."
                  value={newVaccination.notes}
                  onChange={
                    handleNewVaccinationChange
                  }
                />

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
                  Add Vaccination
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ==========================================
          VIEW VACCINATION
      ========================================== */}

      {showViewModal && selectedVaccination && (

        <div className="modal-overlay">

          <div className="modal-container">

            <div className="modal-header">

              <div>
                <h2>Vaccination Details</h2>
                <p>
                  View pet vaccination information
                </p>
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

              <strong>
                {selectedVaccination.pet}
              </strong>
            </div>

            <div className="detail-row">
              <span>Vaccine Name</span>

              <strong>
                {selectedVaccination.vaccine}
              </strong>
            </div>

            <div className="detail-row">
              <span>Date Given</span>

              <strong>
                {formatDate(
                  selectedVaccination.dateGiven
                )}
              </strong>
            </div>

            <div className="detail-row">
              <span>Next Due Date</span>

              <strong>
                {formatDate(
                  selectedVaccination.nextDueDate
                )}
              </strong>
            </div>

            <div className="detail-row">
              <span>Status</span>

              <strong>
                {selectedVaccination.status}
              </strong>
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

      {/* ==========================================
          EDIT VACCINATION
      ========================================== */}

      {showEditModal && selectedVaccination && (

        <div className="modal-overlay">

          <div className="modal-container">

            <div className="modal-header">

              <div>
                <h2>Edit Vaccination</h2>
                <p>
                  Update vaccination information
                </p>
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

            <form
              onSubmit={handleUpdateVaccination}
            >

              {/* PET + VACCINE */}

              <div className="form-row">

                <div className="form-field">

                  <label>Pet Name</label>

                  <input
                    type="text"
                    name="pet"
                    value={
                      selectedVaccination.pet
                    }
                    onChange={handleEditChange}
                    required
                  />

                </div>

                <div className="form-field">

                  <label>Vaccine Name</label>

                  <input
                    type="text"
                    name="vaccine"
                    value={
                      selectedVaccination.vaccine
                    }
                    onChange={handleEditChange}
                    required
                  />

                </div>

              </div>

              {/* DATES */}

              <div className="form-row">

                <div className="form-field">

                  <label>Date Given</label>

                  <input
                    type="date"
                    name="dateGiven"
                    value={
                      selectedVaccination.dateGiven
                    }
                    onChange={handleEditChange}
                    required
                  />

                </div>

                <div className="form-field">

                  <label>Next Due Date</label>

                  <input
                    type="date"
                    name="nextDueDate"
                    value={
                      selectedVaccination.nextDueDate
                    }
                    onChange={handleEditChange}
                    required
                  />

                </div>

              </div>

              {/* STATUS */}

              <div className="form-field">

                <label>Status</label>

                <select
                  name="status"
                  value={
                    selectedVaccination.status
                  }
                  onChange={handleEditChange}
                >

                  <option value="Up to Date">
                    Up to Date
                  </option>

                  <option value="Due Soon">
                    Due Soon
                  </option>

                  <option value="Overdue">
                    Overdue
                  </option>

                </select>

              </div>

              {/* NOTES */}

              <div className="form-field">

                <label>Notes</label>

                <textarea
                  name="notes"
                  rows="3"
                  value={
                    selectedVaccination.notes
                  }
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

    </div>
  );
}

export default Vaccinations;