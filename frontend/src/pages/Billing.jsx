import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";

import {
  FaEye,
  FaPen,
  FaTrash,
  FaFileExcel,
  FaSearch,
  FaTimes,
  FaPrint,
  FaPlus,
} from "react-icons/fa";

import * as XLSX from "xlsx";

function Billing() {
  // =====================================================
  // CLINIC INFORMATION
  // =====================================================

  const clinic = {
    name: "PawCare Veterinary Clinic",
    subtitle: "Veterinary Care & Pet Wellness",
  };

  // =====================================================
  // HELPERS
  // =====================================================

  const createEmptyLine = () => ({
    id: `${Date.now()}-${Math.random()}`,
    type: "Consultation",
    description: "",
    quantity: 1,
    unitPrice: "",
  });

  const createEmptyInvoice = () => ({
    invoiceNumber: "",
    ownerName: "",
    date: "",
    status: "Unpaid",
    lines: [createEmptyLine()],
  });

  // =====================================================
  // DATA
  // =====================================================

  const [invoices, setInvoices] = useState([
    {
      id: 1,
      invoiceNumber: "INV-001",
      ownerName: "Tala El Hajj",
      date: "2026-09-29",
      status: "Paid",
      lines: [
        {
          id: "1-1",
          type: "Consultation",
          description: "General Checkup",
          quantity: 1,
          unitPrice: 50,
        },
        {
          id: "1-2",
          type: "Medication",
          description: "Antibiotic",
          quantity: 1,
          unitPrice: 18,
        },
      ],
    },
    {
      id: 2,
      invoiceNumber: "INV-002",
      ownerName: "Fatima Abbas",
      date: "2026-09-28",
      status: "Partially Paid",
      lines: [
        {
          id: "2-1",
          type: "Procedure",
          description: "Vaccination",
          quantity: 1,
          unitPrice: 35,
        },
        {
          id: "2-2",
          type: "Product",
          description: "Pet Supplement",
          quantity: 2,
          unitPrice: 12,
        },
      ],
    },
    {
      id: 3,
      invoiceNumber: "INV-003",
      ownerName: "Rami Khoury",
      date: "2026-09-27",
      status: "Unpaid",
      lines: [
        {
          id: "3-1",
          type: "Consultation",
          description: "Follow-up Consultation",
          quantity: 1,
          unitPrice: 30,
        },
      ],
    },
  ]);

  // =====================================================
  // TYPES
  // =====================================================

  const billingTypes = [
    "Consultation",
    "Procedure",
    "Medication",
    "Product",
  ];

  // =====================================================
  // SEARCH + FILTERS
  // =====================================================

  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("All");
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
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // =====================================================
  // NEW INVOICE
  // =====================================================

  const [newInvoice, setNewInvoice] = useState(
    createEmptyInvoice()
  );

  // =====================================================
  // TOTALS
  // =====================================================

  const getLineTotal = (line) => {
    const quantity = Number(line.quantity) || 0;
    const unitPrice = Number(line.unitPrice) || 0;

    return quantity * unitPrice;
  };

  const getInvoiceTotal = (invoice) => {
    return (invoice.lines || []).reduce(
      (total, line) => total + getLineTotal(line),
      0
    );
  };

  const formatMoney = (value) => {
    return `$${Number(value || 0).toFixed(2)}`;
  };

  // =====================================================
  // FILTERED INVOICES
  // =====================================================

  const filteredInvoices = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const invoiceLines = invoice.lines || [];

      const matchesSearch =
        searchText === "" ||
        invoice.invoiceNumber
          .toLowerCase()
          .includes(searchText) ||
        invoice.ownerName
          .toLowerCase()
          .includes(searchText) ||
        invoice.date
          .toLowerCase()
          .includes(searchText) ||
        invoice.status
          .toLowerCase()
          .includes(searchText) ||
        invoiceLines.some(
          (line) =>
            line.type
              .toLowerCase()
              .includes(searchText) ||
            line.description
              .toLowerCase()
              .includes(searchText) ||
            String(line.quantity).includes(searchText) ||
            String(line.unitPrice).includes(searchText)
        );

      const matchesService =
        serviceFilter === "All" ||
        invoiceLines.some(
          (line) => line.type === serviceFilter
        );

      const matchesStatus =
        statusFilter === "All" ||
        invoice.status === statusFilter;

      return (
        matchesSearch &&
        matchesService &&
        matchesStatus
      );
    });
  }, [
    invoices,
    search,
    serviceFilter,
    statusFilter,
  ]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInvoices.length / rowsPerPage)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    serviceFilter,
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

  const paginatedInvoices = filteredInvoices.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSearch("");
    setServiceFilter("All");
    setStatusFilter("All");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    serviceFilter !== "All" ||
    statusFilter !== "All";

  // =====================================================
  // INVOICE BASIC FIELD CHANGE
  // =====================================================

  const handleNewInvoiceChange = (e) => {
    const { name, value } = e.target;

    setNewInvoice((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setSelectedInvoice((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // NEW INVOICE LINE FUNCTIONS
  // =====================================================

  const handleNewLineChange = (
    lineId,
    field,
    value
  ) => {
    setNewInvoice((previous) => ({
      ...previous,

      lines: previous.lines.map((line) =>
        line.id === lineId
          ? {
              ...line,
              [field]: value,
            }
          : line
      ),
    }));
  };

  const addNewInvoiceLine = () => {
    setNewInvoice((previous) => ({
      ...previous,

      lines: [
        ...previous.lines,
        createEmptyLine(),
      ],
    }));
  };

  const removeNewInvoiceLine = (lineId) => {
    setNewInvoice((previous) => {
      if (previous.lines.length === 1) {
        return previous;
      }

      return {
        ...previous,

        lines: previous.lines.filter(
          (line) => line.id !== lineId
        ),
      };
    });
  };

  // =====================================================
  // EDIT INVOICE LINE FUNCTIONS
  // =====================================================

  const handleEditLineChange = (
    lineId,
    field,
    value
  ) => {
    setSelectedInvoice((previous) => ({
      ...previous,

      lines: previous.lines.map((line) =>
        line.id === lineId
          ? {
              ...line,
              [field]: value,
            }
          : line
      ),
    }));
  };

  const addEditInvoiceLine = () => {
    setSelectedInvoice((previous) => ({
      ...previous,

      lines: [
        ...previous.lines,
        createEmptyLine(),
      ],
    }));
  };

  const removeEditInvoiceLine = (lineId) => {
    setSelectedInvoice((previous) => {
      if (previous.lines.length === 1) {
        return previous;
      }

      return {
        ...previous,

        lines: previous.lines.filter(
          (line) => line.id !== lineId
        ),
      };
    });
  };

  // =====================================================
  // ADD INVOICE
  // =====================================================

  const handleAddInvoice = (e) => {
    e.preventDefault();

    if (
      !newInvoice.lines ||
      newInvoice.lines.length === 0
    ) {
      alert("Please add at least one invoice line.");
      return;
    }

    const hasInvalidLine =
      newInvoice.lines.some(
        (line) =>
          !line.description.trim() ||
          Number(line.quantity) <= 0 ||
          Number(line.unitPrice) < 0
      );

    if (hasInvalidLine) {
      alert(
        "Please complete all invoice lines correctly."
      );
      return;
    }

    const invoice = {
      id: Date.now(),

      ...newInvoice,

      lines: newInvoice.lines.map((line) => ({
        ...line,
        quantity: Number(line.quantity) || 1,
        unitPrice: Number(line.unitPrice) || 0,
      })),
    };

    setInvoices((previous) => [
      ...previous,
      invoice,
    ]);

    setNewInvoice(createEmptyInvoice());

    setShowAddModal(false);
  };

  // =====================================================
  // VIEW
  // =====================================================

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowViewModal(true);
  };

  // =====================================================
  // OPEN EDIT
  // =====================================================

  const handleOpenEdit = (invoice) => {
    setSelectedInvoice({
      ...invoice,

      lines: invoice.lines.map((line) => ({
        ...line,
      })),
    });

    setShowEditModal(true);
  };

  // =====================================================
  // UPDATE
  // =====================================================

  const handleUpdateInvoice = (e) => {
    e.preventDefault();

    if (
      !selectedInvoice.lines ||
      selectedInvoice.lines.length === 0
    ) {
      alert("Please add at least one invoice line.");
      return;
    }

    const hasInvalidLine =
      selectedInvoice.lines.some(
        (line) =>
          !line.description.trim() ||
          Number(line.quantity) <= 0 ||
          Number(line.unitPrice) < 0
      );

    if (hasInvalidLine) {
      alert(
        "Please complete all invoice lines correctly."
      );
      return;
    }

    const updatedInvoice = {
      ...selectedInvoice,

      lines: selectedInvoice.lines.map(
        (line) => ({
          ...line,
          quantity: Number(line.quantity) || 1,
          unitPrice: Number(line.unitPrice) || 0,
        })
      ),
    };

    setInvoices((previous) =>
      previous.map((invoice) =>
        invoice.id === updatedInvoice.id
          ? updatedInvoice
          : invoice
      )
    );

    setShowEditModal(false);
    setSelectedInvoice(null);
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDeleteInvoice = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this invoice?"
    );

    if (confirmDelete) {
      setInvoices((previous) =>
        previous.filter(
          (invoice) => invoice.id !== id
        )
      );
    }
  };

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "-";

    const [year, month, day] =
      date.split("-");

    return `${day}/${month}/${year}`;
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    if (status === "Paid") {
      return "status confirmed";
    }

    if (status === "Unpaid") {
      return "status pending";
    }

    if (status === "Partially Paid") {
      return "status partially-paid";
    }

    return "status cancelled";
  };

  // =====================================================
  // PRINT INVOICE
  // =====================================================

  const handlePrintInvoice = (invoice) => {
    const printWindow = window.open(
      "",
      "_blank",
      "width=900,height=800"
    );

    if (!printWindow) {
      alert(
        "Please allow pop-ups to print the invoice."
      );
      return;
    }

    const total = getInvoiceTotal(invoice);

    const linesHTML = invoice.lines
      .map(
        (line, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHTML(line.type)}</td>
            <td>${escapeHTML(line.description)}</td>
            <td class="number">
              ${Number(line.quantity)}
            </td>
            <td class="number">
              ${formatMoney(line.unitPrice)}
            </td>
            <td class="number strong">
              ${formatMoney(getLineTotal(line))}
            </td>
          </tr>
        `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>

      <html>
        <head>
          <title>
            ${escapeHTML(invoice.invoiceNumber)}
          </title>

          <meta charset="UTF-8" />

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 40px;
              font-family:
                Arial,
                Helvetica,
                sans-serif;
              color: #253333;
              background: #ffffff;
            }

            .invoice {
              max-width: 900px;
              margin: 0 auto;
            }

            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding-bottom: 24px;
              border-bottom: 2px solid #169f9f;
            }

            .brand {
              display: flex;
              align-items: center;
              gap: 14px;
            }

            .logo {
              width: 64px;
              height: 64px;
              border-radius: 50%;
              background: #169f9f;
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 30px;
              font-weight: bold;
            }

            .clinic-name {
              margin: 0;
              color: #168f8f;
              font-size: 23px;
            }

            .clinic-subtitle {
              margin: 5px 0 0;
              color: #7b8c8b;
              font-size: 12px;
            }

            .invoice-label {
              text-align: right;
            }

            .invoice-label h1 {
              margin: 0;
              color: #344054;
              font-size: 30px;
              letter-spacing: 1px;
            }

            .invoice-label div {
              margin-top: 5px;
              color: #667085;
              font-size: 13px;
            }

            .information {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin: 30px 0;
            }

            .info-box {
              padding: 18px;
              background: #f8fbfb;
              border-radius: 8px;
            }

            .info-label {
              color: #849291;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: .7px;
              margin-bottom: 5px;
            }

            .info-value {
              color: #344054;
              font-size: 15px;
              font-weight: 600;
            }

            .info-row {
              margin-bottom: 15px;
            }

            .info-row:last-child {
              margin-bottom: 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }

            thead {
              background: #169f9f;
              color: #ffffff;
            }

            th {
              padding: 12px 10px;
              font-size: 11px;
              text-align: left;
              text-transform: uppercase;
            }

            td {
              padding: 13px 10px;
              border-bottom: 1px solid #e6ecec;
              font-size: 12px;
            }

            .number {
              text-align: right;
            }

            .strong {
              font-weight: 700;
            }

            .total-area {
              display: flex;
              justify-content: flex-end;
              margin-top: 25px;
            }

            .grand-total {
              width: 300px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 16px 18px;
              background: #f0f9f9;
              border: 1px solid #cce7e7;
              border-radius: 7px;
              color: #167f7f;
            }

            .grand-total span {
              font-size: 14px;
              font-weight: 600;
            }

            .grand-total strong {
              font-size: 21px;
            }

            .status-row {
              margin-top: 20px;
              text-align: right;
              font-size: 12px;
              color: #667085;
            }

            .status-value {
              font-weight: 700;
              color: #344054;
            }

            .footer {
              margin-top: 60px;
              padding-top: 18px;
              border-top: 1px solid #e6ecec;
              text-align: center;
              color: #98a2b3;
              font-size: 11px;
            }

            @media print {
              body {
                padding: 0;
              }

              .invoice {
                max-width: none;
              }
            }
          </style>
        </head>

        <body>
          <div class="invoice">
            <div class="header">
              <div class="brand">
                <div class="logo">🐾</div>

                <div>
                  <h2 class="clinic-name">
                    ${escapeHTML(clinic.name)}
                  </h2>

                  <p class="clinic-subtitle">
                    ${escapeHTML(clinic.subtitle)}
                  </p>
                </div>
              </div>

              <div class="invoice-label">
                <h1>INVOICE</h1>

                <div>
                  ${escapeHTML(invoice.invoiceNumber)}
                </div>
              </div>
            </div>

            <div class="information">
              <div class="info-box">
                <div class="info-row">
                  <div class="info-label">
                    Bill To
                  </div>

                  <div class="info-value">
                    ${escapeHTML(invoice.ownerName)}
                  </div>
                </div>
              </div>

              <div class="info-box">
                <div class="info-row">
                  <div class="info-label">
                    Invoice Number
                  </div>

                  <div class="info-value">
                    ${escapeHTML(invoice.invoiceNumber)}
                  </div>
                </div>

                <div class="info-row">
                  <div class="info-label">
                    Date
                  </div>

                  <div class="info-value">
                    ${formatDate(invoice.date)}
                  </div>
                </div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th class="number">Qty</th>
                  <th class="number">Unit Price</th>
                  <th class="number">Total</th>
                </tr>
              </thead>

              <tbody>
                ${linesHTML}
              </tbody>
            </table>

            <div class="total-area">
              <div class="grand-total">
                <span>Grand Total</span>

                <strong>
                  ${formatMoney(total)}
                </strong>
              </div>
            </div>

            <div class="status-row">
              Payment Status:
              <span class="status-value">
                ${escapeHTML(invoice.status)}
              </span>
            </div>

            <div class="footer">
              Thank you for trusting
              ${escapeHTML(clinic.name)}
              with your pet's care.
            </div>
          </div>

          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  // =====================================================
  // ESCAPE HTML FOR PRINT
  // =====================================================

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // =====================================================
  // EXPORT TO EXCEL
  // =====================================================

  const exportToExcel = () => {
    const excelData = [];

    filteredInvoices.forEach((invoice) => {
      invoice.lines.forEach((line) => {
        excelData.push({
          "Invoice #": invoice.invoiceNumber,
          "Owner Name": invoice.ownerName,
          Date: formatDate(invoice.date),
          Type: line.type,
          Description: line.description,
          Quantity: Number(line.quantity || 0),
          "Unit Price": Number(line.unitPrice || 0),
          "Line Total": getLineTotal(line),
          "Invoice Total": getInvoiceTotal(invoice),
          Status: invoice.status,
        });
      });
    });

    const worksheet =
      XLSX.utils.json_to_sheet(excelData);

    worksheet["!cols"] = [
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 18 },
      { wch: 30 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 17 },
      { wch: 18 },
    ];

    const workbook =
      XLSX.utils.book_new();

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

  // =====================================================
  // BILLING LINES FORM
  // =====================================================

  const renderBillingLines = (
    lines,
    handleChange,
    addLine,
    removeLine
  ) => {
    return (
      <div className="billing-lines-section">
        <div className="billing-lines-heading">
          <div>
            <h3>Invoice Lines</h3>

            <p>
              Add consultation, procedure,
              medication or product to the same
              invoice.
            </p>
          </div>

          <button
            type="button"
            className="billing-add-line-button"
            onClick={addLine}
          >
            <FaPlus />
            Add Line
          </button>
        </div>

        <div className="billing-lines-list">
          {lines.map((line, index) => (
            <div
              className="billing-line-card"
              key={line.id}
            >
              <div className="billing-line-number">
                Line {index + 1}
              </div>

              <div className="billing-line-grid">
                <div className="form-field">
                  <label>Type</label>

                  <select
                    value={line.type}
                    onChange={(e) =>
                      handleChange(
                        line.id,
                        "type",
                        e.target.value
                      )
                    }
                  >
                    {billingTypes.map((type) => (
                      <option
                        value={type}
                        key={type}
                      >
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field billing-description-field">
                  <label>Description</label>

                  <input
                    type="text"
                    placeholder="Enter description"
                    value={line.description}
                    onChange={(e) =>
                      handleChange(
                        line.id,
                        "description",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Qty</label>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={line.quantity}
                    onChange={(e) =>
                      handleChange(
                        line.id,
                        "quantity",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Unit Price ($)</label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={line.unitPrice}
                    onChange={(e) =>
                      handleChange(
                        line.id,
                        "unitPrice",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="billing-line-total-box">
                  <span>Line Total</span>

                  <strong>
                    {formatMoney(
                      getLineTotal(line)
                    )}
                  </strong>
                </div>

                <button
                  type="button"
                  className="billing-remove-line-button"
                  onClick={() =>
                    removeLine(line.id)
                  }
                  disabled={lines.length === 1}
                  title={
                    lines.length === 1
                      ? "Invoice must have at least one line"
                      : "Remove line"
                  }
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="billing-form-total">
          <span>Invoice Total</span>

          <strong>
            {formatMoney(
              lines.reduce(
                (total, line) =>
                  total + getLineTotal(line),
                0
              )
            )}
          </strong>
        </div>
      </div>
    );
  };

  // =====================================================
  // MAIN RETURN
  // =====================================================

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main billing-page">
        {/* =================================================
            EXTRA BILLING STYLES
        ================================================= */}

        <style>{`
          .billing-table {
            min-width: 1050px;
          }

          .billing-table th,
          .billing-table td {
            white-space: nowrap;
          }

          .billing-services-cell {
            min-width: 230px;
          }

          .billing-service-summary {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            max-width: 300px;
          }

          .billing-service-tag {
            display: inline-flex;
            align-items: center;
            padding: 4px 8px;
            border-radius: 20px;
            background: #edf8f7;
            color: #247c78;
            font-size: 11px;
            font-weight: 600;
          }

          .billing-line-count {
            display: block;
            margin-top: 5px;
            color: #98a2b3;
            font-size: 10px;
          }

          .billing-print-button {
            color: #667085 !important;
            background: #f2f4f7 !important;
          }

          .billing-print-button:hover {
            color: #159f9f !important;
            background: #edf9f8 !important;
          }

          .status.partially-paid {
            background: #fff4df;
            color: #b76e00;
          }

          .billing-modal-wide {
            width: min(950px, 94vw);
            max-width: 950px;
            max-height: 90vh;
            overflow-y: auto;
          }

          .billing-lines-section {
            margin: 22px 0 18px;
          }

          .billing-lines-heading {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            margin-bottom: 13px;
          }

          .billing-lines-heading h3 {
            margin: 0 0 4px;
            color: #344054;
            font-size: 15px;
          }

          .billing-lines-heading p {
            margin: 0;
            color: #98a2b3;
            font-size: 11px;
          }

          .billing-add-line-button {
            width: auto !important;
            min-width: 105px;
            padding: 8px 12px !important;
            border: 1px solid #159f9f !important;
            border-radius: 6px !important;
            background: #ffffff !important;
            color: #159f9f !important;
            display: inline-flex !important;
            align-items: center;
            justify-content: center;
            gap: 6px;
            cursor: pointer;
            font-size: 12px !important;
            font-weight: 600;
          }

          .billing-add-line-button:hover {
            background: #f0fafa !important;
          }

          .billing-lines-list {
            display: flex;
            flex-direction: column;
            gap: 11px;
          }

          .billing-line-card {
            padding: 14px;
            border: 1px solid #dfe9e8;
            border-radius: 9px;
            background: #fbfdfd;
          }

          .billing-line-number {
            margin-bottom: 10px;
            color: #159f9f;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
          }

          .billing-line-grid {
            display: grid;
            grid-template-columns:
              145px
              minmax(190px, 1fr)
              80px
              125px
              120px
              38px;
            gap: 10px;
            align-items: end;
          }

          .billing-line-grid .form-field {
            margin-bottom: 0;
          }

          .billing-line-total-box {
            height: 42px;
            padding: 5px 10px;
            border: 1px solid #dce8e7;
            border-radius: 6px;
            background: #ffffff;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }

          .billing-line-total-box span {
            color: #98a2b3;
            font-size: 9px;
          }

          .billing-line-total-box strong {
            color: #344054;
            font-size: 13px;
          }

          .billing-remove-line-button {
            width: 38px !important;
            min-width: 38px !important;
            height: 42px !important;
            padding: 0 !important;
            border: 1px solid #f1c9c7 !important;
            border-radius: 6px !important;
            background: #fff7f6 !important;
            color: #d92d20 !important;
            display: flex !important;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }

          .billing-remove-line-button:disabled {
            opacity: 0.35;
            cursor: not-allowed;
          }

          .billing-form-total {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 25px;
            margin-top: 15px;
            padding: 14px 16px;
            border-radius: 8px;
            background: #edf8f7;
          }

          .billing-form-total span {
            color: #667085;
            font-size: 13px;
            font-weight: 600;
          }

          .billing-form-total strong {
            color: #158c88;
            font-size: 21px;
          }

          .billing-view-lines {
            margin: 20px 0;
            border: 1px solid #e1e9e8;
            border-radius: 8px;
            overflow: hidden;
          }

          .billing-view-lines-header {
            padding: 11px 14px;
            background: #f5f9f9;
            color: #344054;
            font-size: 13px;
            font-weight: 700;
          }

          .billing-view-lines-table {
            width: 100%;
            border-collapse: collapse;
          }

          .billing-view-lines-table th {
            padding: 9px 10px;
            background: #fbfdfd;
            border-bottom: 1px solid #e1e9e8;
            color: #667085;
            font-size: 10px;
            text-align: left;
          }

          .billing-view-lines-table td {
            padding: 10px;
            border-bottom: 1px solid #edf1f1;
            color: #475467;
            font-size: 11px;
          }

          .billing-view-lines-table tr:last-child td {
            border-bottom: 0;
          }

          .billing-view-lines-table .money {
            text-align: right;
          }

          .billing-view-total {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 14px;
            padding: 13px 15px;
            border-radius: 7px;
            background: #edf8f7;
          }

          .billing-view-total span {
            color: #667085;
            font-weight: 600;
          }

          .billing-view-total strong {
            color: #168b87;
            font-size: 20px;
          }

          .billing-modal-print {
            width: auto !important;
            display: inline-flex !important;
            align-items: center;
            justify-content: center;
            gap: 7px;
            padding: 9px 15px !important;
            border: 1px solid #159f9f !important;
            border-radius: 6px !important;
            background: #ffffff !important;
            color: #159f9f !important;
            cursor: pointer;
          }

          @media (max-width: 900px) {
            .billing-line-grid {
              grid-template-columns: 1fr 1fr;
            }

            .billing-description-field {
              grid-column: span 1;
            }

            .billing-remove-line-button {
              width: 100% !important;
            }
          }

          @media (max-width: 600px) {
            .billing-line-grid {
              grid-template-columns: 1fr;
            }

            .billing-lines-heading {
              flex-direction: column;
            }
          }
        `}</style>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="page-header billing-page-header">
          <div className="billing-title">
            <h1>Billing</h1>

            <p>
              Manage invoices and payments
            </p>
          </div>

          <div className="billing-header-actions">
            <button
              type="button"
              className="billing-export-button"
              onClick={exportToExcel}
            >
              <FaFileExcel />
              <span>Export</span>
            </button>

            <button
              type="button"
              className="billing-add-button"
              onClick={() => {
                setNewInvoice(
                  createEmptyInvoice()
                );

                setShowAddModal(true);
              }}
            >
              + Add Invoice
            </button>
          </div>
        </div>

        {/* =================================================
            SEARCH + FILTERS
        ================================================= */}

        <div className="billing-filter-row">
          <div className="billing-search-box">
            <FaSearch className="billing-search-icon" />

            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {hasActiveFilters && (
              <button
                type="button"
                className="billing-clear-button"
                onClick={clearFilters}
                title="Clear filters"
                aria-label="Clear filters"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <select
            className="billing-filter-select"
            value={serviceFilter}
            onChange={(e) =>
              setServiceFilter(
                e.target.value
              )
            }
          >
            <option value="All">
              All Types
            </option>

            {billingTypes.map((type) => (
              <option
                key={type}
                value={type}
              >
                {type}
              </option>
            ))}
          </select>

          <select
            className="billing-filter-select"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
          >
            <option value="All">
              All Status
            </option>

            <option value="Paid">
              Paid
            </option>

            <option value="Partially Paid">
              Partially Paid
            </option>

            <option value="Unpaid">
              Unpaid
            </option>

            <option value="Cancelled">
              Cancelled
            </option>
          </select>
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="owners-table-container billing-table-container">
          <div className="billing-table-scroll">
            <table className="owners-table billing-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Owner Name</th>
                  <th>Date</th>
                  <th>Invoice Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedInvoices.length > 0 ? (
                  paginatedInvoices.map(
                    (invoice) => (
                      <tr key={invoice.id}>
                        <td>
                          <strong>
                            {invoice.invoiceNumber}
                          </strong>
                        </td>

                        <td>
                          {invoice.ownerName}
                        </td>

                        <td>
                          {formatDate(
                            invoice.date
                          )}
                        </td>

                        <td className="billing-services-cell">
                          <div className="billing-service-summary">
                            {[
                              ...new Set(
                                invoice.lines.map(
                                  (line) =>
                                    line.type
                                )
                              ),
                            ].map((type) => (
                              <span
                                key={type}
                                className="billing-service-tag"
                              >
                                {type}
                              </span>
                            ))}
                          </div>

                          <span className="billing-line-count">
                            {invoice.lines.length}{" "}
                            invoice{" "}
                            {invoice.lines.length ===
                            1
                              ? "line"
                              : "lines"}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {formatMoney(
                              getInvoiceTotal(
                                invoice
                              )
                            )}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={getStatusClass(
                              invoice.status
                            )}
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
                                handleViewInvoice(
                                  invoice
                                )
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
                                handleOpenEdit(
                                  invoice
                                )
                              }
                              title="Edit"
                              aria-label="Edit invoice"
                            >
                              <FaPen />
                            </button>

                            <button
                              type="button"
                              className="billing-print-button icon-button"
                              onClick={() =>
                                handlePrintInvoice(
                                  invoice
                                )
                              }
                              title="Print"
                              aria-label="Print invoice"
                            >
                              <FaPrint />
                            </button>

                            <button
                              type="button"
                              className="delete-button icon-button"
                              onClick={() =>
                                handleDeleteInvoice(
                                  invoice.id
                                )
                              }
                              title="Delete"
                              aria-label="Delete invoice"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
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
        </div>

        {/* =================================================
            PAGINATION
        ================================================= */}

        <div className="billing-pagination">
          <div className="billing-rows">
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
              <option value={50}>50</option>
            </select>
          </div>

          <div className="billing-page-controls">
            <button
              type="button"
              className="billing-pagination-button"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((previous) =>
                  Math.max(
                    previous - 1,
                    1
                  )
                )
              }
            >
              Previous
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <button
                type="button"
                key={page}
                className={`billing-page-number ${
                  currentPage === page
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setCurrentPage(page)
                }
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              className="billing-pagination-button"
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
            >
              Next
            </button>
          </div>
        </div>
      </main>

      {/* =====================================================
          ADD INVOICE MODAL
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
          <div className="modal-container billing-modal-wide">
            <div className="modal-header">
              <div>
                <h2>Add Invoice</h2>

                <p>
                  Add all services, medications
                  and products under one invoice
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

            <form onSubmit={handleAddInvoice}>
              <div className="form-row">
                <div className="form-field">
                  <label>
                    Invoice Number
                  </label>

                  <input
                    type="text"
                    name="invoiceNumber"
                    placeholder="Example: INV-004"
                    value={
                      newInvoice.invoiceNumber
                    }
                    onChange={
                      handleNewInvoiceChange
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Owner Name</label>

                  <input
                    type="text"
                    name="ownerName"
                    placeholder="Enter owner name"
                    value={
                      newInvoice.ownerName
                    }
                    onChange={
                      handleNewInvoiceChange
                    }
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
                    onChange={
                      handleNewInvoiceChange
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Status</label>

                  <select
                    name="status"
                    value={
                      newInvoice.status
                    }
                    onChange={
                      handleNewInvoiceChange
                    }
                  >
                    <option value="Paid">
                      Paid
                    </option>

                    <option value="Partially Paid">
                      Partially Paid
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

              {renderBillingLines(
                newInvoice.lines,
                handleNewLineChange,
                addNewInvoiceLine,
                removeNewInvoiceLine
              )}

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
                  Add Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          VIEW INVOICE MODAL
      ===================================================== */}

      {showViewModal && selectedInvoice && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowViewModal(false);
              setSelectedInvoice(null);
            }
          }}
        >
          <div className="modal-container billing-modal-wide">
            <div className="modal-header">
              <div>
                <h2>Invoice Details</h2>

                <p>
                  View complete invoice
                  information
                </p>
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
                {formatDate(
                  selectedInvoice.date
                )}
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

            <div className="billing-view-lines">
              <div className="billing-view-lines-header">
                Invoice Lines
              </div>

              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table className="billing-view-lines-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Description</th>
                      <th>Qty</th>
                      <th className="money">
                        Unit Price
                      </th>
                      <th className="money">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedInvoice.lines.map(
                      (line) => (
                        <tr key={line.id}>
                          <td>{line.type}</td>

                          <td>
                            {line.description}
                          </td>

                          <td>
                            {line.quantity}
                          </td>

                          <td className="money">
                            {formatMoney(
                              line.unitPrice
                            )}
                          </td>

                          <td className="money">
                            <strong>
                              {formatMoney(
                                getLineTotal(
                                  line
                                )
                              )}
                            </strong>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="billing-view-total">
              <span>Grand Total</span>

              <strong>
                {formatMoney(
                  getInvoiceTotal(
                    selectedInvoice
                  )
                )}
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
                className="billing-modal-print"
                onClick={() =>
                  handlePrintInvoice(
                    selectedInvoice
                  )
                }
              >
                <FaPrint />
                <span>Print Invoice</span>
              </button>

              <button
                type="button"
                className="edit-button billing-modal-edit"
                onClick={() => {
                  setShowViewModal(false);

                  setSelectedInvoice({
                    ...selectedInvoice,
                    lines:
                      selectedInvoice.lines.map(
                        (line) => ({
                          ...line,
                        })
                      ),
                  });

                  setShowEditModal(true);
                }}
              >
                <FaPen />
                <span>Edit Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          EDIT INVOICE MODAL
      ===================================================== */}

      {showEditModal && selectedInvoice && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModal(false);
              setSelectedInvoice(null);
            }
          }}
        >
          <div className="modal-container billing-modal-wide">
            <div className="modal-header">
              <div>
                <h2>Edit Invoice</h2>

                <p>
                  Update invoice information
                  and billing lines
                </p>
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

            <form
              onSubmit={
                handleUpdateInvoice
              }
            >
              <div className="form-row">
                <div className="form-field">
                  <label>
                    Invoice Number
                  </label>

                  <input
                    type="text"
                    name="invoiceNumber"
                    value={
                      selectedInvoice.invoiceNumber
                    }
                    onChange={
                      handleEditChange
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Owner Name</label>

                  <input
                    type="text"
                    name="ownerName"
                    value={
                      selectedInvoice.ownerName
                    }
                    onChange={
                      handleEditChange
                    }
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
                    value={
                      selectedInvoice.date
                    }
                    onChange={
                      handleEditChange
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Status</label>

                  <select
                    name="status"
                    value={
                      selectedInvoice.status
                    }
                    onChange={
                      handleEditChange
                    }
                  >
                    <option value="Paid">
                      Paid
                    </option>

                    <option value="Partially Paid">
                      Partially Paid
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

              {renderBillingLines(
                selectedInvoice.lines,
                handleEditLineChange,
                addEditInvoiceLine,
                removeEditInvoiceLine
              )}

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