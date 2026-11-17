import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getClinicOptions } from "../data/clinicOptionsApi";

import {
  FaPen,
  FaUserPlus,
  FaUserSlash,
  FaUserCheck,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

const USERS_API = "/api/users";

async function readStaffRoles(signal) {
  const records = await getClinicOptions({
    listKey: "users.roles",
    signal,
  });

  if (
    !Array.isArray(records) ||
    records.some(
      (record) =>
        typeof record.listKey !== "string" ||
        typeof record.value !== "string" ||
        typeof record.isActive !== "boolean" ||
        !Number.isInteger(record.sortOrder)
    )
  ) {
    throw new Error(
      "The server returned invalid staff roles."
    );
  }

  return [
    ...new Set(
      records
        .filter(
          (record) =>
            record.listKey === "users.roles" &&
            record.isActive
        )
        .sort(
          (a, b) =>
            a.sortOrder - b.sortOrder ||
            a.value.localeCompare(b.value)
        )
        .map((record) => record.value.trim())
        .filter(Boolean)
    ),
  ];
}

const getEmptyUser = () => ({
  name: "",
  phone: "",
  email: "",
  password: "",
  role: "",
  status: "Active",
  permissions: [],
});

function normalizeUser(user) {
  return {
    id: String(user.id),
    name: user.name || "",
    phone: user.phone || "",
    email: user.email || "",
    role: user.role || "Staff",
    status: user.status || "Inactive",
    permissions: Array.isArray(user.permissions)
      ? [...new Set(user.permissions)]
      : [],
  };
}

async function usersRequest(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    credentials: "include",
    cache: "no-store",
    headers: {
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = "Unable to complete the request.";

    if (response.status === 401) {
      message =
        "Your session has expired. Please sign in again.";
    } else if (response.status === 403) {
      message =
        "Only the clinic administrator can manage staff.";
    } else if (response.status === 404) {
      message = "The staff account was not found.";
    } else {
      try {
        const problem = await response.json();

        const errors = Object.values(problem.errors || {})
          .flat()
          .filter((value) => typeof value === "string");

        message = errors.length
          ? errors.join("\n")
          : problem.detail || problem.title || message;
      } catch {
        // Keep the default message.
      }
    }

    throw new Error(message);
  }

  if (response.status === 204) return null;

  return response.json();
}

function Users() {
  const [settingsRoles, setSettingsRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState("");

  const [users, setUsers] = useState([]);
  const [permissionCodes, setPermissionCodes] =
    useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);
  const [formError, setFormError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [showDeactivateModal, setShowDeactivateModal] =
    useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  const [userToDeactivate, setUserToDeactivate] =
    useState(null);

  const [newUser, setNewUser] = useState(getEmptyUser);

  useEffect(() => {
    let active = true;
    let controller = null;
    let requestNumber = 0;

    const refreshRoles = async () => {
      const currentRequest = ++requestNumber;

      controller?.abort();
      controller = new AbortController();
      setRolesLoading(true);

      try {
        const savedRoles = await readStaffRoles(
          controller.signal
        );

        if (
          !active ||
          currentRequest !== requestNumber
        ) {
          return;
        }

        setSettingsRoles(savedRoles);
        setRolesError("");
      } catch (error) {
        if (
          !active ||
          currentRequest !== requestNumber ||
          error.name === "AbortError"
        ) {
          return;
        }

        setSettingsRoles([]);
        setRolesError(
          error.message || "Unable to load staff roles."
        );
      } finally {
        if (
          active &&
          currentRequest === requestNumber
        ) {
          setRolesLoading(false);
        }
      }
    };

    refreshRoles();

    window.addEventListener(
      "clinicOptionsUpdated",
      refreshRoles
    );
    window.addEventListener("focus", refreshRoles);

    return () => {
      active = false;
      controller?.abort();

      window.removeEventListener(
        "clinicOptionsUpdated",
        refreshRoles
      );
      window.removeEventListener("focus", refreshRoles);
    };
  }, [reloadKey]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function load() {
      setIsLoading(true);
      setLoadError("");

      try {
        const [savedUsers, savedPermissions] =
          await Promise.all([
            usersRequest(USERS_API, {
              signal: controller.signal,
            }),
            usersRequest(`${USERS_API}/permissions`, {
              signal: controller.signal,
            }),
          ]);

        if (
          !Array.isArray(savedUsers) ||
          !Array.isArray(savedPermissions) ||
          !savedPermissions.every(
            (permission) =>
              typeof permission === "string"
          )
        ) {
          throw new Error(
            "The server returned invalid staff data."
          );
        }

        if (!active) return;

        setUsers(savedUsers.map(normalizeUser));
        setPermissionCodes(
          [...new Set(savedPermissions)]
        );
      } catch (error) {
        if (!active || error.name === "AbortError") return;

        setLoadError(
          error.message || "Unable to load staff."
        );
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();

    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadKey]);

  // Filters include historical roles already assigned to users.
  const roles = useMemo(
    () =>
      [
        ...new Set([
          ...settingsRoles,
          ...users
            .map((user) => user.role)
            .filter(Boolean),
        ]),
      ].sort((a, b) => a.localeCompare(b)),
    [users, settingsRoles]
  );

  const permissionGroups = useMemo(() => {
    const groups = new Map();

    for (const code of permissionCodes) {
      const separator = code.indexOf(".");

      if (separator < 1) continue;

      const module = code.slice(0, separator);
      const action = code.slice(separator + 1);

      if (!groups.has(module)) {
        groups.set(module, []);
      }

      groups.get(module).push({ code, action });
    }

    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([module, permissions]) => ({
        module,
        permissions,
      }));
  }, [permissionCodes]);

  const filteredUsers = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch = [
        user.name,
        user.phone,
        user.email,
        user.role,
        user.status,
      ].some((value) =>
        value.toLowerCase().includes(searchText)
      );

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

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / rowsPerPage)
  );

  const safeCurrentPage =
    Math.min(currentPage, totalPages);

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
    (safeCurrentPage - 1) * rowsPerPage;

  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + rowsPerPage
  );

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

  const beginSave = () => {
    if (savingRef.current) return false;

    savingRef.current = true;
    setIsSaving(true);
    setFormError("");

    return true;
  };

  const endSave = () => {
    savingRef.current = false;
    setIsSaving(false);
  };

  const notifyUsersUpdated = () => {
    window.dispatchEvent(
      new Event("vetClinicUsersUpdated")
    );
  };

  const handleOpenAdd = () => {
    if (isLoading || loadError || savingRef.current) return;

    setNewUser(getEmptyUser());
    setFormError("");
    setShowAddModal(true);
  };

  const handleCloseAdd = () => {
    if (savingRef.current) return;

    setShowAddModal(false);
    setNewUser(getEmptyUser());
    setFormError("");
  };

  const handleNewUserChange = (event) => {
    const { name, value } = event.target;

    setNewUser((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEditUserChange = (event) => {
    const { name, value } = event.target;

    setSelectedUser((previous) =>
      previous
        ? { ...previous, [name]: value }
        : previous
    );
  };

  const updateFormPermissions = (mode, updater) => {
    if (savingRef.current) return;

    const setter =
      mode === "edit"
        ? setSelectedUser
        : setNewUser;

    setter((previous) =>
      previous
        ? {
            ...previous,
            permissions: updater(
              previous.permissions || []
            ),
          }
        : previous
    );
  };

  const togglePermission = (mode, code, checked) => {
    updateFormPermissions(mode, (previous) =>
      checked
        ? [...new Set([...previous, code])]
        : previous.filter(
            (permission) => permission !== code
          )
    );
  };

  const setAllPermissions = (mode, checked) => {
    updateFormPermissions(
      mode,
      () => checked ? [...permissionCodes] : []
    );
  };

  const buildUserPayload = (data) => ({
    name: data.name.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    role: data.role.trim(),
    permissions: [
      ...new Set(data.permissions || []),
    ],
  });

  const validateUser = async (data, isNew = false) => {
    if (!data.name.trim()) {
      throw new Error(
        "Please enter the employee name."
      );
    }

    if (!data.email.trim()) {
      throw new Error(
        "Please enter the employee email."
      );
    }

    if (!data.role.trim()) {
      throw new Error(
        "Please select the employee role."
      );
    }

    const latestRoles = await readStaffRoles();

    setSettingsRoles(latestRoles);
    setRolesError("");

    const original = isNew
      ? null
      : users.find(
          (user) => String(user.id) === String(data.id)
        );

    const roleAllowed =
      latestRoles.includes(data.role.trim()) ||
      (
        original &&
        original.role === data.role
      );

    if (!roleAllowed) {
      throw new Error(
        "Choose a role saved in Settings → Users → Role."
      );
    }

    if (
      (data.permissions || []).some(
        (permission) =>
          !permissionCodes.includes(permission)
      )
    ) {
      throw new Error(
        "An invalid permission was selected. Reload the page."
      );
    }

    if (isNew) {
      const password = data.password || "";

      if (
        password.length < 12 ||
        password.length > 128 ||
        !/[a-z]/.test(password) ||
        !/[A-Z]/.test(password) ||
        !/[0-9]/.test(password) ||
        !/[^a-zA-Z0-9]/.test(password)
      ) {
        throw new Error(
          "Password must contain 12–128 characters, including " +
          "uppercase, lowercase, a number and a special character."
        );
      }
    }
  };

  const handleAddUser = async (event) => {
    event.preventDefault();

    if (!beginSave()) return;

    try {
      await validateUser(newUser, true);

      const saved = await usersRequest(
        USERS_API,
        {
          method: "POST",
          body: JSON.stringify({
            ...buildUserPayload(newUser),
            password: newUser.password,
          }),
        }
      );

      setUsers((previous) => [
        ...previous,
        normalizeUser(saved),
      ]);

      setNewUser(getEmptyUser());
      setShowAddModal(false);
      notifyUsersUpdated();
    } catch (error) {
      setFormError(
        error.message ||
          "Unable to create staff account."
      );
    } finally {
      endSave();
    }
  };

  const handleOpenEdit = (user) => {
    if (savingRef.current) return;

    setSelectedUser({
      ...user,
      permissions: [...user.permissions],
    });

    setFormError("");
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    if (savingRef.current) return;

    setShowEditModal(false);
    setSelectedUser(null);
    setFormError("");
  };

  const handleUpdateUser = async (event) => {
    event.preventDefault();

    if (!selectedUser || !beginSave()) return;

    try {
      await validateUser(selectedUser);

      const saved = normalizeUser(
        await usersRequest(
          `${USERS_API}/${encodeURIComponent(
            selectedUser.id
          )}`,
          {
            method: "PUT",
            body: JSON.stringify(
              buildUserPayload(selectedUser)
            ),
          }
        )
      );

      setUsers((previous) =>
        previous.map((user) =>
          user.id === saved.id ? saved : user
        )
      );

      setShowEditModal(false);
      setSelectedUser(null);
      notifyUsersUpdated();
    } catch (error) {
      setFormError(
        error.message ||
          "Unable to update staff account."
      );
    } finally {
      endSave();
    }
  };

  const handleOpenDeactivate = (user) => {
    if (savingRef.current) return;

    setUserToDeactivate(user);
    setFormError("");
    setShowDeactivateModal(true);
  };

  const closeDeactivateModal = () => {
    if (savingRef.current) return;

    setShowDeactivateModal(false);
    setUserToDeactivate(null);
    setFormError("");
  };

  const saveUserStatus = async (userId, isActive) => {
    const saved = normalizeUser(
      await usersRequest(
        `${USERS_API}/${encodeURIComponent(
          userId
        )}/status`,
        {
          method: "PUT",
          body: JSON.stringify({ isActive }),
        }
      )
    );

    setUsers((previous) =>
      previous.map((user) =>
        user.id === saved.id ? saved : user
      )
    );

    notifyUsersUpdated();
  };

  const confirmDeactivateUser = async () => {
    if (!userToDeactivate || !beginSave()) return;

    try {
      await saveUserStatus(
        userToDeactivate.id,
        false
      );

      setShowDeactivateModal(false);
      setUserToDeactivate(null);
    } catch (error) {
      setFormError(
        error.message ||
          "Unable to deactivate account."
      );
    } finally {
      endSave();
    }
  };

  const handleReactivateUser = async (user) => {
    if (!beginSave()) return;

    try {
      await saveUserStatus(user.id, true);
    } catch (error) {
      window.alert(
        error.message ||
          "Unable to reactivate account."
      );
    } finally {
      endSave();
    }
  };

  const getRoleClass = (role) => {
    if (role === "Admin") {
      return "users-role admin";
    }

    if (role === "Veterinarian") {
      return "users-role veterinarian";
    }

    return "users-role receptionist";
  };

  const formatPermissionLabel = (value) =>
    value.replace(/([a-z])([A-Z])/g, "$1 $2");  const renderPermissions = (data, mode) => {
      const selected = data.permissions || [];
  
      return (
        <section className="users-permissions-section">
          <div className="users-permissions-heading">
            <div>
              <h3>Permissions</h3>
              <p>Choose what this employee can access and do.</p>
            </div>
  
            <span className="users-permissions-count">
              {selected.length} selected
            </span>
          </div>
  
          <div className="users-permissions-tools">
            <button
              type="button"
              onClick={() => setAllPermissions(mode, true)}
              disabled={isSaving || !permissionCodes.length}
            >
              Select all
            </button>
  
            <button
              type="button"
              onClick={() => setAllPermissions(mode, false)}
              disabled={isSaving}
            >
              Clear all
            </button>
          </div>
  
          <div className="users-permissions-list">
            {permissionGroups.map((group) => (
              <fieldset
                className="users-permission-group"
                key={group.module}
                disabled={isSaving}
              >
                <legend>
                  {formatPermissionLabel(group.module)}
                </legend>
  
                <div className="users-permission-options">
                  {group.permissions.map(({ code, action }) => (
                    <label
                      key={code}
                      className="users-permission-option"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(code)}
                        onChange={(event) =>
                          togglePermission(
                            mode,
                            code,
                            event.target.checked
                          )
                        }
                      />
  
                      <span>
                        {formatPermissionLabel(action)}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
  
          <p className="users-permissions-help">
            Select View to open a section. Some forms also
            need access to related sections, such as Owners
            and Pets. The job role alone does not grant
            permissions.
          </p>
        </section>
      );
    };
  
    const renderUserFields = (data, onChange, mode) => {
      const original = mode === "edit"
        ? users.find(
            (user) => String(user.id) === String(data.id)
          )
        : null;
  
      const originalRole = original?.role || "";
  
      return (
        <>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor={`${mode}-user-name`}>Name</label>
  
              <input
                id={`${mode}-user-name`}
                type="text"
                name="name"
                placeholder="Enter full name"
                value={data.name}
                onChange={onChange}
                maxLength={200}
                required
                disabled={isSaving}
              />
            </div>
  
            <div className="form-field">
              <label htmlFor={`${mode}-user-phone`}>Phone</label>
  
              <input
                id={`${mode}-user-phone`}
                type="tel"
                name="phone"
                placeholder="Enter phone number"
                value={data.phone}
                onChange={onChange}
                maxLength={50}
                required
                disabled={isSaving}
              />
            </div>
          </div>
  
          <div className="form-row">
            <div className="form-field">
              <label htmlFor={`${mode}-user-email`}>Email</label>
  
              <input
                id={`${mode}-user-email`}
                type="email"
                name="email"
                placeholder="Enter email address"
                value={data.email}
                onChange={onChange}
                maxLength={254}
                autoComplete="off"
                required
                disabled={isSaving}
              />
            </div>
  
            <div className="form-field">
              <label htmlFor={`${mode}-user-role`}>Role</label>
  
              <select
                id={`${mode}-user-role`}
                name="role"
                value={data.role}
                onChange={onChange}
                required
                disabled={isSaving || rolesLoading}
              >
                <option value="">Select role</option>
  
                {settingsRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
  
                {originalRole &&
                  !settingsRoles.includes(originalRole) && (
                    <option value={originalRole}>
                      {originalRole} (saved value)
                    </option>
                  )}
              </select>
  
              {(rolesLoading ||
                rolesError ||
                settingsRoles.length === 0) && (
                <small className="users-password-help">
                  {rolesLoading
                    ? "Loading staff roles..."
                    : rolesError ||
                      "Add roles in Settings → Option List → Users → Role, then click Save Settings."}
                </small>
              )}
            </div>
          </div>
  
          {mode === "add" && (
            <div className="form-field">
              <label htmlFor="add-user-password">Password</label>
  
              <input
                id="add-user-password"
                type="password"
                name="password"
                placeholder="Create a password"
                value={data.password}
                onChange={onChange}
                minLength={12}
                maxLength={128}
                autoComplete="new-password"
                required
                disabled={isSaving}
              />
  
              <small className="users-password-help">
                At least 12 characters, including uppercase,
                lowercase, a number and a special character.
              </small>
            </div>
          )}
  
          {renderPermissions(data, mode)}
  
          {formError && (
            <p className="users-form-error" role="alert">
              {formError}
            </p>
          )}
        </>
      );
    };
  
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
  
    return (
      <div className="dashboard-layout">
        <Sidebar />
  
        <style>{`
          .users-page { min-width: 0; }
  
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
  
          .users-add-button:hover { opacity: .92; }
  
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
            padding: 0 38px;
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
  
          .users-table-container { overflow: hidden; }
  
          .users-table-scroll {
            width: 100%;
            overflow-x: auto;
          }
  
          .users-table { min-width: 850px; }
  
          .users-table th,
          .users-table td { white-space: nowrap; }
  
          .users-name-cell {
            font-weight: 600;
            color: #344054;
          }
  
          .users-email-cell { color: #667085; }
  
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
  
          .users-inactive-row { background: #fafafa; }
          .users-inactive-row td { opacity: .72; }
          .users-inactive-row .table-actions { opacity: 1; }
  
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
            flex-wrap: wrap;
          }
  
          .users-deactivate-overlay {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: rgba(16,24,40,.45);
          }
  
          .users-deactivate-dialog {
            width: min(410px,95vw);
            padding: 25px;
            border-radius: 12px;
            background: #ffffff;
            box-shadow: 0 20px 50px rgba(16,24,40,.18);
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
  
          .users-load-error {
            margin-bottom: 16px;
            padding: 12px;
            border: 1px solid #f0c7c4;
            border-radius: 8px;
            background: #fff7f6;
            color: #b42318;
          }
  
          .users-load-error p {
            margin: 0 0 8px;
            font-size: 13px;
          }
  
          html body #root .users-page button:disabled,
          html body #root .users-form-modal button:disabled,
          html body #root .users-deactivate-dialog button:disabled {
            opacity: .5;
            cursor: not-allowed;
          }
  
          html body #root .users-form-modal {
            max-height: calc(100dvh - 32px);
            overflow-y: auto;
          }
  
          html body #root .users-form-modal form > .form-row,
          html body #root .users-form-modal form > .form-field {
            margin-bottom: 16px;
          }
  
          .users-password-help {
            display: block;
            margin-top: 7px;
            color: #667085;
            font-size: 11px;
            line-height: 1.5;
          }
  
          .users-permissions-section {
            margin: 20px 0;
            padding-top: 16px;
            border-top: 1px solid #e2ebea;
          }
  
          .users-permissions-heading {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
          }
  
          .users-permissions-heading h3 {
            margin: 0;
            color: #344054;
            font-size: 15px;
          }
  
          .users-permissions-heading p {
            margin: 5px 0 0;
            color: #667085;
            font-size: 12px;
            line-height: 1.5;
          }
  
          .users-permissions-count {
            flex-shrink: 0;
            padding: 5px 8px;
            border-radius: 20px;
            background: #e8f7f5;
            color: #16856f;
            font-size: 11px;
            white-space: nowrap;
          }
  
          html body #root
          .users-form-modal .users-permissions-tools {
            display: flex;
            gap: 8px;
            margin: 12px 0;
          }
  
          html body #root
          .users-form-modal .users-permissions-tools button {
            position: static;
            width: auto;
            min-width: 0;
            height: 30px;
            margin: 0;
            padding: 0 10px;
            border: 1px solid #dce8e7;
            border-radius: 6px;
            background: #ffffff;
            color: #159f9f;
            font-family: inherit;
            font-size: 11px;
            cursor: pointer;
          }
  
          .users-permissions-list {
            display: grid;
            gap: 10px;
          }
  
          html body #root
          .users-form-modal .users-permission-group {
            min-width: 0;
            margin: 0;
            padding: 10px 12px 12px;
            border: 1px solid #dfe7e7;
            border-radius: 8px;
          }
  
          .users-permission-group legend {
            padding: 0 5px;
            color: #344054;
            font-size: 12px;
            font-weight: 700;
          }
  
          .users-permission-options {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px 16px;
          }
  
          html body #root
          .users-form-modal label.users-permission-option {
            display: inline-flex !important;
            align-items: center !important;
            gap: 7px !important;
            width: auto !important;
            margin: 0 !important;
            color: #475467 !important;
            font-size: 12px !important;
            font-weight: 400 !important;
            cursor: pointer;
          }
  
          html body #root
          .users-form-modal
          .users-permission-option input[type="checkbox"] {
            appearance: auto !important;
            -webkit-appearance: checkbox !important;
            flex: 0 0 15px !important;
            width: 15px !important;
            min-width: 15px !important;
            height: 15px !important;
            min-height: 15px !important;
            margin: 0 !important;
            padding: 0 !important;
            accent-color: #159f9f;
            cursor: pointer;
          }
  
          .users-permissions-help {
            margin: 10px 0 0;
            color: #667085;
            font-size: 11px;
            line-height: 1.6;
          }
  
          .users-form-error {
            margin: 12px 0 !important;
            color: #b42318 !important;
            font-size: 12px !important;
            line-height: 1.6;
            white-space: pre-line;
          }
  
          html body #root
          .users-table .users-permissions-summary {
            position: static;
            width: auto;
            min-width: 0;
            margin: 0;
            padding: 5px 9px;
            border: 1px solid #dce8e7;
            border-radius: 6px;
            background: #f3f9f9;
            color: #16856f;
            font-family: inherit;
            font-size: 11px;
            cursor: pointer;
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
  
            .users-search-box { max-width: none; }
            .users-filter-select { width: 100%; }
  
            .users-pagination {
              align-items: flex-start;
              flex-direction: column;
            }
          }
        `}</style>
  
        <main className="dashboard-main users-page">
          <div className="users-page-header">
            <div className="users-title">
              <h1>Users</h1>
              <p>Manage clinic staff and user access</p>
            </div>
  
            <button
              type="button"
              className="users-add-button"
              onClick={handleOpenAdd}
              disabled={
                isLoading || Boolean(loadError) || isSaving
              }
            >
              <FaUserPlus />
              Add User
            </button>
          </div>
  
          {loadError && (
            <div className="users-load-error" role="alert">
              <p>{loadError}</p>
  
              <button
                type="button"
                onClick={() =>
                  setReloadKey((value) => value + 1)
                }
                disabled={isLoading || isSaving}
              >
                Try Again
              </button>
            </div>
          )}
  
          <div className="users-filter-row">
            <div className="users-search-box">
              <FaSearch className="users-search-icon" />
  
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
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
              onChange={(event) =>
                setRoleFilter(event.target.value)
              }
              aria-label="Filter by role"
            >
              <option value="All">All Roles</option>
  
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
  
            <select
              className="users-filter-select"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              aria-label="Filter by status"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
  
          <div className="owners-table-container users-table-container">
            <div className="users-table-scroll">
              <table className="owners-table users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Permissions</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
  
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="no-results">
                        Loading staff...
                      </td>
                    </tr>
                  ) : loadError ? (
                    <tr>
                      <td colSpan={7} className="no-results">
                        Unable to load staff.
                      </td>
                    </tr>
                  ) : paginatedUsers.length ? (
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
  
                        <td>{user.phone || "—"}</td>
  
                        <td className="users-email-cell">
                          {user.email}
                        </td>
  
                        <td>
                          <span className={getRoleClass(user.role)}>
                            {user.role}
                          </span>
                        </td>
  
                        <td>
                          <button
                            type="button"
                            className="users-permissions-summary"
                            onClick={() => handleOpenEdit(user)}
                            disabled={isSaving}
                            title="View and edit permissions"
                            aria-label={`Edit permissions for ${user.name}`}
                          >
                            {user.permissions.length} permissions
                          </button>
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
                              onClick={() => handleOpenEdit(user)}
                              title="Edit User"
                              aria-label="Edit user"
                              disabled={isSaving}
                            >
                              <FaPen />
                            </button>
  
                            {user.status === "Active" ? (
                              <button
                                type="button"
                                className="users-action-button users-deactivate-button"
                                onClick={() =>
                                  handleOpenDeactivate(user)
                                }
                                title="Deactivate User"
                                aria-label="Deactivate user"
                                disabled={isSaving}
                              >
                                <FaUserSlash />
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="users-action-button users-reactivate-button"
                                onClick={() =>
                                  handleReactivateUser(user)
                                }
                                title="Reactivate User"
                                aria-label="Reactivate user"
                                disabled={isSaving}
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
                      <td colSpan={7} className="no-results">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
  
          <div className="users-pagination">
            <div className="users-rows">
              <span>Rows per page:</span>
  
              <select
                value={rowsPerPage}
                onChange={(event) =>
                  setRowsPerPage(Number(event.target.value))
                }
                aria-label="Rows per page"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
  
            <div className="users-page-controls">
              <button
                type="button"
                disabled={safeCurrentPage === 1}
                onClick={() =>
                  setCurrentPage(
                    Math.max(safeCurrentPage - 1, 1)
                  )
                }
                style={{
                  ...paginationControlStyle,
                  opacity: safeCurrentPage === 1 ? 0.45 : 1,
                  cursor:
                    safeCurrentPage === 1
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
                  onClick={() => setCurrentPage(page)}
                  style={
                    safeCurrentPage === page
                      ? activePageStyle
                      : normalPageStyle
                  }
                  aria-current={
                    safeCurrentPage === page
                      ? "page"
                      : undefined
                  }
                >
                  {page}
                </button>
              ))}
  
              <button
                type="button"
                disabled={safeCurrentPage === totalPages}
                onClick={() =>
                  setCurrentPage(
                    Math.min(safeCurrentPage + 1, totalPages)
                  )
                }
                style={{
                  ...paginationControlStyle,
                  opacity:
                    safeCurrentPage === totalPages
                      ? 0.45
                      : 1,
                  cursor:
                    safeCurrentPage === totalPages
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
  
        {/* ADD USER */}
  
        {showAddModal && (
          <div
            className="modal-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                handleCloseAdd();
              }
            }}
          >
            <div className="modal-container users-form-modal">
              <div className="modal-header">
                <div>
                  <h2>Add User</h2>
                  <p>Add a new clinic staff user</p>
                </div>
  
                <button
                  type="button"
                  className="modal-close"
                  onClick={handleCloseAdd}
                  disabled={isSaving}
                  aria-label="Close add user"
                >
                  ×
                </button>
              </div>
  
              <form
                onSubmit={handleAddUser}
                aria-busy={isSaving}
              >
                {renderUserFields(
                  newUser,
                  handleNewUserChange,
                  "add"
                )}
  
                <div className="users-modal-note">
                  New users are automatically created with an
                  Active status. Their access is determined by
                  the permissions selected above.
                </div>
  
                <div className="form-actions">
                  <button
                    type="button"
                    className="modal-cancel-button"
                    onClick={handleCloseAdd}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
  
                  <button
                    type="submit"
                    className="save-button"
                    disabled={
                      isSaving ||
                      rolesLoading ||
                      Boolean(rolesError) ||
                      settingsRoles.length === 0
                    }
                  >
                    {isSaving ? "Saving..." : "Add User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
  
        {/* EDIT USER */}
  
        {showEditModal && selectedUser && (
          <div
            className="modal-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                handleCloseEdit();
              }
            }}
          >
            <div className="modal-container users-form-modal">
              <div className="modal-header">
                <div>
                  <h2>Edit User</h2>
                  <p>Update user information and permissions</p>
                </div>
  
                <button
                  type="button"
                  className="modal-close"
                  onClick={handleCloseEdit}
                  disabled={isSaving}
                  aria-label="Close edit user"
                >
                  ×
                </button>
              </div>
  
              <form
                onSubmit={handleUpdateUser}
                aria-busy={isSaving}
              >
                {renderUserFields(
                  selectedUser,
                  handleEditUserChange,
                  "edit"
                )}
  
                <div className="form-actions">
                  <button
                    type="button"
                    className="modal-cancel-button"
                    onClick={handleCloseEdit}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
  
                  <button
                    type="submit"
                    className="save-button"
                    disabled={
                      isSaving ||
                      rolesLoading ||
                      Boolean(rolesError)
                    }
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
  
        {/* DEACTIVATE USER */}
  
        {showDeactivateModal && userToDeactivate && (
          <div
            className="users-deactivate-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeDeactivateModal();
              }
            }}
          >
            <div
              className="users-deactivate-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="users-deactivate-title"
            >
              <div className="users-deactivate-icon">
                <FaUserSlash />
              </div>
  
              <h3 id="users-deactivate-title">
                Deactivate User
              </h3>
  
              <p>
                Are you sure you want to deactivate{" "}
                <strong>{userToDeactivate.name}</strong>?
              </p>
  
              <p className="users-deactivate-note">
                This user will stay in the users list and will
                be marked as Inactive.
              </p>
  
              {formError && (
                <p className="users-form-error" role="alert">
                  {formError}
                </p>
              )}
  
              <div className="users-deactivate-actions">
                <button
                  type="button"
                  className="users-deactivate-cancel"
                  onClick={closeDeactivateModal}
                  disabled={isSaving}
                >
                  Cancel
                </button>
  
                <button
                  type="button"
                  className="users-deactivate-confirm"
                  onClick={confirmDeactivateUser}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Deactivate"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  export default Users;