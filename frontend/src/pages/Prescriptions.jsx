import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { FaEye, FaPen, FaTrash } from "react-icons/fa";

function Prescriptions() {
 

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



  const [search, setSearch] = useState("");

  

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedPrescription, setSelectedPrescription] =
    useState(null);

 

  const [newPrescription, setNewPrescription] = useState({
    pet: "",
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    date: "",
  });



  const filteredPrescriptions = prescriptions.filter(
    (prescription) => {
      const searchText = search.trim().toLowerCase();

      return (
        prescription.pet.toLowerCase().includes(searchText) ||
        prescription.medication.toLowerCase().includes(searchText) ||
        prescription.dosage.toLowerCase().includes(searchText) ||
        prescription.frequency.toLowerCase().includes(searchText) ||
        prescription.duration.toLowerCase().includes(searchText) ||
        prescription.date.toLowerCase().includes(searchText)
      );
    }
  );


  const handleNewPrescriptionChange = (e) => {
    const { name, value } = e.target;

    setNewPrescription({
      ...newPrescription,
      [name]: value,
    });
  };



  const handleAddPrescription = (e) => {
    e.preventDefault();

    const prescription = {
      id: Date.now(),
      ...newPrescription,
    };

    setPrescriptions([
      ...prescriptions,
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

  // =========================
  // VIEW
  // =========================

  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setShowViewModal(true);
  };

  // =========================
  // OPEN EDIT
  // =========================

  const handleOpenEdit = (prescription) => {
    setSelectedPrescription({
      ...prescription,
    });

    setShowEditModal(true);
  };

  // =========================
  // EDIT CHANGE
  // =========================

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setSelectedPrescription({
      ...selectedPrescription,
      [name]: value,
    });
  };

  // =========================
  // UPDATE
  // =========================

  const handleUpdatePrescription = (e) => {
    e.preventDefault();

    setPrescriptions(
      prescriptions.map((prescription) =>
        prescription.id === selectedPrescription.id
          ? selectedPrescription
          : prescription
      )
    );

    setShowEditModal(false);
    setSelectedPrescription(null);
  };

  // =========================
  // DELETE
  // =========================

  const handleDeletePrescription = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this prescription?"
    );

    if (confirmDelete) {
      setPrescriptions(
        prescriptions.filter(
          (prescription) => prescription.id !== id
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
            <h1>Prescriptions</h1>
            <p>Manage pet prescriptions</p>
          </div>

          <button
            type="button"
            className="add-button"
            onClick={() => setShowAddModal(true)}
          >
            + Add Prescription
          </button>

        </div>

        {/* SEARCH */}

        <div className="search-container">

          <input
            type="text"
            placeholder="Search prescriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        {/* TABLE */}

        <div className="owners-table-container">

          <table className="owners-table">

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

              {filteredPrescriptions.length > 0 ? (

                filteredPrescriptions.map(
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

      </main>

      {/* =========================================
          ADD PRESCRIPTION
      ========================================= */}

      {showAddModal && (

        <div className="modal-overlay">

          <div className="modal-container">

            <div className="modal-header">

              <div>
                <h2>Add Prescription</h2>
                <p>Enter prescription information</p>
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

            <form onSubmit={handleAddPrescription}>

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
                    value={newPrescription.dosage}
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
                    value={newPrescription.date}
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

      {/* =========================================
          VIEW PRESCRIPTION
      ========================================= */}

      {showViewModal &&
        selectedPrescription && (

        <div className="modal-overlay">

          <div className="modal-container">

            <div className="modal-header">

              <div>
                <h2>Prescription Details</h2>
                <p>View prescription information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedPrescription(null);
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
                {selectedPrescription.medication}
              </strong>
            </div>

            <div className="detail-row">
              <span>Dosage</span>

              <strong>
                {selectedPrescription.dosage}
              </strong>
            </div>

            <div className="detail-row">
              <span>Frequency</span>

              <strong>
                {selectedPrescription.frequency}
              </strong>
            </div>

            <div className="detail-row">
              <span>Duration</span>

              <strong>
                {selectedPrescription.duration}
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
                  setSelectedPrescription(null);
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
                  Edit Prescription
                </span>
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =========================================
          EDIT PRESCRIPTION
      ========================================= */}

      {showEditModal &&
        selectedPrescription && (

        <div className="modal-overlay">

          <div className="modal-container">

            <div className="modal-header">

              <div>
                <h2>Edit Prescription</h2>
                <p>Update prescription information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedPrescription(null);
                }}
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleUpdatePrescription}
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
                    onChange={handleEditChange}
                    required
                  />

                </div>

                <div className="form-field">

                  <label>Medication</label>

                  <input
                    type="text"
                    name="medication"
                    value={
                      selectedPrescription.medication
                    }
                    onChange={handleEditChange}
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
                    onChange={handleEditChange}
                    required
                  />

                </div>

                <div className="form-field">

                  <label>Frequency</label>

                  <select
                    name="frequency"
                    value={
                      selectedPrescription.frequency
                    }
                    onChange={handleEditChange}
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

                  <label>Duration</label>

                  <input
                    type="text"
                    name="duration"
                    value={
                      selectedPrescription.duration
                    }
                    onChange={handleEditChange}
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
                    onChange={handleEditChange}
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
                    setSelectedPrescription(null);
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