import { useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  FaEye,
  FaPen,
  FaTrash,
  FaFileExcel,
} from "react-icons/fa";

import * as XLSX from "xlsx";

function MedicalRecords() {
  // =========================
  // DATA
  // =========================

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

  const [selectedRecord, setSelectedRecord] = useState(null);

  // =========================
  // NEW RECORD
  // =========================

  const [newRecord, setNewRecord] = useState({
    pet: "",
    date: "",
    veterinarian: "",
    diagnosis: "",
    treatment: "",
    notes: "",
  });

  // =========================
  // SEARCH FILTER
  // =========================

  const filteredRecords = records.filter((record) => {
    const searchText = search.trim().toLowerCase();

    return (
      record.pet.toLowerCase().includes(searchText) ||
      record.date.toLowerCase().includes(searchText) ||
      record.veterinarian.toLowerCase().includes(searchText) ||
      record.diagnosis.toLowerCase().includes(searchText) ||
      record.treatment.toLowerCase().includes(searchText) ||
      record.notes.toLowerCase().includes(searchText)
    );
  });

  // =========================
  // ADD INPUT CHANGE
  // =========================

  const handleNewRecordChange = (e) => {
    const { name, value } = e.target;

    setNewRecord({
      ...newRecord,
      [name]: value,
    });
  };

  // =========================
  // ADD RECORD
  // =========================

  const handleAddRecord = (e) => {
    e.preventDefault();

    const record = {
      id: Date.now(),
      ...newRecord,
    };

    setRecords([...records, record]);

    setNewRecord({
      pet: "",
      date: "",
      veterinarian: "",
      diagnosis: "",
      treatment: "",
      notes: "",
    });

    setShowAddModal(false);
  };

  // =========================
  // VIEW
  // =========================

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  // =========================
  // OPEN EDIT
  // =========================

  const handleOpenEdit = (record) => {
    setSelectedRecord({ ...record });
    setShowEditModal(true);
  };

  // =========================
  // EDIT CHANGE
  // =========================

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setSelectedRecord({
      ...selectedRecord,
      [name]: value,
    });
  };

  // =========================
  // UPDATE
  // =========================

  const handleUpdateRecord = (e) => {
    e.preventDefault();

    setRecords(
      records.map((record) =>
        record.id === selectedRecord.id
          ? selectedRecord
          : record
      )
    );

    setShowEditModal(false);
    setSelectedRecord(null);
  };

  // =========================
  // DELETE
  // =========================

  const handleDeleteRecord = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this medical record?"
    );

    if (confirmDelete) {
      setRecords(
        records.filter((record) => record.id !== id)
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
  // EXPORT TO EXCEL
  // =========================

  const exportToExcel = () => {
    const excelData = records.map((record) => ({
      Pet: record.pet,
      Date: formatDate(record.date),
      Veterinarian: record.veterinarian,
      Diagnosis: record.diagnosis,
      Treatment: record.treatment,
      Notes: record.notes || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

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

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-main">

        {/* HEADER */}

        <div className="page-header">
          <div>
            <h1>Medical Records</h1>
            <p>View and manage pet medical records</p>
          </div>
        </div>

        {/* SEARCH + EXPORT + ADD */}

        <div className="inventory-toolbar">

          <div className="search-container inventory-search">
            <input
              type="text"
              placeholder="Search medical records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="inventory-toolbar-actions">

            <button
              type="button"
              className="export-button"
              onClick={exportToExcel}
            >
              <FaFileExcel />
              <span>Export</span>
            </button>

            <button
              type="button"
              className="add-button"
              onClick={() => setShowAddModal(true)}
            >
              + Add Medical Record
            </button>

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

                filteredRecords.map((record) => (

                  <tr key={record.id}>

                    <td>{record.pet}</td>

                    <td>{formatDate(record.date)}</td>

                    <td>{record.veterinarian}</td>

                    <td>{record.diagnosis}</td>

                    <td>{record.treatment}</td>

                    <td>

                      <div className="table-actions">

                        {/* VIEW */}

                        <button
                          type="button"
                          className="view-button icon-button"
                          onClick={() =>
                            handleViewRecord(record)
                          }
                          title="View"
                          aria-label="View medical record"
                        >
                          <FaEye />
                        </button>

                        {/* EDIT */}

                        <button
                          type="button"
                          className="edit-button icon-button"
                          onClick={() =>
                            handleOpenEdit(record)
                          }
                          title="Edit"
                          aria-label="Edit medical record"
                        >
                          <FaPen />
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          className="delete-button icon-button"
                          onClick={() =>
                            handleDeleteRecord(record.id)
                          }
                          title="Delete"
                          aria-label="Delete medical record"
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

      </main>

      {/* ==========================================
          ADD MEDICAL RECORD MODAL
      ========================================== */}

      {showAddModal && (

        <div className="modal-overlay">

          <div className="modal-container">

            <div className="modal-header">

              <div>
                <h2>Add Medical Record</h2>
                <p>Enter medical record information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleAddRecord}>

              {/* PET + DATE */}

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

              {/* VETERINARIAN */}

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

              {/* DIAGNOSIS */}

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

              {/* TREATMENT */}

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

              {/* NOTES */}

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
                  onClick={() => setShowAddModal(false)}
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

      {/* ==========================================
          VIEW MEDICAL RECORD MODAL
      ========================================== */}

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

      {/* ==========================================
          EDIT MEDICAL RECORD MODAL
      ========================================== */}

      {showEditModal && selectedRecord && (

        <div className="modal-overlay">

          <div className="modal-container">

            <div className="modal-header">

              <div>
                <h2>Edit Medical Record</h2>
                <p>Update medical record information</p>
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

              {/* PET + DATE */}

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

              {/* VETERINARIAN */}

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

              {/* DIAGNOSIS */}

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

              {/* TREATMENT */}

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

              {/* NOTES */}

              <div className="form-field">

                <label>Notes</label>

                <textarea
                  name="notes"
                  rows="3"
                  value={selectedRecord.notes}
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