import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import {
  FaEye,
  FaPen,
  FaTrash,
  FaFileExcel,
  FaSearch,
  FaTimes,
  FaPaperclip,
} from "react-icons/fa";

import * as XLSX from "xlsx";

function MedicalRecords() {
  const navigate = useNavigate();
  const location = useLocation();

  /* =====================================================
     DATA
  ===================================================== */

  const [records, setRecords] = useState([
    {
      id: 1,
      pet: "Bella",
      owner: "Tala El Hajj",
      date: "2026-09-25",
      veterinarian: "Dr. Ahmad",

      reasonForVisit: "Skin irritation",
      symptoms: "Itching and redness",
      procedures: "Physical examination",
      weight: "12.5",
      followUpDate: "2026-10-09",
      fileName: "",

      diagnosis: "Skin Allergy",
      treatment: "Medication",
      notes: "Follow treatment and return for a checkup.",

      status: "Completed",
    },

    {
      id: 2,
      pet: "Luna",
      owner: "Maya Khalil",
      date: "2026-09-20",
      veterinarian: "Dr. Sarah",

      reasonForVisit: "Routine checkup",
      symptoms: "None",
      procedures: "General examination",
      weight: "8.2",
      followUpDate: "",
      fileName: "",

      diagnosis: "Routine Checkup",
      treatment: "No treatment required",
      notes: "Pet is healthy.",

      status: "Completed",
    },
  ]);

  /* =====================================================
     SEARCH + FILTERS
  ===================================================== */

  const [search, setSearch] = useState("");

  const [veterinarianFilter, setVeterinarianFilter] =
    useState("All");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* =====================================================
     PAGINATION
  ===================================================== */

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  /* =====================================================
     MODALS
  ===================================================== */

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [showViewModal, setShowViewModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [selectedRecord, setSelectedRecord] =
    useState(null);

  /* =====================================================
     EMPTY RECORD
  ===================================================== */

  const getEmptyRecord = () => ({
    pet: "",
    owner: "",
    date: "",
    veterinarian: "",

    reasonForVisit: "",
    symptoms: "",
    procedures: "",
    weight: "",
    followUpDate: "",
    fileName: "",

    diagnosis: "",
    treatment: "",
    notes: "",

    status: "In Progress",
  });

  const [newRecord, setNewRecord] = useState(
    getEmptyRecord()
  );

  /* =====================================================
     APPOINTMENT -> MEDICAL RECORD FLOW

     Receives:
     pet
     owner
     veterinarian
     appointment date
     appointment reason

     Automatically opens medical record modal.
  ===================================================== */

  useEffect(() => {
    if (!location.state?.openAddMedicalRecord) return;

    const appointment =
      location.state.appointment || {};

    setNewRecord({
      pet:
        location.state.pet ||
        appointment.pet ||
        "",

      owner:
        location.state.owner ||
        appointment.owner ||
        "",

      date:
        location.state.appointmentDate ||
        appointment.date ||
        "",

      veterinarian:
        location.state.veterinarian ||
        appointment.veterinarian ||
        "",

      reasonForVisit:
        location.state.reason ||
        appointment.reason ||
        "",

      symptoms: "",
      procedures: "",
      weight: "",
      followUpDate: "",
      fileName: "",

      diagnosis: "",
      treatment: "",
      notes: "",

      status: "In Progress",
    });

    setShowAddModal(true);
  }, [location.state]);

  /* =====================================================
     VETERINARIAN OPTIONS
  ===================================================== */

  const veterinarianOptions = [
    ...new Set(
      records
        .map((record) => record.veterinarian)
        .filter(Boolean)
    ),
  ];

  /* =====================================================
     FILTERING
  ===================================================== */

  const filteredRecords = records.filter((record) => {
    const value = search.trim().toLowerCase();

    const matchesSearch =
      (record.pet || "")
        .toLowerCase()
        .includes(value) ||
      (record.owner || "")
        .toLowerCase()
        .includes(value) ||
      (record.date || "")
        .toLowerCase()
        .includes(value) ||
      (record.veterinarian || "")
        .toLowerCase()
        .includes(value) ||
      (record.reasonForVisit || "")
        .toLowerCase()
        .includes(value) ||
      (record.symptoms || "")
        .toLowerCase()
        .includes(value) ||
      (record.procedures || "")
        .toLowerCase()
        .includes(value) ||
      (record.diagnosis || "")
        .toLowerCase()
        .includes(value) ||
      (record.treatment || "")
        .toLowerCase()
        .includes(value) ||
      (record.notes || "")
        .toLowerCase()
        .includes(value);

    const matchesVeterinarian =
      veterinarianFilter === "All" ||
      record.veterinarian === veterinarianFilter;

    const matchesFrom =
      !fromDate || record.date >= fromDate;

    const matchesTo =
      !toDate || record.date <= toDate;

    return (
      matchesSearch &&
      matchesVeterinarian &&
      matchesFrom &&
      matchesTo
    );
  });

  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredRecords.length / itemsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) * itemsPerPage;

  const paginatedRecords =
    filteredRecords.slice(
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

  /* =====================================================
     CLEAR FILTERS
  ===================================================== */

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

  /* =====================================================
     NEW RECORD CHANGE
  ===================================================== */

  const handleNewRecordChange = (e) => {
    const { name, value } = e.target;

    setNewRecord((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =====================================================
     FILE UPLOAD
  ===================================================== */

  const handleNewFileChange = (e) => {
    const file = e.target.files?.[0];

    setNewRecord((previous) => ({
      ...previous,
      fileName: file ? file.name : "",
    }));
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files?.[0];

    setSelectedRecord((previous) => ({
      ...previous,
      fileName: file
        ? file.name
        : previous?.fileName || "",
    }));
  };

  /* =====================================================
     VALIDATE RECORD
  ===================================================== */

  const validateMedicalRecord = () => {
    if (
      !newRecord.pet ||
      !newRecord.date ||
      !newRecord.veterinarian ||
      !newRecord.reasonForVisit ||
      !newRecord.diagnosis ||
      !newRecord.treatment
    ) {
      alert(
        "Please complete the required medical record fields."
      );

      return false;
    }

    return true;
  };

  /* =====================================================
     CREATE RECORD
  ===================================================== */

  const createMedicalRecord = (
    status = newRecord.status || "In Progress"
  ) => {
    const record = {
      id: Date.now(),
      ...newRecord,
      status,
    };

    setRecords((previous) => [
      ...previous,
      record,
    ]);

    setNewRecord(getEmptyRecord());
    setShowAddModal(false);
    setCurrentPage(1);

    return record;
  };

  /* =====================================================
     ADD MEDICAL RECORD ONLY
  ===================================================== */

  const handleAddRecord = (e) => {
    e.preventDefault();

    if (!validateMedicalRecord()) return;

    createMedicalRecord("In Progress");
  };

  /* =====================================================
     SAVE + ADD VACCINATION
  ===================================================== */

  const handleSaveAndAddVaccination = () => {
    if (!validateMedicalRecord()) return;

    const savedRecord =
      createMedicalRecord("In Progress");

    navigate("/vaccinations", {
      state: {
        openAddVaccination: true,
        fromVisitFlow: true,

        pet: savedRecord.pet,
        owner: savedRecord.owner,
        veterinarian:
          savedRecord.veterinarian,
        date: savedRecord.date,

        diagnosis: savedRecord.diagnosis,
        treatment: savedRecord.treatment,

        medicalRecord: savedRecord,

        appointment:
          location.state?.appointment || null,
      },
    });
  };

  /* =====================================================
     COMPLETE VISIT

     Saves the record as Completed.
  ===================================================== */

  const handleCompleteVisit = () => {
    if (!validateMedicalRecord()) return;

    const completedRecord =
      createMedicalRecord("Completed");

    setSelectedRecord(completedRecord);
    setShowViewModal(true);
  };

  /* =====================================================
     COMPLETE VISIT + CREATE INVOICE

     Requirement:
     Complete visit, then Create invoice.
  ===================================================== */

  const handleCompleteAndCreateInvoice = () => {
    if (!validateMedicalRecord()) return;

    const completedRecord =
      createMedicalRecord("Completed");

    navigate("/billing", {
      state: {
        openAddInvoice: true,
        fromVisitFlow: true,

        pet: completedRecord.pet,
        owner: completedRecord.owner,
        veterinarian:
          completedRecord.veterinarian,

        date: completedRecord.date,

        reasonForVisit:
          completedRecord.reasonForVisit,

        diagnosis:
          completedRecord.diagnosis,

        treatment:
          completedRecord.treatment,

        procedures:
          completedRecord.procedures,

        medicalRecord: completedRecord,

        appointment:
          location.state?.appointment || null,
      },
    });
  };

  /* =====================================================
     CREATE INVOICE FROM EXISTING RECORD
  ===================================================== */

  const handleCreateInvoice = (record) => {
    if (!record) return;

    setShowViewModal(false);

    navigate("/billing", {
      state: {
        openAddInvoice: true,
        fromVisitFlow: true,

        pet: record.pet,
        owner: record.owner,
        veterinarian: record.veterinarian,
        date: record.date,

        reasonForVisit:
          record.reasonForVisit,

        diagnosis: record.diagnosis,
        treatment: record.treatment,
        procedures: record.procedures,

        medicalRecord: record,

        appointment:
          location.state?.appointment || null,
      },
    });
  };

  /* =====================================================
     VIEW
  ===================================================== */

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  /* =====================================================
     EDIT
  ===================================================== */

  const handleOpenEdit = (record) => {
    setSelectedRecord({ ...record });

    setShowViewModal(false);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setSelectedRecord((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

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

  /* =====================================================
     DELETE
  ===================================================== */

  const handleDeleteRecord = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this medical record?"
    );

    if (!confirmDelete) return;

    setRecords((previous) =>
      previous.filter(
        (record) => record.id !== id
      )
    );

    setShowViewModal(false);
    setShowEditModal(false);
    setSelectedRecord(null);
  };

  /* =====================================================
     DATE
  ===================================================== */

  const formatDate = (date) => {
    if (!date) return "-";

    const [year, month, day] =
      date.split("-");

    if (!year || !month || !day) {
      return date;
    }

    return `${day}/${month}/${year}`;
  };

  /* =====================================================
     EXPORT
  ===================================================== */

  const exportToExcel = () => {
    const excelData = filteredRecords.map(
      (record) => ({
        Pet: record.pet,
        Owner: record.owner || "",
        Date: formatDate(record.date),
        Veterinarian: record.veterinarian,

        "Reason for Visit":
          record.reasonForVisit || "",

        Symptoms: record.symptoms || "",
        Procedures: record.procedures || "",
        "Weight (kg)": record.weight || "",

        "Follow-up Date":
          record.followUpDate
            ? formatDate(
                record.followUpDate
              )
            : "",

        Diagnosis: record.diagnosis,
        Treatment: record.treatment,
        Notes: record.notes || "",
        File: record.fileName || "",
        Status: record.status || "",
      })
    );

    const worksheet =
      XLSX.utils.json_to_sheet(excelData);

    worksheet["!cols"] = [
      { wch: 18 },
      { wch: 22 },
      { wch: 15 },
      { wch: 22 },
      { wch: 30 },
      { wch: 30 },
      { wch: 30 },
      { wch: 14 },
      { wch: 18 },
      { wch: 30 },
      { wch: 30 },
      { wch: 45 },
      { wch: 25 },
      { wch: 15 },
    ];

    const workbook =
      XLSX.utils.book_new();

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

  /* =====================================================
     PAGINATION STYLE
  ===================================================== */

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
      {/* =====================================================
          CSS
          Same small buttons/design as before
      ===================================================== */}

      <style>{`
        .medical-workflow-actions {
          display: flex !important;
          align-items: center !important;
          justify-content: flex-end !important;
          gap: 8px !important;
          flex-wrap: wrap !important;
          margin-top: 18px !important;
        }

        .modal-container
          .medical-workflow-actions
          .medical-workflow-button {
          width: auto !important;
          min-width: 0 !important;
          max-width: none !important;

          height: 34px !important;
          min-height: 34px !important;
          max-height: 34px !important;

          padding: 0 12px !important;
          margin: 0 !important;

          flex: 0 0 auto !important;

          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;

          gap: 5px !important;

          border-radius: 7px !important;

          font-family: inherit !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          line-height: 1 !important;

          white-space: nowrap !important;
          box-sizing: border-box !important;

          cursor: pointer !important;
          box-shadow: none !important;
        }

        .modal-container
          .medical-workflow-actions
          .medical-workflow-secondary {
          background: #ffffff !important;
          color: #52605f !important;
          border: 1px solid #d5e5e3 !important;
        }

        .modal-container
          .medical-workflow-actions
          .medical-workflow-secondary:hover {
          background: #f7fbfa !important;
          border-color: #bdd8d5 !important;
        }

        .modal-container
          .medical-workflow-actions
          .medical-workflow-primary {
          background: #55b7b3 !important;
          color: #ffffff !important;
          border: 1px solid #55b7b3 !important;
        }

        .modal-container
          .medical-workflow-actions
          .medical-workflow-primary:hover {
          background: #319c97 !important;
          border-color: #319c97 !important;
        }

        .modal-container
          form
          .medical-workflow-actions
          button {
          width: auto !important;
          min-width: 0 !important;
          height: 34px !important;
          padding-left: 12px !important;
          padding-right: 12px !important;
          flex: 0 0 auto !important;
        }

        .medical-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          padding: 5px 9px;
          border-radius: 20px;

          font-size: 11px;
          font-weight: 700;
        }

        .medical-status.in-progress {
          background: #fff4d9;
          color: #8b6815;
        }

        .medical-status.completed {
          background: #e0f4f1;
          color: #278d88;
        }

        .medical-file-name {
          margin-top: 7px;
          font-size: 12px;
          color: #617472;
        }

        .medical-file-label {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        @media (max-width: 700px) {
          .medical-workflow-actions {
            justify-content: flex-end !important;
          }

          .modal-container
            .medical-workflow-actions
            .medical-workflow-button {
            width: auto !important;
            flex: 0 0 auto !important;
          }
        }
      `}</style>

      <Sidebar />

      <main className="dashboard-main medical-records-page">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="medical-records-page-header">
          <div className="medical-records-title">
            <h1>Medical Records</h1>

            <p>
              View and manage pet medical records
            </p>
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
              onClick={() => {
                setNewRecord(getEmptyRecord());
                setShowAddModal(true);
              }}
            >
              + Add Medical Record
            </button>
          </div>
        </div>

        {/* =====================================================
            FILTERS
        ===================================================== */}

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
                  title="Clear filters"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            <select
              className="medical-records-filter-select"
              value={veterinarianFilter}
              onChange={(e) => {
                setVeterinarianFilter(
                  e.target.value
                );

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

        {/* =====================================================
            TABLE
        ===================================================== */}

        <div className="owners-table-container">
          <table className="owners-table">
            <thead>
              <tr>
                <th>Pet</th>
                <th>Date</th>
                <th>Veterinarian</th>
                <th>Diagnosis</th>
                <th>Treatment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.length > 0 ? (
                paginatedRecords.map(
                  (record) => (
                    <tr key={record.id}>
                      <td>{record.pet}</td>

                      <td>
                        {formatDate(record.date)}
                      </td>

                      <td>
                        {record.veterinarian}
                      </td>

                      <td>
                        {record.diagnosis}
                      </td>

                      <td>
                        {record.treatment}
                      </td>

                      <td>
                        <span
                          className={`medical-status ${
                            record.status ===
                            "Completed"
                              ? "completed"
                              : "in-progress"
                          }`}
                        >
                          {record.status ||
                            "In Progress"}
                        </span>
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="view-button icon-button"
                            onClick={() =>
                              handleViewRecord(
                                record
                              )
                            }
                            title="View"
                          >
                            <FaEye />
                          </button>

                          <button
                            type="button"
                            className="edit-button icon-button"
                            onClick={() =>
                              handleOpenEdit(
                                record
                              )
                            }
                            title="Edit"
                          >
                            <FaPen />
                          </button>

                          <button
                            type="button"
                            className="delete-button icon-button"
                            onClick={() =>
                              handleDeleteRecord(
                                record.id
                              )
                            }
                            title="Delete"
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
                    No medical records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* =====================================================
            PAGINATION
        ===================================================== */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "15px",
            marginTop: "18px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              color: "#617472",
            }}
          >
            <span>Rows per page:</span>

            <select
              value={itemsPerPage}
              onChange={
                handleItemsPerPageChange
              }
              style={{
                height: "34px",
                padding: "0 28px 0 10px",
                border:
                  "1px solid #c9dddd",
                borderRadius: "7px",
                background: "#ffffff",
                color: "#455757",
                fontSize: "13px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "6px",
            }}
          >
            <button
              type="button"
              onClick={goToPreviousPage}
              disabled={
                safeCurrentPage === 1
              }
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

            <button
              type="button"
              style={paginationActiveStyle}
            >
              {safeCurrentPage}
            </button>

            <button
              type="button"
              onClick={goToNextPage}
              disabled={
                safeCurrentPage ===
                totalPages
              }
              style={
                safeCurrentPage ===
                totalPages
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
                {/* =====================================================
            ADD MEDICAL RECORD MODAL
        ===================================================== */}

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
                  onClick={() => {
                    setShowAddModal(false);
                    setNewRecord(getEmptyRecord());
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleAddRecord}>
                {/* PET + OWNER */}

                <div className="form-row">
                  <div className="form-field">
                    <label>Pet Name</label>

                    <input
                      type="text"
                      name="pet"
                      value={newRecord.pet}
                      onChange={handleNewRecordChange}
                      placeholder="Enter pet name"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>Owner</label>

                    <input
                      type="text"
                      name="owner"
                      value={newRecord.owner}
                      onChange={handleNewRecordChange}
                      placeholder="Enter owner name"
                    />
                  </div>
                </div>

                {/* DATE + VETERINARIAN */}

                <div className="form-row">
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

                  <div className="form-field">
                    <label>Veterinarian</label>

                    <input
                      type="text"
                      name="veterinarian"
                      value={newRecord.veterinarian}
                      onChange={handleNewRecordChange}
                      placeholder="Enter veterinarian name"
                      required
                    />
                  </div>
                </div>

                {/* REASON FOR VISIT */}

                <div className="form-field">
                  <label>Reason for Visit</label>

                  <input
                    type="text"
                    name="reasonForVisit"
                    value={newRecord.reasonForVisit}
                    onChange={handleNewRecordChange}
                    placeholder="Enter reason for visit"
                    required
                  />
                </div>

                {/* SYMPTOMS */}

                <div className="form-field">
                  <label>Symptoms</label>

                  <textarea
                    name="symptoms"
                    value={newRecord.symptoms}
                    onChange={handleNewRecordChange}
                    placeholder="Enter symptoms"
                    rows="2"
                  />
                </div>

                {/* PROCEDURES + WEIGHT */}

                <div className="form-row">
                  <div className="form-field">
                    <label>Procedures</label>

                    <input
                      type="text"
                      name="procedures"
                      value={newRecord.procedures}
                      onChange={handleNewRecordChange}
                      placeholder="Enter procedures"
                    />
                  </div>

                  <div className="form-field">
                    <label>Weight (kg)</label>

                    <input
                      type="number"
                      name="weight"
                      value={newRecord.weight}
                      onChange={handleNewRecordChange}
                      placeholder="Enter weight"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>

                {/* DIAGNOSIS */}

                <div className="form-field">
                  <label>Diagnosis</label>

                  <textarea
                    name="diagnosis"
                    value={newRecord.diagnosis}
                    onChange={handleNewRecordChange}
                    placeholder="Enter diagnosis"
                    rows="2"
                    required
                  />
                </div>

                {/* TREATMENT */}

                <div className="form-field">
                  <label>Treatment</label>

                  <textarea
                    name="treatment"
                    value={newRecord.treatment}
                    onChange={handleNewRecordChange}
                    placeholder="Enter treatment"
                    rows="2"
                    required
                  />
                </div>

                {/* FOLLOW-UP DATE + FILE */}

                <div className="form-row">
                  <div className="form-field">
                    <label>Follow-up Date</label>

                    <input
                      type="date"
                      name="followUpDate"
                      value={newRecord.followUpDate}
                      onChange={handleNewRecordChange}
                      min={newRecord.date || undefined}
                    />
                  </div>

                  <div className="form-field">
                    <label className="medical-file-label">
                      <FaPaperclip />
                      File Upload
                    </label>

                    <input
                      type="file"
                      onChange={handleNewFileChange}
                    />

                    {newRecord.fileName && (
                      <div className="medical-file-name">
                        Selected: {newRecord.fileName}
                      </div>
                    )}
                  </div>
                </div>

                {/* NOTES */}

                <div className="form-field">
                  <label>Notes</label>

                  <textarea
                    name="notes"
                    value={newRecord.notes}
                    onChange={handleNewRecordChange}
                    placeholder="Additional notes..."
                    rows="2"
                  />
                </div>

                {/* WORKFLOW BUTTONS */}

                <div className="medical-workflow-actions">
                  <button
                    type="button"
                    className="medical-workflow-button medical-workflow-secondary"
                    onClick={() => {
                      setShowAddModal(false);
                      setNewRecord(getEmptyRecord());
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="medical-workflow-button medical-workflow-primary"
                  >
                    Add Medical Record
                  </button>

                  <button
                    type="button"
                    className="medical-workflow-button medical-workflow-primary"
                    onClick={handleSaveAndAddVaccination}
                  >
                    Save & Add Vaccination
                  </button>

                  <button
                    type="button"
                    className="medical-workflow-button medical-workflow-primary"
                    onClick={handleCompleteVisit}
                  >
                    Complete Visit
                  </button>

                  <button
                    type="button"
                    className="medical-workflow-button medical-workflow-primary"
                    onClick={handleCompleteAndCreateInvoice}
                  >
                    Complete & Create Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =====================================================
            VIEW MEDICAL RECORD
        ===================================================== */}

        {showViewModal && selectedRecord && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <div>
                  <h2>Medical Record Details</h2>
                  <p>View complete medical information</p>
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

              {/* PET */}

              <div className="detail-row">
                <span>Pet</span>
                <strong>{selectedRecord.pet}</strong>
              </div>

              {/* OWNER */}

              <div className="detail-row">
                <span>Owner</span>
                <strong>
                  {selectedRecord.owner || "-"}
                </strong>
              </div>

              {/* DATE */}

              <div className="detail-row">
                <span>Date</span>
                <strong>
                  {formatDate(selectedRecord.date)}
                </strong>
              </div>

              {/* VETERINARIAN */}

              <div className="detail-row">
                <span>Veterinarian</span>
                <strong>
                  {selectedRecord.veterinarian}
                </strong>
              </div>

              {/* STATUS */}

              <div className="detail-row">
                <span>Status</span>

                <strong>
                  <span
                    className={`medical-status ${
                      selectedRecord.status === "Completed"
                        ? "completed"
                        : "in-progress"
                    }`}
                  >
                    {selectedRecord.status || "In Progress"}
                  </span>
                </strong>
              </div>

              {/* REASON */}

              <div className="detail-row">
                <span>Reason for Visit</span>
                <strong>
                  {selectedRecord.reasonForVisit || "-"}
                </strong>
              </div>

              {/* SYMPTOMS */}

              <div className="detail-row">
                <span>Symptoms</span>
                <strong>
                  {selectedRecord.symptoms || "-"}
                </strong>
              </div>

              {/* PROCEDURES */}

              <div className="detail-row">
                <span>Procedures</span>
                <strong>
                  {selectedRecord.procedures || "-"}
                </strong>
              </div>

              {/* WEIGHT */}

              <div className="detail-row">
                <span>Weight</span>
                <strong>
                  {selectedRecord.weight
                    ? `${selectedRecord.weight} kg`
                    : "-"}
                </strong>
              </div>

              {/* DIAGNOSIS */}

              <div className="detail-row">
                <span>Diagnosis</span>
                <strong>
                  {selectedRecord.diagnosis || "-"}
                </strong>
              </div>

              {/* TREATMENT */}

              <div className="detail-row">
                <span>Treatment</span>
                <strong>
                  {selectedRecord.treatment || "-"}
                </strong>
              </div>

              {/* FOLLOW UP */}

              <div className="detail-row">
                <span>Follow-up Date</span>
                <strong>
                  {selectedRecord.followUpDate
                    ? formatDate(selectedRecord.followUpDate)
                    : "-"}
                </strong>
              </div>

              {/* FILE */}

              <div className="detail-row">
                <span>Attached File</span>
                <strong>
                  {selectedRecord.fileName || "-"}
                </strong>
              </div>

              {/* NOTES */}

              <div className="detail-row">
                <span>Notes</span>
                <strong>
                  {selectedRecord.notes || "-"}
                </strong>
              </div>

              {/* VIEW ACTIONS */}

              <div className="medical-workflow-actions">
                <button
                  type="button"
                  className="delete-button icon-button"
                  onClick={() =>
                    handleDeleteRecord(selectedRecord.id)
                  }
                  title="Delete"
                >
                  <FaTrash />
                </button>

                <button
                  type="button"
                  className="medical-workflow-button medical-workflow-secondary"
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedRecord(null);
                  }}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="medical-workflow-button medical-workflow-secondary"
                  onClick={() =>
                    handleOpenEdit(selectedRecord)
                  }
                >
                  <FaPen />
                  Edit
                </button>

                {selectedRecord.status === "Completed" && (
                  <button
                    type="button"
                    className="medical-workflow-button medical-workflow-primary"
                    onClick={() =>
                      handleCreateInvoice(selectedRecord)
                    }
                  >
                    Create Invoice
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            EDIT MEDICAL RECORD
        ===================================================== */}

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
                {/* PET + OWNER */}

                <div className="form-row">
                  <div className="form-field">
                    <label>Pet Name</label>

                    <input
                      type="text"
                      name="pet"
                      value={selectedRecord.pet || ""}
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>Owner</label>

                    <input
                      type="text"
                      name="owner"
                      value={selectedRecord.owner || ""}
                      onChange={handleEditChange}
                    />
                  </div>
                </div>

                {/* DATE + VETERINARIAN */}

                <div className="form-row">
                  <div className="form-field">
                    <label>Date</label>

                    <input
                      type="date"
                      name="date"
                      value={selectedRecord.date || ""}
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
                        selectedRecord.veterinarian || ""
                      }
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                </div>

                {/* REASON */}

                <div className="form-field">
                  <label>Reason for Visit</label>

                  <input
                    type="text"
                    name="reasonForVisit"
                    value={
                      selectedRecord.reasonForVisit || ""
                    }
                    onChange={handleEditChange}
                    placeholder="Enter reason for visit"
                    required
                  />
                </div>

                {/* SYMPTOMS */}

                <div className="form-field">
                  <label>Symptoms</label>

                  <textarea
                    name="symptoms"
                    value={selectedRecord.symptoms || ""}
                    onChange={handleEditChange}
                    placeholder="Enter symptoms"
                    rows="2"
                  />
                </div>

                {/* PROCEDURES + WEIGHT */}

                <div className="form-row">
                  <div className="form-field">
                    <label>Procedures</label>

                    <input
                      type="text"
                      name="procedures"
                      value={
                        selectedRecord.procedures || ""
                      }
                      onChange={handleEditChange}
                      placeholder="Enter procedures"
                    />
                  </div>

                  <div className="form-field">
                    <label>Weight (kg)</label>

                    <input
                      type="number"
                      name="weight"
                      value={selectedRecord.weight || ""}
                      onChange={handleEditChange}
                      min="0"
                      step="0.1"
                      placeholder="Enter weight"
                    />
                  </div>
                </div>

                {/* DIAGNOSIS */}

                <div className="form-field">
                  <label>Diagnosis</label>

                  <textarea
                    name="diagnosis"
                    value={
                      selectedRecord.diagnosis || ""
                    }
                    onChange={handleEditChange}
                    rows="2"
                    required
                  />
                </div>

                {/* TREATMENT */}

                <div className="form-field">
                  <label>Treatment</label>

                  <textarea
                    name="treatment"
                    value={
                      selectedRecord.treatment || ""
                    }
                    onChange={handleEditChange}
                    rows="2"
                    required
                  />
                </div>

                {/* FOLLOW-UP + FILE */}

                <div className="form-row">
                  <div className="form-field">
                    <label>Follow-up Date</label>

                    <input
                      type="date"
                      name="followUpDate"
                      value={
                        selectedRecord.followUpDate || ""
                      }
                      onChange={handleEditChange}
                      min={
                        selectedRecord.date || undefined
                      }
                    />
                  </div>

                  <div className="form-field">
                    <label className="medical-file-label">
                      <FaPaperclip />
                      File Upload
                    </label>

                    <input
                      type="file"
                      onChange={handleEditFileChange}
                    />

                    {selectedRecord.fileName && (
                      <div className="medical-file-name">
                        Current:{" "}
                        {selectedRecord.fileName}
                      </div>
                    )}
                  </div>
                </div>

                {/* NOTES */}

                <div className="form-field">
                  <label>Notes</label>

                  <textarea
                    name="notes"
                    value={selectedRecord.notes || ""}
                    onChange={handleEditChange}
                    rows="2"
                    placeholder="Additional notes..."
                  />
                </div>

                {/* STATUS */}

                <div className="form-field">
                  <label>Status</label>

                  <select
                    name="status"
                    value={
                      selectedRecord.status ||
                      "In Progress"
                    }
                    onChange={handleEditChange}
                  >
                    <option value="In Progress">
                      In Progress
                    </option>

                    <option value="Completed">
                      Completed
                    </option>
                  </select>
                </div>

                {/* EDIT ACTIONS */}

                <div className="medical-workflow-actions">
                  <button
                    type="button"
                    className="medical-workflow-button medical-workflow-secondary"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedRecord(null);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="medical-workflow-button medical-workflow-primary"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default MedicalRecords;