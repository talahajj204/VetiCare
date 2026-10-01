import { useState } from "react";
import Sidebar from "../components/Sidebar";

import {
  FaEye,
  FaPen,
  FaTrash,
  FaSortAmountDown,
  FaSearch,
  FaTimes,
  FaFileExport,
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
      status: "active",
    },
    {
      id: 2,
      firstName: "Fatima",
      lastName: "Abbas",
      email: "fatima@gmail.com",
      phone: "70 456 789",
      address: "Dahye",
      status: "active",
    },
    {
      id: 3,
      firstName: "Karen",
      lastName: "N",
      email: "karen@email.com",
      phone: "71 555 222",
      address: "Tripoli",
      status: "inactive",
    },
  ]);

  // =========================
  // SEARCH / FILTER / SORT
  // =========================

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  // =========================
  // PAGINATION
  // =========================

  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // =========================
  // MODALS
  // =========================

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);

  // =========================
  // DELETE POPUP
  // =========================

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState(null);

  // =========================
  // NEW OWNER
  // =========================

  const [newOwner, setNewOwner] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    status: "active",
  });

  // =========================
  // SEARCH + FILTER
  // =========================

  const filteredOwners = owners.filter((owner) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      owner.firstName.toLowerCase().includes(searchText) ||
      owner.lastName.toLowerCase().includes(searchText) ||
      owner.email.toLowerCase().includes(searchText) ||
      owner.phone.toLowerCase().includes(searchText) ||
      owner.address.toLowerCase().includes(searchText) ||
      owner.status.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "all" || owner.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // =========================
  // SORT
  // =========================

  const sortedOwners = [...filteredOwners].sort((a, b) => {
    const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
    const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();

    if (sortBy === "name-asc") return nameA.localeCompare(nameB);
    if (sortBy === "name-desc") return nameB.localeCompare(nameA);

    if (sortBy === "address-asc") {
      return a.address.localeCompare(b.address);
    }

    if (sortBy === "address-desc") {
      return b.address.localeCompare(a.address);
    }

    if (sortBy === "active") {
      return a.status === "active" ? -1 : 1;
    }

    if (sortBy === "inactive") {
      return a.status === "inactive" ? -1 : 1;
    }

    return a.id - b.id;
  });

  // =========================
  // PAGINATION CALCULATIONS
  // =========================

  const totalPages = Math.max(
    1,
    Math.ceil(sortedOwners.length / itemsPerPage)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const indexOfLastOwner = safeCurrentPage * itemsPerPage;
  const indexOfFirstOwner = indexOfLastOwner - itemsPerPage;

  const currentOwners = sortedOwners.slice(
    indexOfFirstOwner,
    indexOfLastOwner
  );

  // =========================
  // CLEAR FILTERS
  // =========================

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSortBy("default");
    setCurrentPage(1);
  };

  // =========================
  // EXPORT
  // =========================

  const handleExport = () => {
    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Address",
      "Status",
    ];

    const rows = sortedOwners.map((owner) => [
      owner.firstName,
      owner.lastName,
      owner.email,
      owner.phone,
      owner.address,
      owner.status,
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "owners-data.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // =========================
  // ADD OWNER
  // =========================

  const handleNewOwnerChange = (e) => {
    const { name, value } = e.target;

    setNewOwner({
      ...newOwner,
      [name]: value,
    });
  };

  const handleAddOwner = (e) => {
    e.preventDefault();

    const owner = {
      id: Date.now(),
      ...newOwner,
      status: "active",
    };

    setOwners([...owners, owner]);

    setNewOwner({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      status: "active",
    });

    setShowAddModal(false);
  };

  // =========================
  // VIEW / EDIT
  // =========================

  const handleViewOwner = (owner) => {
    setSelectedOwner(owner);
    setShowViewModal(true);
  };

  const handleOpenEdit = (owner) => {
    setSelectedOwner({ ...owner });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setSelectedOwner({
      ...selectedOwner,
      [name]: value,
    });
  };

  const handleUpdateOwner = (e) => {
    e.preventDefault();

    setOwners(
      owners.map((owner) =>
        owner.id === selectedOwner.id ? selectedOwner : owner
      )
    );

    setShowEditModal(false);
    setSelectedOwner(null);
  };

  // =========================
  // STATUS
  // =========================

  const handleToggleStatus = (id) => {
    setOwners(
      owners.map((owner) =>
        owner.id === id
          ? {
              ...owner,
              status:
                owner.status === "active" ? "inactive" : "active",
            }
          : owner
      )
    );
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = (owner) => {
    if (owner.status === "active") {
      alert("You must set this owner as Inactive before deleting.");
      return;
    }

    setOwnerToDelete(owner);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!ownerToDelete) return;

    setOwners(
      owners.filter((owner) => owner.id !== ownerToDelete.id)
    );

    setShowDeleteModal(false);
    setOwnerToDelete(null);

    if (currentOwners.length === 1 && safeCurrentPage > 1) {
      setCurrentPage(safeCurrentPage - 1);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setOwnerToDelete(null);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        {/* HEADER */}

        <div className="page-header">
          <div>
            <h1>Pet Owners</h1>
            <p>Manage pet owner information</p>
          </div>
        </div>

        {/* TOOLBAR */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            width: "100%",
            marginBottom: "22px",
            flexWrap: "wrap",
          }}
        >
          {/* SEARCH */}

          <div
            style={{
              position: "relative",
              flex: "1 1 280px",
              minWidth: "240px",
            }}
          >
            <FaSearch
              style={{
                position: "absolute",
                left: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#7f9997",
                fontSize: "15px",
                pointerEvents: "none",
                zIndex: 2,
              }}
            />

            <input
              type="text"
              placeholder="Search owners..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: "100%",
                height: "44px",
                padding: "0 42px",
                border: "1px solid #d5e5e3",
                borderRadius: "8px",
                outline: "none",
                boxSizing: "border-box",
                background: "#fff",
              }}
            />

            {(search ||
              statusFilter !== "all" ||
              sortBy !== "default") && (
              <button
                type="button"
                onClick={handleClearFilters}
                title="Clear filters"
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "28px",
                  minWidth: "28px",
                  height: "28px",
                  padding: 0,
                  margin: 0,
                  border: "none",
                  borderRadius: "50%",
                  background: "transparent",
                  color: "#78908e",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: "145px",
              height: "44px",
              padding: "0 12px",
              border: "1px solid #d5e5e3",
              borderRadius: "8px",
              background: "#fff",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* SORT */}

          <div
            style={{
              position: "relative",
              width: "180px",
            }}
          >
            <FaSortAmountDown
              style={{
                position: "absolute",
                left: "13px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#319c97",
                pointerEvents: "none",
              }}
            />

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: "100%",
                height: "44px",
                padding: "0 12px 0 38px",
                border: "1px solid #d5e5e3",
                borderRadius: "8px",
                background: "#fff",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="default">Sort By</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="address-asc">Address A-Z</option>
              <option value="address-desc">Address Z-A</option>
              <option value="active">Active First</option>
              <option value="inactive">Inactive First</option>
            </select>
          </div>

          {/* EXPORT */}

          <button
            type="button"
            onClick={handleExport}
            style={{
              width: "auto",
              minWidth: "110px",
              height: "44px",
              padding: "0 16px",
              border: "none",
              borderRadius: "8px",
              background: "#55b7b3",
              color: "#fff",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
              fontWeight: "600",
              whiteSpace: "nowrap",
            }}
          >
            <FaFileExport />
            Export
          </button>

          {/* ADD */}

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            style={{
              width: "auto",
              minWidth: "120px",
              height: "44px",
              padding: "0 16px",
              border: "none",
              borderRadius: "8px",
              background: "#55b7b3",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "600",
              whiteSpace: "nowrap",
            }}
          >
            + Add Owner
          </button>
        </div>

        {/* TABLE */}

        <div className="owners-table-container">
          <table className="owners-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentOwners.length > 0 ? (
                currentOwners.map((owner) => (
                  <tr key={owner.id}>
                    <td>
                      {owner.firstName} {owner.lastName}
                    </td>

                    <td>{owner.email}</td>
                    <td>{owner.phone}</td>
                    <td>{owner.address}</td>

                    <td>
                      <button
                        type="button"
                        className={`owner-status-button ${
                          owner.status === "active"
                            ? "owner-status-active"
                            : "owner-status-inactive"
                        }`}
                        onClick={() => handleToggleStatus(owner.id)}
                      >
                        <span className="status-dot"></span>
                        {owner.status === "active"
                          ? "Active"
                          : "Inactive"}
                      </button>
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="view-button icon-button"
                          onClick={() => handleViewOwner(owner)}
                          title="View"
                        >
                          <FaEye />
                        </button>

                        <button
                          type="button"
                          className="edit-button icon-button"
                          onClick={() => handleOpenEdit(owner)}
                          title="Edit"
                        >
                          <FaPen />
                        </button>

                        {owner.status === "inactive" && (
                          <button
                            type="button"
                            className="delete-button icon-button"
                            onClick={() => handleDelete(owner)}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-results">
                    No owners found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* =========================
            PAGINATION
        ========================= */}

        <div
          style={{
            width: "100%",
            marginTop: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          {/* LEFT */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                color: "#52605f",
              }}
            >
              Rows per page:
            </span>

            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                width: "75px",
                height: "36px",
                padding: "0 10px",
                border: "1px solid #d5e5e3",
                borderRadius: "7px",
                background: "#fff",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* RIGHT - SMALL PAGINATION */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "6px",
              whiteSpace: "nowrap",
            }}
          >
            {/* PREVIOUS < */}

            <button
              type="button"
              disabled={safeCurrentPage === 1}
              onClick={() =>
                setCurrentPage((page) => Math.max(page - 1, 1))
              }
              style={{
                width: "34px",
                minWidth: "34px",
                height: "34px",
                padding: 0,
                margin: 0,
                border: "1px solid #d5e5e3",
                borderRadius: "7px",
                background:
                  safeCurrentPage === 1 ? "#edf3f2" : "#fff",
                color:
                  safeCurrentPage === 1
                    ? "#9aa8a7"
                    : "#52605f",
                cursor:
                  safeCurrentPage === 1
                    ? "not-allowed"
                    : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: "600",
                lineHeight: 1,
              }}
            >
              &lt;
            </button>

            {/* PAGE NUMBERS */}

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                style={{
                  width: "34px",
                  minWidth: "34px",
                  height: "34px",
                  padding: 0,
                  margin: 0,
                  border:
                    page === safeCurrentPage
                      ? "1px solid #419c99"
                      : "1px solid #d5e5e3",
                  borderRadius: "7px",
                  background:
                    page === safeCurrentPage
                      ? "#419c99"
                      : "#fff",
                  color:
                    page === safeCurrentPage
                      ? "#fff"
                      : "#52605f",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {page}
              </button>
            ))}

            {/* NEXT > */}

            <button
              type="button"
              disabled={safeCurrentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(page + 1, totalPages)
                )
              }
              style={{
                width: "34px",
                minWidth: "34px",
                height: "34px",
                padding: 0,
                margin: 0,
                border: "1px solid #d5e5e3",
                borderRadius: "7px",
                background:
                  safeCurrentPage === totalPages
                    ? "#edf3f2"
                    : "#fff",
                color:
                  safeCurrentPage === totalPages
                    ? "#9aa8a7"
                    : "#52605f",
                cursor:
                  safeCurrentPage === totalPages
                    ? "not-allowed"
                    : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: "600",
                lineHeight: 1,
              }}
            >
              &gt;
            </button>
          </div>
        </div>
      </main>

      {/* =========================
          ADD OWNER MODAL
      ========================= */}

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

              <div className="form-actions">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="save-button">
                  Add Owner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================
          VIEW OWNER MODAL
      ========================= */}

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
              <strong>{selectedOwner.firstName}</strong>
            </div>

            <div className="detail-row">
              <span>Last Name</span>
              <strong>{selectedOwner.lastName}</strong>
            </div>

            <div className="detail-row">
              <span>Email</span>
              <strong>{selectedOwner.email}</strong>
            </div>

            <div className="detail-row">
              <span>Phone</span>
              <strong>{selectedOwner.phone}</strong>
            </div>

            <div className="detail-row">
              <span>Address</span>
              <strong>{selectedOwner.address || "—"}</strong>
            </div>

            <div className="detail-row">
              <span>Status</span>

              <strong
                className={
                  selectedOwner.status === "active"
                    ? "status-text-active"
                    : "status-text-inactive"
                }
              >
                {selectedOwner.status === "active"
                  ? "Active"
                  : "Inactive"}
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

      {/* =========================
          EDIT OWNER MODAL
      ========================= */}

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

              <div className="form-field">
                <label>Address</label>

                <input
                  type="text"
                  name="address"
                  value={selectedOwner.address}
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-field">
                <label>Owner Status</label>

                <select
                  name="status"
                  value={selectedOwner.status}
                  onChange={handleEditChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

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

                <button type="submit" className="save-button">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================
          DELETE POPUP
      ========================= */}

      {showDeleteModal && ownerToDelete && (
        <div className="modal-overlay">
          <div
            className="modal-container"
            style={{
              maxWidth: "420px",
            }}
          >
            <div className="modal-header">
              <div>
                <h2>Delete Owner</h2>
                <p>This action cannot be undone</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={cancelDelete}
              >
                ×
              </button>
            </div>

            <div
              style={{
                padding: "10px 0 5px",
              }}
            >
              <p
                style={{
                  fontSize: "16px",
                  color: "#333",
                  marginBottom: "8px",
                }}
              >
                Are you sure you want to delete this?
              </p>

              <p
                style={{
                  fontSize: "14px",
                  color: "#718181",
                }}
              >
                {ownerToDelete.firstName} {ownerToDelete.lastName}{" "}
                will be permanently deleted.
              </p>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="modal-cancel-button"
                onClick={cancelDelete}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                style={{
                  width: "auto",
                  padding: "10px 18px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#dc5555",
                  color: "#fff",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "7px",
                }}
              >
                <FaTrash />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Owners;