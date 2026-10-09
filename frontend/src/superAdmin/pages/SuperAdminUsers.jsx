
import { useMemo, useState } from "react";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import {
  FaUsers,
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
  FaEnvelope,
  FaPhone,
  FaLocationDot,
  FaCrown,
  FaUserShield,
} from "react-icons/fa6";

// ==========================================
// HARDCODED DEMO DATA
// ==========================================

const initialClinics = [
  {
    id: 1,
    clinicName: "Happy Paws Veterinary Clinic",
    adminName: "Dr. Sara Ahmed",
    email: "contact@happypaws.com",
    phone: "+961 70 123 456",
    location: "Beirut, Lebanon",
    plan: "Premium",
    subscription: "Active",
    status: "Active",
    registered: "2026-09-12",
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    website: "https://example.com",
  },
  {
    id: 2,
    clinicName: "Pet Care Clinic",
    adminName: "Dr. Omar Khaled",
    email: "info@petcare.com",
    phone: "+961 71 234 567",
    location: "Baabda, Lebanon",
    plan: "Professional",
    subscription: "Active",
    status: "Active",
    registered: "2026-08-21",
    instagram: "https://instagram.com/",
    facebook: "",
    website: "",
  },
  {
    id: 3,
    clinicName: "Animal Wellness Center",
    adminName: "Dr. Maya Hassan",
    email: "hello@animalwellness.com",
    phone: "+961 76 345 678",
    location: "Jounieh, Lebanon",
    plan: "Basic",
    subscription: "Pending",
    status: "Pending",
    registered: "2026-10-02",
    instagram: "",
    facebook: "https://facebook.com/",
    website: "",
  },
  {
    id: 4,
    clinicName: "Healthy Tails Clinic",
    adminName: "Dr. Karim Mansour",
    email: "support@healthytails.com",
    phone: "+961 03 456 789",
    location: "Tripoli, Lebanon",
    plan: "Premium",
    subscription: "Expired",
    status: "Suspended",
    registered: "2026-07-15",
    instagram: "",
    facebook: "",
    website: "https://example.com",
  },
  {
    id: 5,
    clinicName: "Pawfect Vet",
    adminName: "Dr. Lina Nasser",
    email: "contact@pawfectvet.com",
    phone: "+961 81 567 890",
    location: "Saida, Lebanon",
    plan: "Professional",
    subscription: "Active",
    status: "Active",
    registered: "2026-09-28",
    instagram: "https://instagram.com/",
    facebook: "",
    website: "",
  },
];

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

.sau-header h1 {
  margin: 0 0 9px;
  color: #143743;
  font-size: clamp(24px, 2.6vw, 32px);
}

.sau-subtitle {
  margin: 0;
  color: #71838e;
  font-size: 14px;
  line-height: 1.6;
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

.sau-count {
  color: #71838e;
  font-size: 13px;
}

.sau-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.sau-search {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1 1 260px;
  min-width: 0;
  max-width: 430px;
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

.sau-select {
  height: 44px;
  min-width: 155px;
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

.sau-empty {
  padding: 55px 20px;
  text-align: center;
  color: #84939c;
  font-size: 14px;
}

.sau-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(12,34,42,.55);
}

.sau-modal {
  width: 100%;
  max-width: 650px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 26px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 20px 60px rgba(0,0,0,.18);
}

.sau-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 22px;
}

.sau-modal-header h2 {
  margin: 0 0 6px;
  color: #173944;
  font-size: 22px;
}

.sau-modal-header p {
  margin: 0;
  color: #84939c;
  font-size: 13px;
}

.sau-page .sau-close {
  width: 34px !important;
  height: 34px;
  padding: 0 !important;
  border: 0;
  border-radius: 8px;
  background: #f1f4f5;
  color: #607481;
  cursor: pointer;
}

.sau-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
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

.sau-modal-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}

