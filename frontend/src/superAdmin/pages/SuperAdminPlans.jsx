import { useEffect, useState } from "react";
import SuperAdminSidebar from "../components/SuperAdminSidebar";

import {
  FaPlus,
  FaPen,
  FaTrash,
  FaXmark,
  FaCheck,
  FaPaw,
  FaStethoscope,
  FaCrown,
  FaCircleCheck,
  FaListCheck,
} from "react-icons/fa6";

const FEATURES = [
  "Appointments",
  "Medical Records",
  "Pet Management",
  "Vaccinations",
  "Inventory",
  "Pharmacy",
  "Staff Management",
  "Reports & Analytics",
  "Billing & Invoices",
  "Multi-Branch Access",
  "Export Reports",
  "Priority Support",
];

const DEFAULT_PLANS = [
  {
    id: 1,
    name: "Basic",
    description: "Essential tools for small veterinary clinics.",
    monthlyPrice: 19,
    yearlyPrice: 190,
    status: "Active",
    features: [
      "Appointments",
      "Medical Records",
      "Pet Management",
      "Vaccinations",
    ],
  },
  {
    id: 2,
    name: "Professional",
    description: "Advanced tools for growing veterinary clinics.",
    monthlyPrice: 39,
    yearlyPrice: 390,
    status: "Active",
    features: [
      "Appointments",
      "Medical Records",
      "Pet Management",
      "Vaccinations",
      "Inventory",
      "Pharmacy",
      "Staff Management",
      "Reports & Analytics",
    ],
  },
  {
    id: 3,
    name: "Premium",
    description: "Complete management for larger clinics.",
    monthlyPrice: 69,
    yearlyPrice: 690,
    status: "Active",
    features: [...FEATURES],
  },
];

const EMPTY_PLAN = {
  name: "",
  description: "",
  monthlyPrice: "",
  yearlyPrice: "",
  status: "Active",
  features: [],
};

function loadPlans() {
  try {
    const saved = localStorage.getItem("sa_demo_plans");
    return saved ? JSON.parse(saved) : DEFAULT_PLANS;
  } catch {
    return DEFAULT_PLANS;
  }
}

const money = (value) => `$${Number(value || 0).toFixed(2)}`;

