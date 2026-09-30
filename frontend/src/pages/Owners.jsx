import { useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  FaEye,
  FaPen,
  FaTrash,
  FaSortAmountDown,
} from "react-icons/fa";

function Owners() {
  // =========================
  // DATA
  // =========================

  const [owners, setOwners] = useState([
    {
      id: 1,
      firstName: "Tala",
      lastName: "El Hajj",
      email: "talaelhajj4@gmail.com",
      phone: "03 123 456",
      address: "Beirut",
    },
    {
      id: 2,
      firstName: "Fatima",
      lastName: "Abbas",
      email: "fatima@gmail.com",
      phone: "70 456 789",
      address: "Dahye",
    },
    {
      id: 3,
      firstName: "Karen",
      lastName: "N",
      email: "karen@email.com",
      phone: "71 555 222",
      address: "Tripoli",
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

  const [selectedOwner, setSelectedOwner] = useState(null);

  // =========================
  // NEW OWNER
  // =========================

  const [newOwner, setNewOwner] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  // =========================
  // SEARCH
  // =========================

  const filteredOwners = owners.filter((owner) => {
    const searchText = search.trim().toLowerCase();

    return (
      owner.firstName.toLowerCase().includes(searchText) ||
      owner.lastName.toLowerCase().includes(searchText) ||
      owner.email.toLowerCase().includes(searchText) ||
      owner.phone.toLowerCase().includes(searchText) ||
      owner.address.toLowerCase().includes(searchText)
    );
  });

  // =========================
  // SORT
  // =========================

  const sortedOwners = [...filteredOwners].sort((a, b) => {
    const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
    const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();

    if (sortBy === "name-asc") {
      return nameA.localeCompare(nameB);
    }

    if (sortBy === "name-desc") {
      return nameB.localeCompare(nameA);
    }

    if (sortBy === "address-asc") {
      return a.address.localeCompare(b.address);
    }

    if (sortBy === "address-desc") {
      return b.address.localeCompare(a.address);
    }

    return a.id - b.id;
  });

  // =========================
  // ADD OWNER INPUT CHANGE
  // =========================

  const handleNewOwnerChange = (e) => {
    const { name, value } = e.target;

    setNewOwner({
      ...newOwner,
      [name]: value,
    });
  };

  // =========================
  // ADD OWNER
  // =========================

  const handleAddOwner = (e) => {
    e.preventDefault();

    const owner = {
      id: Date.now(),
      ...newOwner,
    };

    setOwners([...owners, owner]);

    setNewOwner({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
    });

    setShowAddModal(false);
  };

  // =========================
  // VIEW OWNER
  // =========================

  const handleViewOwner = (owner) => {
    setSelectedOwner(owner);
    setShowViewModal(true);
  };

  // =========================
  // OPEN EDIT
  // =========================

  const handleOpenEdit = (owner) => {
    setSelectedOwner({ ...owner });
    setShowEditModal(true);
  };

  // =========================
  // EDIT CHANGE
  // =========================

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setSelectedOwner({
      ...selectedOwner,
      [name]: value,
    });
  };

  // =========================
  // UPDATE OWNER
  // =========================

  const handleUpdateOwner = (e) => {
    e.preventDefault();

    setOwners(
      owners.map((owner) =>
        owner.id === selectedOwner.id
          ? selectedOwner
          : owner
      )
    );

    setShowEditModal(false);
    setSelectedOwner(null);
  };

  // =========================
  // DELETE OWNER
  // =========================

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this owner?"
    );

    if (confirmDelete) {
      setOwners(
        owners.filter((owner) => owner.id !== id)
      );
    }
  };

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-main">

        {/* =========================
            HEADER
        ========================= */}

        <div className="page-header">

          <div>
            <h1>Pet Owners</h1>
            <p>Manage pet owner information</p>
          </div>

        </div>

        {/* =========================
            SEARCH + SORT + ADD
        ========================= */}

        <div className="inventory-toolbar">

          {/* SEARCH */}

          <div className="search-container inventory-search">
            <input
              type="text"
              placeholder="Search owners..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* ACTIONS */}

          <div className="inventory-toolbar-actions">

            {/* SORT */}

            <div className="sort-container">

              <FaSortAmountDown className="sort-icon" />

              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">
                  Sort By
                </option>

                <option value="name-asc">
                  Name A-Z
                </option>

                <option value="name-desc">
                  Name Z-A
                </option>

                <option value="address-asc">
                  Address A-Z
                </option>

                <option value="address-desc">
                  Address Z-A
                </option>

              </select>

            </div>

            {/* ADD OWNER */}

            <button
              type="button"
              className="add-button"
              onClick={() => setShowAddModal(true)}
            >
              + Add Owner
            </button>

          </div>

        </div>

        {/* =========================
            TABLE
        ========================= */}

        <div className="owners-table-container">

          <table className="owners-table">

            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {sortedOwners.length > 0 ? (

                sortedOwners.map((owner) => (

                  <tr key={owner.id}>

                    <td>
                      {owner.firstName} {owner.lastName}
                    </td>

                    <td>{owner.email}</td>

                    <td>{owner.phone}</td>

                    <td>{owner.address}</td>

                    <td>

                      <div className="table-actions">

                        {/* VIEW */}

                        <button
                          type="button"
                          className="view-button icon-button"
                          onClick={() => handleViewOwner(owner)}
                          title="View"
                          aria-label="View owner"
                        >
                          <FaEye />
                        </button>

                        {/* EDIT */}

                        <button
                          type="button"
                          className="edit-button icon-button"
                          onClick={() => handleOpenEdit(owner)}
                          title="Edit"
                          aria-label="Edit owner"
                        >
                          <FaPen />
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          className="delete-button icon-button"
                          onClick={() => handleDelete(owner.id)}
                          title="Delete"
                          aria-label="Delete owner"
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
                    colSpan="5"
                    className="no-results"
                  >
                    No owners found
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </main>

      {/* =========================================
          ADD OWNER MODAL
      ========================================= */}

      {showAddModal && (

        <div className="modal-overlay">

          <div className="modal-container">

            <div className="modal-header">

              <div>
                <h2>Add Owner</h2>
                <p>Enter owner information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleAddOwner}>

              {/* FIRST + LAST NAME */}

              <div className="form-row">

                <div className="form-field">

                  <label>First Name</label>

                  <input
                    type="text"
                    name="firstName"
                    placeholder="Enter first name"
                    value={newOwner.firstName}
                    onChange={handleNewOwnerChange}
                    required
                  />

                </div>

                <div className="form-field">

                  <label>Last Name</label>

                  <input
                    type="text"
                    name="lastName"
                    placeholder="Enter last name"
                    value={newOwner.lastName}
                    onChange={handleNewOwnerChange}
                    required
                  />

                </div>

              </div>

              {/* EMAIL + PHONE */}

              <div className="form-row">

                <div className="form-field">

                  <label>Email</label>

                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={newOwner.email}
                    onChange={handleNewOwnerChange}
                    required
                  />

                </div>

                <div className="form-field">

                  <label>Phone</label>

                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter phone number"
                    value={newOwner.phone}
                    onChange={handleNewOwnerChange}
                    required
                  />

                </div>

              </div>

              {/* ADDRESS */}

              <div className="form-field">

                <label>Address</label>

                <input
                  type="text"
                  name="address"
                  placeholder="Enter address"
                  value={newOwner.address}
                  onChange={handleNewOwnerChange}
                />

              </div>

              {/* ACTIONS */}

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
                  Add Owner
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =========================================
          VIEW OWNER MODAL
      ========================================= */}

      {showViewModal && selectedOwner && (

        <div className="modal-overlay">

          <div className="modal-container">

            <div className="modal-header">

              <div>
                <h2>Owner Details</h2>
                <p>View owner information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedOwner(null);
                }}
              >
                ×
              </button>

            </div>

            <div className="detail-row">

              <span>First Name</span>

              <strong>
                {selectedOwner.firstName}
              </strong>

            </div>

            <div className="detail-row">

              <span>Last Name</span>

              <strong>
                {selectedOwner.lastName}
              </strong>

            </div>

            <div className="detail-row">

              <span>Email</span>

              <strong>
                {selectedOwner.email}
              </strong>

            </div>

            <div className="detail-row">

              <span>Phone</span>

              <strong>
                {selectedOwner.phone}
              </strong>

            </div>

            <div className="detail-row">

              <span>Address</span>

              <strong>
                {selectedOwner.address || "—"}
              </strong>

            </div>

            <div className="form-actions">

              <button
                type="button"
                className="modal-cancel-button"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedOwner(null);
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
                  Edit Owner
                </span>

              </button>

            </div>

          </div>

        </div>

      )}

      {/* =========================================
          EDIT OWNER MODAL
      ========================================= */}

      {showEditModal && selectedOwner && (

        <div className="modal-overlay">

          <div className="modal-container">

            <div className="modal-header">

              <div>
                <h2>Edit Owner</h2>
                <p>Update owner information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedOwner(null);
                }}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleUpdateOwner}>

              {/* FIRST + LAST NAME */}

              <div className="form-row">

                <div className="form-field">

                  <label>First Name</label>

                  <input
                    type="text"
                    name="firstName"
                    value={selectedOwner.firstName}
                    onChange={handleEditChange}
                    required
                  />

                </div>

                <div className="form-field">

                  <label>Last Name</label>

                  <input
                    type="text"
                    name="lastName"
                    value={selectedOwner.lastName}
                    onChange={handleEditChange}
                    required
                  />

                </div>

              </div>

              {/* EMAIL + PHONE */}

              <div className="form-row">

                <div className="form-field">

                  <label>Email</label>

                  <input
                    type="email"
                    name="email"
                    value={selectedOwner.email}
                    onChange={handleEditChange}
                    required
                  />

                </div>

                <div className="form-field">

                  <label>Phone</label>

                  <input
                    type="tel"
                    name="phone"
                    value={selectedOwner.phone}
                    onChange={handleEditChange}
                    required
                  />

                </div>

              </div>

              {/* ADDRESS */}

              <div className="form-field">

                <label>Address</label>

                <input
                  type="text"
                  name="address"
                  value={selectedOwner.address}
                  onChange={handleEditChange}
                />

              </div>

              {/* ACTIONS */}

              <div className="form-actions">

                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedOwner(null);
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

export default Owners;