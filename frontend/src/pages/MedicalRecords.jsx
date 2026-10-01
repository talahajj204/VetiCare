import { useState } from "react";
import Sidebar from "../components/Sidebar";

import {
  FaEye,
  FaPen,
  FaTrash,
  FaFileExcel,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

import * as XLSX from "xlsx";

function MedicalRecords() {
  // =========================================================
  // DATA
  // =========================================================

  const [records, setRecords] = useState([
    {
      id: 1,
      pet: "Bella",
      date: "2026-09-25",
      veterinarian: "Dr. Ahmad",
      diagnosis: "Skin Allergy",
      treatment: "Medication",
      notes: "Follow treatment and return for a checkup.",
    },
    {
      id: 2,
      pet: "Luna",
      date: "2026-09-20",
      veterinarian: "Dr. Sarah",
      diagnosis: "Routine Checkup",
      treatment: "No treatment required",
      notes: "Pet is healthy.",
    },
  ]);

  // =========================================================
  // SEARCH + FILTERS
  // =========================================================

  const [search, setSearch] = useState("");
  const [veterinarianFilter, setVeterinarianFilter] =
    useState("All");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // =========================================================
  // PAGINATION
  // =========================================================

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // =========================================================
  // MODALS
  // =========================================================

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedRecord, setSelectedRecord] = useState(null);

  // =========================================================
  // NEW RECORD
  // =========================================================

  const [newRecord, setNewRecord] = useState({
    pet: "",
    date: "",
    veterinarian: "",
    diagnosis: "",
    treatment: "",
    notes: "",
  });

  // =========================================================
  // FILTER OPTIONS
  // =========================================================

  const veterinarianOptions = [
    ...new Set(
      records
        .map((record) => record.veterinarian)
        .filter(Boolean)
    ),
  ];

  // =========================================================
  // FILTER RECORDS
  // =========================================================

  const filteredRecords = records.filter((record) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      record.pet.toLowerCase().includes(searchText) ||
      record.date.toLowerCase().includes(searchText) ||
      record.veterinarian.toLowerCase().includes(searchText) ||
      record.diagnosis.toLowerCase().includes(searchText) ||
      record.treatment.toLowerCase().includes(searchText) ||
      (record.notes || "").toLowerCase().includes(searchText);

    const matchesVeterinarian =
      veterinarianFilter === "All" ||
      record.veterinarian === veterinarianFilter;

    const matchesFromDate =
      !fromDate || record.date >= fromDate;

    const matchesToDate =
      !toDate || record.date <= toDate;

    return (
      matchesSearch &&
      matchesVeterinarian &&
      matchesFromDate &&
      matchesToDate
    );
  });

  // =========================================================
  // PAGINATION LOGIC
  // =========================================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecords.length / itemsPerPage)
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) * itemsPerPage;

  const paginatedRecords = filteredRecords.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const goToPreviousPage = () => {
    setCurrentPage((previous) =>
      Math.max(previous - 1, 1)
    );
  };

  const goToNextPage = () => {
    setCurrentPage((previous) =>
      Math.min(previous + 1, totalPages)
    );
  };

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {
    setSearch("");
    setVeterinarianFilter("All");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  const hasFilters =
    search !== "" ||
    veterinarianFilter !== "All" ||
    fromDate !== "" ||
    toDate !== "";

  // =========================================================
  // ADD INPUT CHANGE
  // =========================================================

  const handleNewRecordChange = (e) => {
    const { name, value } = e.target;

    setNewRecord((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // ADD RECORD
  // =========================================================

  const handleAddRecord = (e) => {
    e.preventDefault();

    const record = {
      id: Date.now(),
      ...newRecord,
    };

    setRecords((previous) => [
      ...previous,
      record,
    ]);

    setNewRecord({
      pet: "",
      date: "",
      veterinarian: "",
      diagnosis: "",
      treatment: "",
      notes: "",
    });

    setShowAddModal(false);
    setCurrentPage(1);
  };

  // =========================================================
  // VIEW
  // =========================================================

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  // =========================================================
  // OPEN EDIT
  // =========================================================

  const handleOpenEdit = (record) => {
    setSelectedRecord({ ...record });
    setShowEditModal(true);
  };

  // =========================================================
  // EDIT CHANGE
  // =========================================================

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setSelectedRecord((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // UPDATE
  // =========================================================

  const handleUpdateRecord = (e) => {
    e.preventDefault();

    setRecords((previous) =>
      previous.map((record) =>
        record.id === selectedRecord.id
          ? selectedRecord
          : record
      )
    );

    setShowEditModal(false);
    setSelectedRecord(null);
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDeleteRecord = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this medical record?"
    );

    if (!confirmDelete) {
      return;
    }

    setRecords((previous) =>
      previous.filter((record) => record.id !== id)
    );

    setShowViewModal(false);
    setShowEditModal(false);
    setSelectedRecord(null);
  };

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "";

    const [year, month, day] = date.split("-");

    return `${day}/${month}/${year}`;
  };

  // =========================================================
  // EXPORT
  // =========================================================

  const exportToExcel = () => {
    const excelData = filteredRecords.map(
      (record) => ({
        Pet: record.pet,
        Date: formatDate(record.date),
        Veterinarian: record.veterinarian,
        Diagnosis: record.diagnosis,
        Treatment: record.treatment,
        Notes: record.notes || "",
      })
    );

    const worksheet =
      XLSX.utils.json_to_sheet(excelData);

    worksheet["!cols"] = [
      { wch: 18 },
      { wch: 15 },
      { wch: 22 },
      { wch: 30 },
      { wch: 30 },
      { wch: 45 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Medical Records"
    );

    XLSX.writeFile(
      workbook,
      "vet-clinic-medical-records.xlsx"
    );
  };

  // =========================================================
  // PAGINATION STYLE
  // SAME STYLE FOR ALL PAGES
  // =========================================================

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
    border: "1px solid #c9dddd",
    borderRadius: "7px",
    background: "#ffffff",
    color: "#455757",
    fontSize: "14px",
    fontWeight: "700",
    lineHeight: "1",
    boxSizing: "border-box",
  };

  const paginationDisabledStyle = {
    ...paginationButtonStyle,
    background: "#eef4f4",
    borderColor: "#d6e3e3",
    color: "#aab9b9",
    cursor: "not-allowed",
  };

  const paginationActiveStyle = {
    ...paginationButtonStyle,
    background: "#54b7b5",
    borderColor: "#54b7b5",
    color: "#ffffff",
    cursor: "pointer",
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main medical-records-page">
        {/* HEADER */}
        <div className="medical-records-page-header">
          <div className="medical-records-title">
            <h1>Medical Records</h1>
            <p>View and manage pet medical records</p>
          </div>

          <div className="medical-records-header-actions">
            <button
              type="button"
              className="medical-records-export-button"
              onClick={exportToExcel}
            >
              <FaFileExcel />
              <span>Export</span>
            </button>

            <button
              type="button"
              className="medical-records-add-button"
              onClick={() => setShowAddModal(true)}
            >
              + Add Medical Record
            </button>
          </div>
        </div>

        {/* SEARCH + FILTERS */}
        <div className="medical-records-toolbar">
          <div className="medical-records-filters">
            <div className="medical-records-search">
              <FaSearch className="medical-records-search-icon" />

              <input
                type="text"
                placeholder="Search medical records..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />

              {hasFilters && (
                <button
                  type="button"
                  className="medical-records-clear"
                  onClick={clearFilters}
                  title="Clear all filters"
                  aria-label="Clear all filters"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            <select
              className="medical-records-filter-select"
              value={veterinarianFilter}
              onChange={(e) => {
                setVeterinarianFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">
                All Veterinarians
              </option>

              {veterinarianOptions.map(
                (veterinarian) => (
                  <option
                    key={veterinarian}
                    value={veterinarian}
                  >
                    {veterinarian}
                  </option>
                )
              )}
            </select>

            <div className="medical-records-date-filter">
              <span>From</span>

              <input
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="medical-records-date-filter">
              <span>To</span>

              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="owners-table-container">
          <table className="owners-table">
            <thead>
              <tr>
                <th>Pet</th>
                <th>Date</th>
                <th>Veterinarian</th>
                <th>Diagnosis</th>
                <th>Treatment</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.length > 0 ? (
                paginatedRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{record.pet}</td>

                    <td>
                      {formatDate(record.date)}
                    </td>

                    <td>{record.veterinarian}</td>
                    <td>{record.diagnosis}</td>
                    <td>{record.treatment}</td>

                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="view-button icon-button"
                          onClick={() =>
                            handleViewRecord(record)
                          }
                          title="View"
                        >
                          <FaEye />
                        </button>

                        <button
                          type="button"
                          className="edit-button icon-button"
                          onClick={() =>
                            handleOpenEdit(record)
                          }
                          title="Edit"
                        >
                          <FaPen />
                        </button>

                        <button
                          type="button"
                          className="delete-button icon-button"
                          onClick={() =>
                            handleDeleteRecord(record.id)
                          }
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="no-results"
                  >
                    No medical records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="medical-records-pagination">
          <div className="medical-records-page-size">
            <span>Rows per page:</span>

            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div
            className="medical-records-page-controls"
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
              onClick={goToPreviousPage}
              disabled={safeCurrentPage === 1}
              aria-label="Previous page"
              style={
                safeCurrentPage === 1
                  ? paginationDisabledStyle
                  : {
                      ...paginationButtonStyle,
                      cursor: "pointer",
                    }
              }
            >
              &lt;
            </button>

            {/* PAGE NUMBERS */}
            {Array.from(
              { length: totalPages },
              (_, index) => {
                const pageNumber = index + 1;

                const isActive =
                  safeCurrentPage === pageNumber;

                return (
                  <button
                    type="button"
                    key={pageNumber}
                    onClick={() =>
                      setCurrentPage(pageNumber)
                    }
                    style={
                      isActive
                        ? paginationActiveStyle
                        : {
                            ...paginationButtonStyle,
                            cursor: "pointer",
                          }
                    }
                  >
                    {pageNumber}
                  </button>
                );
              }
            )}

            {/* > */}
            <button
              type="button"
              onClick={goToNextPage}
              disabled={
                safeCurrentPage === totalPages
              }
              aria-label="Next page"
              style={
                safeCurrentPage === totalPages
                  ? paginationDisabledStyle
                  : {
                      ...paginationButtonStyle,
                      cursor: "pointer",
                    }
              }
            >
              &gt;
            </button>
          </div>
        </div>
      </main>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>Add Medical Record</h2>
                <p>
                  Enter medical record information
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

            <form onSubmit={handleAddRecord}>
              <div className="form-row">
                <div className="form-field">
                  <label>Pet Name</label>

                  <input
                    type="text"
                    name="pet"
                    placeholder="Enter pet name"
                    value={newRecord.pet}
                    onChange={handleNewRecordChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Date</label>

                  <input
                    type="date"
                    name="date"
                    value={newRecord.date}
                    onChange={handleNewRecordChange}
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Veterinarian</label>

                <input
                  type="text"
                  name="veterinarian"
                  placeholder="Enter veterinarian name"
                  value={newRecord.veterinarian}
                  onChange={handleNewRecordChange}
                  required
                />
              </div>

              <div className="form-field">
                <label>Diagnosis</label>

                <textarea
                  name="diagnosis"
                  rows="3"
                  placeholder="Enter diagnosis"
                  value={newRecord.diagnosis}
                  onChange={handleNewRecordChange}
                  required
                />
              </div>

              <div className="form-field">
                <label>Treatment</label>

                <textarea
                  name="treatment"
                  rows="3"
                  placeholder="Enter treatment"
                  value={newRecord.treatment}
                  onChange={handleNewRecordChange}
                  required
                />
              </div>

              <div className="form-field">
                <label>Notes</label>

                <textarea
                  name="notes"
                  rows="3"
                  placeholder="Additional notes..."
                  value={newRecord.notes}
                  onChange={handleNewRecordChange}
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
                  Add Medical Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showViewModal && selectedRecord && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>Medical Record Details</h2>
                <p>View pet medical information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedRecord(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="detail-row">
              <span>Pet Name</span>
              <strong>{selectedRecord.pet}</strong>
            </div>

            <div className="detail-row">
              <span>Date</span>
              <strong>
                {formatDate(selectedRecord.date)}
              </strong>
            </div>

            <div className="detail-row">
              <span>Veterinarian</span>
              <strong>
                {selectedRecord.veterinarian}
              </strong>
            </div>

            <div className="detail-row">
              <span>Diagnosis</span>
              <strong>
                {selectedRecord.diagnosis}
              </strong>
            </div>

            <div className="detail-row">
              <span>Treatment</span>
              <strong>
                {selectedRecord.treatment}
              </strong>
            </div>

            <div className="detail-row">
              <span>Notes</span>
              <strong>
                {selectedRecord.notes || "—"}
              </strong>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="modal-cancel-button"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedRecord(null);
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
                  Edit Medical Record
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedRecord && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>Edit Medical Record</h2>
                <p>
                  Update medical record information
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedRecord(null);
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateRecord}>
              <div className="form-row">
                <div className="form-field">
                  <label>Pet Name</label>

                  <input
                    type="text"
                    name="pet"
                    value={selectedRecord.pet}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Date</label>

                  <input
                    type="date"
                    name="date"
                    value={selectedRecord.date}
                    onChange={handleEditChange}
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Veterinarian</label>

                <input
                  type="text"
                  name="veterinarian"
                  value={selectedRecord.veterinarian}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="form-field">
                <label>Diagnosis</label>

                <textarea
                  name="diagnosis"
                  rows="3"
                  value={selectedRecord.diagnosis}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="form-field">
                <label>Treatment</label>

                <textarea
                  name="treatment"
                  rows="3"
                  value={selectedRecord.treatment}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="form-field">
                <label>Notes</label>

                <textarea
                  name="notes"
                  rows="3"
                  value={selectedRecord.notes || ""}
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedRecord(null);
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

export default MedicalRecords;