const styles = `
.sp-page, .sp-page * { box-sizing: border-box; }

.sp-page {
  display: flex !important;
  flex-direction: row !important;
  width: 100% !important;
  min-height: 100vh;
  margin: 0 !important;
  padding: 0 !important;
  background: #f5f8fa;
}

.sp-main {
  flex: 1 1 0% !important;
  min-width: 0 !important;
  width: auto !important;
  max-width: none !important;
  padding: 32px !important;
}

.sp-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 26px;
}

.sp-eyebrow {
  margin: 0 0 9px;
  color: #299d99;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1px;
}

.sp-header h1 {
  margin: 0 0 8px;
  color: #143743;
  font-size: 30px;
}

.sp-subtitle {
  margin: 0;
  color: #71838e;
  font-size: 14px;
  line-height: 1.6;
}

.sp-page .sp-btn,
.sp-overlay .sp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: auto !important;
  min-height: 40px;
  padding: 10px 16px !important;
  border: 0;
  border-radius: 9px;
  background: #39aaa5;
  color: white;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.sp-page .sp-btn:hover,
.sp-overlay .sp-btn:hover {
  background: #258f8a;
}

.sp-page .sp-btn.secondary,
.sp-overlay .sp-btn.secondary {
  background: #edf1f3;
  color: #344e5a;
}

.sp-page .sp-btn.danger,
.sp-overlay .sp-btn.danger {
  background: #fdeaea;
  color: #bb4d4d;
}

.sp-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 23px;
}

.sp-stat {
  padding: 22px;
  border: 1px solid #e9eff0;
  border-radius: 14px;
  background: white;
}

.sp-stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 43px;
  height: 43px;
  margin-bottom: 13px;
  border-radius: 11px;
  background: #edf8f7;
  color: #299d99;
  font-size: 19px;
}

.sp-stat h2 {
  margin: 0 0 6px;
  color: #173944;
  font-size: 28px;
}

.sp-stat p {
  margin: 0;
  color: #71838e;
  font-size: 13px;
}

.sp-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 24px;
}

.sp-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid #e9eff0;
  border-radius: 15px;
  background: white;
}

.sp-card-top {
  padding: 24px;
  background: #edf7ff;
  text-align: center;
}

.sp-card:nth-child(3n+2) .sp-card-top {
  background: #f1eaff;
}

.sp-card:nth-child(3n+3) .sp-card-top {
  background: #fff3e9;
}

.sp-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  margin: 0 auto 12px;
  border-radius: 13px;
  background: #ffffffaa;
  color: #299d99;
  font-size: 23px;
}

.sp-card-top h2 {
  margin: 0 0 8px;
  color: #173944;
  font-size: 21px;
}

.sp-description {
  min-height: 35px;
  margin: 0;
  color: #71838e;
  font-size: 12px;
  line-height: 1.5;
}

.sp-price {
  margin: 15px 0 5px;
  color: #143743;
  font-size: 29px;
  font-weight: 800;
}

.sp-price span {
  color: #71838e;
  font-size: 12px;
  font-weight: 400;
}

.sp-yearly {
  margin: 0;
  color: #71838e;
  font-size: 12px;
}

.sp-status {
  display: inline-block;
  margin-top: 13px;
  padding: 6px 11px;
  border-radius: 20px;
  background: #e4f8ee;
  color: #16825d;
  font-size: 11px;
  font-weight: 700;
}

.sp-status.inactive {
  background: #fdeaea;
  color: #bb4d4d;
}

.sp-card-body {
  padding: 21px;
}

.sp-feature {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-bottom: 12px;
  color: #344e5a;
  font-size: 13px;
}

.sp-feature svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: #23a67d;
}

.sp-feature-count {
  display: inline-block;
  margin: 8px 0 18px;
  padding: 6px 12px;
  border-radius: 20px;
  background: #f1f5f7;
  color: #627783;
  font-size: 11px;
}

.sp-actions {
  display: flex;
  gap: 8px;
}

.sp-actions .sp-btn.secondary {
  flex: 1;
}

.sp-panel {
  padding: 24px;
  border: 1px solid #e9eff0;
  border-radius: 15px;
  background: white;
}

.sp-panel h2 {
  margin: 0 0 18px;
  color: #173944;
  font-size: 19px;
}

.sp-table-wrap {
  overflow-x: auto;
}

.sp-table {
  width: 100%;
  min-width: 650px;
  border-collapse: collapse;
  text-align: left;
}

.sp-table th,
.sp-table td {
  padding: 13px;
  border-bottom: 1px solid #edf1f3;
  text-align: left;
  font-size: 12px;
}

.sp-table th {
  background: #f5f8fa;
  color: #71838e;
}

.sp-table td {
  color: #344e5a;
}

.sp-yes {
  color: #16a36b;
  font-weight: 800;
}

.sp-no {
  color: #db6666;
}

.sp-overlay {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(12,34,42,.55);
}

.sp-modal {
  width: 100%;
  max-width: 720px;
  max-height: 92vh;
  overflow-y: auto;
  padding: 26px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 20px 60px #0003;
}

/* TEAL MODAL HEADER */

.sp-modal-head {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  flex-direction: row !important;
  gap: 12px;
  margin: -26px -26px 24px;
  padding: 18px 24px;
  background: #55b8b5;
  border-radius: 16px 16px 0 0;
}

.sp-modal-head h2 {
  margin: 0 !important;
  color: #ffffff !important;
  font-size: 21px;
  font-weight: 700;
}

.sp-overlay .sp-modal-head .sp-close {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex: 0 0 30px !important;
  width: 30px !important;
  min-width: 30px !important;
  max-width: 30px !important;
  height: 30px !important;
  min-height: 30px !important;
  max-height: 30px !important;
  padding: 0 !important;
  margin: 0 !important;
  border: 0 !important;
  border-radius: 50% !important;
  background: rgba(255,255,255,.16) !important;
  color: #ffffff !important;
  font-size: 14px !important;
  cursor: pointer;
}

.sp-overlay .sp-modal-head .sp-close svg {
  width: 13px;
  height: 13px;
}

.sp-overlay .sp-modal-head .sp-close:hover {
  background: rgba(255,255,255,.28) !important;
}

.sp-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.sp-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.sp-field.full {
  grid-column: 1 / -1;
}

.sp-field label {
  color: #627783;
  font-size: 12px;
  font-weight: 700;
}

.sp-field input,
.sp-field textarea,
.sp-field select {
  width: 100%;
  padding: 11px 12px;
  border: 1px solid #dfe8ea;
  border-radius: 9px;
  background: white;
  color: #173944;
  font-size: 13px;
}

.sp-field textarea {
  min-height: 75px;
  resize: vertical;
}

.sp-section-title {
  margin: 24px 0 13px;
  color: #173944;
  font-size: 16px;
}

.sp-check-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.sp-check-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px;
  border: 1px solid #e7edef;
  border-radius: 9px;
  color: #344e5a;
  font-size: 13px;
  cursor: pointer;
}

.sp-check-item input {
  width: 16px;
  height: 16px;
  accent-color: #39aaa5;
}

.sp-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 25px;
}

.sp-empty {
  padding: 25px;
  color: #84939c;
  text-align: center;
}

@media (max-width: 1100px) {
  .sp-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .sp-page {
    display: block !important;
  }

  .sp-main {
    width: 100% !important;
    padding: 84px 18px 28px !important;
  }

  .sp-header {
    flex-direction: column;
  }

  .sp-stats,
  .sp-grid,
  .sp-form-grid,
  .sp-check-grid {
    grid-template-columns: 1fr;
  }

  .sp-panel {
    padding: 16px;
  }

  .sp-modal {
    padding: 18px;
  }

  .sp-modal-head {
    margin: -18px -18px 20px;
    padding: 16px 18px;
  }

  .sp-modal-head h2 {
    font-size: 18px;
  }
}
`;export default function SuperAdminPlans() {
  const [plans, setPlans] = useState(loadPlans);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_PLAN);

  useEffect(() => {
    localStorage.setItem("sa_demo_plans", JSON.stringify(plans));
  }, [plans]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_PLAN, features: [] });
    setModalOpen(true);
  };

  const openEdit = (plan) => {
    setEditingId(plan.id);
    setForm({ ...plan, features: [...plan.features] });
    setModalOpen(true);
  };

  const toggleFeature = (feature) => {
    setForm((previous) => ({
      ...previous,
      features: previous.features.includes(feature)
        ? previous.features.filter((item) => item !== feature)
        : [...previous.features, feature],
    }));
  };

  const savePlan = (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const monthlyPrice = Number(form.monthlyPrice);
    const yearlyPrice = Number(form.yearlyPrice);

    if (
      !name ||
      !Number.isFinite(monthlyPrice) ||
      !Number.isFinite(yearlyPrice) ||
      monthlyPrice < 0 ||
      yearlyPrice < 0
    ) {
      window.alert("Please enter valid plan details.");
      return;
    }

    const updated = {
      ...form,
      name,
      monthlyPrice,
      yearlyPrice,
    };

    if (editingId !== null) {
      setPlans((previous) =>
        previous.map((plan) =>
          plan.id === editingId
            ? { ...updated, id: editingId }
            : plan
        )
      );
    } else {
      setPlans((previous) => [
        ...previous,
        { ...updated, id: Date.now() },
      ]);
    }

    setModalOpen(false);
  };

  const deletePlan = (id) => {
    try {
      const subscriptions = JSON.parse(
        localStorage.getItem("sa_demo_subscriptions") || "[]"
      );

      if (subscriptions.some((item) => item.planId === id)) {
        window.alert(
          "This plan is used by subscriptions and cannot be deleted."
        );
        return;
      }
    } catch {
      // Continue with confirmation.
    }

    if (!window.confirm("Delete this plan?")) return;

    setPlans((previous) =>
      previous.filter((plan) => plan.id !== id)
    );
  };

  const icons = [FaPaw, FaStethoscope, FaCrown];

  return (
    <>
      <style>{styles}</style>

      <div className="sp-page">
        <SuperAdminSidebar />

        <main className="sp-main">
          <header className="sp-header">
            <div>
              <p className="sp-eyebrow">PLANS MANAGEMENT</p>
              <h1>Manage Plans</h1>

              <p className="sp-subtitle">
                Create subscription plans, manage pricing,
                features and permissions.
              </p>
            </div>

            <button
              type="button"
              className="sp-btn"
              onClick={openCreate}
            >
              <FaPlus /> New Plan
            </button>
          </header>

          <section className="sp-stats">
            {[
              {
                label: "Total Plans",
                value: plans.length,
                icon: FaCrown,
              },
              {
                label: "Active Plans",
                value: plans.filter(
                  (plan) => plan.status === "Active"
                ).length,
                icon: FaCircleCheck,
              },
              {
                label: "Available Features",
                value: FEATURES.length,
                icon: FaListCheck,
              },
            ].map(({ label, value, icon: Icon }) => (
              <article className="sp-stat" key={label}>
                <div className="sp-stat-icon">
                  <Icon />
                </div>
                <h2>{value}</h2>
                <p>{label}</p>
              </article>
            ))}
          </section>

          <section className="sp-grid">
            {plans.map((plan, index) => {
              const Icon = icons[index % icons.length];

              return (
                <article className="sp-card" key={plan.id}>
                  <div className="sp-card-top">
                    <div className="sp-card-icon">
                      <Icon />
                    </div>

                    <h2>{plan.name}</h2>

                    <p className="sp-description">
                      {plan.description}
                    </p>

                    <div className="sp-price">
                      {money(plan.monthlyPrice)}
                      <span> / month</span>
                    </div>

                    <p className="sp-yearly">
                      {money(plan.yearlyPrice)} / year
                    </p>

                    <span
                      className={`sp-status ${
                        plan.status === "Inactive" ? "inactive" : ""
                      }`}
                    >
                      {plan.status}
                    </span>
                  </div>

                  <div className="sp-card-body">
                    {plan.features.slice(0, 7).map((feature) => (
                      <div className="sp-feature" key={feature}>
                        <FaCheck />
                        {feature}
                      </div>
                    ))}

                    {plan.features.length === 0 && (
                      <p className="sp-empty">No features selected</p>
                    )}

                    <span className="sp-feature-count">
                      {plan.features.length} Features
                    </span>

                    <div className="sp-actions">
                      <button
                        type="button"
                        className="sp-btn secondary"
                        onClick={() => openEdit(plan)}
                      >
                        <FaPen /> Edit
                      </button>

                      <button
                        type="button"
                        className="sp-btn danger"
                        onClick={() => deletePlan(plan.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="sp-panel">
            <h2>Plans Comparison — Features & Permissions</h2>

            <div className="sp-table-wrap">
              <table className="sp-table">
                <thead>
                  <tr>
                    <th>Feature / Permission</th>

                    {plans.map((plan) => (
                      <th key={plan.id}>{plan.name}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {FEATURES.map((feature) => (
                    <tr key={feature}>
                      <td>{feature}</td>

                      {plans.map((plan) => (
                        <td key={plan.id}>
                          {plan.features.includes(feature) ? (
                            <span className="sp-yes">✓</span>
                          ) : (
                            <span className="sp-no">✕</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {/* CREATE / EDIT MODAL */}

      {modalOpen && (
        <div className="sp-overlay">
          <div
            className="sp-modal"
            role="dialog"
            aria-modal="true"
            aria-label={
              editingId !== null ? "Edit Plan" : "Create New Plan"
            }
          >
            {/* TEAL HEADER WITH SMALL X */}

            <div className="sp-modal-head">
              <h2>
                {editingId !== null
                  ? "Edit Plan"
                  : "Create New Plan"}
              </h2>

              <button
                type="button"
                className="sp-close"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
              >
                <FaXmark />
              </button>
            </div>

            <form onSubmit={savePlan}>
              <div className="sp-form-grid">
                <div className="sp-field full">
                  <label>Plan Name</label>

                  <input
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="e.g. Professional"
                  />
                </div>

                <div className="sp-field full">
                  <label>Description</label>

                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe this plan..."
                  />
                </div>

                <div className="sp-field">
                  <label>Monthly Price (USD)</label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.monthlyPrice}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        monthlyPrice: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="sp-field">
                  <label>Yearly Price (USD)</label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.yearlyPrice}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        yearlyPrice: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="sp-field full">
                  <label>Plan Status</label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value,
                      })
                    }
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              <h3 className="sp-section-title">
                Features & Permissions
              </h3>

              <div className="sp-check-grid">
                {FEATURES.map((feature) => (
                  <label className="sp-check-item" key={feature}>
                    <input
                      type="checkbox"
                      checked={form.features.includes(feature)}
                      onChange={() => toggleFeature(feature)}
                    />
                    {feature}
                  </label>
                ))}
              </div>

              <div className="sp-modal-actions">
                <button
                  type="button"
                  className="sp-btn secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="sp-btn">
                  <FaCheck />
                  {editingId !== null
                    ? "Save Changes"
                    : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}