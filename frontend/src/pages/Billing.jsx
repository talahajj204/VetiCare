import { useState } from "react";
import Sidebar from "../components/Sidebar";

import {
  FaEye,
  FaPen,
  FaTrash,
  FaFileExcel,
} from "react-icons/fa";

import * as XLSX from "xlsx";

function Billing() {
  // =========================
  // DATA
  // =========================

  const [invoices, setInvoices] = useState([
    {
      id: 1,
      invoiceNumber: "INV-001",
      ownerName: "Tala El Hajj",
      date: "2026-09-29",
      service: "General Checkup",
      amount: "50",
      status: "Paid",
    },
    {
      id: 2,
      invoiceNumber: "INV-002",
      ownerName: "Fatima Abbas",
      date: "2026-09-28",
      service: "Vaccination",
      amount: "35",
      status: "Unpaid",
    },
  ]);

  // =========================
  // SEARCH
  // =========================

  const [search, setSearch] = useState("");

  // =========================
  // MODALS
  // =========================

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // =========================
  // NEW INVOICE
  // =========================

  const [newInvoice, setNewInvoice] = useState({
    invoiceNumber: "",
    ownerName: "",
    date: "",
    service: "",
    amount: "",
    status: "Unpaid",
  });

  // =========================
  // SEARCH FILTER
  // =========================

  const filteredInvoices = invoices.filter((invoice) => {
    const searchText = search.trim().toLowerCase();

    return (
      invoice.invoiceNumber.toLowerCase().includes(searchText) ||
      invoice.ownerName.toLowerCase().includes(searchText) ||
      invoice.date.toLowerCase().includes(searchText) ||
      invoice.service.toLowerCase().includes(searchText) ||
      invoice.amount.toString().includes(searchText) ||
      invoice.status.toLowerCase().includes(searchText)
    );
  });

  // =========================
  // NEW INVOICE CHANGE
  // =========================

  const handleNewInvoiceChange = (e) => {
    const { name, value } = e.target;

    setNewInvoice({
      ...newInvoice,
      [name]: value,
    });
  };

  // =========================
  // ADD INVOICE
  // =========================

  const handleAddInvoice = (e) => {
    e.preventDefault();

    const invoice = {
      id: Date.now(),
      ...newInvoice,
    };

    setInvoices([...invoices, invoice]);

    setNewInvoice({
      invoiceNumber: "",
      ownerName: "",
      date: "",
      service: "",
      amount: "",
      status: "Unpaid",
    });

    setShowAddModal(false);
  };

  // =========================
  // VIEW
  // =========================

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowViewModal(true);
  };

  // =========================
  // OPEN EDIT
  // =========================

  const handleOpenEdit = (invoice) => {
    setSelectedInvoice({ ...invoice });
    setShowEditModal(true);
  };

  // =========================
  // EDIT CHANGE
  // =========================

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setSelectedInvoice({
      ...selectedInvoice,
      [name]: value,
    });
  };

  // =========================
  // UPDATE
  // =========================

  const handleUpdateInvoice = (e) => {
    e.preventDefault();

    setInvoices(
      invoices.map((invoice) =>
        invoice.id === selectedInvoice.id
          ? selectedInvoice
          : invoice
      )
    );

    setShowEditModal(false);
    setSelectedInvoice(null);
  };

  // =========================
  // DELETE
  // =========================

  const handleDeleteInvoice = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this invoice?"
    );

    if (confirmDelete) {
      setInvoices(
        invoices.filter((invoice) => invoice.id !== id)
      );
    }
  };

  // =========================
  // DATE FORMAT
  // =========================

  const formatDate = (date) => {
    if (!date) return "-";

    const [year, month, day] = date.split("-");

    return `${day}/${month}/${year}`;
  };

  // =========================
  // STATUS CLASS
  // =========================

  const getStatusClass = (status) => {
    if (status === "Paid") {
      return "status confirmed";
    }

    if (status === "Unpaid") {
      return "status pending";
    }

    return "status cancelled";
  };

  // =========================
  // EXPORT TO EXCEL
  // =========================

  const exportToExcel = () => {
    const excelData = invoices.map((invoice) => ({
      "Invoice #": invoice.invoiceNumber,
      "Owner Name": invoice.ownerName,
      Date: formatDate(invoice.date),
      Service: invoice.service,
      Amount: Number(invoice.amount || 0),
      Status: invoice.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Column widths
    worksheet["!cols"] = [
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Billing"
    );

    XLSX.writeFile(
      workbook,
      "vet-clinic-billing.xlsx"
    );
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">

        {/* =========================
            HEADER
        ========================= */}

        <div className="page-header">
          <div>
            <h1>Billing</h1>
            <p>Manage invoices and payments</p>
          </div>
        </div>

        {/* =========================
            SEARCH + EXPORT + ADD
        ========================= */}

        <div className="inventory-toolbar">

          <div className="search-container inventory-search">
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="inventory-toolbar-actions">

            <button
              type="button"
              className="export-button"
              onClick={exportToExcel}
            >
              <FaFileExcel />
              <span>Export</span>
            </button>

            <button
              type="button"
              className="add-button"
              onClick={() => setShowAddModal(true)}
            >
              + Add Invoice
            </button>

          </div>
        </div>

        {/* =========================
            TABLE
        ========================= */}

        <div className="owners-table-container">
          <table className="owners-table">

            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Owner Name</th>
                <th>Date</th>
                <th>Service</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id}>

                    <td>{invoice.invoiceNumber}</td>

                    <td>{invoice.ownerName}</td>

                    <td>{formatDate(invoice.date)}</td>

                    <td>{invoice.service}</td>

                    <td>
                      ${Number(invoice.amount || 0).toFixed(2)}
                    </td>

                    <td>
                      <span
                        className={getStatusClass(invoice.status)}
                      >
                        {invoice.status}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions">

                        <button
                          type="button"
                          className="view-button icon-button"
                          onClick={() =>
                            handleViewInvoice(invoice)
                          }
                          title="View"
                          aria-label="View invoice"
                        >
                          <FaEye />
                        </button>

                        <button
                          type="button"
                          className="edit-button icon-button"
                          onClick={() =>
                            handleOpenEdit(invoice)
                          }
                          title="Edit"
                          aria-label="Edit invoice"
                        >
                          <FaPen />
                        </button>

                        <button
                          type="button"
                          className="delete-button icon-button"
                          onClick={() =>
                            handleDeleteInvoice(invoice.id)
                          }
                          title="Delete"
                          aria-label="Delete invoice"
                        >
                          <FaTrash />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="no-results"
                  >
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

      </main>

      {/* =========================================
          ADD INVOICE MODAL
      ========================================= */}

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">

            <div className="modal-header">
              <div>
                <h2>Add Invoice</h2>
                <p>Enter invoice information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddInvoice}>

              <div className="form-row">

                <div className="form-field">
                  <label>Invoice Number</label>

                  <input
                    type="text"
                    name="invoiceNumber"
                    placeholder="Example: INV-003"
                    value={newInvoice.invoiceNumber}
                    onChange={handleNewInvoiceChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Owner Name</label>

                  <input
                    type="text"
                    name="ownerName"
                    placeholder="Enter owner name"
                    value={newInvoice.ownerName}
                    onChange={handleNewInvoiceChange}
                    required
                  />
                </div>

              </div>

              <div className="form-row">

                <div className="form-field">
                  <label>Date</label>

                  <input
                    type="date"
                    name="date"
                    value={newInvoice.date}
                    onChange={handleNewInvoiceChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Service</label>

                  <input
                    type="text"
                    name="service"
                    placeholder="Example: General Checkup"
                    value={newInvoice.service}
                    onChange={handleNewInvoiceChange}
                    required
                  />
                </div>

              </div>

              <div className="form-row">

                <div className="form-field">
                  <label>Amount ($)</label>

                  <input
                    type="number"
                    name="amount"
                    min="0"
                    step="0.01"
                    placeholder="Enter amount"
                    value={newInvoice.amount}
                    onChange={handleNewInvoiceChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Status</label>

                  <select
                    name="status"
                    value={newInvoice.status}
                    onChange={handleNewInvoiceChange}
                  >
                    <option value="Paid">
                      Paid
                    </option>

                    <option value="Unpaid">
                      Unpaid
                    </option>

                    <option value="Cancelled">
                      Cancelled
                    </option>
                  </select>
                </div>

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
                >
                  Add Invoice
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* =========================================
          VIEW INVOICE MODAL
      ========================================= */}

      {showViewModal && selectedInvoice && (
        <div className="modal-overlay">
          <div className="modal-container">

            <div className="modal-header">
              <div>
                <h2>Invoice Details</h2>
                <p>View invoice information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedInvoice(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="detail-row">
              <span>Invoice Number</span>
              <strong>
                {selectedInvoice.invoiceNumber}
              </strong>
            </div>

            <div className="detail-row">
              <span>Owner Name</span>
              <strong>
                {selectedInvoice.ownerName}
              </strong>
            </div>

            <div className="detail-row">
              <span>Date</span>
              <strong>
                {formatDate(selectedInvoice.date)}
              </strong>
            </div>

            <div className="detail-row">
              <span>Service</span>
              <strong>
                {selectedInvoice.service}
              </strong>
            </div>

            <div className="detail-row">
              <span>Amount</span>
              <strong>
                ${Number(
                  selectedInvoice.amount || 0
                ).toFixed(2)}
              </strong>
            </div>

            <div className="detail-row">
              <span>Status</span>

              <strong>
                <span
                  className={getStatusClass(
                    selectedInvoice.status
                  )}
                >
                  {selectedInvoice.status}
                </span>
              </strong>
            </div>

            <div className="form-actions">

              <button
                type="button"
                className="modal-cancel-button"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedInvoice(null);
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
                  Edit Invoice
                </span>
              </button>

            </div>

          </div>
        </div>
      )}

      {/* =========================================
          EDIT INVOICE MODAL
      ========================================= */}

      {showEditModal && selectedInvoice && (
        <div className="modal-overlay">
          <div className="modal-container">

            <div className="modal-header">
              <div>
                <h2>Edit Invoice</h2>
                <p>Update invoice information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedInvoice(null);
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateInvoice}>

              <div className="form-row">

                <div className="form-field">
                  <label>Invoice Number</label>

                  <input
                    type="text"
                    name="invoiceNumber"
                    value={selectedInvoice.invoiceNumber}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Owner Name</label>

                  <input
                    type="text"
                    name="ownerName"
                    value={selectedInvoice.ownerName}
                    onChange={handleEditChange}
                    required
                  />
                </div>

              </div>

              <div className="form-row">

                <div className="form-field">
                  <label>Date</label>

                  <input
                    type="date"
                    name="date"
                    value={selectedInvoice.date}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Service</label>

                  <input
                    type="text"
                    name="service"
                    value={selectedInvoice.service}
                    onChange={handleEditChange}
                    required
                  />
                </div>

              </div>

              <div className="form-row">

                <div className="form-field">
                  <label>Amount ($)</label>

                  <input
                    type="number"
                    name="amount"
                    min="0"
                    step="0.01"
                    value={selectedInvoice.amount}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Status</label>

                  <select
                    name="status"
                    value={selectedInvoice.status}
                    onChange={handleEditChange}
                  >
                    <option value="Paid">
                      Paid
                    </option>

                    <option value="Unpaid">
                      Unpaid
                    </option>

                    <option value="Cancelled">
                      Cancelled
                    </option>
                  </select>
                </div>

              </div>

              <div className="form-actions">

                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedInvoice(null);
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

    </div>
  );
}

export default Billing;