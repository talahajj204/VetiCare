import { useState } from "react";
import Sidebar from "../components/Sidebar";

import {
  FaEye,
  FaPen,
  FaTrash,
  FaFileExcel,
} from "react-icons/fa";

import * as XLSX from "xlsx";

function Medications() {
  // =========================
  // DATA
  // =========================

  const [medications, setMedications] = useState([
    {
      id: 1,
      name: "Amoxicillin",
      dosage: "250 mg",
      form: "Capsule",
      quantity: "40",
      status: "Available",
    },
    {
      id: 2,
      name: "Meloxicam",
      dosage: "1.5 mg",
      form: "Liquid",
      quantity: "8",
      status: "Low Stock",
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

  const [selectedMedication, setSelectedMedication] = useState(null);

  // =========================
  // NEW MEDICATION
  // =========================

  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    form: "",
    quantity: "",
    status: "Available",
  });

  // =========================
  // SEARCH FILTER
  // =========================

  const filteredMedications = medications.filter((medication) => {
    const searchText = search.trim().toLowerCase();

    return (
      medication.name.toLowerCase().includes(searchText) ||
      medication.dosage.toLowerCase().includes(searchText) ||
      medication.form.toLowerCase().includes(searchText) ||
      medication.quantity.toString().includes(searchText) ||
      medication.status.toLowerCase().includes(searchText)
    );
  });

  // =========================
  // NEW MEDICATION CHANGE
  // =========================

  const handleNewMedicationChange = (e) => {
    const { name, value } = e.target;

    setNewMedication({
      ...newMedication,
      [name]: value,
    });
  };

  // =========================
  // ADD MEDICATION
  // =========================

  const handleAddMedication = (e) => {
    e.preventDefault();

    const medication = {
      id: Date.now(),
      ...newMedication,
    };

    setMedications([...medications, medication]);

    setNewMedication({
      name: "",
      dosage: "",
      form: "",
      quantity: "",
      status: "Available",
    });

    setShowAddModal(false);
  };

  // =========================
  // VIEW
  // =========================

  const handleViewMedication = (medication) => {
    setSelectedMedication(medication);
    setShowViewModal(true);
  };

  // =========================
  // OPEN EDIT
  // =========================

  const handleOpenEdit = (medication) => {
    setSelectedMedication({ ...medication });
    setShowEditModal(true);
  };

  // =========================
  // EDIT CHANGE
  // =========================

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setSelectedMedication({
      ...selectedMedication,
      [name]: value,
    });
  };

  // =========================
  // UPDATE MEDICATION
  // =========================

  const handleUpdateMedication = (e) => {
    e.preventDefault();

    setMedications(
      medications.map((medication) =>
        medication.id === selectedMedication.id
          ? selectedMedication
          : medication
      )
    );

    setShowEditModal(false);
    setSelectedMedication(null);
  };

  // =========================
  // DELETE
  // =========================

  const handleDeleteMedication = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this medication?"
    );

    if (confirmDelete) {
      setMedications(
        medications.filter((medication) => medication.id !== id)
      );
    }
  };

  // =========================
  // STATUS CLASS
  // =========================

  const getStatusClass = (status) => {
    if (status === "Available") {
      return "status confirmed";
    }

    if (status === "Low Stock") {
      return "status pending";
    }

    return "status cancelled";
  };

  // =========================
  // EXPORT TO EXCEL
  // =========================

  const exportToExcel = () => {
    const excelData = medications.map((medication) => ({
      "Medication Name": medication.name,
      Dosage: medication.dosage,
      Form: medication.form,
      Quantity: Number(medication.quantity || 0),
      Status: medication.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

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

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">

        {/* HEADER */}

        <div className="page-header">
          <div>
            <h1>Medications</h1>
            <p>Manage clinic medications</p>
          </div>
        </div>

        {/* SEARCH + EXPORT + ADD */}

        <div className="inventory-toolbar">

          <div className="search-container inventory-search">
            <input
              type="text"
              placeholder="Search medications..."
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
              + Add Medication
            </button>

          </div>

        </div>

        {/* TABLE */}

        <div className="owners-table-container">

          <table className="owners-table">

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

              {filteredMedications.length > 0 ? (
                filteredMedications.map((medication) => (

                  <tr key={medication.id}>

                    <td>{medication.name}</td>

                    <td>{medication.dosage}</td>

                    <td>{medication.form}</td>

                    <td>{medication.quantity}</td>

                    <td>
                      <span
                        className={getStatusClass(medication.status)}
                      >
                        {medication.status}
                      </span>
                    </td>

                    <td>

                      <div className="table-actions">

                        {/* VIEW */}

                        <button
                          type="button"
                          className="view-button icon-button"
                          onClick={() =>
                            handleViewMedication(medication)
                          }
                          title="View"
                          aria-label="View medication"
                        >
                          <FaEye />
                        </button>

                        {/* EDIT */}

                        <button
                          type="button"
                          className="edit-button icon-button"
                          onClick={() =>
                            handleOpenEdit(medication)
                          }
                          title="Edit"
                          aria-label="Edit medication"
                        >
                          <FaPen />
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          className="delete-button icon-button"
                          onClick={() =>
                            handleDeleteMedication(medication.id)
                          }
                          title="Delete"
                          aria-label="Delete medication"
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
                    No medications found
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </main>

      {/* =========================================
          ADD MEDICATION
      ========================================= */}

      {showAddModal && (

        <div className="modal-overlay">

          <div className="modal-container">

            <div className="modal-header">

              <div>
                <h2>Add Medication</h2>
                <p>Enter medication information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setShowAddModal(false)}
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
                    onChange={handleNewMedicationChange}
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
                    onChange={handleNewMedicationChange}
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
                    onChange={handleNewMedicationChange}
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
                    onChange={handleNewMedicationChange}
                    required
                  />

                </div>

              </div>

              <div className="form-field">

                <label>Status</label>

                <select
                  name="status"
                  value={newMedication.status}
                  onChange={handleNewMedicationChange}
                >

                  <option value="Available">
                    Available
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
                  onClick={() => setShowAddModal(false)}
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

      {/* =========================================
          VIEW MEDICATION
      ========================================= */}

      {showViewModal && selectedMedication && (

        <div className="modal-overlay">

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
              <strong>{selectedMedication.name}</strong>
            </div>

            <div className="detail-row">
              <span>Dosage</span>
              <strong>{selectedMedication.dosage}</strong>
            </div>

            <div className="detail-row">
              <span>Form</span>
              <strong>{selectedMedication.form}</strong>
            </div>

            <div className="detail-row">
              <span>Quantity</span>
              <strong>{selectedMedication.quantity}</strong>
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
                className="edit-button"
                onClick={() => {
                  setShowViewModal(false);
                  setShowEditModal(true);
                }}
              >
                <FaPen />

                <span style={{ marginLeft: "7px" }}>
                  Edit Medication
                </span>

              </button>

            </div>

          </div>

        </div>

      )}

      {/* =========================================
          EDIT MEDICATION
      ========================================= */}

      {showEditModal && selectedMedication && (

        <div className="modal-overlay">

          <div className="modal-container">

            <div className="modal-header">

              <div>
                <h2>Edit Medication</h2>
                <p>Update medication information</p>
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

            <form onSubmit={handleUpdateMedication}>

              <div className="form-row">

                <div className="form-field">

                  <label>Medication Name</label>

                  <input
                    type="text"
                    name="name"
                    value={selectedMedication.name}
                    onChange={handleEditChange}
                    required
                  />

                </div>

                <div className="form-field">

                  <label>Dosage</label>

                  <input
                    type="text"
                    name="dosage"
                    value={selectedMedication.dosage}
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
                    value={selectedMedication.form}
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
                    value={selectedMedication.quantity}
                    onChange={handleEditChange}
                    required
                  />

                </div>

              </div>

              <div className="form-field">

                <label>Status</label>

                <select
                  name="status"
                  value={selectedMedication.status}
                  onChange={handleEditChange}
                >

                  <option value="Available">
                    Available
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

    </div>
  );
}

export default Medications;