.sau-page .sau-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: auto !important;
  min-height: 42px;
  padding: 10px 17px !important;
  border: 0;
  border-radius: 9px;
  background: #39aaa5;
  color: white;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.sau-page .sau-button.secondary {
  background: #edf1f3;
  color: #344e5a;
}

.sau-page .sau-button.danger {
  background: #fdeaea;
  color: #bb4d4d;
}

.sau-edit-grid {
  display: grid;
  grid-template-columns: repeat(2,minmax(0,1fr));
  gap: 15px;
}

.sau-edit-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.sau-edit-field.full {
  grid-column: 1 / -1;
}

.sau-edit-field label {
  color: #627783;
  font-size: 12px;
  font-weight: 600;
}

.sau-edit-field input,
.sau-edit-field select {
  width: 100%;
  height: 42px;
  padding: 0 12px;
  border: 1px solid #e0e9eb;
  border-radius: 9px;
  background: white;
  color: #173944;
  font-size: 13px;
}

@media(max-width:1100px) {
  .sau-stats {
    grid-template-columns: repeat(2,minmax(0,1fr));
  }
}

@media(max-width:768px) {
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

@media(max-width:480px) {
  .sau-stats {
    grid-template-columns: 1fr;
  }

  .sau-main {
    padding: 84px 14px 24px !important;
  }

  .sau-modal {
    padding: 18px;
  }
}
`;

const formatDate = (value) =>
  new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));

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
  const [clinics, setClinics] = useState(initialClinics);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);

  const selectedClinic = clinics.find(
    (clinic) => clinic.id === selectedId
  );

  const filteredClinics = useMemo(() => {
    const query = search.toLowerCase().trim();

    return clinics.filter((clinic) => {
      const matchesSearch = [
        clinic.clinicName,
        clinic.adminName,
        clinic.email,
        clinic.location,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

      const matchesPlan =
        planFilter === "All" || clinic.plan === planFilter;

      const matchesStatus =
        statusFilter === "All" || clinic.status === statusFilter;

      return matchesSearch && matchesPlan && matchesStatus;
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
      value: clinics.filter((c) => c.status === "Active").length,
      icon: FaCircleCheck,
      color: "green",
    },
    {
      title: "Pending Clinics",
      value: clinics.filter((c) => c.status === "Pending").length,
      icon: FaClock,
      color: "orange",
    },
    {
      title: "Clinic Admins",
      value: clinics.length,
      icon: FaUserShield,
      color: "purple",
    },
  ];

  const openDetails = (clinic) => {
    setSelectedId(clinic.id);
    setEditing(false);
    setDraft(null);
  };

  const openEdit = (clinic) => {
    setSelectedId(clinic.id);
    setDraft({ ...clinic });
    setEditing(true);
  };

  const closeModal = () => {
    setSelectedId(null);
    setEditing(false);
    setDraft(null);
  };

  const saveEdit = (event) => {
    event.preventDefault();

    setClinics((previous) =>
      previous.map((clinic) =>
        clinic.id === draft.id ? { ...draft } : clinic
      )
    );

    setEditing(false);
    setDraft(null);
  };

  const toggleStatus = () => {
    if (!selectedClinic) return;

    const nextStatus =
      selectedClinic.status === "Suspended"
        ? "Active"
        : "Suspended";

    setClinics((previous) =>
      previous.map((clinic) =>
        clinic.id === selectedId
          ? { ...clinic, status: nextStatus }
          : clinic
      )
    );
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
            <p className="sau-eyebrow">
              PLATFORM MANAGEMENT
            </p>

            <h1>Admin & Users</h1>

            <p className="sau-subtitle">
              Manage registered clinics, administrators,
              contact details and subscription information.
            </p>
          </header>

          <section className="sau-stats">
            {overview.map(({ title, value, icon: Icon, color }) => (
              <article
                key={title}
                className={`sau-stat ${color}`}
              >
                <div className="sau-stat-icon">
                  <Icon />
                </div>

                <h2 className="sau-stat-value">
                  {value}
                </h2>

                <p className="sau-stat-label">
                  {title}
                </p>
              </article>
            ))}
          </section>

          <section className="sau-panel">
            <div className="sau-panel-top">
              <h2>Registered Clinics</h2>

              <span className="sau-count">
                Showing {filteredClinics.length} of {clinics.length}
              </span>
            </div>

            <div className="sau-toolbar">
              <label className="sau-search">
                <FaMagnifyingGlass />
                <input
                  type="search"
                  placeholder="Search clinic, admin or email..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />
              </label>

              <select
                className="sau-select"
                value={planFilter}
                onChange={(event) =>
                  setPlanFilter(event.target.value)
                }
              >
                <option value="All">All Plans</option>
                <option value="Basic">Basic</option>
                <option value="Professional">Professional</option>
                <option value="Premium">Premium</option>
              </select>

              <select
                className="sau-select"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            {filteredClinics.length === 0 ? (
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
                      <th>Status</th>
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
                            {clinic.location}
                          </div>
                        </td>

                        <td>{clinic.adminName}</td>
                        <td>{clinic.email}</td>

                        <td>
                          <StatusBadge value={clinic.plan} />
                        </td>

                        <td>
                          <StatusBadge value={clinic.subscription} />
                        </td>

                        <td>
                          <StatusBadge value={clinic.status} />
                        </td>

                        <td>
                          <div className="sau-actions">
                            <button
                              type="button"
                              className="sau-icon-button"
                              title="View details"
                              onClick={() => openDetails(clinic)}
                            >
                              <FaEye />
                            </button>

                            <button
                              type="button"
                              className="sau-icon-button"
                              title="Edit clinic"
                              onClick={() => openEdit(clinic)}
                            >
                              <FaPen />
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

      {selectedClinic && (
        <div
          className="sau-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className="sau-modal"
            role="dialog"
            aria-modal="true"
            aria-label={
              editing ? "Edit clinic" : "Clinic details"
            }
          >
            <div className="sau-modal-header">
              <div>
                <h2>
                  {editing
                    ? "Edit Clinic"
                    : selectedClinic.clinicName}
                </h2>

                <p>
                  {editing
                    ? "Update clinic information"
                    : "Clinic profile and subscription details"}
                </p>
              </div>

              <button
                type="button"
                className="sau-close"
                onClick={closeModal}
                aria-label="Close"
              >
                <FaXmark />
              </button>
            </div>

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
                            : "text"
                        }
                        value={draft[field]}
                        onChange={(event) =>
                          updateDraft(field, event.target.value)
                        }
                        required={[
                          "clinicName",
                          "adminName",
                          "email",
                        ].includes(field)}
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
                        updateDraft(
                          "subscription",
                          event.target.value
                        )
                      }
                    >
                      <option>Active</option>
                      <option>Pending</option>
                      <option>Expired</option>
                    </select>
                  </div>
                </div>

                <div className="sau-modal-actions">
                  <button
                    type="button"
                    className="sau-button secondary"
                    onClick={() => {
                      setEditing(false);
                      setDraft(null);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="sau-button"
                  >
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
                    value={formatDate(
                      selectedClinic.registered
                    )}
                  />

                  <div>
                    <p className="sau-detail-label">
                      Current Plan
                    </p>
                    <StatusBadge value={selectedClinic.plan} />
                  </div>

                  <div>
                    <p className="sau-detail-label">
                      Subscription
                    </p>
                    <StatusBadge
                      value={selectedClinic.subscription}
                    />
                  </div>

                  <div>
                    <p className="sau-detail-label">
                      Account Status
                    </p>
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
                  <button
                    type="button"
                    className="sau-button secondary"
                    onClick={() => openEdit(selectedClinic)}
                  >
                    <FaPen />
                    Edit
                  </button>

                  <button
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
