import { useEffect, useMemo, useState } from "react";
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

function Medications() {
  // =====================================================
  // DATA
  // =====================================================

  const [medications, setMedications] = useState([
    {
      id: 1,
      name: "Amoxicillin",
      dosage: "250 mg",
      form: "Capsule",
      quantity: "40",
      status: "In Stock",
    },
    {
      id: 2,
      name: "Meloxicam",
      dosage: "1.5 mg",
      form: "Liquid",
      quantity: "8",
      status: "Low Stock",
    },
    {
      id: 3,
      name: "Cefalexin",
      dosage: "500 mg",
      form: "Tablet",
      quantity: "0",
      status: "Out of Stock",
    },
  ]);

  // =====================================================
  // FILTERS
  // =====================================================

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [formFilter, setFormFilter] = useState("All");

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

  const [selectedMedication, setSelectedMedication] = useState(null);
  const [medicationToDelete, setMedicationToDelete] = useState(null);

  // =====================================================
  // NEW MEDICATION
  // =====================================================

  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    form: "",
    quantity: "",
    status: "In Stock",
  });

  // =====================================================
  // FILTER MEDICATIONS
  // =====================================================

  const filteredMedications = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return medications.filter((medication) => {
      const matchesSearch =
        !searchText ||
        medication.name.toLowerCase().includes(searchText) ||
        medication.dosage.toLowerCase().includes(searchText) ||
        medication.form.toLowerCase().includes(searchText) ||
        medication.quantity.toString().includes(searchText) ||
        medication.status.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        medication.status === statusFilter;

      const matchesForm =
        formFilter === "All" ||
        medication.form === formFilter;

      return matchesSearch && matchesStatus && matchesForm;
    });
  }, [medications, search, statusFilter, formFilter]);

  // =====================================================
  // PAGINATION CALCULATIONS
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMedications.length / rowsPerPage)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, formFilter, rowsPerPage]);

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
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setFormFilter("All");
    setCurrentPage(1);
  };

  const hasFilters =
    search !== "" ||
    statusFilter !== "All" ||
    formFilter !== "All";

  // =====================================================
  // NEW MEDICATION CHANGE
  // =====================================================

  const handleNewMedicationChange = (e) => {
    const { name, value } = e.target;

    setNewMedication((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // ADD MEDICATION
  // =====================================================

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

    setNewMedication({
      name: "",
      dosage: "",
      form: "",
      quantity: "",
      status: "In Stock",
    });

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
      previous.map((medication) =>
        medication.id === selectedMedication.id
          ? selectedMedication
          : medication
      )
    );

    setShowEditModal(false);
    setSelectedMedication(null);
  };

  // =====================================================
  // DELETE POPUP
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
        (medication) =>
          medication.id !== medicationToDelete.id
      )
    );

    setShowDeleteModal(false);
    setMedicationToDelete(null);
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    if (status === "In Stock") {
      return "status confirmed";
    }

    if (status === "Low Stock") {
      return "status pending";
    }

    return "status cancelled";
  };

  // =====================================================
  // EXPORT TO EXCEL
  // =====================================================

  const exportToExcel = () => {
    const excelData = filteredMedications.map(
      (medication) => ({
        "Medication Name": medication.name,
        Dosage: medication.dosage,
        Form: medication.form,
        Quantity: Number(medication.quantity || 0),
        Status: medication.status,
      })
    );

    const worksheet =
      XLSX.utils.json_to_sheet(excelData);

    worksheet["!cols"] = [
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 18 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Medications"
    );

    XLSX.writeFile(
      workbook,
      "vet-clinic-medications.xlsx"
    );
  };

  // =====================================================
  // PAGINATION STYLES
  // SAME STYLE AS REMINDERS: < 1 >
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

      <main className="dashboard-main medications-page">
        {/* HEADER */}

        <div className="page-header">
          <div>
            <h1>Medications</h1>
            <p>Manage clinic medications</p>
          </div>
        </div>

        {/* =================================================
            SEARCH + FILTERS
        ================================================= */}

        <div className="medications-filter-row">
          {/* SEARCH */}

          <div className="medications-search-box">
            <FaSearch className="medications-search-icon" />

            <input
              type="text"
              placeholder="Search medications..."
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

          {/* STATUS */}

          <select
            className="medications-filter-select"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="All">All Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">
              Out of Stock
            </option>
          </select>

          {/* FORM */}

          <select
            className="medications-filter-select"
            value={formFilter}
            onChange={(e) =>
              setFormFilter(e.target.value)
            }
          >
            <option value="All">All Forms</option>
            <option value="Capsule">Capsule</option>
            <option value="Tablet">Tablet</option>
            <option value="Liquid">Liquid</option>
            <option value="Injection">
              Injection
            </option>
            <option value="Cream">Cream</option>
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
            onClick={() => setShowAddModal(true)}
          >
            + Add Medication
          </button>
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="owners-table-container medications-table-container">
          <div className="medications-table-scroll">
            <table className="owners-table medications-table">
              <thead>
                <tr>
                  <th>Medication Name</th>
                  <th>Dosage</th>
                  <th>Form</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedMedications.length > 0 ? (
                  paginatedMedications.map(
                    (medication) => (
                      <tr key={medication.id}>
                        <td>{medication.name}</td>
                        <td>{medication.dosage}</td>
                        <td>{medication.form}</td>
                        <td>{medication.quantity}</td>

                        <td>
                          <span
                            className={getStatusClass(
                              medication.status
                            )}
                          >
                            {medication.status}
                          </span>
                        </td>

                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="view-button icon-button"
                              onClick={() =>
                                handleViewMedication(
                                  medication
                                )
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
                                handleOpenEdit(
                                  medication
                                )
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
                                handleOpenDelete(
                                  medication
                                )
                              }
                              title="Delete"
                              aria-label="Delete medication"
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
                      ? "medications-page-active"
                      : ""
                  }
                  onClick={() =>
                    setCurrentPage(page)
                  }
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
                <p>Enter medication information</p>
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
              <div className="form-row">
                <div className="form-field">
                  <label>Medication Name</label>

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter medication name"
                    value={newMedication.name}
                    onChange={
                      handleNewMedicationChange
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Dosage</label>

                  <input
                    type="text"
                    name="dosage"
                    placeholder="Example: 250 mg"
                    value={newMedication.dosage}
                    onChange={
                      handleNewMedicationChange
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Form</label>

                  <select
                    name="form"
                    value={newMedication.form}
                    onChange={
                      handleNewMedicationChange
                    }
                    required
                  >
                    <option value="">
                      Select form
                    </option>

                    <option value="Capsule">
                      Capsule
                    </option>

                    <option value="Tablet">
                      Tablet
                    </option>

                    <option value="Liquid">
                      Liquid
                    </option>

                    <option value="Injection">
                      Injection
                    </option>

                    <option value="Cream">
                      Cream
                    </option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Quantity</label>

                  <input
                    type="number"
                    name="quantity"
                    min="0"
                    placeholder="Enter quantity"
                    value={newMedication.quantity}
                    onChange={
                      handleNewMedicationChange
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Status</label>

                <select
                  name="status"
                  value={newMedication.status}
                  onChange={
                    handleNewMedicationChange
                  }
                >
                  <option value="In Stock">
                    In Stock
                  </option>

                  <option value="Low Stock">
                    Low Stock
                  </option>

                  <option value="Out of Stock">
                    Out of Stock
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
                <p>View medication information</p>
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
              <span>Medication Name</span>
              <strong>
                {selectedMedication.name}
              </strong>
            </div>

            <div className="detail-row">
              <span>Dosage</span>
              <strong>
                {selectedMedication.dosage}
              </strong>
            </div>

            <div className="detail-row">
              <span>Form</span>
              <strong>
                {selectedMedication.form}
              </strong>
            </div>

            <div className="detail-row">
              <span>Quantity</span>
              <strong>
                {selectedMedication.quantity}
              </strong>
            </div>

            <div className="detail-row">
              <span>Status</span>

              <strong>
                <span
                  className={getStatusClass(
                    selectedMedication.status
                  )}
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
                  Update medication information
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
              <div className="form-row">
                <div className="form-field">
                  <label>
                    Medication Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={
                      selectedMedication.name
                    }
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Dosage</label>

                  <input
                    type="text"
                    name="dosage"
                    value={
                      selectedMedication.dosage
                    }
                    onChange={handleEditChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Form</label>

                  <select
                    name="form"
                    value={
                      selectedMedication.form
                    }
                    onChange={handleEditChange}
                    required
                  >
                    <option value="Capsule">
                      Capsule
                    </option>

                    <option value="Tablet">
                      Tablet
                    </option>

                    <option value="Liquid">
                      Liquid
                    </option>

                    <option value="Injection">
                      Injection
                    </option>

                    <option value="Cream">
                      Cream
                    </option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Quantity</label>

                  <input
                    type="number"
                    name="quantity"
                    min="0"
                    value={
                      selectedMedication.quantity
                    }
                    onChange={handleEditChange}
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Status</label>

                <select
                  name="status"
                  value={
                    selectedMedication.status
                  }
                  onChange={handleEditChange}
                >
                  <option value="In Stock">
                    In Stock
                  </option>

                  <option value="Low Stock">
                    Low Stock
                  </option>

                  <option value="Out of Stock">
                    Out of Stock
                  </option>
                </select>
              </div>

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

      {showDeleteModal && medicationToDelete && (
        <div
          className="medications-delete-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
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
              Are you sure you want to delete this?
            </p>

            <div className="medications-delete-actions">
              <button
                type="button"
                className="medications-delete-cancel"
                onClick={handleCancelDelete}
              >
                Cancel
              </button>

              <button
                type="button"
                className="medications-delete-confirm"
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

export default Medications;