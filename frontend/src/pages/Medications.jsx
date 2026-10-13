import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import {
  FaEye,
  FaPen,
  FaTrash,
  FaFileExcel,
  FaSearch,
  FaTimes,
  FaPrescription,
} from "react-icons/fa";

import * as XLSX from "xlsx";

function Medications() {
  const navigate = useNavigate();

  // =====================================================
  // DATA
  // =====================================================

  const [medications, setMedications] = useState([
    {
      id: 1,
      pet: "Bella",
      owner: "Tala El Hajj",
      medication: "Amoxicillin",
      dosage: "250 mg",
      frequency: "Twice daily",
      route: "Oral",
      startDate: "2026-09-25",
      endDate: "2026-10-05",
      instructions: "Give after food.",
      status: "Active",
    },
    {
      id: 2,
      pet: "Luna",
      owner: "Fatima Abbas",
      medication: "Meloxicam",
      dosage: "1.5 mg",
      frequency: "Once daily",
      route: "Oral",
      startDate: "2026-08-10",
      endDate: "2026-08-17",
      instructions: "Give with food.",
      status: "Past",
    },
    {
      id: 3,
      pet: "Bella",
      owner: "Tala El Hajj",
      medication: "Cefalexin",
      dosage: "500 mg",
      frequency: "Every 12 hours",
      route: "Oral",
      startDate: "2026-10-01",
      endDate: "2026-10-10",
      instructions: "Complete the full course.",
      status: "Active",
    },
  ]);

  // =====================================================
  // FILTERS
  // =====================================================

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [routeFilter, setRouteFilter] = useState("All");

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

  const [selectedMedication, setSelectedMedication] =
    useState(null);

  const [medicationToDelete, setMedicationToDelete] =
    useState(null);

  // =====================================================
  // EMPTY MEDICATION
  // =====================================================

  const getEmptyMedication = () => ({
    pet: "",
    owner: "",
    medication: "",
    dosage: "",
    frequency: "",
    route: "Oral",
    startDate: "",
    endDate: "",
    instructions: "",
    status: "Active",
  });

  // =====================================================
  // NEW MEDICATION
  // =====================================================

  const [newMedication, setNewMedication] = useState(
    getEmptyMedication()
  );

  // =====================================================
  // FILTER MEDICATIONS
  // =====================================================

  const filteredMedications = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return medications.filter((item) => {
      const matchesSearch =
        !searchText ||
        (item.pet || "").toLowerCase().includes(searchText) ||
        (item.owner || "").toLowerCase().includes(searchText) ||
        (item.medication || "")
          .toLowerCase()
          .includes(searchText) ||
        (item.dosage || "").toLowerCase().includes(searchText) ||
        (item.frequency || "")
          .toLowerCase()
          .includes(searchText) ||
        (item.route || "").toLowerCase().includes(searchText) ||
        (item.instructions || "")
          .toLowerCase()
          .includes(searchText) ||
        (item.status || "").toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      const matchesRoute =
        routeFilter === "All" || item.route === routeFilter;

      return matchesSearch && matchesStatus && matchesRoute;
    });
  }, [medications, search, statusFilter, routeFilter]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMedications.length / rowsPerPage)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, routeFilter, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * rowsPerPage;

  const paginatedMedications = filteredMedications.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // =====================================================
  // FILTERS
  // =====================================================

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setRouteFilter("All");
    setCurrentPage(1);
  };

  const hasFilters =
    search !== "" ||
    statusFilter !== "All" ||
    routeFilter !== "All";

  // =====================================================
  // ADD MEDICATION
  // =====================================================

  const handleNewMedicationChange = (e) => {
    const { name, value } = e.target;

    setNewMedication((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAddMedication = (e) => {
    e.preventDefault();

    const medication = {
      id: Date.now(),
      ...newMedication,
    };

    setMedications((previous) => [
      ...previous,
      medication,
    ]);

    setNewMedication(getEmptyMedication());
    setShowAddModal(false);
  };

  // =====================================================
  // VIEW
  // =====================================================

  const handleViewMedication = (medication) => {
    setSelectedMedication(medication);
    setShowViewModal(true);
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleOpenEdit = (medication) => {
    setSelectedMedication({ ...medication });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setSelectedMedication((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleUpdateMedication = (e) => {
    e.preventDefault();

    setMedications((previous) =>
      previous.map((item) =>
        item.id === selectedMedication.id
          ? selectedMedication
          : item
      )
    );

    setShowEditModal(false);
    setSelectedMedication(null);
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleOpenDelete = (medication) => {
    setMedicationToDelete(medication);
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setMedicationToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (!medicationToDelete) return;

    setMedications((previous) =>
      previous.filter(
        (item) => item.id !== medicationToDelete.id
      )
    );

    setShowDeleteModal(false);
    setMedicationToDelete(null);
  };

  // =====================================================
  // CREATE PRESCRIPTION
  // =====================================================

  const handleCreatePrescription = (medication) => {
    if (medication.status !== "Active") return;

    navigate("/prescriptions", {
      state: {
        openAddPrescription: true,

        medicationId: medication.id,

        pet: medication.pet,
        petName: medication.pet,

        owner: medication.owner,
        ownerName: medication.owner,

        medication: medication.medication,
        medicationName: medication.medication,

        dosage: medication.dosage,
        frequency: medication.frequency,
        route: medication.route,
        startDate: medication.startDate,
        endDate: medication.endDate,
        instructions: medication.instructions,

        medicationData: medication,
      },
    });
  };

  // =====================================================
  // STATUS
  // =====================================================

  const getStatusClass = (status) => {
    if (status === "Active") {
      return "status confirmed";
    }

    return "status cancelled";
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "—";

    const parts = date.split("-");

    if (parts.length !== 3) return date;

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  // =====================================================
  // EXPORT
  // =====================================================

  const exportToExcel = () => {
    const excelData = filteredMedications.map((item) => ({
      Pet: item.pet,
      Owner: item.owner,
      Medication: item.medication,
      Dosage: item.dosage,
      Frequency: item.frequency,
      Route: item.route,
      "Start Date": item.startDate,
      "End Date": item.endDate,
      Instructions: item.instructions,
      Status: item.status,
    }));

    const worksheet =
      XLSX.utils.json_to_sheet(excelData);

    worksheet["!cols"] = [
      { wch: 18 },
      { wch: 22 },
      { wch: 24 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 35 },
      { wch: 12 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Pet Medications"
    );

    XLSX.writeFile(
      workbook,
      "vet-clinic-pet-medications.xlsx"
    );
  };

  // =====================================================
  // PAGINATION STYLES
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

  // =====================================================
  // SMALL BUTTON STYLES
  // =====================================================

  const prescriptionButtonStyle = {
    width: "auto",
    minWidth: "0",
    height: "32px",
    padding: "0 10px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    border: "1px solid #54b7b5",
    borderRadius: "6px",
    backgroundColor: "#54b7b5",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: "600",
    lineHeight: "1",
    whiteSpace: "nowrap",
    cursor: "pointer",
  };

  // =====================================================
  // FORM CONTENT
  // =====================================================

  const renderMedicationFields = (
    data,
    onChange,
    isEdit = false
  ) => (
    <>
      <div className="form-row">
        <div className="form-field">
          <label>Pet</label>

          <input
            type="text"
            name="pet"
            placeholder="Enter pet name"
            value={data.pet || ""}
            onChange={onChange}
            required
          />
        </div>

        <div className="form-field">
          <label>Owner</label>

          <input
            type="text"
            name="owner"
            placeholder="Enter owner name"
            value={data.owner || ""}
            onChange={onChange}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>Medication</label>

          <input
            type="text"
            name="medication"
            placeholder="Enter medication name"
            value={data.medication || ""}
            onChange={onChange}
            required
          />
        </div>

        <div className="form-field">
          <label>Dosage</label>

          <input
            type="text"
            name="dosage"
            placeholder="Example: 250 mg"
            value={data.dosage || ""}
            onChange={onChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>Frequency</label>

          <input
            type="text"
            name="frequency"
            placeholder="Example: Twice daily"
            value={data.frequency || ""}
            onChange={onChange}
            required
          />
        </div>

        <div className="form-field">
          <label>Route</label>

          <select
            name="route"
            value={data.route || "Oral"}
            onChange={onChange}
            required
          >
            <option value="Oral">Oral</option>
            <option value="Injection">Injection</option>
            <option value="Topical">Topical</option>
            <option value="Ophthalmic">Ophthalmic</option>
            <option value="Otic">Otic</option>
            <option value="Inhalation">Inhalation</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>Start Date</label>

          <input
            type="date"
            name="startDate"
            value={data.startDate || ""}
            onChange={onChange}
            required
          />
        </div>

        <div className="form-field">
          <label>End Date</label>

          <input
            type="date"
            name="endDate"
            value={data.endDate || ""}
            onChange={onChange}
          />
        </div>
      </div>

      <div className="form-field">
        <label>Instructions</label>

        <textarea
          name="instructions"
          placeholder="Enter medication instructions"
          value={data.instructions || ""}
          onChange={onChange}
          rows="3"
        />
      </div>

      <div className="form-field">
        <label>Status</label>

        <select
          name="status"
          value={data.status || "Active"}
          onChange={onChange}
          required
        >
          <option value="Active">Active</option>
          <option value="Past">Past</option>
        </select>
      </div>
    </>
  );

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main medications-page">
        <style>{`
          .medications-main-table {
            min-width: 1180px;
          }

          .medications-main-table th,
          .medications-main-table td {
            white-space: nowrap;
          }

          .medication-instructions-cell {
            max-width: 220px;
            min-width: 180px;
            white-space: normal !important;
            line-height: 1.4;
          }

          .medications-actions-cell {
            min-width: 225px;
          }

          .medication-prescription-button:hover {
            background: #359f9b !important;
            border-color: #359f9b !important;
          }

          .medication-status-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 62px;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
          }

          .medication-status-active {
            color: #238d78;
            background: #e1f5ef;
          }

          .medication-status-past {
            color: #788685;
            background: #edf1f1;
          }

          .medication-detail-status {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 5px 11px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
          }

          .medications-modal-prescription {
            width: auto !important;
            min-width: 0 !important;
            height: 38px !important;
            padding: 0 14px !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 6px !important;
            border: 1px solid #54b7b5 !important;
            border-radius: 7px !important;
            background: #54b7b5 !important;
            color: #ffffff !important;
            font-size: 12px !important;
            font-weight: 600 !important;
            white-space: nowrap !important;
            cursor: pointer !important;
          }

          .medications-modal-prescription:hover {
            background: #359f9b !important;
            border-color: #359f9b !important;
          }
        `}</style>

        {/* HEADER */}

        <div className="page-header">
          <div>
            <h1>Medications</h1>
            <p>
              Manage medications currently or previously taken
              by pets
            </p>
          </div>
        </div>

        {/* =================================================
            SEARCH + FILTERS
        ================================================= */}

        <div className="medications-filter-row">
          <div className="medications-search-box">
            <FaSearch className="medications-search-icon" />

            <input
              type="text"
              placeholder="Search pet or medication..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {hasFilters && (
              <button
                type="button"
                className="medications-clear-button"
                onClick={clearFilters}
                title="Clear filters"
                aria-label="Clear filters"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <select
            className="medications-filter-select"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Past">Past</option>
          </select>

          <select
            className="medications-filter-select"
            value={routeFilter}
            onChange={(e) =>
              setRouteFilter(e.target.value)
            }
          >
            <option value="All">All Routes</option>
            <option value="Oral">Oral</option>
            <option value="Injection">Injection</option>
            <option value="Topical">Topical</option>
            <option value="Ophthalmic">Ophthalmic</option>
            <option value="Otic">Otic</option>
            <option value="Inhalation">Inhalation</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* =================================================
            EXPORT + ADD
        ================================================= */}

        <div className="medications-toolbar-buttons">
          <button
            type="button"
            className="medications-export-button"
            onClick={exportToExcel}
          >
            <FaFileExcel />
            <span>Export</span>
          </button>

          <button
            type="button"
            className="medications-add-button"
            onClick={() => {
              setNewMedication(getEmptyMedication());
              setShowAddModal(true);
            }}
          >
            + Add Medication
          </button>
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="owners-table-container medications-table-container">
          <div className="medications-table-scroll">
            <table className="owners-table medications-table medications-main-table">
              <thead>
                <tr>
                  <th>Pet</th>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Route</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Instructions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedMedications.length > 0 ? (
                  paginatedMedications.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.pet}</strong>

                        {item.owner && (
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#849291",
                              marginTop: "3px",
                            }}
                          >
                            {item.owner}
                          </div>
                        )}
                      </td>

                      <td>{item.medication}</td>

                      <td>{item.dosage}</td>

                      <td>{item.frequency}</td>

                      <td>{item.route}</td>

                      <td>{formatDate(item.startDate)}</td>

                      <td>
                        {item.endDate
                          ? formatDate(item.endDate)
                          : "—"}
                      </td>

                      <td className="medication-instructions-cell">
                        {item.instructions || "—"}
                      </td>

                      <td>
                        <span
                          className={`medication-status-badge ${
                            item.status === "Active"
                              ? "medication-status-active"
                              : "medication-status-past"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="medications-actions-cell">
                        <div className="table-actions">
                          <button
                            type="button"
                            className="view-button icon-button"
                            onClick={() =>
                              handleViewMedication(item)
                            }
                            title="View"
                            aria-label="View medication"
                          >
                            <FaEye />
                          </button>

                          <button
                            type="button"
                            className="edit-button icon-button"
                            onClick={() =>
                              handleOpenEdit(item)
                            }
                            title="Edit"
                            aria-label="Edit medication"
                          >
                            <FaPen />
                          </button>

                          <button
                            type="button"
                            className="delete-button icon-button"
                            onClick={() =>
                              handleOpenDelete(item)
                            }
                            title="Delete"
                            aria-label="Delete medication"
                          >
                            <FaTrash />
                          </button>

                          {item.status === "Active" && (
                            <button
                              type="button"
                              className="medication-prescription-button"
                              style={prescriptionButtonStyle}
                              onClick={() =>
                                handleCreatePrescription(item)
                              }
                              title="Create Prescription"
                            >
                              <FaPrescription />
                              <span></span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="10"
                      className="no-results"
                    >
                      No medications found
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

        <div className="medications-pagination">
          <div className="medications-rows-per-page">
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
            className="medications-page-controls"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "6px",
            }}
          >
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
          ADD MEDICATION
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
                <h2>Add Medication</h2>
                <p>
                  Add a medication that a pet is taking
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

            <form onSubmit={handleAddMedication}>
              {renderMedicationFields(
                newMedication,
                handleNewMedicationChange
              )}

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
                  Add Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          VIEW MEDICATION
      ===================================================== */}

      {showViewModal && selectedMedication && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowViewModal(false);
              setSelectedMedication(null);
            }
          }}
        >
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>Medication Details</h2>

                <p>
                  View pet medication information
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedMedication(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="detail-row">
              <span>Pet</span>
              <strong>
                {selectedMedication.pet}
              </strong>
            </div>

            <div className="detail-row">
              <span>Owner</span>
              <strong>
                {selectedMedication.owner || "—"}
              </strong>
            </div>

            <div className="detail-row">
              <span>Medication</span>
              <strong>
                {selectedMedication.medication}
              </strong>
            </div>

            <div className="detail-row">
              <span>Dosage</span>
              <strong>
                {selectedMedication.dosage}
              </strong>
            </div>

            <div className="detail-row">
              <span>Frequency</span>
              <strong>
                {selectedMedication.frequency}
              </strong>
            </div>

            <div className="detail-row">
              <span>Route</span>
              <strong>
                {selectedMedication.route}
              </strong>
            </div>

            <div className="detail-row">
              <span>Start Date</span>
              <strong>
                {formatDate(
                  selectedMedication.startDate
                )}
              </strong>
            </div>

            <div className="detail-row">
              <span>End Date</span>
              <strong>
                {selectedMedication.endDate
                  ? formatDate(
                      selectedMedication.endDate
                    )
                  : "—"}
              </strong>
            </div>

            <div className="detail-row">
              <span>Instructions</span>
              <strong>
                {selectedMedication.instructions ||
                  "—"}
              </strong>
            </div>

            <div className="detail-row">
              <span>Status</span>

              <strong>
                <span
                  className={`medication-detail-status ${
                    selectedMedication.status ===
                    "Active"
                      ? "medication-status-active"
                      : "medication-status-past"
                  }`}
                >
                  {selectedMedication.status}
                </span>
              </strong>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="modal-cancel-button"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedMedication(null);
                }}
              >
                Close
              </button>

              <button
                type="button"
                className="edit-button medications-modal-edit"
                onClick={() => {
                  setShowViewModal(false);
                  setShowEditModal(true);
                }}
              >
                <FaPen />
                <span>Edit Medication</span>
              </button>

              {selectedMedication.status ===
                "Active" && (
                <button
                  type="button"
                  className="medications-modal-prescription"
                  onClick={() =>
                    handleCreatePrescription(
                      selectedMedication
                    )
                  }
                >
                  <FaPrescription />
                  <span>Create Prescription</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          EDIT MEDICATION
      ===================================================== */}

      {showEditModal && selectedMedication && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModal(false);
              setSelectedMedication(null);
            }
          }}
        >
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>Edit Medication</h2>

                <p>
                  Update pet medication information
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedMedication(null);
                }}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleUpdateMedication}
            >
              {renderMedicationFields(
                selectedMedication,
                handleEditChange,
                true
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedMedication(null);
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

      {showDeleteModal &&
        medicationToDelete && (
          <div
            className="medications-delete-overlay"
            onMouseDown={(e) => {
              if (
                e.target === e.currentTarget
              ) {
                handleCancelDelete();
              }
            }}
          >
            <div className="medications-delete-dialog">
              <div className="medications-delete-icon">
                <FaTrash />
              </div>

              <h3>Delete Medication</h3>

              <p>
                Are you sure you want to delete{" "}
                <strong>
                  {medicationToDelete.medication}
                </strong>{" "}
                for{" "}
                <strong>
                  {medicationToDelete.pet}
                </strong>
                ?
              </p>

              <div className="medications-delete-actions">
                <button
                  type="button"
                  className="medications-delete-cancel"
                  onClick={
                    handleCancelDelete
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="medications-delete-confirm"
                  onClick={
                    handleConfirmDelete
                  }
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

export default Medications;