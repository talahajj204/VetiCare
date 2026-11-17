import { subscriptionsRequest } from "../api/subscriptionsApi";
import { useEffect, useMemo, useRef, useState } from "react";
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
  FaPenToSquare,
  FaTrash,
  FaTriangleExclamation,
  FaPlus,
} from "react-icons/fa6";

const round = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const money = (value) => `$${round(value || 0).toFixed(2)}`;

const today = () => {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

function calculateEndDate(startDate, billing) {
  if (!startDate) return "";

  const [year, month, day] = startDate.split("-").map(Number);
  const monthsToAdd = billing === "Yearly" ? 12 : 1;
  const target = new Date(year, month - 1 + monthsToAdd, 1);

  const lastDay = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0
  ).getDate();

  target.setDate(Math.min(day, lastDay));

  return [
    target.getFullYear(),
    String(target.getMonth() + 1).padStart(2, "0"),
    String(target.getDate()).padStart(2, "0"),
  ].join("-");
}

/* DISCOUNT IS ALWAYS A PERCENTAGE */

function calculatePayment(item) {
  const subtotal = round(Math.max(0, Number(item.amount) || 0));

  const discount = Math.min(
    100,
    Math.max(0, Number(item.discount) || 0)
  );

  const discountAmount = round((subtotal * discount) / 100);

  const total = round(Math.max(0, subtotal - discountAmount));

  const paid = round(
    (item.payments || []).reduce(
      (sum, payment) =>
        sum + Math.max(0, Number(payment.amount) || 0),
      0
    )
  );

  const remaining = round(Math.max(0, total - paid));

  const status =
    remaining <= 0
      ? "Paid"
      : paid > 0
        ? "Partially Paid"
        : "Unpaid";

  return {
    subtotal,
    discount,
    discountAmount,
    total,
    paid,
    remaining,
    status,
  };
}


function createEmptySubscription(plan) {
  const startDate = today();

  return {
    clinic: "",
    admin: "",
    email: "",
    planName: plan?.name || "",
    billing: "Monthly",
    amount: plan?.monthlyPrice ?? 0,
    discount: 0,
    startDate,
    endDate: calculateEndDate(startDate, "Monthly"),
    payments: [],
    notes: "",
  };
}

function Badge({ value }) {
  return (
    <span
      className={`ss-badge ${String(value)
        .toLowerCase()
        .replace(/\s+/g, "-")}`}
    >
      {value}
    </span>
  );
}

