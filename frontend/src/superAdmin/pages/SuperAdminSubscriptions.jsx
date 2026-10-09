
import { useEffect, useMemo, useState } from "react";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import {
  FaMagnifyingGlass,
  FaCreditCard,
  FaReceipt,
  FaPrint,
  FaXmark,
  FaCheck,
  FaMoneyBillWave,
  FaCircleCheck,
  FaClock,
} from "react-icons/fa6";

const DEFAULT_SUBSCRIPTIONS = [
  {
    id: 1001,
    clinic: "Happy Paws Veterinary Clinic",
    admin: "Dr. Sara Ahmed",
    email: "contact@happypaws.com",
    planId: 3,
    planName: "Premium",
    billing: "Monthly",
    amount: 69,
    discountType: "percent",
    discount: 0,
    status: "Paid",
    startDate: "2026-10-01",
    endDate: "2026-11-01",
    paidAt: "2026-10-01",
    paymentMethod: "Cash",
    notes: "",
  },
  {
    id: 1002,
    clinic: "Pet Care Clinic",
    admin: "Dr. Omar Khaled",
    email: "info@petcare.com",
    planId: 2,
    planName: "Professional",
    billing: "Yearly",
    amount: 390,
    discountType: "percent",
    discount: 10,
    status: "Unpaid",
    startDate: "2026-09-12",
    endDate: "2027-09-12",
    paidAt: "",
    paymentMethod: "",
    notes: "",
  },
  {
    id: 1003,
    clinic: "Animal Wellness Center",
    admin: "Dr. Maya Hassan",
    email: "hello@animalwellness.com",
    planId: 1,
    planName: "Basic",
    billing: "Monthly",
    amount: 19,
    discountType: "percent",
    discount: 0,
    status: "Unpaid",
    startDate: "2026-10-05",
    endDate: "2026-11-05",
    paidAt: "",
    paymentMethod: "",
    notes: "",
  },
  {
    id: 1004,
    clinic: "Healthy Tails Clinic",
    admin: "Dr. Karim Mansour",
    email: "support@healthytails.com",
    planId: 3,
    planName: "Premium",
    billing: "Yearly",
    amount: 690,
    discountType: "percent",
    discount: 20,
    status: "Paid",
    startDate: "2026-08-20",
    endDate: "2027-08-20",
    paidAt: "2026-08-20",
    paymentMethod: "Bank Transfer",
    notes: "",
  },
  {
    id: 1005,
    clinic: "Pawfect Vet",
    admin: "Dr. Lina Nasser",
    email: "contact@pawfectvet.com",
    planId: 2,
    planName: "Professional",
    billing: "Monthly",
    amount: 39,
    discountType: "percent",
    discount: 0,
    status: "Unpaid",
    startDate: "2026-10-08",
    endDate: "2026-11-08",
    paidAt: "",
    paymentMethod: "",
    notes: "",
  },
];

function loadSubscriptions() {
  try {
    const saved = localStorage.getItem("sa_demo_subscriptions");
    return saved ? JSON.parse(saved) : DEFAULT_SUBSCRIPTIONS;
  } catch {
    return DEFAULT_SUBSCRIPTIONS;
  }
}

const money = (value) => `$${Number(value || 0).toFixed(2)}`;

function calculatePayment(item) {
  const amount = Math.max(0, Number(item.amount) || 0);
  const discount = Math.max(0, Number(item.discount) || 0);

  const discountAmount =
    item.discountType === "fixed"
      ? Math.min(amount, discount)
      : (amount * Math.min(discount, 100)) / 100;

  return {
    subtotal: amount,
    discountAmount,
    total: Math.max(0, amount - discountAmount),
  };
}

