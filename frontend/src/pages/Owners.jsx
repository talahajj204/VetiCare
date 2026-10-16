import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const OWNERS_KEY = "vetClinicOwners";

const DEFAULT_OWNERS = [
  {
    id: 1,
    firstName: "Tala",
    lastName: "El Hajj",
    email: "talaelhajj4@gmail.com",
    phone: "03 123 456",
    address: "Beirut",
    emergencyContact: "70 111 222",
    notes: "Prefers morning appointments.",
    status: "active",
    pets: [
      {
        id: 1,
        name: "Bella",
        species: "Dog",
        breed: "Golden Retriever",
        age: "4 years",
      },
    ],
    history: [
      {
        id: 1,
        date: "25/09/2026",
        description: "Bella - Medical record added",
      },
      {
        id: 2,
        date: "20/09/2026",
        description: "Bella - Routine appointment",
      },
    ],
  },
  {
    id: 2,
    firstName: "Fatima",
    lastName: "Abbas",
    email: "fatima@gmail.com",
    phone: "70 456 789",
    address: "Dahye",
    emergencyContact: "71 222 333",
    notes: "",
    status: "active",
    pets: [
      {
        id: 2,
        name: "Luna",
        species: "Cat",
        breed: "Persian",
        age: "3 years",
      },
    ],
    history: [
      {
        id: 1,
        date: "20/09/2026",
        description: "Luna - Routine checkup",
      },
    ],
  },
  {
    id: 3,
    firstName: "Karen",
    lastName: "N",
    email: "karen@email.com",
    phone: "71 555 222",
    address: "Tripoli",
    emergencyContact: "03 444 555",
    notes: "",
    status: "inactive",
    pets: [],
    history: [],
  },
];

export function readOwners() {
  try {
    const saved = localStorage.getItem(OWNERS_KEY);

    if (saved === null) return DEFAULT_OWNERS;

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : DEFAULT_OWNERS;
  } catch {
    return DEFAULT_OWNERS;
  }
}

