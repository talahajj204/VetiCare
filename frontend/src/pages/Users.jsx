import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";

import {
  FaPen,
  FaUserPlus,
  FaUserSlash,
  FaUserCheck,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

function Users() {
  // =====================================================
  // DATA
  // =====================================================

  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      phone: "+961 70 123 456",
      email: "sarah@vetclinic.com",
      role: "Veterinarian",
      status: "Active",
    },
    {
      id: 2,
      name: "Maya Haddad",
      phone: "+961 71 456 789",
      email: "maya@vetclinic.com",
      role: "Receptionist",
      status: "Active",
    },
    {
      id: 3,
      name: "Admin User",
      phone: "+961 76 789 123",
      email: "admin@vetclinic.com",
      role: "Admin",
      status: "Active",
    },
    {
      id: 4,
      name: "Dr. Karim Nassar",
      phone: "+961 81 234 567",
      email: "karim@vetclinic.com",
      role: "Veterinarian",
      status: "Inactive",
    },
  ]);

  // =====================================================
  // EMPTY USER
  // =====================================================

  const getEmptyUser = () => ({
    name: "",
    phone: "",
    email: "",
    role: "",
    status: "Active",
  });

  // =====================================================
  // SEARCH + FILTERS
  // =====================================================

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // =====================================================
  // PAGINATION
  // =====================================================

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // =====================================================
  // MODALS
  // =====================================================

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] =
    useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDeactivate, setUserToDeactivate] =
    useState(null);

  // =====================================================
  // NEW USER
  // =====================================================

  const [newUser, setNewUser] = useState(getEmptyUser());

  // =====================================================
  // ROLES
  // =====================================================

  const roles = [
    "Admin",
    "Veterinarian",
    "Receptionist",
  ];

  // =====================================================
  // FILTER USERS
  // =====================================================

  const filteredUsers = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        searchText === "" ||
        user.name.toLowerCase().includes(searchText) ||
        user.phone.toLowerCase().includes(searchText) ||
        user.email.toLowerCase().includes(searchText) ||
        user.role.toLowerCase().includes(searchText) ||
        user.status.toLowerCase().includes(searchText);

      const matchesRole =
        roleFilter === "All" ||
        user.role === roleFilter;

      const matchesStatus =
        statusFilter === "All" ||
        user.status === statusFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [users, search, roleFilter, statusFilter]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / rowsPerPage)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    roleFilter,
    statusFilter,
    rowsPerPage,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex =
    (currentPage - 1) * rowsPerPage;

  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("All");
    setStatusFilter("All");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    roleFilter !== "All" ||
    statusFilter !== "All";

  // =====================================================
  // NEW USER INPUT
  // =====================================================

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;

    setNewUser((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // EDIT USER INPUT
  // =====================================================

  const handleEditUserChange = (e) => {
    const { name, value } = e.target;

    setSelectedUser((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // ADD USER
  // =====================================================

  const handleAddUser = (e) => {
    e.preventDefault();

    const emailAlreadyExists = users.some(
      (user) =>
        user.email.toLowerCase() ===
        newUser.email.trim().toLowerCase()
    );

    if (emailAlreadyExists) {
      alert(
        "A user with this email already exists."
      );
      return;
    }

    const user = {
      id: Date.now(),
      name: newUser.name.trim(),
      phone: newUser.phone.trim(),
      email: newUser.email.trim(),
      role: newUser.role,
      status: "Active",
    };

    setUsers((previous) => [
      ...previous,
      user,
    ]);

    setNewUser(getEmptyUser());
    setShowAddModal(false);
  };

  // =====================================================
  // OPEN EDIT
  // =====================================================

  const handleOpenEdit = (user) => {
    setSelectedUser({
      ...user,
    });

    setShowEditModal(true);
  };

  // =====================================================
  // UPDATE USER
  // =====================================================

  const handleUpdateUser = (e) => {
    e.preventDefault();

    const emailAlreadyExists = users.some(
      (user) =>
        user.id !== selectedUser.id &&
        user.email.toLowerCase() ===
          selectedUser.email
            .trim()
            .toLowerCase()
    );

    if (emailAlreadyExists) {
      alert(
        "A user with this email already exists."
      );
      return;
    }

    const updatedUser = {
      ...selectedUser,
      name: selectedUser.name.trim(),
      phone: selectedUser.phone.trim(),
      email: selectedUser.email.trim(),
    };

    setUsers((previous) =>
      previous.map((user) =>
        user.id === updatedUser.id
          ? updatedUser
          : user
      )
    );

    setShowEditModal(false);
    setSelectedUser(null);
  };

  // =====================================================
  // OPEN DEACTIVATE
  // =====================================================

  const handleOpenDeactivate = (user) => {
    setUserToDeactivate(user);
    setShowDeactivateModal(true);
  };

  // =====================================================
  // CLOSE DEACTIVATE
  // =====================================================

  const closeDeactivateModal = () => {
    setShowDeactivateModal(false);
    setUserToDeactivate(null);
  };

  // =====================================================
  // DEACTIVATE USER
  // =====================================================

  const confirmDeactivateUser = () => {
    if (!userToDeactivate) return;

    setUsers((previous) =>
      previous.map((user) =>
        user.id === userToDeactivate.id
          ? {
              ...user,
              status: "Inactive",
            }
          : user
      )
    );

    closeDeactivateModal();
  };

  // =====================================================
  // REACTIVATE USER
  // =====================================================

  const handleReactivateUser = (user) => {
    setUsers((previous) =>
      previous.map((currentUser) =>
        currentUser.id === user.id
          ? {
              ...currentUser,
              status: "Active",
            }
          : currentUser
      )
    );
  };

  // =====================================================
  // ROLE CLASS
  // =====================================================

  const getRoleClass = (role) => {
    if (role === "Admin") {
      return "users-role admin";
    }

    if (role === "Veterinarian") {
      return "users-role veterinarian";
    }

    return "users-role receptionist";
  };

  // =====================================================
  // PAGINATION STYLE
  // =====================================================

  const paginationControlStyle = {
    width: "30px",
    minWidth: "30px",
    height: "30px",
    padding: "0",
    border: "1px solid #d9e1e7",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    color: "#667085",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "600",
    lineHeight: "1",
    cursor: "pointer",
    boxShadow: "none",
  };

  const activePageStyle = {
    ...paginationControlStyle,
    border: "1px solid #159f9f",
    backgroundColor: "#159f9f",
    color: "#ffffff",
    fontSize: "13px",
  };

  const normalPageStyle = {
    ...paginationControlStyle,
    fontSize: "13px",
  };

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main users-page">
        {/* =================================================
            USERS PAGE CSS
        ================================================= */}

        <style>{`
          .users-page {
            min-width: 0;
          }

          .users-page-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 22px;
          }

          .users-title h1 {
            margin: 0;
            color: #344054;
            font-size: 27px;
            font-weight: 700;
          }

          .users-title p {
            margin: 5px 0 0;
            color: #98a2b3;
            font-size: 13px;
          }

          .users-add-button {
            width: auto !important;
            min-width: 0 !important;
            padding: 9px 14px !important;
            border: 1px solid #159f9f !important;
            border-radius: 6px !important;
            background: #159f9f !important;
            color: #ffffff !important;
            display: inline-flex !important;
            align-items: center;
            justify-content: center;
            gap: 7px;
            cursor: pointer;
            font-size: 12px !important;
            font-weight: 600;
            white-space: nowrap;
          }

          .users-add-button:hover {
            opacity: 0.92;
          }

          .users-filter-row {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 18px;
          }

          .users-search-box {
            position: relative;
            flex: 1;
            max-width: 420px;
          }

          .users-search-box input {
            width: 100%;
            height: 40px;
            padding: 0 38px 0 38px;
            border: 1px solid #dfe7e7;
            border-radius: 7px;
            background: #ffffff;
            color: #344054;
            outline: none;
            box-sizing: border-box;
          }

          .users-search-box input:focus {
            border-color: #159f9f;
          }

          .users-search-icon {
            position: absolute;
            left: 13px;
            top: 50%;
            transform: translateY(-50%);
            color: #98a2b3;
            font-size: 13px;
          }

          .users-clear-button {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            width: 25px !important;
            min-width: 25px !important;
            height: 25px !important;
            padding: 0 !important;
            border: none !important;
            background: transparent !important;
            color: #98a2b3 !important;
            display: flex !important;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }

          .users-filter-select {
            height: 40px;
            min-width: 150px;
            padding: 0 32px 0 11px;
            border: 1px solid #dfe7e7;
            border-radius: 7px;
            background: #ffffff;
            color: #475467;
            outline: none;
            cursor: pointer;
          }

          .users-filter-select:focus {
            border-color: #159f9f;
          }

          .users-table-container {
            overflow: hidden;
          }

          .users-table-scroll {
            width: 100%;
            overflow-x: auto;
          }

          .users-table {
            min-width: 850px;
          }

          .users-table th,
          .users-table td {
            white-space: nowrap;
          }

          .users-name-cell {
            font-weight: 600;
            color: #344054;
          }

          .users-email-cell {
            color: #667085;
          }

          .users-role {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 25px;
            padding: 4px 9px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
          }

          .users-role.admin {
            background: #eef2ff;
            color: #4f46e5;
          }

          .users-role.veterinarian {
            background: #e7f8f3;
            color: #16856f;
          }

          .users-role.receptionist {
            background: #fff4df;
            color: #b76e00;
          }

          .users-status {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            min-height: 25px;
            padding: 4px 9px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
          }

          .users-status.active {
            background: #e7f8f3;
            color: #16856f;
          }

          .users-status.inactive {
            background: #f2f4f7;
            color: #667085;
          }

          .users-status-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: currentColor;
          }

          .users-inactive-row {
            background: #fafafa;
          }

          .users-inactive-row td {
            opacity: 0.72;
          }

          .users-inactive-row .table-actions {
            opacity: 1;
          }

          .users-action-button {
            width: 31px !important;
            min-width: 31px !important;
            height: 31px !important;
            padding: 0 !important;
            border-radius: 6px !important;
            display: inline-flex !important;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 12px !important;
          }

          .users-edit-button {
            border: 1px solid #dce8e7 !important;
            background: #ffffff !important;
            color: #159f9f !important;
          }

          .users-edit-button:hover {
            background: #edf9f8 !important;
          }

          .users-deactivate-button {
            border: 1px solid #f0c7c4 !important;
            background: #fff7f6 !important;
            color: #d92d20 !important;
          }

          .users-deactivate-button:hover {
            background: #fff0ef !important;
          }

          .users-reactivate-button {
            border: 1px solid #bfe5dc !important;
            background: #f1fbf8 !important;
            color: #16856f !important;
          }

          .users-reactivate-button:hover {
            background: #e5f8f2 !important;
          }

          .users-pagination {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            margin-top: 16px;
          }

          .users-rows {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #667085;
            font-size: 12px;
          }

          .users-rows select {
            height: 31px;
            padding: 0 27px 0 8px;
            border: 1px solid #dfe7e7;
            border-radius: 6px;
            background: #ffffff;
            color: #475467;
            outline: none;
          }

          .users-page-controls {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .users-deactivate-overlay {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: rgba(16, 24, 40, 0.45);
          }

          .users-deactivate-dialog {
            width: min(410px, 95vw);
            padding: 25px;
            border-radius: 12px;
            background: #ffffff;
            box-shadow:
              0 20px 50px
              rgba(16, 24, 40, 0.18);
            text-align: center;
          }

          .users-deactivate-icon {
            width: 48px;
            height: 48px;
            margin: 0 auto 13px;
            border-radius: 50%;
            background: #fff1f0;
            color: #d92d20;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 19px;
          }

          .users-deactivate-dialog h3 {
            margin: 0 0 8px;
            color: #344054;
            font-size: 18px;
          }

          .users-deactivate-dialog p {
            margin: 0;
            color: #667085;
            font-size: 13px;
            line-height: 1.6;
          }

          .users-deactivate-note {
            margin-top: 11px !important;
            padding: 9px 10px;
            border-radius: 6px;
            background: #f8fafb;
            color: #7c8b8a !important;
            font-size: 11px !important;
          }

          .users-deactivate-actions {
            display: flex;
            justify-content: center;
            gap: 9px;
            margin-top: 20px;
          }

          .users-deactivate-cancel,
          .users-deactivate-confirm {
            width: auto !important;
            min-width: 90px !important;
            padding: 8px 13px !important;
            border-radius: 6px !important;
            cursor: pointer;
            font-size: 12px !important;
            font-weight: 600;
          }

          .users-deactivate-cancel {
            border: 1px solid #d9e2e1 !important;
            background: #ffffff !important;
            color: #667085 !important;
          }

          .users-deactivate-confirm {
            border: 1px solid #d92d20 !important;
            background: #d92d20 !important;
            color: #ffffff !important;
          }

          .users-modal-note {
            margin: 0 0 15px;
            padding: 10px 12px;
            border-radius: 7px;
            background: #f3f9f9;
            color: #667085;
            font-size: 11px;
            line-height: 1.5;
          }

          @media (max-width: 768px) {
            .users-page-header {
              align-items: flex-start;
              flex-direction: column;
            }

            .users-filter-row {
              align-items: stretch;
              flex-direction: column;
            }

            .users-search-box {
              max-width: none;
            }

            .users-filter-select {
              width: 100%;
            }

            .users-pagination {
              align-items: flex-start;
              flex-direction: column;
            }
          }
        `}</style>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="users-page-header">
          <div className="users-title">
            <h1>Users</h1>

            <p>
              Manage clinic staff and user access
            </p>
          </div>

          <button
            type="button"
            className="users-add-button"
            onClick={() => {
              setNewUser(getEmptyUser());
              setShowAddModal(true);
            }}
          >
            <FaUserPlus />
            Add User
          </button>
        </div>

        {/* =================================================
            SEARCH + FILTERS
        ================================================= */}

        <div className="users-filter-row">
          <div className="users-search-box">
            <FaSearch className="users-search-icon" />

            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {hasActiveFilters && (
              <button
                type="button"
                className="users-clear-button"
                onClick={clearFilters}
                title="Clear filters"
                aria-label="Clear filters"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <select
            className="users-filter-select"
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
          >
            <option value="All">
              All Roles
            </option>

            {roles.map((role) => (
              <option
                key={role}
                value={role}
              >
                {role}
              </option>
            ))}
          </select>

          <select
            className="users-filter-select"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="All">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>
          </select>
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="owners-table-container users-table-container">
          <div className="users-table-scroll">
            <table className="owners-table users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className={
                        user.status === "Inactive"
                          ? "users-inactive-row"
                          : ""
                      }
                    >
                      <td className="users-name-cell">
                        {user.name}
                      </td>

                      <td>{user.phone}</td>

                      <td className="users-email-cell">
                        {user.email}
                      </td>

                      <td>
                        <span
                          className={getRoleClass(
                            user.role
                          )}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`users-status ${
                            user.status === "Active"
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          <span className="users-status-dot" />

                          {user.status}
                        </span>
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="users-action-button users-edit-button"
                            onClick={() =>
                              handleOpenEdit(user)
                            }
                            title="Edit User"
                            aria-label="Edit user"
                          >
                            <FaPen />
                          </button>

                          {user.status ===
                          "Active" ? (
                            <button
                              type="button"
                              className="users-action-button users-deactivate-button"
                              onClick={() =>
                                handleOpenDeactivate(
                                  user
                                )
                              }
                              title="Deactivate User"
                              aria-label="Deactivate user"
                            >
                              <FaUserSlash />
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="users-action-button users-reactivate-button"
                              onClick={() =>
                                handleReactivateUser(
                                  user
                                )
                              }
                              title="Reactivate User"
                              aria-label="Reactivate user"
                            >
                              <FaUserCheck />
                            </button>
                          )}
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
                      No users found
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

        <div className="users-pagination">
          <div className="users-rows">
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
            </select>
          </div>

          <div className="users-page-controls">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((previous) =>
                  Math.max(previous - 1, 1)
                )
              }
              style={{
                ...paginationControlStyle,
                opacity:
                  currentPage === 1
                    ? 0.45
                    : 1,
                cursor:
                  currentPage === 1
                    ? "not-allowed"
                    : "pointer",
              }}
              aria-label="Previous page"
            >
              &lt;
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <button
                type="button"
                key={page}
                onClick={() =>
                  setCurrentPage(page)
                }
                style={
                  currentPage === page
                    ? activePageStyle
                    : normalPageStyle
                }
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={
                currentPage === totalPages
              }
              onClick={() =>
                setCurrentPage((previous) =>
                  Math.min(
                    previous + 1,
                    totalPages
                  )
                )
              }
              style={{
                ...paginationControlStyle,
                opacity:
                  currentPage === totalPages
                    ? 0.45
                    : 1,
                cursor:
                  currentPage === totalPages
                    ? "not-allowed"
                    : "pointer",
              }}
              aria-label="Next page"
            >
              &gt;
            </button>
          </div>
        </div>
      </main>

      {/* =====================================================
          ADD USER MODAL
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
                <h2>Add User</h2>

                <p>
                  Add a new clinic staff user
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

            <form onSubmit={handleAddUser}>
              <div className="form-row">
                <div className="form-field">
                  <label>Name</label>

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter full name"
                    value={newUser.name}
                    onChange={
                      handleNewUserChange
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Phone</label>

                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter phone number"
                    value={newUser.phone}
                    onChange={
                      handleNewUserChange
                    }
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
                    placeholder="Enter email address"
                    value={newUser.email}
                    onChange={
                      handleNewUserChange
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Role</label>

                  <select
                    name="role"
                    value={newUser.role}
                    onChange={
                      handleNewUserChange
                    }
                    required
                  >
                    <option value="">
                      Select role
                    </option>

                    {roles.map((role) => (
                      <option
                        key={role}
                        value={role}
                      >
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="users-modal-note">
                New users are automatically
                created with an Active status.
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
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          EDIT USER MODAL
      ===================================================== */}

      {showEditModal && selectedUser && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModal(false);
              setSelectedUser(null);
            }
          }}
        >
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>Edit User</h2>

                <p>
                  Update user information
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateUser}>
              <div className="form-row">
                <div className="form-field">
                  <label>Name</label>

                  <input
                    type="text"
                    name="name"
                    value={selectedUser.name}
                    onChange={
                      handleEditUserChange
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Phone</label>

                  <input
                    type="tel"
                    name="phone"
                    value={selectedUser.phone}
                    onChange={
                      handleEditUserChange
                    }
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
                    value={selectedUser.email}
                    onChange={
                      handleEditUserChange
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Role</label>

                  <select
                    name="role"
                    value={selectedUser.role}
                    onChange={
                      handleEditUserChange
                    }
                    required
                  >
                    {roles.map((role) => (
                      <option
                        key={role}
                        value={role}
                      >
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
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
          DEACTIVATE CONFIRMATION
      ===================================================== */}

      {showDeactivateModal &&
        userToDeactivate && (
          <div
            className="users-deactivate-overlay"
            onMouseDown={(e) => {
              if (
                e.target ===
                e.currentTarget
              ) {
                closeDeactivateModal();
              }
            }}
          >
            <div
              className="users-deactivate-dialog"
              role="dialog"
              aria-modal="true"
            >
              <div className="users-deactivate-icon">
                <FaUserSlash />
              </div>

              <h3>Deactivate User</h3>

              <p>
                Are you sure you want to
                deactivate{" "}
                <strong>
                  {userToDeactivate.name}
                </strong>
                ?
              </p>

              <p className="users-deactivate-note">
                This user will stay in the
                users list and will be marked
                as Inactive.
              </p>

              <div className="users-deactivate-actions">
                <button
                  type="button"
                  className="users-deactivate-cancel"
                  onClick={
                    closeDeactivateModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="users-deactivate-confirm"
                  onClick={
                    confirmDeactivateUser
                  }
                >
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export default Users;