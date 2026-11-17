import { managedUsersRequest } from "../api/managedUsersApi";
import { useEffect, useMemo, useRef, useState } from "react";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import {
  FaPlus,
  FaTrashCan,
  FaBuilding,
  FaCircleCheck,
  FaClock,
  FaMagnifyingGlass,
  FaEye,
  FaPen,
  FaXmark,
  FaInstagram,
  FaFacebook,
  FaGlobe,
  FaUserShield,
} from "react-icons/fa6";



const emptyAdmin = {
  clinicName: "",
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const styles = `
.sau-page,
.sau-page * {
  box-sizing: border-box;
}

.sau-page {
  display: flex !important;
  flex-direction: row !important;
  width: 100% !important;
  max-width: none !important;
  min-height: 100vh;
  margin: 0 !important;
  padding: 0 !important;
  background: #f5f8fa;
}

.sau-main {
  flex: 1 1 0% !important;
  width: auto !important;
  min-width: 0 !important;
  max-width: none !important;
  padding: 32px !important;
}

.sau-header {
  margin-bottom: 26px;
}

.sau-eyebrow {
  margin: 0 0 9px;
  color: #299d99;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1px;
}

#root .sau-page .sau-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 9px;
}

#root .sau-page .sau-title-row h1 {
  margin: 0;
  color: #143743;
  font-size: clamp(24px, 2.6vw, 32px);
}

.sau-subtitle {
  margin: 0;
  color: #71838e;
  font-size: 14px;
  line-height: 1.6;
}

#root .sau-page button.sau-header-add {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex: 0 0 auto !important;
  width: auto !important;
  min-width: 150px !important;
  height: 44px !important;
  min-height: 44px !important;
  padding: 10px 20px !important;
  margin: 0 !important;
  gap: 8px !important;
  border: 0 !important;
  border-radius: 9px !important;
  background: #39aaa5 !important;
  color: white !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  white-space: nowrap !important;
  cursor: pointer;
}

.sau-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 22px;
}

.sau-stat {
  padding: 22px;
  min-width: 0;
  border-radius: 14px;
  box-shadow: 0 4px 20px rgba(22,55,65,.035);
}

.sau-stat.blue { background: #edf7ff; }
.sau-stat.green { background: #eefbf4; }
.sau-stat.orange { background: #fff5ec; }
.sau-stat.purple { background: #f5efff; }

.sau-stat-icon {
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  border-radius: 12px;
  background: rgba(255,255,255,.8);
  font-size: 20px;
}

.sau-stat.blue .sau-stat-icon { color: #168ce6; }
.sau-stat.green .sau-stat-icon { color: #15a365; }
.sau-stat.orange .sau-stat-icon { color: #fa891e; }
.sau-stat.purple .sau-stat-icon { color: #8250e6; }

.sau-stat-value {
  margin: 0 0 7px;
  color: #123744;
  font-size: 29px;
  font-weight: 800;
}

.sau-stat-label {
  margin: 0;
  color: #71838e;
  font-size: 13px;
}

.sau-panel {
  padding: 24px;
  border-radius: 14px;
  background: white;
  box-shadow: 0 4px 20px rgba(22,55,65,.035);
  min-width: 0;
}

.sau-panel-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 22px;
}

.sau-panel-top h2 {
  margin: 0;
  color: #173944;
  font-size: 19px;
}

#root .sau-page .sau-toolbar {
  display: grid !important;
  grid-template-columns: minmax(0, 2fr) repeat(2, minmax(0, 1fr));
  align-items: center !important;
  width: 100% !important;
  max-width: none !important;
  gap: 12px !important;
  margin-bottom: 20px;
}

#root .sau-page .sau-toolbar .sau-search {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100% !important;
  min-width: 0 !important;
  max-width: none !important;
  height: 44px;
  padding: 0 13px;
  border: 1px solid #e0e9eb;
  border-radius: 10px;
  color: #829096;
  background: #fafcfc;
}

.sau-search input {
  flex: 1;
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #173944;
  font-size: 14px;
}

#root .sau-page .sau-toolbar .sau-select {
  width: 100% !important;
  min-width: 0 !important;
  max-width: none !important;
  height: 44px;
  padding: 0 12px;
  border: 1px solid #e0e9eb;
  border-radius: 10px;
  background: #fafcfc;
  color: #344e5a;
  font-size: 13px;
  cursor: pointer;
}

.sau-table-wrap {
  width: 100%;
  overflow-x: auto;
}

.sau-table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
  text-align: left;
}

.sau-table th,
.sau-table td {
  padding: 15px 12px;
  border-bottom: 1px solid #edf1f3;
  font-size: 13px;
  text-align: left;
}

.sau-table th {
  color: #7a8a94;
  background: #f5f8fa;
  font-weight: 700;
  white-space: nowrap;
}

.sau-table td {
  color: #344e5a;
}

.sau-table tbody tr:hover {
  background: #f8fbfb;
}

.sau-clinic-name {
  color: #173944;
  font-weight: 700;
}

.sau-secondary {
  margin-top: 4px;
  color: #84939c;
  font-size: 12px;
}

.sau-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 20px;
  background: #f0f2f4;
  color: #687782;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.sau-badge.active {
  background: #e4f8ee;
  color: #16825d;
}

.sau-badge.pending {
  background: #fff2d9;
  color: #b87b16;
}

.sau-badge.suspended,
.sau-badge.expired {
  background: #fdeaea;
  color: #bb4d4d;
}

.sau-badge.premium {
  background: #f3ebff;
  color: #8250e6;
}

.sau-badge.professional {
  background: #e9f5ff;
  color: #168ce6;
}

.sau-badge.basic {
  background: #eef2f4;
  color: #607481;
}

.sau-actions {
  display: flex;
  align-items: center;
  gap: 7px;
}

.sau-page .sau-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px !important;
  min-width: 34px;
  height: 34px;
  padding: 0 !important;
  border: 0;
  border-radius: 8px;
  background: #edf8f7;
  color: #299d99;
  cursor: pointer;
}

.sau-page .sau-icon-button:hover {
  background: #d6f0ed;
}

.sau-page .sau-delete-admin {
  background: #fdeaea !important;
  color: #bb4d4d !important;
}

.sau-page .sau-delete-admin:disabled {
  opacity: .35;
  cursor: not-allowed;
}

.sau-empty {
  padding: 55px 20px;
  text-align: center;
  color: #84939c;
  font-size: 14px;
}

.sau-modal-overlay {
  position: fixed !important;
  inset: 0 !important;
  z-index: 5000;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  height: 100dvh !important;
  padding: 20px !important;
  overflow: hidden !important;
  box-sizing: border-box !important;
  background: rgba(12,34,42,.55);
}

#root .sau-modal-overlay .sau-modal {
  box-sizing: border-box !important;
  width: min(650px, 100%) !important;
  max-width: 650px !important;
  max-height: calc(100dvh - 40px) !important;
  margin: 0 !important;
  padding: 26px !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  border-radius: 16px !important;
  background: white;
  box-shadow: 0 20px 60px rgba(0,0,0,.18);
}

#root .sau-modal-overlay .sau-modal-header {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: space-between !important;
  box-sizing: border-box !important;
  width: auto !important;
  max-width: none !important;
  gap: 16px !important;
  margin: -26px -26px 26px !important;
  padding: 24px 26px !important;
  background: #55b7b2 !important;
  border-radius: 16px 16px 0 0 !important;
}

.sau-modal-header > div {
  flex: 1 1 auto !important;
  min-width: 0 !important;
}

.sau-modal-header h2 {
  margin: 0 0 6px !important;
  color: white !important;
  font-size: 22px;
}

.sau-modal-header p {
  margin: 0 !important;
  color: white !important;
  font-size: 13px;
}

#root .sau-modal-overlay button.sau-close {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex: 0 0 36px !important;
  width: 36px !important;
  min-width: 36px !important;
  max-width: 36px !important;
  height: 36px !important;
  min-height: 36px !important;
  max-height: 36px !important;
  padding: 0 !important;
  margin: 0 !important;
  border: 0 !important;
  border-radius: 50% !important;
  background: white !important;
  color: #526b70 !important;
  cursor: pointer;
}

.sau-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.sau-detail-label {
  margin: 0 0 6px;
  color: #84939c;
  font-size: 12px;
}

.sau-detail-value {
  margin: 0;
  color: #173944;
  font-size: 14px;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.sau-social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
}

.sau-social-links a {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 12px;
  border-radius: 9px;
  background: #edf8f7;
  color: #299d99;
  text-decoration: none;
  font-size: 13px;
}

.sau-modal-section {
  padding-top: 20px;
  margin-top: 20px;
  border-top: 1px solid #edf1f3;
}

.sau-modal-section h3 {
  margin: 0 0 16px;
  color: #173944;
  font-size: 16px;
}

#root .sau-modal-overlay .sau-modal-actions {
  display: flex !important;
  flex-direction: row !important;
  justify-content: flex-end !important;
  align-items: center !important;
  flex-wrap: wrap !important;
  gap: 10px !important;
  margin-top: 24px;
}

#root .sau-modal-overlay button.sau-button {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex: 0 0 auto !important;
  width: auto !important;
  min-width: 0 !important;
  min-height: 42px !important;
  margin: 0 !important;
  padding: 10px 17px !important;
  gap: 8px !important;
  border: 0 !important;
  border-radius: 9px !important;
  background: #39aaa5 !important;
  color: white !important;
  font-size: 13px !important;
  font-weight: 700;
  cursor: pointer;
}

#root .sau-modal-overlay button.sau-button.secondary {
  background: #edf1f3 !important;
  color: #344e5a !important;
}

#root .sau-modal-overlay button.sau-button.danger {
  background: #fdeaea !important;
  color: #bb4d4d !important;
}

.sau-edit-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 15px;
}

.sau-edit-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.sau-edit-field label {
  color: #627783;
  font-size: 12px;
  font-weight: 600;
}

.sau-edit-field input,
.sau-edit-field select {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  height: 42px;
  padding: 0 12px;
  border: 1px solid #e0e9eb;
  border-radius: 9px;
  background: white;
  color: #173944;
  font-size: 13px;
}

.sau-modal-overlay .sau-admin-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.sau-modal-overlay .sau-admin-form label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  color: #607481;
  font-size: 13px;
  font-weight: 600;
}

.sau-modal-overlay .sau-admin-form input {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 42px;
  padding: 10px 12px;
  border: 1px solid #dce8eb;
  border-radius: 9px;
  background: white;
  color: #173944;
  font: inherit;
}

.sau-form-error {
  margin: 16px 0 0;
  color: #bb4d4d;
  font-size: 13px;
}

@media (max-width: 1100px) {
  .sau-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .sau-page {
    display: block !important;
  }

  .sau-main {
    width: 100% !important;
    padding: 84px 18px 28px !important;
  }

  .sau-panel {
    padding: 16px;
  }

  .sau-detail-grid,
  .sau-edit-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  #root .sau-page .sau-toolbar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  #root .sau-page .sau-toolbar .sau-search {
    grid-column: 1 / -1;
  }

  #root .sau-page .sau-title-row {
    gap: 10px;
  }

  #root .sau-page button.sau-header-add {
    min-width: 0 !important;
    padding: 10px 12px !important;
  }
}

@media (max-width: 540px) {
  .sau-modal-overlay .sau-admin-form {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .sau-stats {
    grid-template-columns: 1fr;
  }

  .sau-main {
    padding: 84px 14px 24px !important;
  }
}
`;

const formatDate = (value) => {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
};

function StatusBadge({ value }) {
  return (
    <span className={`sau-badge ${value.toLowerCase()}`}>
      {value}
    </span>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="sau-detail-label">{label}</p>
      <p className="sau-detail-value">{value || "—"}</p>
    </div>
  );
}

export default function SuperAdminUsers() {
  const [clinics, setClinics] = useState([]);
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [newAdmin, setNewAdmin] = useState({ ...emptyAdmin });

  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedId, setSelectedId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [pageError, setPageError] = useState("");
  const [editError, setEditError] = useState("");

  const mutationLock = useRef(false);

  const selectedClinic = clinics.find(
    (clinic) => clinic.id === selectedId
  );

  const loadClinics = async (signal) => {
    setLoading(true);
    setPageError("");

    try {
      const data = await managedUsersRequest("", { signal });

      if (!Array.isArray(data)) {
        throw new Error("Invalid clinic data returned by server.");
      }

      setClinics(data);
    } catch (error) {
      if (error.name !== "AbortError") {
        setPageError(error.message);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    loadClinics(controller.signal);

    return () => controller.abort();
  }, []);

  const replaceClinic = (updatedClinic) => {
    setClinics((previous) => {
      const exists = previous.some(
        (clinic) => clinic.id === updatedClinic.id
      );

      return exists
        ? previous.map((clinic) =>
            clinic.id === updatedClinic.id
              ? updatedClinic
              : clinic
          )
        : [...previous, updatedClinic];
    });
  };

  const closeAddAdmin = () => {
    if (mutationLock.current) return;

    setAddingAdmin(false);
    setNewAdmin({ ...emptyAdmin });
    setAdminError("");
  };

  const changeAdmin = (field, value) => {
    setNewAdmin((previous) => ({
      ...previous,
      [field]: value,
    }));

    setAdminError("");
  };

  const addAdmin = async (event) => {
    event.preventDefault();

    if (mutationLock.current) return;

    if (!newAdmin.clinicName.trim() || !newAdmin.name.trim()) {
      setAdminError("Enter the clinic and admin names.");
      return;
    }

    if (newAdmin.password !== newAdmin.confirmPassword) {
      setAdminError("Passwords do not match.");
      return;
    }

    mutationLock.current = true;
    setBusy(true);
    setAdminError("");

    try {
      const created = await managedUsersRequest("/admins", {
        method: "POST",
        body: JSON.stringify(newAdmin),
      });

      replaceClinic(created);

      mutationLock.current = false;
      closeAddAdmin();
    } catch (error) {
      setAdminError(error.message);
    } finally {
      mutationLock.current = false;
      setBusy(false);
    }
  };

  const deleteAdmin = async (clinic) => {
    if (mutationLock.current || !clinic.adminName) return;

    const confirmed = window.confirm(
      `Delete admin account "${clinic.adminName}"? ` +
      "The clinic and its data will remain."
    );

    if (!confirmed) return;

    mutationLock.current = true;
    setBusy(true);
    setPageError("");

    try {
      replaceClinic(
        await managedUsersRequest(
          `/clinics/${clinic.id}/admin`,
          { method: "DELETE" }
        )
      );
    } catch (error) {
      setPageError(error.message);
    } finally {
      mutationLock.current = false;
      setBusy(false);
    }
  };

  const filteredClinics = useMemo(() => {
    const query = search.toLowerCase().trim();

    return clinics.filter((clinic) => {
      const matchesSearch = [
        clinic.clinicName,
        clinic.adminName,
        clinic.email,
        clinic.adminEmail,
        clinic.location,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

      return (
        matchesSearch &&
        (planFilter === "All" || clinic.plan === planFilter) &&
        (statusFilter === "All" || clinic.status === statusFilter)
      );
    });
  }, [clinics, search, planFilter, statusFilter]);

  const overview = [
    {
      title: "Total Clinics",
      value: clinics.length,
      icon: FaBuilding,
      color: "blue",
    },
    {
      title: "Active Clinics",
      value: clinics.filter(
        (clinic) => clinic.status === "Active"
      ).length,
      icon: FaCircleCheck,
      color: "green",
    },
    {
      title: "Pending Clinics",
      value: clinics.filter(
        (clinic) => clinic.status === "Pending"
      ).length,
      icon: FaClock,
      color: "orange",
    },
    {
      title: "Clinic Admins",
      value: clinics.filter(
        (clinic) => clinic.adminName
      ).length,
      icon: FaUserShield,
      color: "purple",
    },
  ];

  const openDetails = (clinic) => {
    if (mutationLock.current) return;

    setSelectedId(clinic.id);
    setEditing(false);
    setDraft(null);
    setEditError("");
  };

  const openEdit = (clinic) => {
    if (mutationLock.current) return;

    setSelectedId(clinic.id);
    setDraft({ ...clinic });
    setEditing(true);
    setEditError("");
  };

  const closeModal = () => {
    if (mutationLock.current) return;

    setSelectedId(null);
    setEditing(false);
    setDraft(null);
    setEditError("");
  };

  const saveEdit = async (event) => {
    event.preventDefault();

    if (!draft || mutationLock.current) return;

    mutationLock.current = true;
    setBusy(true);
    setEditError("");

    try {
      const updated = await managedUsersRequest(
        `/clinics/${draft.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            ...draft,
            email: draft.email.trim() || null,
          }),
        }
      );

      replaceClinic(updated);

      mutationLock.current = false;
      closeModal();
    } catch (error) {
      setEditError(error.message);
    } finally {
      mutationLock.current = false;
      setBusy(false);
    }
  };

  const toggleStatus = async () => {
    if (!selectedClinic || mutationLock.current) return;

    mutationLock.current = true;
    setBusy(true);
    setEditError("");

    try {
      replaceClinic(
        await managedUsersRequest(
          `/clinics/${selectedClinic.id}/status`,
          {
            method: "PUT",
            body: JSON.stringify({
              isActive: selectedClinic.status === "Suspended",
            }),
          }
        )
      );
    } catch (error) {
      setEditError(error.message);
    } finally {
      mutationLock.current = false;
      setBusy(false);
    }
  };

  const updateDraft = (field, value) => {
    setDraft((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  return (
    <>
      <style>{styles}</style>

      <div className="sau-page">
        <SuperAdminSidebar />

        <main className="sau-main">
          <header className="sau-header">
            <p className="sau-eyebrow">PLATFORM MANAGEMENT</p>

            <div className="sau-title-row">
              <h1>Admin & Users</h1>

              <button disabled={loading || busy}
                type="button"
                className="sau-header-add"
                onClick={() => {
                  setNewAdmin({ ...emptyAdmin });
                  setAdminError("");
                  setAddingAdmin(true);
                }}
              >
                <FaPlus /> Add Admin
              </button>
            </div>

            <p className="sau-subtitle">
              Manage registered clinics, administrators, contact details
              and subscription information.
            </p>
          </header>

          <section className="sau-stats">
            {overview.map(({ title, value, icon: Icon, color }) => (
              <article key={title} className={`sau-stat ${color}`}>
                <div className="sau-stat-icon">
                  <Icon />
                </div>

                <h2 className="sau-stat-value">{value}</h2>
                <p className="sau-stat-label">{title}</p>
              </article>
            ))}
          </section>

          <section className="sau-panel">
            <div className="sau-panel-top">
              <h2>Registered Clinics</h2>
            </div>

            <div className="sau-toolbar">
              <label className="sau-search">
                <FaMagnifyingGlass />

                <input
                  type="search"
                  aria-label="Search clinics"
                  placeholder="Search clinic, admin or email..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>

              <select
                className="sau-select"
                aria-label="Filter by plan"
                value={planFilter}
                onChange={(event) => setPlanFilter(event.target.value)}
              >
                <option value="All">All Plans</option>
                <option value="Basic">Basic</option>
                <option value="Professional">Professional</option>
                <option value="Premium">Premium</option>
              </select>

              <select
                className="sau-select"
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            {pageError && (
              <div role="alert" className="sau-form-error">
                <p>{pageError}</p>
                <button
                  type="button"
                  disabled={loading || busy}
                  onClick={() => loadClinics()}
                >
                  Retry
                </button>
              </div>
            )}

            {loading ? (
              <div className="sau-empty">Loading clinics...</div>
            ) : filteredClinics.length === 0 ? (
              <div className="sau-empty">
                No clinics match your search.
              </div>
            ) : (
              <div className="sau-table-wrap">
                <table className="sau-table">
                  <thead>
                    <tr>
                      <th>Clinic</th>
                      <th>Admin</th>
                      <th>Email</th>
                      <th>Plan</th>
                      <th>Subscription</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredClinics.map((clinic) => (
                      <tr key={clinic.id}>
                        <td>
                          <div className="sau-clinic-name">
                            {clinic.clinicName}
                          </div>

                          <div className="sau-secondary">
                            {clinic.location || "—"}
                          </div>
                        </td>

                        <td>
                          {clinic.adminName || "No admin assigned"}
                        </td>

                        <td>
                          {clinic.email || clinic.adminEmail || "—"}
                        </td>

                        <td>
                          <StatusBadge value={clinic.plan} />
                        </td>

                        <td>
                          <StatusBadge value={clinic.subscription} />
                        </td>

                        <td>
                          <div className="sau-actions">
                            <button disabled={busy}
                              type="button"
                              className="sau-icon-button"
                              title="View details"
                              aria-label={`View ${clinic.clinicName}`}
                              onClick={() => openDetails(clinic)}
                            >
                              <FaEye />
                            </button>

                            <button disabled={busy}
                              type="button"
                              className="sau-icon-button"
                              title="Edit clinic"
                              aria-label={`Edit ${clinic.clinicName}`}
                              onClick={() => openEdit(clinic)}
                            >
                              <FaPen />
                            </button>

                            <button
                              type="button"
                              className="sau-icon-button sau-delete-admin"
                              title="Delete admin account"
                              aria-label={`Delete admin ${clinic.adminName || ""}`}
                              disabled={busy || !clinic.adminName}
                              onClick={() => deleteAdmin(clinic)}
                            >
                              <FaTrashCan />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>

      {addingAdmin && (
        <div
          className="sau-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAddAdmin();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") closeAddAdmin();
          }}
        >
          <div
            className="sau-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sau-add-admin-title"
          >
            <div className="sau-modal-header">
              <div>
                <h2 id="sau-add-admin-title">Add Admin</h2>
                <p>Create a Clinic Admin account.</p>
              </div>

              <button disabled={busy}
                type="button"
                className="sau-close"
                aria-label="Close"
                onClick={closeAddAdmin}
              >
                <FaXmark />
              </button>
            </div>

            <form onSubmit={addAdmin}>
              <div className="sau-admin-form">
                <label>
                  Clinic
                  <input
                    required
                    autoFocus
                    type="text"
                    list="sau-clinic-options"
                    maxLength={200}
                    autoComplete="off"
                    placeholder="Type a new or existing clinic name"
                    value={newAdmin.clinicName}
                    onChange={(event) =>
                      changeAdmin("clinicName", event.target.value)
                    }
                  />

                  <datalist id="sau-clinic-options">
                    {clinics
                      .filter((clinic) => !clinic.adminName)
                      .map((clinic) => (
                        <option
                          key={clinic.id}
                          value={clinic.clinicName}
                        />
                      ))}
                  </datalist>
                </label>

                <label>
                  Admin Name
                  <input
                    required
                    type="text"
                    maxLength={200}
                    autoComplete="name"
                    placeholder="Enter admin name"
                    value={newAdmin.name}
                    onChange={(event) =>
                      changeAdmin("name", event.target.value)
                    }
                  />
                </label>

                <label>
                  Email
                  <input
                    required
                    type="email"
                    maxLength={254}
                    autoComplete="email"
                    placeholder="Enter admin email"
                    value={newAdmin.email}
                    onChange={(event) =>
                      changeAdmin("email", event.target.value)
                    }
                  />
                </label>

                <label>
                  Phone
                  <input
                    type="tel"
                    autoComplete="tel"
                    placeholder="Enter phone number"
                    value={newAdmin.phone}
                    onChange={(event) =>
                      changeAdmin("phone", event.target.value)
                    }
                  />
                </label>

                <label>
                  Password
                  <input
                    required
                    type="password"
                    minLength={12}
                    autoComplete="new-password"
                    placeholder="At least 12 characters"
                    value={newAdmin.password}
                    onChange={(event) =>
                      changeAdmin("password", event.target.value)
                    }
                  />
                </label>

                <label>
                  Confirm Password
                  <input
                    required
                    type="password"
                    minLength={12}
                    autoComplete="new-password"
                    placeholder="Confirm password"
                    value={newAdmin.confirmPassword}
                    onChange={(event) =>
                      changeAdmin("confirmPassword", event.target.value)
                    }
                  />
                </label>
              </div>

              {adminError && (
                <p role="alert" className="sau-form-error">
                  {adminError}
                </p>
              )}

              <div className="sau-modal-actions">
                <button disabled={busy}
                  type="button"
                  className="sau-button secondary"
                  onClick={closeAddAdmin}
                >
                  Cancel
                </button>

                <button disabled={busy} type="submit" className="sau-button">
                  Add Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedClinic && (
        <div
          className="sau-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") closeModal();
          }}
        >
          <div
            className="sau-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sau-clinic-modal-title"
          >
            <div className="sau-modal-header">
              <div>
                <h2 id="sau-clinic-modal-title">
                  {editing ? "Edit Clinic" : selectedClinic.clinicName}
                </h2>

                <p>
                  {editing
                    ? "Update clinic information"
                    : "Clinic profile and subscription details"}
                </p>
              </div>

              <button disabled={busy}
                type="button"
                className="sau-close"
                onClick={closeModal}
                aria-label="Close"
              >
                <FaXmark />
              </button>
            </div>

            {editError && (
              <p role="alert" className="sau-form-error">
                {editError}
              </p>
            )}

            {editing && draft ? (
              <form onSubmit={saveEdit}>
                <div className="sau-edit-grid">
                  {[
                    ["clinicName", "Clinic Name"],
                    ["adminName", "Admin Name"],
                    ["email", "Email"],
                    ["phone", "Phone"],
                    ["location", "Location"],
                    ["instagram", "Instagram URL"],
                    ["facebook", "Facebook URL"],
                    ["website", "Website URL"],
                  ].map(([field, label]) => (
                    <div className="sau-edit-field" key={field}>
                      <label htmlFor={`edit-${field}`}>
                        {label}
                      </label>

                      <input
                        id={`edit-${field}`}
                        type={
                          field === "email"
                            ? "email"
                            : field === "phone"
                              ? "tel"
                              : "text"
                        }
                        value={draft[field] ?? ""}
                        onChange={(event) =>
                          updateDraft(field, event.target.value)
                        }
                        required={field === "clinicName"}
                      />
                    </div>
                  ))}

                  <div className="sau-edit-field">
                    <label htmlFor="edit-plan">Plan</label>

                    <select
                      id="edit-plan"
                      value={draft.plan}
                      onChange={(event) =>
                        updateDraft("plan", event.target.value)
                      }
                    >
                      <option>Basic</option>
                      <option>Professional</option>
                      <option>Premium</option>
                    </select>
                  </div>

                  <div className="sau-edit-field">
                    <label htmlFor="edit-subscription">
                      Subscription
                    </label>

                    <select
                      id="edit-subscription"
                      value={draft.subscription}
                      onChange={(event) =>
                        updateDraft("subscription", event.target.value)
                      }
                    >
                      <option>Active</option>
                      <option>Pending</option>
                      <option>Expired</option>
                    </select>
                  </div>
                </div>

                <div className="sau-modal-actions">
                  <button disabled={busy}
                    type="button"
                    className="sau-button secondary"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>

                  <button disabled={busy} type="submit" className="sau-button">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="sau-detail-grid">
                  <Detail
                    label="Clinic Name"
                    value={selectedClinic.clinicName}
                  />

                  <Detail
                    label="Admin Name"
                    value={selectedClinic.adminName}
                  />

                  <Detail
                    label="Email"
                    value={selectedClinic.email}
                  />

                  <Detail
                    label="Phone"
                    value={selectedClinic.phone}
                  />

                  <Detail
                    label="Location"
                    value={selectedClinic.location}
                  />

                  <Detail
                    label="Registration Date"
                    value={formatDate(selectedClinic.registered)}
                  />

                  {selectedClinic.adminEmail && (
                    <Detail
                      label="Admin Email"
                      value={selectedClinic.adminEmail}
                    />
                  )}

                  {selectedClinic.adminPhone && (
                    <Detail
                      label="Admin Phone"
                      value={selectedClinic.adminPhone}
                    />
                  )}

                  <div>
                    <p className="sau-detail-label">Current Plan</p>
                    <StatusBadge value={selectedClinic.plan} />
                  </div>

                  <div>
                    <p className="sau-detail-label">Subscription</p>
                    <StatusBadge value={selectedClinic.subscription} />
                  </div>

                  <div>
                    <p className="sau-detail-label">Account Status</p>
                    <StatusBadge value={selectedClinic.status} />
                  </div>
                </div>

                <div className="sau-modal-section">
                  <h3>Social Media & Website</h3>

                  <div className="sau-social-links">
                    {selectedClinic.instagram && (
                      <a
                        href={selectedClinic.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaInstagram /> Instagram
                      </a>
                    )}

                    {selectedClinic.facebook && (
                      <a
                        href={selectedClinic.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaFacebook /> Facebook
                      </a>
                    )}

                    {selectedClinic.website && (
                      <a
                        href={selectedClinic.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaGlobe /> Website
                      </a>
                    )}

                    {!selectedClinic.instagram &&
                      !selectedClinic.facebook &&
                      !selectedClinic.website && (
                        <p className="sau-secondary">
                          No social media links available.
                        </p>
                      )}
                  </div>
                </div>

                <div className="sau-modal-actions">
                  <button disabled={busy}
                    type="button"
                    className="sau-button secondary"
                    onClick={() => openEdit(selectedClinic)}
                  >
                    <FaPen /> Edit
                  </button>

                  <button disabled={busy}
                    type="button"
                    className={
                      selectedClinic.status === "Suspended"
                        ? "sau-button"
                        : "sau-button danger"
                    }
                    onClick={toggleStatus}
                  >
                    {selectedClinic.status === "Suspended"
                      ? "Activate Account"
                      : "Suspend Account"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}