function Owners() {
  const navigate = useNavigate();

  const [owners, setOwners] = useState(readOwners);

  useEffect(() => {
    const refresh = () => setOwners(readOwners());

    window.addEventListener("vetClinicOwnersUpdated", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("vetClinicOwnersUpdated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(OWNERS_KEY, JSON.stringify(owners));
    } catch (error) {
      console.error("Could not save owners:", error);
    }
  }, [owners]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState(null);

  const emptyOwner = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    emergencyContact: "",
    notes: "",
    status: "active",
  };

  const [newOwner, setNewOwner] = useState(emptyOwner);

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

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSortBy("default");
    setCurrentPage(1);
  };

  const handleExport = () => {
    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Address",
      "Emergency Contact",
      "Notes",
      "Status",
    ];

    const rows = sortedOwners.map((owner) => [
      owner.firstName,
      owner.lastName,
      owner.email,
      owner.phone,
      owner.address,
      owner.emergencyContact,
      owner.notes,
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

  const handleNewOwnerChange = (e) => {
    const { name, value } = e.target;

    setNewOwner({
      ...newOwner,
      [name]: value,
    });
  };

  const handleAddOwner = (e) => {
    e.preventDefault();

    const action = e.nativeEvent.submitter?.value;

    const owner = {
      id: Date.now(),
      ...newOwner,
      status: "active",
      pets: [],
      history: [],
    };

    setOwners((previousOwners) => [...previousOwners, owner]);
    setNewOwner(emptyOwner);
    setShowAddModal(false);

    if (action === "save-and-add-pet") {
      navigate("/pets", {
        state: {
          openAddPet: true,
          ownerId: owner.id,
          owner,
        },
      });
    }
  };

  const handleViewOwner = (owner) => {
    navigate(`/owners/${owner.id}`, {
      state: {
        owner,
      },
    });
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

      <main className="dashboard-main owners-spacing-fix">
        <style>{`
          html body #root
          main.dashboard-main.owners-spacing-fix
          > .page-header.owners-fixed-header {
            position: relative !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            flex-wrap: wrap !important;
            gap: 16px !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            min-height: 70px !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            margin-bottom: 22px !important;
            padding: 0 !important;
            box-sizing: border-box !important;
          }

          html body #root
          .owners-spacing-fix
          .owners-fixed-header > .owners-fixed-title {
            min-width: 0 !important;
            flex: 1 1 240px !important;
          }

          html body #root
          .owners-spacing-fix
          .owners-fixed-header > .owners-fixed-actions {
            position: static !important;
            display: flex !important;
            align-items: center !important;
            justify-content: flex-end !important;
            flex-wrap: wrap !important;
            gap: 10px !important;
            flex: 0 1 auto !important;
            width: auto !important;
            min-width: 0 !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            inset: auto !important;
            transform: none !important;
            box-sizing: border-box !important;
          }

          html body #root
          .owners-spacing-fix
          .owners-fixed-actions > button {
            position: static !important;
            inset: auto !important;
            flex: 0 0 auto !important;
            width: auto !important;
            height: 42px !important;
            min-height: 42px !important;
            max-height: 42px !important;
            margin: 0 !important;
            padding: 0 16px !important;
            box-sizing: border-box !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 7px !important;
            border-radius: 8px !important;
            font-family: inherit !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            white-space: nowrap !important;
            transform: none !important;
            cursor: pointer !important;
          }

          html body #root
          .owners-spacing-fix
          .owners-fixed-actions > .owners-fixed-export {
            min-width: 120px !important;
            max-width: none !important;
            background: #ffffff !important;
            color: #319c97 !important;
            border: 1px solid #55b7b3 !important;
          }

          html body #root
          .owners-spacing-fix
          .owners-fixed-actions > .owners-fixed-export:hover {
            background: #eef9f8 !important;
          }

          html body #root
          .owners-spacing-fix
          .owners-fixed-actions > .owners-fixed-add {
            min-width: 135px !important;
            max-width: none !important;
            background: #55b7b3 !important;
            color: #ffffff !important;
            border: 1px solid #55b7b3 !important;
          }

          html body #root
          .owners-spacing-fix
          .owners-fixed-actions > .owners-fixed-add:hover {
            background: #45aaa6 !important;
            border-color: #45aaa6 !important;
          }

          html body #root
          .owners-spacing-fix > .owners-fixed-toolbar {
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
          }

          @media (max-width: 768px) {
            html body #root
            main.dashboard-main.owners-spacing-fix {
              padding-top: 76px !important;
            }

            html body #root
            main.dashboard-main.owners-spacing-fix
            > .page-header.owners-fixed-header {
              flex-direction: column !important;
              flex-wrap: nowrap !important;
              align-items: flex-start !important;
              justify-content: flex-start !important;
              height: auto !important;
              min-height: 0 !important;
              max-height: none !important;
              padding: 0 !important;
              margin: 0 0 22px !important;
              gap: 16px !important;
            }

            html body #root
            main.dashboard-main.owners-spacing-fix
            > .page-header.owners-fixed-header
            > .owners-fixed-title {
              flex: 0 0 auto !important;
              width: 100% !important;
              height: auto !important;
              min-height: 0 !important;
              max-height: none !important;
              margin: 0 !important;
              padding: 0 !important;
              text-align: left !important;
            }

            html body #root
            main.dashboard-main.owners-spacing-fix
            > .page-header.owners-fixed-header
            > .owners-fixed-actions {
              flex: 0 0 auto !important;
              width: 100% !important;
              height: auto !important;
              min-height: 0 !important;
              justify-content: flex-start !important;
              align-items: center !important;
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        `}</style>        <div className="page-header owners-fixed-header">
        <div className="owners-fixed-title">
          <h1>Pet Owners</h1>
          <p>Manage pet owner information</p>
        </div>

        <div className="owners-fixed-actions">
          <button
            type="button"
            className="owners-fixed-export"
            onClick={handleExport}
          >
            <FaFileExport />
            Export
          </button>

          <button
            type="button"
            className="owners-fixed-add"
            onClick={() => setShowAddModal(true)}
          >
            + Add Owner
          </button>
        </div>
      </div>

      <div
        className="owners-fixed-toolbar"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          width: "100%",
          marginBottom: "22px",
          flexWrap: "wrap",
        }}
      >
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
      </div>

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
                        title="View Owner Profile"
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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "6px",
            whiteSpace: "nowrap",
          }}
        >
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
                safeCurrentPage === 1 ? "#9aa8a7" : "#52605f",
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
                  page === safeCurrentPage ? "#419c99" : "#fff",
                color:
                  page === safeCurrentPage ? "#fff" : "#52605f",
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

            <div className="form-field">
              <label>Emergency Contact</label>
              <input
                type="text"
                name="emergencyContact"
                placeholder="Enter emergency contact"
                value={newOwner.emergencyContact}
                onChange={handleNewOwnerChange}
              />
            </div>

            <div className="form-field">
              <label>Notes</label>
              <textarea
                name="notes"
                placeholder="Enter owner notes..."
                value={newOwner.notes}
                onChange={handleNewOwnerChange}
                rows="3"
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
                value="save-owner"
              >
                Add Owner
              </button>

              <button
                type="submit"
                className="save-button"
                value="save-and-add-pet"
                style={{
                  width: "auto",
                  padding: "10px 18px",
                  whiteSpace: "nowrap",
                }}
              >
                Save & Add Pet
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

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
                value={selectedOwner.address || ""}
                onChange={handleEditChange}
              />
            </div>

            <div className="form-field">
              <label>Emergency Contact</label>
              <input
                type="text"
                name="emergencyContact"
                value={selectedOwner.emergencyContact || ""}
                onChange={handleEditChange}
                placeholder="Enter emergency contact"
              />
            </div>

            <div className="form-field">
              <label>Notes</label>
              <textarea
                name="notes"
                value={selectedOwner.notes || ""}
                onChange={handleEditChange}
                placeholder="Enter owner notes..."
                rows="3"
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
              {ownerToDelete.firstName}{" "}
              {ownerToDelete.lastName} will be permanently deleted.
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