const styles = `
.ss-page, .ss-page * { box-sizing: border-box; }

.ss-page {
  display: flex !important;
  flex-direction: row !important;
  width: 100% !important;
  min-height: 100vh;
  margin: 0 !important;
  padding: 0 !important;
  background: #f5f8fa;
}

.ss-main {
  flex: 1 1 0% !important;
  min-width: 0 !important;
  width: auto !important;
  max-width: none !important;
  padding: 32px !important;
}

.ss-header {
  margin-bottom: 25px;
}

.ss-eyebrow {
  margin: 0 0 9px;
  color: #299d99;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1px;
}

.ss-header h1 {
  margin: 0 0 9px;
  color: #143743;
  font-size: 30px;
}

.ss-subtitle {
  margin: 0;
  color: #71838e;
  font-size: 14px;
  line-height: 1.6;
}

.ss-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 22px;
}

.ss-stat {
  padding: 22px;
  border: 1px solid #e9eff0;
  border-radius: 14px;
  background: white;
}

.ss-stat-icon {
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

.ss-stat-value {
  margin: 0 0 6px;
  color: #173944;
  font-size: 27px;
  font-weight: 800;
}

.ss-stat-label {
  margin: 0;
  color: #71838e;
  font-size: 13px;
}

.ss-panel {
  padding: 24px;
  border: 1px solid #e9eff0;
  border-radius: 15px;
  background: white;
}

.ss-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 20px;
}

.ss-panel-head h2 {
  margin: 0;
  color: #173944;
  font-size: 19px;
}

.ss-count {
  color: #71838e;
  font-size: 12px;
}

.ss-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 11px;
  margin-bottom: 20px;
}

.ss-search {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1 1 230px;
  max-width: 400px;
  height: 44px;
  padding: 0 12px;
  border: 1px solid #e0e9eb;
  border-radius: 9px;
  background: #fafcfc;
  color: #829096;
}

.ss-search input {
  flex: 1;
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #173944;
  font-size: 13px;
}

.ss-select {
  height: 44px;
  min-width: 145px;
  padding: 0 12px;
  border: 1px solid #e0e9eb;
  border-radius: 9px;
  background: #fafcfc;
  color: #344e5a;
  font-size: 13px;
}

.ss-table-wrap {
  width: 100%;
  overflow-x: auto;
}

.ss-table {
  width: 100%;
  min-width: 1100px;
  border-collapse: collapse;
  text-align: left;
}

.ss-table th,
.ss-table td {
  padding: 14px 11px;
  border-bottom: 1px solid #edf1f3;
  text-align: left;
  font-size: 12px;
}

.ss-table th {
  background: #f5f8fa;
  color: #71838e;
  font-weight: 700;
  white-space: nowrap;
}

.ss-table td {
  color: #344e5a;
}

.ss-table tbody tr:hover {
  background: #f8fbfb;
}

.ss-clinic {
  color: #173944;
  font-weight: 700;
}

.ss-muted {
  margin-top: 4px;
  color: #84939c;
  font-size: 11px;
}

.ss-badge {
  display: inline-block;
  padding: 6px 10px;
  border-radius: 20px;
  background: #edf1f3;
  color: #627783;
  font-size: 11px;
  font-weight: 700;
}

.ss-badge.paid {
  background: #e4f8ee;
  color: #16825d;
}

.ss-badge.unpaid {
  background: #fdeaea;
  color: #bb4d4d;
}

.ss-badge.premium {
  background: #f3ebff;
  color: #8250e6;
}

.ss-badge.professional {
  background: #e9f5ff;
  color: #168ce6;
}

.ss-badge.basic {
  background: #eef2f4;
  color: #607481;
}

.ss-page .ss-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: auto !important;
  min-height: 37px;
  padding: 9px 13px !important;
  border: 0;
  border-radius: 8px;
  background: #39aaa5;
  color: white;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.ss-page .ss-btn:hover {
  background: #258f8a;
}

.ss-page .ss-btn.secondary {
  background: #edf1f3;
  color: #344e5a;
}

.ss-actions {
  display: flex;
  align-items: center;
  gap: 7px;
}

.ss-empty {
  padding: 40px;
  color: #84939c;
  text-align: center;
}

.ss-overlay {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(12,34,42,.55);
}

.ss-modal {
  width: 100%;
  max-width: 560px;
  max-height: 92vh;
  overflow-y: auto;
  padding: 27px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 20px 60px #0003;
}

.ss-modal.invoice {
  max-width: 800px;
}

.ss-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.ss-modal-head h2 {
  margin: 0;
  color: #173944;
  font-size: 22px;
}

.ss-page .ss-close {
  width: 35px !important;
  height: 35px;
  border: 0;
  border-radius: 8px;
  background: #edf1f3;
  color: #344e5a;
  cursor: pointer;
}

.ss-clinic-box {
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 11px;
  background: #f4f9fa;
}

.ss-clinic-box strong {
  display: block;
  color: #173944;
  font-size: 15px;
}

.ss-clinic-box span {
  display: block;
  margin-top: 6px;
  color: #71838e;
  font-size: 12px;
}

.ss-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.ss-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.ss-field.full {
  grid-column: 1 / -1;
}

.ss-field label {
  color: #627783;
  font-size: 12px;
  font-weight: 700;
}

.ss-field input,
.ss-field select,
.ss-field textarea {
  width: 100%;
  padding: 11px 12px;
  border: 1px solid #dfe8ea;
  border-radius: 9px;
  background: white;
  color: #173944;
  font-size: 13px;
}

.ss-field textarea {
  min-height: 70px;
  resize: vertical;
}

.ss-totals {
  margin-top: 20px;
  padding: 17px;
  border-radius: 11px;
  background: #f4f9fa;
}

.ss-total-row {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding: 8px 0;
  color: #627783;
  font-size: 13px;
}

.ss-total-row.final {
  margin-top: 8px;
  padding-top: 15px;
  border-top: 1px solid #dfe8ea;
  color: #173944;
  font-size: 17px;
  font-weight: 800;
}

.ss-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
}

.ss-invoice {
  max-width: 760px;
  margin: 0 auto;
  padding: 30px;
  background: white;
  color: #173944;
}

.ss-invoice-top {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding-bottom: 25px;
  border-bottom: 2px solid #39aaa5;
}

.ss-invoice-top h1 {
  margin: 0;
  font-size: 30px;
}

.ss-invoice-top p {
  margin: 5px 0;
  color: #71838e;
  font-size: 12px;
}

.ss-invoice-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 25px 0;
}

.ss-invoice-info h3 {
  color: #71838e;
  font-size: 12px;
}

.ss-invoice-info p {
  margin: 6px 0;
  font-size: 13px;
}

.ss-invoice-table {
  width: 100%;
  margin: 20px 0;
  border-collapse: collapse;
}

.ss-invoice-table th,
.ss-invoice-table td {
  padding: 13px;
  border-bottom: 1px solid #e7edef;
  text-align: left;
  font-size: 13px;
}

.ss-invoice-table th {
  background: #f4f9fa;
}

.ss-invoice-total {
  margin-top: 20px;
  color: #173944;
  font-size: 21px;
  font-weight: 800;
  text-align: right;
}

.ss-invoice-footer {
  margin-top: 45px;
  padding-top: 20px;
  border-top: 1px solid #e7edef;
  color: #84939c;
  font-size: 12px;
  text-align: center;
}

@media (max-width: 950px) {
  .ss-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .ss-page {
    display: block !important;
  }

  .ss-main {
    width: 100% !important;
    padding: 84px 18px 28px !important;
  }

  .ss-panel {
    padding: 16px;
  }

  .ss-form-grid,
  .ss-invoice-info {
    grid-template-columns: 1fr;
  }

  .ss-modal {
    padding: 18px;
  }
}

@media print {
  body * {
    visibility: hidden !important;
  }

  #ss-print-area,
  #ss-print-area * {
    visibility: visible !important;
  }

  #ss-print-area {
    position: absolute !important;
    left: 0;
    top: 0;
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .ss-no-print {
    display: none !important;
  }

  @page {
    size: A4;
    margin: 15mm;
  }
}
`;

