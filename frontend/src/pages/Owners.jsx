import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import {
  getOwners,
  createOwner,
  updateOwner,
  deleteOwner,
} from "../api/ownersApi";

import { getClinicOptions } from "../data/clinicOptionsApi";

import {
  FaEye,
  FaPen,
  FaTrash,
  FaSortAmountDown,
  FaSearch,
  FaTimes,
  FaFileExport,
} from "react-icons/fa";

export function readOwners(options) {
  return getOwners(options);
}

const statusKey = (value) =>
  String(value || "").trim().toLowerCase();

async function readOwnerStatuses(signal) {
  const records = await getClinicOptions({
    listKey: "petOwners",
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
      "The server returned invalid owner statuses."
    );
  }

  const seen = new Set();

  return records
    .filter(
      (record) =>
        record.listKey === "petOwners" &&
        record.isActive
    )
    .sort(
      (a, b) =>
        a.sortOrder - b.sortOrder ||
        a.value.localeCompare(b.value)
    )
    .map((record) => record.value.trim())
    .filter((value) => {
      const key = statusKey(value);

      if (!key || seen.has(key)) return false;

      seen.add(key);
      return true;
    });
}

function Owners() {
  const navigate = useNavigate();

  const [owners, setOwners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);

  const [ownerStatuses, setOwnerStatuses] = useState([]);
  const [statusesLoading, setStatusesLoading] =
    useState(true);
  const [statusesError, setStatusesError] = useState("");

  useEffect(() => {
    let controller;
    let disposed = false;

    const refresh = async () => {
      controller?.abort();
      controller = new AbortController();
      const currentController = controller;

      setIsLoading(true);
      setLoadError("");

      try {
        const data = await getOwners({
          signal: currentController.signal,
        });

        if (!disposed && !currentController.signal.aborted) {
          setOwners(data);
        }
      } catch (error) {
        if (!disposed && !currentController.signal.aborted) {
          setLoadError(error.message);
        }
      } finally {
        if (!disposed && !currentController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    refresh();

    window.addEventListener(
      "vetClinicOwnersUpdated",
      refresh
    );

    return () => {
      disposed = true;
      controller?.abort();

      window.removeEventListener(
        "vetClinicOwnersUpdated",
        refresh
      );
    };
  }, []);

  useEffect(() => {
    let controller;
    let disposed = false;

    const refreshStatuses = async () => {
      controller?.abort();
      controller = new AbortController();
      const currentController = controller;

      setStatusesLoading(true);

      try {
        const values = await readOwnerStatuses(
          currentController.signal
        );

        if (
          !disposed &&
          !currentController.signal.aborted
        ) {
          setOwnerStatuses(values);
          setStatusesError("");
        }
      } catch (error) {
        if (
          !disposed &&
          !currentController.signal.aborted
        ) {
          setOwnerStatuses([]);
          setStatusesError(
            error.message ||
              "Unable to load owner statuses."
          );
        }
      } finally {
        if (
          !disposed &&
          !currentController.signal.aborted
        ) {
          setStatusesLoading(false);
        }
      }
    };

    refreshStatuses();

    window.addEventListener(
      "clinicOptionsUpdated",
      refreshStatuses
    );
    window.addEventListener("focus", refreshStatuses);

    return () => {
      disposed = true;
      controller?.abort();

      window.removeEventListener(
        "clinicOptionsUpdated",
        refreshStatuses
      );
      window.removeEventListener(
        "focus",
        refreshStatuses
      );
    };
  }, []);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);
  const [ownerToDelete, setOwnerToDelete] =
    useState(null);

  const emptyOwner = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    emergencyContact: "",
    notes: "",
    status: "",
  };

  const [newOwner, setNewOwner] = useState(emptyOwner);

  const filterStatuses = [
    ...ownerStatuses,
    ...owners.map((owner) => owner.status),
  ].filter(
    (value, index, values) =>
      value &&
      values.findIndex(
        (item) => statusKey(item) === statusKey(value)
      ) === index
  );

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
      statusFilter === "all" ||
      statusKey(owner.status) === statusKey(statusFilter);

    return matchesSearch && matchesStatus;
  });

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

    if (sortBy === "active") {
      return (
        Number(statusKey(b.status) === "active") -
        Number(statusKey(a.status) === "active")
      );
    }

    if (sortBy === "inactive") {
      return (
        Number(statusKey(b.status) === "inactive") -
        Number(statusKey(a.status) === "inactive")
      );
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

  const beginSave = () => {
    if (savingRef.current) return false;

    savingRef.current = true;
    setIsSaving(true);
    return true;
  };

  const endSave = () => {
    savingRef.current = false;
    setIsSaving(false);
  };

  const handleOpenAdd = () => {
    if (savingRef.current) return;

    if (statusesLoading) {
      window.alert(
        "Owner statuses are loading. Please try again."
      );
      return;
    }

    if (statusesError) {
      window.alert(statusesError);
      return;
    }

    const defaultStatus =
      ownerStatuses.find(
        (value) => statusKey(value) === "active"
      ) ||
      ownerStatuses[0] ||
      "";

    setNewOwner({
      ...emptyOwner,
      status: defaultStatus,
    });

    setShowAddModal(true);
  };

  const validateOwnerStatus = async (
    owner,
    original = null
  ) => {
    const values = await readOwnerStatuses();

    setOwnerStatuses(values);
    setStatusesError("");

    const allowed =
      values.includes(owner.status) ||
      (
        original &&
        original.status === owner.status
      );

    if (!owner.status || !allowed) {
      throw new Error(
        "Choose an owner status saved in Settings → Pet Owners."
      );
    }
  };

  const handleNewOwnerChange = (e) => {
    const { name, value } = e.target;

    setNewOwner({
      ...newOwner,
      [name]: value,
    });
  };

  const handleAddOwner = async (e) => {
    e.preventDefault();

    const action = e.nativeEvent.submitter?.value;

    if (!beginSave()) return;

    try {
      await validateOwnerStatus(newOwner);

      const owner = await createOwner(newOwner);

      setOwners((previousOwners) => [
        ...previousOwners,
        owner,
      ]);
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
    } catch (error) {
      window.alert(error.message);
    } finally {
      endSave();
    }
  };

  const handleViewOwner = (owner) => {
    navigate(`/owners/${owner.id}`, {
      state: { owner },
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

  const handleUpdateOwner = async (e) => {
    e.preventDefault();

    if (!selectedOwner || !beginSave()) return;

    try {
      const original = owners.find(
        (owner) => owner.id === selectedOwner.id
      );

      await validateOwnerStatus(selectedOwner, original);

      const updated = await updateOwner(
        selectedOwner.id,
        selectedOwner
      );

      setOwners((previousOwners) =>
        previousOwners.map((owner) =>
          owner.id === updated.id ? updated : owner
        )
      );

      setShowEditModal(false);
      setSelectedOwner(null);
    } catch (error) {
      window.alert(error.message);
    } finally {
      endSave();
    }
  };

  const handleToggleStatus = async (id) => {
    const owner = owners.find((item) => item.id === id);

    if (!owner || !beginSave()) return;

    try {
      const currentStatus = statusKey(owner.status);

      if (
        currentStatus !== "active" &&
        currentStatus !== "inactive"
      ) {
        window.alert(
          "Use Edit Owner to change this status."
        );
        return;
      }

      const values = await readOwnerStatuses();

      setOwnerStatuses(values);
      setStatusesError("");

      const targetKey =
        currentStatus === "active" ? "inactive" : "active";

      const targetStatus = values.find(
        (value) => statusKey(value) === targetKey
      );

      if (!targetStatus) {
        throw new Error(
          `Add "${targetKey === "active" ? "Active" : "Inactive"}" in Settings → Pet Owners before switching to it.`
        );
      }

      const updated = await updateOwner(id, {
        ...owner,
        status: targetStatus,
      });

      setOwners((previousOwners) =>
        previousOwners.map((item) =>
          item.id === updated.id ? updated : item
        )
      );
    } catch (error) {
      window.alert(error.message);
    } finally {
      endSave();
    }
  };

  const handleDelete = (owner) => {
    if (statusKey(owner.status) === "active") {
      alert(
        "You must set this owner as Inactive before deleting."
      );
      return;
    }

    setOwnerToDelete(owner);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!ownerToDelete || !beginSave()) return;

    try {
      await deleteOwner(ownerToDelete.id);

      setOwners((previousOwners) =>
        previousOwners.filter(
          (owner) => owner.id !== ownerToDelete.id
        )
      );

      setShowDeleteModal(false);
      setOwnerToDelete(null);

      if (currentOwners.length === 1 && safeCurrentPage > 1) {
        setCurrentPage(safeCurrentPage - 1);
      }
    } catch (error) {
      window.alert(error.message);
    } finally {
      endSave();
    }
  };

  const cancelDelete = () => {
    if (savingRef.current) return;

    setShowDeleteModal(false);
    setOwnerToDelete(null);
  };

  const renderOwnerStatus = (data, isEdit = false) => {
    const original = isEdit
      ? owners.find((owner) => owner.id === data.id)
      : null;

    return (
      <div className="form-field">
        <label>Owner Status</label>

        <select
          name="status"
          value={data.status}
          onChange={
            isEdit
              ? handleEditChange
              : handleNewOwnerChange
          }
          disabled={isSaving || statusesLoading}
          required
        >
          <option value="">Select status</option>

          {ownerStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}

          {original?.status &&
            !ownerStatuses.includes(original.status) && (
              <option value={original.status}>
                {original.status} (saved value)
              </option>
            )}
        </select>

        {(statusesLoading ||
          statusesError ||
          ownerStatuses.length === 0) && (
          <small
            style={{ color: "#7c8f94", lineHeight: 1.5 }}
          >
            {statusesLoading
              ? "Loading owner statuses..."
              : statusesError ||
                "Add statuses in Settings → Option List → Pet Owners, then click Save Settings."}
          </small>
        )}
      </div>
    );
  };  return (
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
        `}</style>

        <div className="page-header owners-fixed-header">
          <div className="owners-fixed-title">
            <h1>Pet Owners</h1>
            <p>Manage pet owner information</p>
          </div>

          <div className="owners-fixed-actions">
            <button
              type="button"
              className="owners-fixed-export"
              onClick={handleExport}
              disabled={isLoading || Boolean(loadError)}
            >
              <FaFileExport />
              Export
            </button>

            <button
              type="button"
              className="owners-fixed-add"
              onClick={handleOpenAdd}
              disabled={
                isLoading || isSaving || Boolean(loadError)
              }
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

            {filterStatuses.map((status) => (
              <option key={status} value={status}>
                {statusKey(status) === "active"
                  ? "Active"
                  : statusKey(status) === "inactive"
                    ? "Inactive"
                    : status}
              </option>
            ))}
          </select>

          <div style={{ position: "relative", width: "180px" }}>
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
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="no-results">
                    Loading owners...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan="6" className="no-results">
                    <span role="alert">{loadError}</span>
                  </td>
                </tr>
              ) : currentOwners.length > 0 ? (
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
                          statusKey(owner.status) === "active"
                            ? "owner-status-active"
                            : "owner-status-inactive"
                        }`}
                        onClick={() =>
                          handleToggleStatus(owner.id)
                        }
                        disabled={isSaving}
                      >
                        <span className="status-dot"></span>
                        {statusKey(owner.status) === "active"
                          ? "Active"
                          : statusKey(owner.status) === "inactive"
                            ? "Inactive"
                            : owner.status}
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
                          disabled={isSaving}
                        >
                          <FaPen />
                        </button>

                        {statusKey(owner.status) === "inactive" && (
                          <button
                            type="button"
                            className="delete-button icon-button"
                            onClick={() => handleDelete(owner)}
                            title="Delete"
                            disabled={isSaving}
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
            <span style={{ fontSize: "14px", color: "#52605f" }}>
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
                disabled={isSaving}
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

              {renderOwnerStatus(newOwner)}

              <div className="form-actions">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                  value="save-owner"
                  disabled={
                    isSaving ||
                    statusesLoading ||
                    Boolean(statusesError) ||
                    ownerStatuses.length === 0
                  }
                >
                  Add Owner
                </button>

                <button
                  type="submit"
                  className="save-button"
                  value="save-and-add-pet"
                  disabled={
                    isSaving ||
                    statusesLoading ||
                    Boolean(statusesError) ||
                    ownerStatuses.length === 0
                  }
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
                disabled={isSaving}
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

              {renderOwnerStatus(selectedOwner, true)}

              <div className="form-actions">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedOwner(null);
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                  disabled={
                    isSaving ||
                    statusesLoading ||
                    Boolean(statusesError)
                  }
                >
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
            style={{ maxWidth: "420px" }}
          >
            <div className="modal-header">
              <div>
                <h2>Archive Owner</h2>
                <p>Linked records will be kept</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={cancelDelete}
                disabled={isSaving}
              >
                ×
              </button>
            </div>

            <div style={{ padding: "10px 0 5px" }}>
              <p
                style={{
                  fontSize: "16px",
                  color: "#333",
                  marginBottom: "8px",
                }}
              >
                Are you sure you want to delete this?
              </p>

              <p style={{ fontSize: "14px", color: "#718181" }}>
                {ownerToDelete.firstName}{" "}
                {ownerToDelete.lastName} will be archived.
              </p>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="modal-cancel-button"
                onClick={cancelDelete}
                disabled={isSaving}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={isSaving}
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