const styles = `
.ss-page, .ss-page *,
.ss-overlay, .ss-overlay * {
  box-sizing: border-box;
}

.ss-page {
  display: flex !important;
  flex-direction: row !important;
  width: 100% !important;
  min-height: 100vh;
  margin: 0 !important;
  padding: 0 !important;
  background: #f5f8fa;
  color: #173944;
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

/* STATISTICS */

.ss-stats {
  display: grid !important;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  gap: 16px;
  margin-bottom: 22px;
  width: 100%;
  min-width: 0;
}

.ss-stat {
  min-width: 0;
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
  overflow-wrap: anywhere;
}

.ss-stat-label {
  margin: 0;
  color: #71838e;
  font-size: 13px;
}

/* TABLE */

.ss-panel {
  min-width: 0;
  padding: 24px;
  border: 1px solid #e9eff0;
  border-radius: 15px;
  background: white;
}

.ss-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.ss-panel-head h2 {
  margin: 0;
  color: #173944;
  font-size: 19px;
}

.ss-panel-heading {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.ss-panel-heading .ss-count {
  margin: 0;
}

.ss-count {
  color: #71838e;
  font-size: 12px;
  white-space: nowrap;
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
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.ss-table {
  width: 100%;
  min-width: 1570px;
  border-collapse: collapse;
  text-align: left;
}

.ss-table th,
.ss-table td {
  padding: 14px 11px;
  border-bottom: 1px solid #edf1f3;
  text-align: left;
  font-size: 12px;
  vertical-align: middle;
}

.ss-table th {
  background: #f5f8fa;
  color: #71838e;
  font-weight: 700;
  white-space: nowrap;
}

.ss-table td {
  color: #344e5a;
  white-space: nowrap;
}

.ss-table tbody tr:hover {
  background: #f8fbfb;
}

.ss-clinic {
  color: #173944;
  font-weight: 700;
  white-space: normal;
  min-width: 170px;
}

.ss-muted {
  margin-top: 4px;
  color: #84939c;
  font-size: 11px;
}

.ss-money-strong {
  font-weight: 800;
}

.ss-remaining {
  color: #bb4d4d !important;
  font-weight: 800;
}

.ss-remaining.zero {
  color: #16825d !important;
}

/* BADGES */

.ss-badge {
  display: inline-block;
  padding: 6px 10px;
  border-radius: 20px;
  background: #edf1f3;
  color: #627783;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.ss-badge.paid {
  background: #e4f8ee;
  color: #16825d;
}

.ss-badge.unpaid {
  background: #fdeaea;
  color: #bb4d4d;
}

.ss-badge.partially-paid {
  background: #fff2d9;
  color: #a56c10;
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

/* BUTTONS */

.ss-page .ss-btn,
.ss-overlay .ss-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: auto !important;
  min-height: 39px;
  padding: 9px 15px !important;
  border: 0;
  border-radius: 8px;
  background: #39aaa5;
  color: white;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.ss-page .ss-btn:hover,
.ss-overlay .ss-btn:hover {
  background: #258f8a;
}

.ss-overlay .ss-btn.secondary {
  background: #edf1f3;
  color: #344e5a;
}

.ss-overlay .ss-btn.danger {
  background: #cf5555;
  color: white;
}

.ss-page .ss-btn:disabled,
.ss-overlay .ss-btn:disabled {
  opacity: .45;
  cursor: not-allowed;
}

.ss-add-btn {
  flex-shrink: 0;
  white-space: nowrap;
}

/* ACTION ICONS */

.ss-actions {
  display: flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
}

.ss-page .ss-icon-btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex: 0 0 35px !important;
  width: 35px !important;
  min-width: 35px !important;
  max-width: 35px !important;
  height: 35px !important;
  min-height: 35px !important;
  padding: 0 !important;
  margin: 0 !important;
  border: 1px solid transparent !important;
  border-radius: 9px !important;
  font-size: 14px !important;
  cursor: pointer;
  transition: background .2s ease;
}

.ss-icon-btn.pay {
  background: #e5f7f5 !important;
  color: #258f8a !important;
}

.ss-icon-btn.invoice {
  background: #eaf2ff !important;
  color: #3976bf !important;
}

.ss-icon-btn.edit {
  background: #fff4de !important;
  color: #ad761c !important;
}

.ss-icon-btn.delete {
  background: #ffebeb !important;
  color: #c94b4b !important;
}

.ss-icon-btn:hover {
  filter: brightness(.94);
}

/* MODALS */

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
  max-width: 590px;
  max-height: 92vh;
  overflow-y: auto;
  padding: 27px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 20px 60px #0003;
}

.ss-modal.invoice {
  max-width: 850px;
}

.ss-modal.delete-modal {
  max-width: 430px;
}

/* TEAL HEADER + SMALL X */

.ss-modal-head {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  flex-direction: row !important;
  gap: 12px;
  margin: -27px -27px 22px;
  padding: 18px 24px;
  border-radius: 16px 16px 0 0;
  background: #55b8b5;
}

.ss-modal-head h2 {
  margin: 0 !important;
  color: #ffffff !important;
  font-size: 22px;
  font-weight: 700;
}

.ss-overlay .ss-modal-head .ss-close {
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
  cursor: pointer;
}

.ss-overlay .ss-modal-head .ss-close svg {
  width: 13px;
  height: 13px;
}

.ss-overlay .ss-modal-head .ss-close:hover {
  background: rgba(255,255,255,.28) !important;
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
  min-width: 0;
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
  min-width: 0;
  padding: 11px 12px;
  border: 1px solid #dfe8ea;
  border-radius: 9px;
  background: white;
  color: #173944;
  font-family: inherit;
  font-size: 13px;
}

.ss-field input:focus,
.ss-field select:focus,
.ss-field textarea:focus {
  outline: 2px solid #b5e7e3;
  border-color: #39aaa5;
}

.ss-field input[readonly] {
  background: #f5f8fa;
  color: #627783;
}

.ss-field textarea {
  min-height: 70px;
  resize: vertical;
}

.ss-hint {
  margin: 3px 0 0;
  color: #84939c;
  font-size: 11px;
  line-height: 1.5;
}

.ss-error {
  padding: 11px 13px;
  margin-top: 15px;
  border-radius: 8px;
  background: #ffebeb;
  color: #b63d3d;
  font-size: 12px;
  line-height: 1.5;
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
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
}

.ss-section-title {
  margin: 22px 0 12px;
  color: #173944;
  font-size: 14px;
  font-weight: 800;
}

.ss-payment-list {
  width: 100%;
  border-collapse: collapse;
}

.ss-payment-list th,
.ss-payment-list td {
  padding: 10px 8px;
  border-bottom: 1px solid #e7edef;
  color: #344e5a;
  text-align: left;
  font-size: 12px;
}

.ss-payment-list th {
  background: #f4f9fa;
  color: #627783;
}

/* INVOICE */

.ss-invoice {
  max-width: 760px;
  margin: 0 auto;
  padding: 24px;
  background: white;
  color: #173944;
}

.ss-invoice-top {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 24px;
  border-bottom: 3px solid #39aaa5;
}

.ss-invoice-brand {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 12px;
}

.ss-invoice-brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 39px;
  height: 39px;
  border-radius: 10px;
  background: #e6f6f4;
  color: #299d99;
  font-size: 18px;
}

.ss-invoice-brand strong {
  display: block;
  color: #173944;
  font-size: 15px;
}

.ss-invoice-brand small {
  color: #71838e;
  font-size: 10px;
}

.ss-invoice-top h1 {
  margin: 0 0 6px;
  color: #173944;
  font-size: 29px;
  letter-spacing: 1px;
}

.ss-invoice-top p {
  margin: 5px 0;
  color: #71838e;
  font-size: 12px;
}

.ss-invoice-meta {
  text-align: right;
  font-size: 12px;
}

.ss-invoice-meta strong {
  display: block;
  margin-bottom: 9px;
  color: #173944;
  font-size: 15px;
}

.ss-invoice-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  margin: 25px 0;
}

.ss-invoice-info h3 {
  margin: 0 0 11px;
  color: #299d99;
  font-size: 11px;
  letter-spacing: .7px;
}

.ss-invoice-info p {
  margin: 7px 0;
  color: #344e5a;
  font-size: 12px;
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
  font-size: 12px;
}

.ss-invoice-table th {
  background: #f4f9fa;
  color: #627783;
}

.ss-invoice-summary {
  width: min(100%, 360px);
  margin: 20px 0 0 auto;
}

.ss-invoice-summary .ss-total-row {
  font-size: 12px;
}

.ss-invoice-balance {
  margin-top: 12px;
  padding: 14px;
  border-radius: 9px;
  background: #edf8f7;
}

.ss-invoice-balance .ss-total-row {
  padding: 3px 0;
  color: #173944;
  font-size: 17px;
  font-weight: 800;
}

.ss-invoice-footer {
  margin-top: 35px;
  padding-top: 17px;
  border-top: 1px solid #e7edef;
  color: #84939c;
  font-size: 11px;
  line-height: 1.6;
  text-align: center;
}

.ss-delete-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  border-radius: 12px;
  background: #ffebeb;
  color: #c94b4b;
  font-size: 22px;
}

.ss-delete-message {
  color: #627783;
  font-size: 13px;
  line-height: 1.7;
}

.ss-empty {
  padding: 40px;
  color: #84939c;
  text-align: center;
}

/* MOBILE — THREE CARDS STAY SIDE BY SIDE */

@media (max-width: 768px) {
  .ss-page {
    display: block !important;
    width: 100% !important;
    overflow-x: clip;
  }

  .ss-main {
    width: 100% !important;
    min-width: 0 !important;
    padding: 84px 12px 24px !important;
  }

  .ss-header {
    margin-bottom: 18px;
  }

  .ss-header h1 {
    font-size: 23px;
  }

  .ss-subtitle {
    font-size: 12px;
  }

  .ss-stats {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 7px !important;
    margin-bottom: 16px;
  }

  .ss-stat {
    min-width: 0 !important;
    padding: 11px 7px !important;
    border-radius: 10px;
  }

  .ss-stat-icon {
    width: 29px;
    height: 29px;
    margin-bottom: 9px;
    border-radius: 8px;
    font-size: 13px;
  }

  .ss-stat-value {
    font-size: clamp(13px, 3.7vw, 19px) !important;
    line-height: 1.25;
    margin-bottom: 5px;
    white-space: nowrap;
    letter-spacing: -.5px;
  }

  .ss-stat-label {
    font-size: 10px !important;
    line-height: 1.35;
    overflow-wrap: break-word;
  }

  .ss-panel {
    padding: 12px;
  }

  .ss-panel-head h2 {
    font-size: 16px;
  }

  .ss-page .ss-add-btn {
    padding: 9px 11px !important;
    font-size: 11px;
  }

  .ss-search {
    max-width: none;
    flex-basis: 100%;
  }

  .ss-select {
    flex: 1 1 120px;
    min-width: 0;
  }

  .ss-form-grid,
  .ss-invoice-info {
    grid-template-columns: 1fr;
  }

  .ss-modal {
    padding: 18px;
  }

  .ss-modal-head {
    margin: -18px -18px 20px;
    padding: 16px 18px;
  }

  .ss-modal-head h2 {
    font-size: 18px;
  }

  .ss-invoice {
    padding: 8px;
  }

  .ss-invoice-top {
    flex-wrap: wrap;
  }

  .ss-invoice-meta {
    text-align: left;
  }
}

@media (max-width: 360px) {
  .ss-main {
    padding-left: 8px !important;
    padding-right: 8px !important;
  }

  .ss-stats {
    gap: 5px !important;
  }

  .ss-stat {
    padding: 9px 5px !important;
  }

  .ss-stat-value {
    font-size: 12px !important;
  }

  .ss-stat-label {
    font-size: 9px !important;
  }
}

/* PRINT ONLY THE INVOICE */

@media print {
  body * {
    visibility: hidden !important;
  }

  #ss-print-area,
  #ss-print-area * {
    visibility: visible !important;
  }

  .ss-overlay:has(#ss-print-area) {
    position: static !important;
    display: block !important;
    padding: 0 !important;
    background: white !important;
    overflow: visible !important;
  }

  .ss-modal.invoice {
    position: static !important;
    width: 100% !important;
    max-width: none !important;
    max-height: none !important;
    overflow: visible !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
  }

  #ss-print-area {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
  }

  .ss-no-print {
    display: none !important;
  }

  .ss-invoice-top,
  .ss-invoice-info,
  .ss-invoice-summary,
  .ss-invoice-footer {
    break-inside: avoid;
  }

  @page {
    size: A4;
    margin: 15mm;
  }
}

/* Add Subscription beside the page title */
#root .ss-page .ss-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  width: 100%;
  margin-bottom: 9px;
}

#root .ss-page .ss-title-row h1 {
  margin: 0;
}

#root .ss-page .ss-title-row .ss-header-add {
  flex: 0 0 auto !important;
  width: auto !important;
  margin: 0 !important;
  white-space: nowrap;
}

@media (max-width: 600px) {
  #root .ss-page .ss-title-row {
    flex-wrap: wrap;
    gap: 12px;
  }
}
`;
export default function SuperAdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");

  // ADD SUBSCRIPTION
  const [showAdd, setShowAdd] = useState(false);
  const [addDraft, setAddDraft] = useState(() => createEmptySubscription());
  const [addError, setAddError] = useState("");

  // PAYMENT
  const [paymentId, setPaymentId] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentDate, setPaymentDate] = useState(today());
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentError, setPaymentError] = useState("");

  // EDIT
  const [editId, setEditId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [editError, setEditError] = useState("");

  // INVOICE / DELETE
  const [invoiceId, setInvoiceId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);


  const [plans, setPlans] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [pageError, setPageError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const mutationLock = useRef(false);
  const paymentRequest = useRef(null);

  const loadData = async (signal) => {
    setLoading(true);
    setPageError("");

    try {
      const [records, availablePlans, availableClinics] =
        await Promise.all([
          subscriptionsRequest("", { signal }),
          subscriptionsRequest(
            "", { signal }, "/api/super-admin/plans"
          ),
          subscriptionsRequest(
            "", { signal }, "/api/super-admin/users"
          ),
        ]);

      if (
        ![records, availablePlans, availableClinics]
          .every(Array.isArray)
      ) {
        throw new Error("Invalid data returned by server.");
      }

      setSubscriptions(records);
      setPlans(availablePlans);
      setClinics(availableClinics);
    } catch (error) {
      if (error.name !== "AbortError") {
        setPageError(error.message);
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    loadData(controller.signal);

    return () => controller.abort();
  }, []);

  const replaceSubscription = (saved) => {
    setSubscriptions((previous) =>
      previous.some((item) => item.id === saved.id)
        ? previous.map((item) =>
            item.id === saved.id ? saved : item
          )
        : [saved, ...previous]
    );
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return subscriptions.filter((item) => {
      const matchesSearch = [
        item.clinic,
        item.admin,
        item.email,
        item.planName,
        `INV-${item.id}`,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

      const status = calculatePayment(item).status;

      return (
        matchesSearch &&
        (statusFilter === "All" || status === statusFilter) &&
        (planFilter === "All" || item.planName === planFilter)
      );
    });
  }, [subscriptions, search, statusFilter, planFilter]);

  const paidCount = subscriptions.filter(
    (item) => calculatePayment(item).status === "Paid"
  ).length;

  const totalCollected = round(
    subscriptions.reduce(
      (sum, item) => sum + calculatePayment(item).paid,
      0
    )
  );

  const paymentItem = subscriptions.find(
    (item) => item.id === paymentId
  );

  const editItem = subscriptions.find(
    (item) => item.id === editId
  );

  const invoiceItem = subscriptions.find(
    (item) => item.id === invoiceId
  );

  const deleteItem = subscriptions.find(
    (item) => item.id === deleteId
  );

  const paymentTotals = paymentItem
    ? calculatePayment(paymentItem)
    : null;

  const editTotals = editDraft
    ? calculatePayment(editDraft)
    : null;

  const invoiceTotals = invoiceItem
    ? calculatePayment(invoiceItem)
    : null;

  const addTotals = calculatePayment(addDraft);

  // VALIDATION — DISCOUNT MUST BE 0–100%

  const validateSubscription = (draft) => {
    const amount = Number(draft.amount);
    const discount = Number(draft.discount);

    if (
      !draft.clinic.trim() ||
      !draft.admin.trim() ||
      !draft.email.trim() ||
      !draft.planName.trim()
    ) {
      return "Please complete all required fields.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) {
      return "Please enter a valid email address.";
    }

    if (
      draft.amount === "" ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return "Please enter a valid subscription amount.";
    }

    if (
      draft.discount === "" ||
      !Number.isFinite(discount) ||
      discount < 0 ||
      discount > 100
    ) {
      return "Discount must be a percentage between 0% and 100%.";
    }

    if (!draft.startDate || !draft.endDate) {
      return "Please select the subscription dates.";
    }

    if (draft.endDate <= draft.startDate) {
      return "End Date must be later than Start Date.";
    }

    return "";
  };

  // ADD SUBSCRIPTION

  const openAdd = () => {
    if (mutationLock.current || loading) return;

    const plan = plans.find((item) => item.status === "Active");

    if (!plan) {
      setPageError("Create an active plan first.");
      return;
    }

    setAddDraft(createEmptySubscription(plan));
    setAddError("");
    setShowAdd(true);
  };

  const closeAdd = () => {
    if (mutationLock.current) return;
    setShowAdd(false);
    setAddError("");
  };

  const updateAdd = (field, value) => {
    setAddDraft((previous) => {
      const updated = {
        ...previous,
        [field]: value,
      };

      if (field === "clinic") {
        const clinic = clinics.find(
          (item) =>
            item.clinicName.toLowerCase() ===
            value.trim().toLowerCase()
        );

        if (clinic) {
          updated.clinic = clinic.clinicName;
          updated.admin = clinic.adminName || "";
          updated.email = clinic.email || clinic.adminEmail || "";
        }
      }

      if (field === "planName" || field === "billing") {
        const plan = plans.find(
          (item) => item.name === updated.planName
        );

        updated.amount =
          (updated.billing === "Yearly"
            ? plan?.yearlyPrice
            : plan?.monthlyPrice) ?? 0;
      }

      if (field === "startDate" || field === "billing") {
        updated.endDate = calculateEndDate(
          updated.startDate,
          updated.billing
        );
      }

      return updated;
    });

    setAddError("");
  };


  const saveAdd = async (event) => {
    event.preventDefault();

    if (mutationLock.current) return;

    const error = validateSubscription(addDraft);

    if (error) {
      setAddError(error);
      return;
    }

    mutationLock.current = true;
    setBusy(true);
    setAddError("");

    try {
      const saved = await subscriptionsRequest("", {
        method: "POST",
        body: JSON.stringify(addDraft),
      });

      replaceSubscription(saved);

      setSearch("");
      setStatusFilter("All");
      setPlanFilter("All");

      mutationLock.current = false;
      closeAdd();
    } catch (error) {
      setAddError(error.message);
    } finally {
      mutationLock.current = false;
      setBusy(false);
    }
  };

  // PAYMENT

  const closePayment = () => {
    if (mutationLock.current) return;
    setPaymentId(null);
    setPaymentAmount("");
    setPaymentError("");
  };

  const openPayment = (item) => {
    if (mutationLock.current) return;
    paymentRequest.current = null;
    const totals = calculatePayment(item);

    setPaymentId(item.id);
    setPaymentAmount(
      totals.remaining > 0 ? totals.remaining.toFixed(2) : ""
    );
    setPaymentMethod("Cash");
    setPaymentDate(today());
    setPaymentNotes("");
    setPaymentError("");
  };

  const savePayment = async (event) => {
    if (mutationLock.current) {
      event.preventDefault();
      return;
    }
    event.preventDefault();

    if (!paymentItem) return;

    const totals = calculatePayment(paymentItem);
    const amount = Number(paymentAmount);

    if (totals.remaining <= 0) {
      setPaymentError("This subscription is already fully paid.");
      return;
    }

    if (
      paymentAmount === "" ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      round(amount) <= 0
    ) {
      setPaymentError("Please enter a valid payment amount.");
      return;
    }

    if (round(amount) > totals.remaining) {
      setPaymentError(
        `Payment cannot exceed the remaining balance of ${money(
          totals.remaining
        )}.`
      );
      return;
    }

    if (!paymentDate) {
      setPaymentError("Please select a payment date.");
      return;
    }


    const payload = {
      amount: round(amount),
      date: paymentDate,
      method: paymentMethod,
      notes: paymentNotes.trim(),
    };

    const fingerprint = JSON.stringify({
      id: paymentId,
      ...payload,
    });

    if (paymentRequest.current?.fingerprint !== fingerprint) {
      paymentRequest.current = {
        fingerprint,
        requestId: crypto.randomUUID(),
      };
    }

    payload.requestId = paymentRequest.current.requestId;

    mutationLock.current = true;
    setBusy(true);
    setPaymentError("");

    try {
      const saved = await subscriptionsRequest(
        `/${paymentId}/payments`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      replaceSubscription(saved);

      mutationLock.current = false;
      closePayment();
      setInvoiceId(saved.id);
    } catch (error) {
      setPaymentError(error.message);
    } finally {
      mutationLock.current = false;
      setBusy(false);
    }
  };

  // EDIT

  const closeEdit = () => {
    if (mutationLock.current) return;
    setEditId(null);
    setEditDraft(null);
    setEditError("");
  };

  const openEdit = (item) => {
    if (mutationLock.current) return;
    setEditId(item.id);
    setEditDraft({
      ...item,
      payments: [...(item.payments || [])],
    });
    setEditError("");
  };

  const updateEdit = (field, value) => {
    setEditDraft((previous) => ({
      ...previous,
      [field]: value,
    }));

    setEditError("");
  };


  const saveEdit = async (event) => {
    event.preventDefault();

    if (!editDraft || mutationLock.current) return;

    const error = validateSubscription(editDraft);

    if (error) {
      setEditError(error);
      return;
    }

    mutationLock.current = true;
    setBusy(true);
    setEditError("");

    try {
      replaceSubscription(
        await subscriptionsRequest(`/${editId}`, {
          method: "PUT",
          body: JSON.stringify(editDraft),
        })
      );

      mutationLock.current = false;
      closeEdit();
    } catch (error) {
      setEditError(error.message);
    } finally {
      mutationLock.current = false;
      setBusy(false);
    }
  };

  // DELETE


  const confirmDelete = async () => {
    if (!deleteItem || mutationLock.current) return;

    mutationLock.current = true;
    setBusy(true);
    setDeleteError("");

    try {
      await subscriptionsRequest(`/${deleteId}`, {
        method: "DELETE",
      });

      setSubscriptions((previous) =>
        previous.filter((item) => item.id !== deleteId)
      );

      setDeleteId(null);
    } catch (error) {
      setDeleteError(error.message);
    } finally {
      mutationLock.current = false;
      setBusy(false);
    }
  };

  // REUSABLE PAYMENT SUMMARY

  const renderTotals = (totals) => (
    <div className="ss-totals">
      <div className="ss-total-row">
        <span>Original Amount</span>
        <strong>{money(totals.subtotal)}</strong>
      </div>

      <div className="ss-total-row">
        <span>Discount ({totals.discount}%)</span>
        <strong>− {money(totals.discountAmount)}</strong>
      </div>

      <div className="ss-total-row">
        <span>Final Amount</span>
        <strong>{money(totals.total)}</strong>
      </div>

      <div className="ss-total-row">
        <span>Total Paid</span>
        <strong>{money(totals.paid)}</strong>
      </div>

      <div className="ss-total-row final">
        <span>Remaining</span>
        <span>{money(totals.remaining)}</span>
      </div>

      <div style={{ marginTop: 12 }}>
        <Badge value={totals.status} />
      </div>
    </div>
  );

  return (
    <>
      <style>{styles}</style>

      <div className="ss-page">
        <SuperAdminSidebar />

        <main className="ss-main">
          <header className="ss-header">
            <p className="ss-eyebrow">SUBSCRIPTION MANAGEMENT</p>
            <div className="ss-title-row">
  <h1>Subscription Records</h1>
  <button disabled={busy || loading}
                type="button"
                className="ss-btn ss-add-btn"
                onClick={openAdd}
              >
                <FaPlus />
                Add Subscription
              </button>
</div>

            <p className="ss-subtitle">
              Manage clinic subscriptions, percentage discounts,
              partial payments, remaining balances and invoices.
            </p>
          </header>

          {/* STATISTICS */}

          <section className="ss-stats">
            {[
              {
                label: "Total Subscriptions",
                value: subscriptions.length,
                icon: FaCreditCard,
              },
              {
                label: "Paid Subscriptions",
                value: paidCount,
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

          {/* SUBSCRIPTIONS TABLE */}

          <section className="ss-panel">
            <div className="ss-panel-head">
              <div className="ss-panel-heading">
                <h2>All Subscriptions</h2>
                <p className="ss-count">{filtered.length} records</p>
              </div>

              
            </div>

            <div className="ss-toolbar">
              <label className="ss-search">
                <FaMagnifyingGlass />

                <input
                  type="search"
                  placeholder="Search clinic, admin, plan or invoice..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>

              <select
                className="ss-select"
                value={planFilter}
                onChange={(event) => setPlanFilter(event.target.value)}
              >
                <option value="All">All Plans</option>

                {[
                  ...new Set(
                    subscriptions.map((item) => item.planName)
                  ),
                ]
                  .sort()
                  .map((plan) => (
                    <option key={plan} value={plan}>
                      {plan}
                    </option>
                  ))}
              </select>

              <select
                className="ss-select"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="All">All Payments</option>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>

            {pageError && (
              <div role="alert" className="ss-error">
                {pageError}
                <button
                  type="button"
                  className="ss-btn secondary"
                  disabled={busy || loading}
                  onClick={() => loadData()}
                >
                  Retry
                </button>
              </div>
            )}

            {loading ? (
              <div className="ss-empty">
                Loading subscriptions...
              </div>
            ) : filtered.length === 0 ? (
              <div className="ss-empty">No subscriptions found.</div>
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
                      <th>Paid</th>
                      <th>Remaining</th>
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
                          <td>{money(totals.subtotal)}</td>

                          <td>
                            {totals.discount}%

                            <div className="ss-muted">
                              − {money(totals.discountAmount)}
                            </div>
                          </td>

                          <td className="ss-money-strong">
                            {money(totals.total)}
                          </td>

                          <td>{money(totals.paid)}</td>

                          <td
                            className={`ss-remaining ${
                              totals.remaining === 0 ? "zero" : ""
                            }`}
                          >
                            {money(totals.remaining)}
                          </td>

                          <td>
                            <Badge value={totals.status} />
                          </td>

                          <td>{item.startDate}</td>
                          <td>{item.endDate}</td>

                          <td>
                            <div className="ss-actions">
                              <button disabled={busy || loading}
                                type="button"
                                className="ss-icon-btn pay"
                                onClick={() => openPayment(item)}
                                title="Pay"
                                aria-label={`Pay for ${item.clinic}`}
                              >
                                <FaCreditCard />
                              </button>

                              <button disabled={busy || loading}
                                type="button"
                                className="ss-icon-btn invoice"
                                onClick={() => setInvoiceId(item.id)}
                                title="View / Print Invoice"
                                aria-label={`Invoice for ${item.clinic}`}
                              >
                                <FaReceipt />
                              </button>

                              <button disabled={busy || loading}
                                type="button"
                                className="ss-icon-btn edit"
                                onClick={() => openEdit(item)}
                                title="Edit Subscription"
                                aria-label={`Edit ${item.clinic}`}
                              >
                                <FaPenToSquare />
                              </button>

                              <button disabled={busy || loading}
                                type="button"
                                className="ss-icon-btn delete"
                                onClick={() => { setDeleteError(""); setDeleteId(item.id); }}
                                title="Delete Subscription"
                                aria-label={`Delete ${item.clinic}`}
                              >
                                <FaTrash />
                              </button>
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

      {/* ADD SUBSCRIPTION MODAL */}

      {showAdd && (
        <div className="ss-overlay">
          <div
            className="ss-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Add Subscription"
          >
            {/* TEAL HEADER — NO DESCRIPTION BOX */}

            <div className="ss-modal-head">
              <h2>Add Subscription</h2>

              <button disabled={busy || loading}
                type="button"
                className="ss-close"
                onClick={closeAdd}
                aria-label="Close"
              >
                <FaXmark />
              </button>
            </div>

            <form onSubmit={saveAdd}>
<fieldset disabled={busy} style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>

              <datalist id="ss-clinic-options">
                {clinics.map((clinic) => (
                  <option
                    key={clinic.id}
                    value={clinic.clinicName}
                  />
                ))}
              </datalist>
              <div className="ss-form-grid">
                <div className="ss-field full">
                  <label>Clinic Name *</label>

                  <input
                    required
                    list="ss-clinic-options"
                    value={addDraft.clinic}
                    onChange={(event) =>
                      updateAdd("clinic", event.target.value)
                    }
                    placeholder="Enter clinic name"
                  />
                </div>

                <div className="ss-field">
                  <label>Admin Name *</label>

                  <input
                    required
                    value={addDraft.admin}
                    onChange={(event) =>
                      updateAdd("admin", event.target.value)
                    }
                    placeholder="Dr. ..."
                  />
                </div>

                <div className="ss-field">
                  <label>Email *</label>

                  <input
                    required
                    type="email"
                    value={addDraft.email}
                    onChange={(event) =>
                      updateAdd("email", event.target.value)
                    }
                    placeholder="clinic@example.com"
                  />
                </div>

                <div className="ss-field">
                  <label>Subscription Plan *</label>

                  <select
                    value={addDraft.planName}
                    onChange={(event) =>
                      updateAdd("planName", event.target.value)
                    }
                  >
                    {plans
                      .filter((plan) => plan.status === "Active")
                      .map((plan) => (
                        <option key={plan.id} value={plan.name}>
                          {plan.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="ss-field">
                  <label>Billing Cycle *</label>

                  <select
                    value={addDraft.billing}
                    onChange={(event) =>
                      updateAdd("billing", event.target.value)
                    }
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>

                <div className="ss-field">
                  <label>Original Amount (USD) *</label>

                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={addDraft.amount}
                    onChange={(event) =>
                      updateAdd("amount", event.target.value)
                    }
                  />

                  <p className="ss-hint">
                    Suggested price is filled automatically based
                    on the selected plan.
                  </p>
                </div>

                <div className="ss-field">
                  <label>Discount (%)</label>

                  <input
                    required
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={addDraft.discount}
                    onChange={(event) =>
                      updateAdd("discount", event.target.value)
                    }
                    placeholder="Enter discount percentage"
                  />

                  <p className="ss-hint">
                    Enter a percentage from 0 to 100.
                  </p>
                </div>

                <div className="ss-field">
                  <label>Start Date *</label>

                  <input
                    required
                    type="date"
                    value={addDraft.startDate}
                    onChange={(event) =>
                      updateAdd("startDate", event.target.value)
                    }
                  />
                </div>

                <div className="ss-field">
                  <label>End Date *</label>

                  <input
                    required
                    type="date"
                    value={addDraft.endDate}
                    onChange={(event) =>
                      updateAdd("endDate", event.target.value)
                    }
                  />

                  <p className="ss-hint">
                    Calculated automatically; you can adjust it.
                  </p>
                </div>

                <div className="ss-field full">
                  <label>Notes (Optional)</label>

                  <textarea
                    value={addDraft.notes}
                    onChange={(event) =>
                      updateAdd("notes", event.target.value)
                    }
                    placeholder="Additional subscription notes..."
                  />
                </div>
              </div>

              {renderTotals(addTotals)}

              <p className="ss-hint" style={{ marginTop: 12 }}>
                The new subscription starts as Unpaid. Use its Pay
                action in the table to record full or partial payments.
              </p>

              {addError && (
                <div className="ss-error">{addError}</div>
              )}

              <div className="ss-modal-actions">
                <button disabled={busy || loading}
                  type="button"
                  className="ss-btn secondary"
                  onClick={closeAdd}
                >
                  Cancel
                </button>

                <button disabled={busy || loading} type="submit" className="ss-btn">
                  <FaPlus />
                  Save Subscription
                </button>
              </div>
            
</fieldset>
</form>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}

      {paymentItem && paymentTotals && (
        <div className="ss-overlay">
          <div
            className="ss-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Process Payment"
          >
            <div className="ss-modal-head">
              <h2>Process Payment</h2>

              <button disabled={busy || loading}
                type="button"
                className="ss-close"
                onClick={closePayment}
                aria-label="Close"
              >
                <FaXmark />
              </button>
            </div>

            <div className="ss-clinic-box">
              <strong>{paymentItem.clinic}</strong>
              <span>{paymentItem.admin}</span>
              <span>{paymentItem.email}</span>
              <span>
                {paymentItem.planName} — {paymentItem.billing}
              </span>
            </div>

            <form onSubmit={savePayment}>
<fieldset disabled={busy} style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>

              <div className="ss-form-grid">
                <div className="ss-field">
                  <label>Original Amount</label>

                  <input
                    value={money(paymentTotals.subtotal)}
                    readOnly
                  />
                </div>

                <div className="ss-field">
                  <label>
                    Discount Applied ({paymentTotals.discount}%)
                  </label>

                  <input
                    value={money(paymentTotals.discountAmount)}
                    readOnly
                  />
                </div>

                <div className="ss-field">
                  <label>Payment Amount (USD)</label>

                  <input
                    type="number"
                    min="0.01"
                    max={paymentTotals.remaining}
                    step="0.01"
                    value={paymentAmount}
                    disabled={paymentTotals.remaining <= 0}
                    onChange={(event) => {
                      setPaymentAmount(event.target.value);
                      setPaymentError("");
                    }}
                    placeholder="Enter amount received"
                  />
                </div>

                <div className="ss-field">
                  <label>Payment Method</label>

                  <select
                    value={paymentMethod}
                    disabled={paymentTotals.remaining <= 0}
                    onChange={(event) =>
                      setPaymentMethod(event.target.value)
                    }
                  >
                    <option>Cash</option>
                    <option>Bank Transfer</option>
                    <option>Card (Recorded Manually)</option>
                  </select>
                </div>

                <div className="ss-field">
                  <label>Payment Date</label>

                  <input
                    type="date"
                    value={paymentDate}
                    disabled={paymentTotals.remaining <= 0}
                    onChange={(event) =>
                      setPaymentDate(event.target.value)
                    }
                  />
                </div>

                <div className="ss-field full">
                  <label>Payment Notes (Optional)</label>

                  <textarea
                    value={paymentNotes}
                    disabled={paymentTotals.remaining <= 0}
                    onChange={(event) =>
                      setPaymentNotes(event.target.value)
                    }
                    placeholder="Reference number or notes..."
                  />
                </div>
              </div>

              {renderTotals(paymentTotals)}

              {paymentTotals.remaining > 0 &&
                paymentAmount !== "" &&
                Number(paymentAmount) > 0 &&
                round(Number(paymentAmount)) <=
                  paymentTotals.remaining && (
                  <div className="ss-totals">
                    <div className="ss-total-row">
                      <span>New Payment</span>
                      <strong>{money(paymentAmount)}</strong>
                    </div>

                    <div className="ss-total-row final">
                      <span>Remaining After Payment</span>

                      <span>
                        {money(
                          paymentTotals.remaining -
                            round(Number(paymentAmount))
                        )}
                      </span>
                    </div>
                  </div>
                )}

              {paymentTotals.remaining <= 0 && (
                <p className="ss-hint" style={{ marginTop: 13 }}>
                  This subscription is fully paid. You can still
                  view its invoice and payment history.
                </p>
              )}

              {(paymentItem.payments || []).length > 0 && (
                <>
                  <h3 className="ss-section-title">
                    Previous Payments
                  </h3>

                  <div className="ss-table-wrap">
                    <table className="ss-payment-list">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Method</th>
                          <th>Amount</th>
                        </tr>
                      </thead>

                      <tbody>
                        {paymentItem.payments.map((payment) => (
                          <tr key={payment.id}>
                            <td>{payment.date}</td>
                            <td>{payment.method}</td>
                            <td>{money(payment.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {paymentError && (
                <div className="ss-error">{paymentError}</div>
              )}

              <div className="ss-modal-actions">
                <button disabled={busy || loading}
                  type="button"
                  className="ss-btn secondary"
                  onClick={closePayment}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="ss-btn"
                  disabled={paymentTotals.remaining <= 0}
                >
                  <FaCheck />
                  Record Payment
                </button>
              </div>
            
</fieldset>
</form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}

      {editItem && editDraft && editTotals && (
        <div className="ss-overlay">
          <div
            className="ss-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Edit Subscription"
          >
            <div className="ss-modal-head">
              <h2>Edit Subscription</h2>

              <button disabled={busy || loading}
                type="button"
                className="ss-close"
                onClick={closeEdit}
                aria-label="Close"
              >
                <FaXmark />
              </button>
            </div>

            

            <form onSubmit={saveEdit}>
<fieldset disabled={busy} style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>

              <div className="ss-form-grid">
                <div className="ss-field full">
                  <label>Clinic Name *</label>

                  <input
                    required
                    value={editDraft.clinic}
                    onChange={(event) =>
                      updateEdit("clinic", event.target.value)
                    }
                  />
                </div>

                <div className="ss-field">
                  <label>Admin Name *</label>

                  <input
                    required
                    value={editDraft.admin}
                    onChange={(event) =>
                      updateEdit("admin", event.target.value)
                    }
                  />
                </div>

                <div className="ss-field">
                  <label>Email *</label>

                  <input
                    required
                    type="email"
                    value={editDraft.email}
                    onChange={(event) =>
                      updateEdit("email", event.target.value)
                    }
                  />
                </div>

                <div className="ss-field">
                  <label>Plan Name *</label>

                  <select
                    required
                    value={editDraft.planName}
                    onChange={(event) =>
                      updateEdit("planName", event.target.value)
                    }
                  >
                    {plans
                      .filter((plan) =>
                        plan.status === "Active" ||
                        plan.name === editDraft.planName
                      )
                      .map((plan) => (
                        <option key={plan.id} value={plan.name}>
                          {plan.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="ss-field">
                  <label>Billing Cycle</label>

                  <select
                    value={editDraft.billing}
                    onChange={(event) =>
                      updateEdit("billing", event.target.value)
                    }
                  >
                    <option>Monthly</option>
                    <option>Yearly</option>
                  </select>
                </div>

                <div className="ss-field">
                  <label>Original Amount (USD) *</label>

                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={editDraft.amount}
                    onChange={(event) =>
                      updateEdit("amount", event.target.value)
                    }
                  />
                </div>

                <div className="ss-field">
                  <label>Discount (%)</label>

                  <input
                    required
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={editDraft.discount}
                    onChange={(event) =>
                      updateEdit("discount", event.target.value)
                    }
                    placeholder="Enter discount percentage"
                  />

                  <p className="ss-hint">
                    Percentage only, from 0 to 100.
                  </p>
                </div>

                <div className="ss-field">
                  <label>Start Date *</label>

                  <input
                    required
                    type="date"
                    value={editDraft.startDate}
                    onChange={(event) =>
                      updateEdit("startDate", event.target.value)
                    }
                  />
                </div>

                <div className="ss-field">
                  <label>End Date *</label>

                  <input
                    required
                    type="date"
                    value={editDraft.endDate}
                    onChange={(event) =>
                      updateEdit("endDate", event.target.value)
                    }
                  />
                </div>

                <div className="ss-field full">
                  <label>Subscription Notes (Optional)</label>

                  <textarea
                    value={editDraft.notes}
                    onChange={(event) =>
                      updateEdit("notes", event.target.value)
                    }
                    placeholder="Additional subscription details..."
                  />
                </div>
              </div>

              {renderTotals(editTotals)}

              <p className="ss-hint" style={{ marginTop: 12 }}>
                Payment status and remaining balance are calculated
                automatically. Editing cannot erase previous payments
                or create an overpayment.
              </p>

              {editError && (
                <div className="ss-error">{editError}</div>
              )}

              <div className="ss-modal-actions">
                <button disabled={busy || loading}
                  type="button"
                  className="ss-btn secondary"
                  onClick={closeEdit}
                >
                  Cancel
                </button>

                <button disabled={busy || loading} type="submit" className="ss-btn">
                  <FaCheck />
                  Save Changes
                </button>
              </div>
            
</fieldset>
</form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}

      {deleteItem && (
        <div className="ss-overlay">
          <div
            className="ss-modal delete-modal"
            role="alertdialog"
            aria-modal="true"
            aria-label="Delete Subscription"
          >
            <div className="ss-delete-icon">
              <FaTriangleExclamation />
            </div>

            <div className="ss-modal-head">
              <h2>Delete Subscription?</h2>

              <button disabled={busy || loading}
                type="button"
                className="ss-close"
                onClick={() => setDeleteId(null)}
                aria-label="Close"
              >
                <FaXmark />
              </button>
            </div>

            {deleteError && (
              <div role="alert" className="ss-error">
                {deleteError}
              </div>
            )}

            <p className="ss-delete-message">
              Are you sure you want to delete subscription{" "}
              <strong>INV-{deleteItem.id}</strong> for{" "}
              <strong>{deleteItem.clinic}</strong>?
              <br />
              This will also permanently remove its recorded payment history.
            </p>

            <div className="ss-modal-actions">
              <button disabled={busy || loading}
                type="button"
                className="ss-btn secondary"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>

              <button disabled={busy || loading}
                type="button"
                className="ss-btn danger"
                onClick={confirmDelete}
              >
                <FaTrash />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INVOICE MODAL */}

      {invoiceItem && invoiceTotals && (
        <div className="ss-overlay">
          <div
            className="ss-modal invoice"
            role="dialog"
            aria-modal="true"
            aria-label="Invoice Preview"
          >
            <div className="ss-modal-head ss-no-print">
              <h2>Invoice Preview</h2>

              <button disabled={busy || loading}
                type="button"
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
                  <div className="ss-invoice-brand">
                    <div className="ss-invoice-brand-icon">
                      <FaReceipt />
                    </div>

                    <div>
                      <strong>Super Admin</strong>
                      <small>System Management</small>
                    </div>
                  </div>

                  <h1>INVOICE</h1>

                  <p>Veterinary Clinic Management System</p>
                  <p>Subscription Billing</p>
                </div>

                <div className="ss-invoice-meta">
                  <strong>INV-{invoiceItem.id}</strong>

                  <p>Issued: {invoiceItem.startDate}</p>
                  <p>Period End: {invoiceItem.endDate}</p>

                  <div style={{ marginTop: 11 }}>
                    <Badge value={invoiceTotals.status} />
                  </div>
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

                  <p>
                    <strong>Plan:</strong> {invoiceItem.planName}
                  </p>

                  <p>
                    <strong>Billing:</strong> {invoiceItem.billing}
                  </p>

                  <p>
                    <strong>Start Date:</strong> {invoiceItem.startDate}
                  </p>

                  <p>
                    <strong>End Date:</strong> {invoiceItem.endDate}
                  </p>
                </div>
              </div>

              <table className="ss-invoice-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Billing Cycle</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>
                      <strong>
                        {invoiceItem.planName} Subscription
                      </strong>

                      <div className="ss-muted">
                        {invoiceItem.startDate} to{" "}
                        {invoiceItem.endDate}
                      </div>
                    </td>

                    <td>{invoiceItem.billing}</td>

                    <td style={{ textAlign: "right" }}>
                      {money(invoiceTotals.subtotal)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="ss-invoice-summary">
                <div className="ss-total-row">
                  <span>Subtotal</span>
                  <strong>{money(invoiceTotals.subtotal)}</strong>
                </div>

                <div className="ss-total-row">
                  <span>
                    Discount ({invoiceTotals.discount}%)
                  </span>

                  <strong>
                    − {money(invoiceTotals.discountAmount)}
                  </strong>
                </div>

                <div className="ss-total-row final">
                  <span>Final Amount</span>
                  <strong>{money(invoiceTotals.total)}</strong>
                </div>

                <div className="ss-total-row">
                  <span>Total Paid</span>
                  <strong>{money(invoiceTotals.paid)}</strong>
                </div>

                <div className="ss-invoice-balance">
                  <div className="ss-total-row">
                    <span>Balance Due</span>
                    <strong>{money(invoiceTotals.remaining)}</strong>
                  </div>
                </div>
              </div>

              <h3 className="ss-section-title">Payment History</h3>

              {(invoiceItem.payments || []).length === 0 ? (
                <p className="ss-hint">
                  No payments have been recorded for this invoice.
                </p>
              ) : (
                <table className="ss-payment-list">
                  <thead>
                    <tr>
                      <th>Payment Reference</th>
                      <th>Date</th>
                      <th>Method</th>
                      <th style={{ textAlign: "right" }}>Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {invoiceItem.payments.map((payment) => (
                      <tr key={payment.id}>
                        <td>{payment.id}</td>
                        <td>{payment.date}</td>
                        <td>{payment.method}</td>

                        <td style={{ textAlign: "right" }}>
                          {money(payment.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {invoiceItem.notes && (
                <>
                  <h3 className="ss-section-title">Notes</h3>
                  <p className="ss-hint">{invoiceItem.notes}</p>
                </>
              )}

              <div className="ss-invoice-footer">
                Thank you for your business.

                <div>
                  This invoice reflects recorded payments and the
                  outstanding balance as shown above.
                </div>

                <div>
                  Invoice Reference: INV-{invoiceItem.id}
                </div>
              </div>
            </div>

            <div className="ss-modal-actions ss-no-print">
              <button disabled={busy || loading}
                type="button"
                className="ss-btn secondary"
                onClick={() => setInvoiceId(null)}
              >
                Close
              </button>

              <button disabled={busy || loading}
                type="button"
                className="ss-btn"
                onClick={() => window.print()}
              >
                <FaPrint />
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}