function Badge({ value }) {
  return (
    <span className={`ss-badge ${String(value).toLowerCase()}`}>
      {value}
    </span>
  );
}

export default function SuperAdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState(
    loadSubscriptions
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");

  const [paymentId, setPaymentId] = useState(null);
  const [paymentDraft, setPaymentDraft] = useState(null);
  const [invoiceId, setInvoiceId] = useState(null);

  useEffect(() => {
    localStorage.setItem(
      "sa_demo_subscriptions",
      JSON.stringify(subscriptions)
    );
  }, [subscriptions]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return subscriptions.filter((item) => {
      const matchesSearch = [
        item.clinic,
        item.admin,
        item.email,
        item.planName,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

      return (
        matchesSearch &&
        (statusFilter === "All" ||
          item.status === statusFilter) &&
        (planFilter === "All" ||
          item.planName === planFilter)
      );
    });
  }, [subscriptions, search, statusFilter, planFilter]);

  const paid = subscriptions.filter(
    (item) => item.status === "Paid"
  );

  const totalCollected = paid.reduce(
    (sum, item) => sum + calculatePayment(item).total,
    0
  );

  const paymentItem = subscriptions.find(
    (item) => item.id === paymentId
  );

  const invoiceItem = subscriptions.find(
    (item) => item.id === invoiceId
  );

  const paymentTotals = paymentDraft
    ? calculatePayment(paymentDraft)
    : null;

  const invoiceTotals = invoiceItem
    ? calculatePayment(invoiceItem)
    : null;

  const openPayment = (item) => {
    setPaymentId(item.id);
    setPaymentDraft({
      ...item,
      paymentMethod: item.paymentMethod || "Cash",
    });
  };

  const savePayment = (event) => {
    event.preventDefault();

    if (!paymentDraft) return;

    const discount = Number(paymentDraft.discount);

    if (
      !Number.isFinite(discount) ||
      discount < 0 ||
      (paymentDraft.discountType === "percent" &&
        discount > 100) ||
      (paymentDraft.discountType === "fixed" &&
        discount > Number(paymentDraft.amount))
    ) {
      window.alert("Please enter a valid discount.");
      return;
    }

    const updated = {
      ...paymentDraft,
      discount,
      status: "Paid",
      paidAt: new Date().toISOString().slice(0, 10),
    };

    setSubscriptions((previous) =>
      previous.map((item) =>
        item.id === paymentId ? updated : item
      )
    );

    setPaymentId(null);
    setPaymentDraft(null);
    setInvoiceId(updated.id);
  };

  return (
    <>
      <style>{styles}</style>

      <div className="ss-page">
        <SuperAdminSidebar />

        <main className="ss-main">
          <header className="ss-header">
            <p className="ss-eyebrow">
              SUBSCRIPTION MANAGEMENT
            </p>

            <h1>Subscription Records</h1>

            <p className="ss-subtitle">
              Manage clinic subscriptions, discounts,
              payments and invoices.
            </p>
          </header>

          <section className="ss-stats">
            {[
              {
                label: "Total Subscriptions",
                value: subscriptions.length,
                icon: FaCreditCard,
              },
              {
                label: "Paid Subscriptions",
                value: paid.length,
                icon: FaCircleCheck,
              },
              {
                label: "Total Collected",
                value: money(totalCollected),
                icon: FaMoneyBillWave,
              },
            ].map(({ label, value, icon: Icon }) => (
              <article className="ss-stat" key={label}>
                <div className="ss-stat-icon">
                  <Icon />
                </div>
                <h2 className="ss-stat-value">{value}</h2>
                <p className="ss-stat-label">{label}</p>
              </article>
            ))}
          </section>

          <section className="ss-panel">
            <div className="ss-panel-head">
              <h2>All Subscriptions</h2>
              <span className="ss-count">
                {filtered.length} records
              </span>
            </div>

            <div className="ss-toolbar">
              <label className="ss-search">
                <FaMagnifyingGlass />

                <input
                  type="search"
                  placeholder="Search clinic, admin or plan..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>

              <select
                className="ss-select"
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
              >
                <option value="All">All Plans</option>
                <option>Basic</option>
                <option>Professional</option>
                <option>Premium</option>
              </select>

              <select
                className="ss-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Payments</option>
                <option>Paid</option>
                <option>Unpaid</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="ss-empty">
                No subscriptions found.
              </div>
            ) : (
              <div className="ss-table-wrap">
                <table className="ss-table">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Clinic / Admin</th>
                      <th>Plan</th>
                      <th>Billing</th>
                      <th>Amount</th>
                      <th>Discount</th>
                      <th>Final Amount</th>
                      <th>Status</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((item) => {
                      const totals = calculatePayment(item);

                      return (
                        <tr key={item.id}>
                          <td>INV-{item.id}</td>

                          <td>
                            <div className="ss-clinic">
                              {item.clinic}
                            </div>
                            <div className="ss-muted">
                              {item.admin}
                            </div>
                          </td>

                          <td>
                            <Badge value={item.planName} />
                          </td>

                          <td>{item.billing}</td>
                          <td>{money(item.amount)}</td>

                          <td>
                            {item.discount}
                            {item.discountType === "percent"
                              ? "%"
                              : " USD"}
                          </td>

                          <td>
                            <strong>
                              {money(totals.total)}
                            </strong>
                          </td>

                          <td>
                            <Badge value={item.status} />
                          </td>

                          <td>{item.startDate}</td>
                          <td>{item.endDate}</td>

                          <td>
                            <div className="ss-actions">
                              {item.status === "Unpaid" ? (
                                <button
                                  className="ss-btn"
                                  onClick={() => openPayment(item)}
                                >
                                  <FaCreditCard /> Pay
                                </button>
                              ) : (
                                <button
                                  className="ss-btn secondary"
                                  onClick={() =>
                                    setInvoiceId(item.id)
                                  }
                                >
                                  <FaReceipt /> Invoice
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* PAYMENT MODAL */}
      {paymentItem && paymentDraft && (
        <div className="ss-overlay">
          <div
            className="ss-modal"
            role="dialog"
            aria-modal="true"
          >
            <div className="ss-modal-head">
              <h2>Process Payment</h2>

              <button
                className="ss-close"
                onClick={() => {
                  setPaymentId(null);
                  setPaymentDraft(null);
                }}
                aria-label="Close"
              >
                <FaXmark />
              </button>
            </div>

            <div className="ss-clinic-box">
              <strong>{paymentItem.clinic}</strong>
              <span>{paymentItem.admin}</span>
              <span>{paymentItem.email}</span>
            </div>

            <form onSubmit={savePayment}>
              <div className="ss-form-grid">
                <div className="ss-field">
                  <label>Plan</label>
                  <input value={paymentDraft.planName} readOnly />
                </div>

                <div className="ss-field">
                  <label>Billing Cycle</label>
                  <input value={paymentDraft.billing} readOnly />
                </div>

                <div className="ss-field">
                  <label>Original Amount</label>
                  <input
                    value={money(paymentDraft.amount)}
                    readOnly
                  />
                </div>

                <div className="ss-field">
                  <label>Discount Type</label>

                  <select
                    value={paymentDraft.discountType}
                    onChange={(e) =>
                      setPaymentDraft({
                        ...paymentDraft,
                        discountType: e.target.value,
                        discount: 0,
                      })
                    }
                  >
                    <option value="percent">
                      Percentage (%)
                    </option>
                    <option value="fixed">
                      Fixed Amount ($)
                    </option>
                  </select>
                </div>

                <div className="ss-field">
                  <label>Discount</label>

                  <input
                    type="number"
                    min="0"
                    max={
                      paymentDraft.discountType === "percent"
                        ? 100
                        : paymentDraft.amount
                    }
                    step="0.01"
                    value={paymentDraft.discount}
                    onChange={(e) =>
                      setPaymentDraft({
                        ...paymentDraft,
                        discount: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="ss-field">
                  <label>Payment Method</label>

                  <select
                    value={paymentDraft.paymentMethod}
                    onChange={(e) =>
                      setPaymentDraft({
                        ...paymentDraft,
                        paymentMethod: e.target.value,
                      })
                    }
                  >
                    <option>Cash</option>
                    <option>Bank Transfer</option>
                    <option>Card (Recorded Manually)</option>
                  </select>
                </div>

                <div className="ss-field full">
                  <label>Payment Notes (Optional)</label>

                  <textarea
                    value={paymentDraft.notes}
                    onChange={(e) =>
                      setPaymentDraft({
                        ...paymentDraft,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Add notes..."
                  />
                </div>
              </div>

              <div className="ss-totals">
                <div className="ss-total-row">
                  <span>Subtotal</span>
                  <strong>
                    {money(paymentTotals.subtotal)}
                  </strong>
                </div>

                <div className="ss-total-row">
                  <span>Discount</span>
                  <strong>
                    - {money(paymentTotals.discountAmount)}
                  </strong>
                </div>

                <div className="ss-total-row final">
                  <span>Final Amount</span>
                  <span>{money(paymentTotals.total)}</span>
                </div>
              </div>

              <div className="ss-modal-actions">
                <button
                  type="button"
                  className="ss-btn secondary"
                  onClick={() => {
                    setPaymentId(null);
                    setPaymentDraft(null);
                  }}
                >
                  Cancel
                </button>

                <button type="submit" className="ss-btn">
                  <FaCheck /> Pay & Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVOICE MODAL */}
      {invoiceItem && (
        <div className="ss-overlay">
          <div
            className="ss-modal invoice"
            role="dialog"
            aria-modal="true"
          >
            <div className="ss-modal-head ss-no-print">
              <h2>Invoice Preview</h2>

              <button
                className="ss-close"
                onClick={() => setInvoiceId(null)}
                aria-label="Close"
              >
                <FaXmark />
              </button>
            </div>

            <div id="ss-print-area" className="ss-invoice">
              <div className="ss-invoice-top">
                <div>
                  <h1>INVOICE</h1>
                  <p>
                    Veterinary Clinic Management System
                  </p>
                  <p>Super Admin — Subscription Billing</p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <strong>INV-{invoiceItem.id}</strong>
                  <p>Date: {invoiceItem.paidAt}</p>
                  <p>Status: PAID</p>
                </div>
              </div>

              <div className="ss-invoice-info">
                <div>
                  <h3>BILL TO</h3>
                  <p>
                    <strong>{invoiceItem.clinic}</strong>
                  </p>
                  <p>{invoiceItem.admin}</p>
                  <p>{invoiceItem.email}</p>
                </div>

                <div>
                  <h3>SUBSCRIPTION DETAILS</h3>
                  <p>Plan: {invoiceItem.planName}</p>
                  <p>Billing: {invoiceItem.billing}</p>
                  <p>Start: {invoiceItem.startDate}</p>
                  <p>End: {invoiceItem.endDate}</p>
                  <p>Payment: {invoiceItem.paymentMethod}</p>
                </div>
              </div>

              <table className="ss-invoice-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Billing</th>
                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>
                      {invoiceItem.planName} Subscription
                    </td>
                    <td>{invoiceItem.billing}</td>
                    <td>
                      {money(invoiceTotals.subtotal)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="ss-total-row">
                <span>Subtotal</span>
                <strong>
                  {money(invoiceTotals.subtotal)}
                </strong>
              </div>

              <div className="ss-total-row">
                <span>
                  Discount (
                  {invoiceItem.discountType === "percent"
                    ? `${invoiceItem.discount}%`
                    : "Fixed"}
                  )
                </span>

                <strong>
                  - {money(invoiceTotals.discountAmount)}
                </strong>
              </div>

              <div className="ss-invoice-total">
                Total Paid: {money(invoiceTotals.total)}
              </div>

              <div className="ss-invoice-footer">
                Thank you for your business!
              </div>
            </div>

            <div className="ss-modal-actions ss-no-print">
              <button
                className="ss-btn secondary"
                onClick={() => setInvoiceId(null)}
              >
                Close
              </button>

              <button
                className="ss-btn"
                onClick={() => window.print()}
              >
                <FaPrint /> Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
