import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";

import {
  FaEye,
  FaPen,
  FaTrash,
  FaSearch,
  FaTimes,
  FaFileExcel,
} from "react-icons/fa";

import * as XLSX from "xlsx";

function Prescriptions() {
  // =====================================================
  // DATA
  // =====================================================

  const [prescriptions, setPrescriptions] = useState([
    {
      id: 1,
      pet: "Bella",
      medication: "Amoxicillin",
      dosage: "250 mg",
      frequency: "Twice daily",
      duration: "7 days",
      date: "2026-09-29",
    },
    {
      id: 2,
      pet: "Luna",
      medication: "Meloxicam",
      dosage: "1.5 mg",
      frequency: "Once daily",
      duration: "5 days",
      date: "2026-09-25",
    },
  ]);

  // =====================================================
  // SEARCH + DATE FILTERS
  // =====================================================

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

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

  const [selectedPrescription, setSelectedPrescription] =
    useState(null);

  // =====================================================
  // NEW PRESCRIPTION
  // =====================================================

  const [newPrescription, setNewPrescription] = useState({
    pet: "",
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    date: "",
  });

  // =====================================================
  // FILTERED PRESCRIPTIONS
  // =====================================================

  const filteredPrescriptions = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return prescriptions.filter((prescription) => {
      const matchesSearch =
        !searchText ||
        prescription.pet.toLowerCase().includes(searchText) ||
        prescription.medication.toLowerCase().includes(searchText) ||
        prescription.dosage.toLowerCase().includes(searchText) ||
        prescription.frequency.toLowerCase().includes(searchText) ||
        prescription.duration.toLowerCase().includes(searchText) ||
        prescription.date.toLowerCase().includes(searchText);

      const matchesFrom =
        !dateFrom || prescription.date >= dateFrom;

      const matchesTo =
        !dateTo || prescription.date <= dateTo;

      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [prescriptions, search, dateFrom, dateTo]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPrescriptions.length / rowsPerPage)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, dateFrom, dateTo, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * rowsPerPage;

  const paginatedPrescriptions = filteredPrescriptions.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const hasFilters =
    search.trim() !== "" || dateFrom !== "" || dateTo !== "";

  // =====================================================
  // ADD
  // =====================================================

  const handleNewPrescriptionChange = (e) => {
    const { name, value } = e.target;

    setNewPrescription((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAddPrescription = (e) => {
    e.preventDefault();

    const prescription = {
      id: Date.now(),
      ...newPrescription,
    };

    setPrescriptions((previous) => [
      ...previous,
      prescription,
    ]);

    setNewPrescription({
      pet: "",
      medication: "",
      dosage: "",
      frequency: "",
      duration: "",
      date: "",
    });

    setShowAddModal(false);
  };

  // =====================================================
  // VIEW
  // =====================================================

  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setShowViewModal(true);
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleOpenEdit = (prescription) => {
    setSelectedPrescription({
      ...prescription,
    });

    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setSelectedPrescription((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleUpdatePrescription = (e) => {
    e.preventDefault();

    setPrescriptions((previous) =>
      previous.map((prescription) =>
        prescription.id === selectedPrescription.id
          ? selectedPrescription
          : prescription
      )
    );

    setShowEditModal(false);
    setSelectedPrescription(null);
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDeletePrescription = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this prescription?"
    );

    if (confirmDelete) {
      setPrescriptions((previous) =>
        previous.filter(
          (prescription) => prescription.id !== id
        )
      );
    }
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
  // EXPORT
  // =====================================================

  const exportToExcel = () => {
    const exportData = filteredPrescriptions.map(
      (prescription) => ({
        "Pet Name": prescription.pet,
        Medication: prescription.medication,
        Dosage: prescription.dosage,
        Frequency: prescription.frequency,
        Duration: prescription.duration,
        Date: formatDate(prescription.date),
      })
    );

    const worksheet =
      XLSX.utils.json_to_sheet(exportData);

    worksheet["!cols"] = [
      { wch: 20 },
      { wch: 25 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Prescriptions"
    );

    XLSX.writeFile(
      workbook,
      "vet-clinic-prescriptions.xlsx"
    );
  };

  // =====================================================
  // PAGINATION STYLE
  // SAME STYLE AS OTHER PAGES
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

      <main className="dashboard-main prescriptions-page">
        {/* HEADER */}

        <div className="page-header">
          <div>
            <h1>Prescriptions</h1>
            <p>Manage pet prescriptions</p>
          </div>
        </div>

        {/* =================================================
            SEARCH + DATE FILTERS
        ================================================= */}

        <div className="prescriptions-filter-row">
          {/* SEARCH */}

          <div className="prescriptions-search-box">
            <FaSearch className="prescriptions-search-icon" />

            <input
              type="text"
              placeholder="Search prescriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {hasFilters && (
              <button
                type="button"
                className="prescriptions-clear-button"
                onClick={clearFilters}
                title="Clear filters"
                aria-label="Clear filters"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* FROM DATE */}

          <div className="prescriptions-date-filter">
            <span>From</span>

            <input
              type="date"
              value={dateFrom}
              onChange={(e) =>
                setDateFrom(e.target.value)
              }
            />
          </div>

          {/* TO DATE */}

          <div className="prescriptions-date-filter">
            <span>To</span>

            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) =>
                setDateTo(e.target.value)
              }
            />
          </div>
        </div>

        {/* =================================================
            EXPORT + ADD
        ================================================= */}

        <div className="prescriptions-toolbar-buttons">
          <button
            type="button"
            className="prescriptions-export-button"
            onClick={exportToExcel}
          >
            <FaFileExcel />
            <span>Export</span>
          </button>

          <button
            type="button"
            className="prescriptions-add-button"
            onClick={() => setShowAddModal(true)}
          >
            + Add Prescription
          </button>
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="owners-table-container prescriptions-table-container">
          <div className="prescriptions-table-scroll">
            <table className="owners-table prescriptions-table">
              <thead>
                <tr>
                  <th>Pet Name</th>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedPrescriptions.length > 0 ? (
                  paginatedPrescriptions.map(
                    (prescription) => (
                      <tr key={prescription.id}>
                        <td>{prescription.pet}</td>

                        <td>
                          {prescription.medication}
                        </td>

                        <td>
                          {prescription.dosage}
                        </td>

                        <td>
                          {prescription.frequency}
                        </td>

                        <td>
                          {prescription.duration}
                        </td>

                        <td>
                          {formatDate(
                            prescription.date
                          )}
                        </td>

                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="view-button icon-button"
                              onClick={() =>
                                handleViewPrescription(
                                  prescription
                                )
                              }
                              title="View"
                              aria-label="View prescription"
                            >
                              <FaEye />
                            </button>

                            <button
                              type="button"
                              className="edit-button icon-button"
                              onClick={() =>
                                handleOpenEdit(
                                  prescription
                                )
                              }
                              title="Edit"
                              aria-label="Edit prescription"
                            >
                              <FaPen />
                            </button>

                            <button
                              type="button"
                              className="delete-button icon-button"
                              onClick={() =>
                                handleDeletePrescription(
                                  prescription.id
                                )
                              }
                              title="Delete"
                              aria-label="Delete prescription"
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
                      colSpan="7"
                      className="no-results"
                    >
                      No prescriptions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* =================================================
            PAGINATION
        ================================================= */}

        <div className="prescriptions-pagination">
          <div className="prescriptions-rows-per-page">
            <span>Rows per page:</span>

            <select
              value={rowsPerPage}
              onChange={(e) =>
                setRowsPerPage(
                  Number(e.target.value)
                )
              }
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div
            className="prescriptions-page-controls"
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
              const isActive =
                currentPage === page;

              return (
                <button
                  type="button"
                  key={page}
                  onClick={() =>
                    setCurrentPage(page)
                  }
                  aria-current={
                    isActive
                      ? "page"
                      : undefined
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
              disabled={
                currentPage === totalPages
              }
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(
                    page + 1,
                    totalPages
                  )
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
          ADD PRESCRIPTION
      ===================================================== */}

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>Add Prescription</h2>
                <p>
                  Enter prescription information
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

            <form
              onSubmit={handleAddPrescription}
            >
              {/* PET + MEDICATION */}

              <div className="form-row">
                <div className="form-field">
                  <label>Pet Name</label>

                  <input
                    type="text"
                    name="pet"
                    placeholder="Enter pet name"
                    value={newPrescription.pet}
                    onChange={
                      handleNewPrescriptionChange
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Medication</label>

                  <input
                    type="text"
                    name="medication"
                    placeholder="Enter medication"
                    value={
                      newPrescription.medication
                    }
                    onChange={
                      handleNewPrescriptionChange
                    }
                    required
                  />
                </div>
              </div>

              {/* DOSAGE + FREQUENCY */}

              <div className="form-row">
                <div className="form-field">
                  <label>Dosage</label>

                  <input
                    type="text"
                    name="dosage"
                    placeholder="Example: 250 mg"
                    value={
                      newPrescription.dosage
                    }
                    onChange={
                      handleNewPrescriptionChange
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Frequency</label>

                  <select
                    name="frequency"
                    value={
                      newPrescription.frequency
                    }
                    onChange={
                      handleNewPrescriptionChange
                    }
                    required
                  >
                    <option value="">
                      Select frequency
                    </option>

                    <option value="Once daily">
                      Once daily
                    </option>

                    <option value="Twice daily">
                      Twice daily
                    </option>

                    <option value="Three times daily">
                      Three times daily
                    </option>

                    <option value="Every 8 hours">
                      Every 8 hours
                    </option>

                    <option value="Every 12 hours">
                      Every 12 hours
                    </option>

                    <option value="As needed">
                      As needed
                    </option>
                  </select>
                </div>
              </div>

              {/* DURATION + DATE */}

              <div className="form-row">
                <div className="form-field">
                  <label>Duration</label>

                  <input
                    type="text"
                    name="duration"
                    placeholder="Example: 7 days"
                    value={
                      newPrescription.duration
                    }
                    onChange={
                      handleNewPrescriptionChange
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Date</label>

                  <input
                    type="date"
                    name="date"
                    value={
                      newPrescription.date
                    }
                    onChange={
                      handleNewPrescriptionChange
                    }
                    required
                  />
                </div>
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
                  Add Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          VIEW PRESCRIPTION
      ===================================================== */}

      {showViewModal &&
        selectedPrescription && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <div>
                  <h2>
                    Prescription Details
                  </h2>

                  <p>
                    View prescription information
                  </p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedPrescription(
                      null
                    );
                  }}
                >
                  ×
                </button>
              </div>

              <div className="detail-row">
                <span>Pet Name</span>
                <strong>
                  {selectedPrescription.pet}
                </strong>
              </div>

              <div className="detail-row">
                <span>Medication</span>
                <strong>
                  {
                    selectedPrescription.medication
                  }
                </strong>
              </div>

              <div className="detail-row">
                <span>Dosage</span>
                <strong>
                  {
                    selectedPrescription.dosage
                  }
                </strong>
              </div>

              <div className="detail-row">
                <span>Frequency</span>
                <strong>
                  {
                    selectedPrescription.frequency
                  }
                </strong>
              </div>

              <div className="detail-row">
                <span>Duration</span>
                <strong>
                  {
                    selectedPrescription.duration
                  }
                </strong>
              </div>

              <div className="detail-row">
                <span>Date</span>
                <strong>
                  {formatDate(
                    selectedPrescription.date
                  )}
                </strong>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedPrescription(
                      null
                    );
                  }}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="edit-button prescriptions-modal-edit"
                  onClick={() => {
                    setShowViewModal(false);
                    setShowEditModal(true);
                  }}
                >
                  <FaPen />
                  <span>
                    Edit Prescription
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          EDIT PRESCRIPTION
      ===================================================== */}

      {showEditModal &&
        selectedPrescription && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <div>
                  <h2>Edit Prescription</h2>

                  <p>
                    Update prescription
                    information
                  </p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPrescription(
                      null
                    );
                  }}
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={
                  handleUpdatePrescription
                }
              >
                {/* PET + MEDICATION */}

                <div className="form-row">
                  <div className="form-field">
                    <label>Pet Name</label>

                    <input
                      type="text"
                      name="pet"
                      value={
                        selectedPrescription.pet
                      }
                      onChange={
                        handleEditChange
                      }
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>
                      Medication
                    </label>

                    <input
                      type="text"
                      name="medication"
                      value={
                        selectedPrescription.medication
                      }
                      onChange={
                        handleEditChange
                      }
                      required
                    />
                  </div>
                </div>

                {/* DOSAGE + FREQUENCY */}

                <div className="form-row">
                  <div className="form-field">
                    <label>Dosage</label>

                    <input
                      type="text"
                      name="dosage"
                      value={
                        selectedPrescription.dosage
                      }
                      onChange={
                        handleEditChange
                      }
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>
                      Frequency
                    </label>

                    <select
                      name="frequency"
                      value={
                        selectedPrescription.frequency
                      }
                      onChange={
                        handleEditChange
                      }
                      required
                    >
                      <option value="Once daily">
                        Once daily
                      </option>

                      <option value="Twice daily">
                        Twice daily
                      </option>

                      <option value="Three times daily">
                        Three times daily
                      </option>

                      <option value="Every 8 hours">
                        Every 8 hours
                      </option>

                      <option value="Every 12 hours">
                        Every 12 hours
                      </option>

                      <option value="As needed">
                        As needed
                      </option>
                    </select>
                  </div>
                </div>

                {/* DURATION + DATE */}

                <div className="form-row">
                  <div className="form-field">
                    <label>
                      Duration
                    </label>

                    <input
                      type="text"
                      name="duration"
                      value={
                        selectedPrescription.duration
                      }
                      onChange={
                        handleEditChange
                      }
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>Date</label>

                    <input
                      type="date"
                      name="date"
                      value={
                        selectedPrescription.date
                      }
                      onChange={
                        handleEditChange
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="modal-cancel-button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedPrescription(
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

export default Prescriptions;