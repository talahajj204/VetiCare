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
  FaFileInvoiceDollar,
  FaShoppingBag,
  FaCashRegister,
} from "react-icons/fa";

import * as XLSX from "xlsx";

const STORE_ORDERS_KEY = "vetClinicStoreOrders";
const POS_SALES_KEY = "vetClinicPOSSales";
const BILLING_INVOICES_KEY = "vetClinicBillingInvoices";

const readPrintBrand = () => {
  try {
    const settings = JSON.parse(
      localStorage.getItem("storeSettings") || "{}"
    );

    const name = String(settings?.storeName || "").trim();
    const image = settings?.storeBanner;
    let logo = "";

    if (typeof image === "string") {
      const value = image.trim();

      if (
        /^data:image\/(?:png|jpeg|webp);base64,/i.test(value) ||
        /^https?:\/\//i.test(value) ||
        /^blob:/i.test(value) ||
        /^\/(?!\/)/.test(value)
      ) {
        logo = value;
      }
    }

    return { name, logo };
  } catch {
    return { name: "", logo: "" };
  }
};

function Billing() {
  // CLINIC INFORMATION

  const clinic = {
    name: "PawCare Veterinary Clinic",
    subtitle: "Veterinary Care & Pet Wellness",
  };

  // HELPERS

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

  // DEFAULT INVOICES

  const defaultInvoices = [
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
  ];

  // INVOICES

  const [invoices, setInvoices] = useState(() => {
    try {
      const saved = localStorage.getItem(BILLING_INVOICES_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      console.error("Could not load billing invoices:", error);
    }

    return defaultInvoices;
  });

  const [storeOrders, setStoreOrders] = useState([]);
  const [posSales, setPosSales] = useState([]);
  const [activeTab, setActiveTab] = useState("invoices");

  const billingTypes = [
    "Consultation",
    "Procedure",
    "Medication",
    "Product",
  ];

  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [selectedTransaction, setSelectedTransaction] =
    useState(null);

  const [transactionModalOpen, setTransactionModalOpen] =
    useState(false);

  const [newInvoice, setNewInvoice] = useState(
    createEmptyInvoice()
  );

  // SAVE INVOICES

  useEffect(() => {
    try {
      localStorage.setItem(
        BILLING_INVOICES_KEY,
        JSON.stringify(invoices)
      );
    } catch (error) {
      console.error("Could not save billing invoices:", error);
    }
  }, [invoices]);

  // LOAD STORE ORDERS

  useEffect(() => {
    const loadStoreOrders = () => {
      try {
        const saved = localStorage.getItem(STORE_ORDERS_KEY);

        if (!saved) {
          setStoreOrders([]);
          return;
        }

        const parsed = JSON.parse(saved);
        setStoreOrders(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error("Could not load store orders:", error);
        setStoreOrders([]);
      }
    };

    const handleOrdersUpdated = (event) => {
      if (Array.isArray(event?.detail)) {
        setStoreOrders(event.detail);
        return;
      }

      loadStoreOrders();
    };

    loadStoreOrders();

    window.addEventListener(
      "vetClinicOrdersUpdated",
      handleOrdersUpdated
    );

    window.addEventListener("storage", loadStoreOrders);

    return () => {
      window.removeEventListener(
        "vetClinicOrdersUpdated",
        handleOrdersUpdated
      );

      window.removeEventListener("storage", loadStoreOrders);
    };
  }, []);

  // LOAD POS SALES

  useEffect(() => {
    const loadPOSSales = () => {
      try {
        const saved = localStorage.getItem(POS_SALES_KEY);

        if (!saved) {
          setPosSales([]);
          return;
        }

        const parsed = JSON.parse(saved);
        setPosSales(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error("Could not load POS sales:", error);
        setPosSales([]);
      }
    };

    const handlePOSSalesUpdated = (event) => {
      if (Array.isArray(event?.detail)) {
        setPosSales(event.detail);
        return;
      }

      loadPOSSales();
    };

    loadPOSSales();

    window.addEventListener(
      "vetClinicPOSSalesUpdated",
      handlePOSSalesUpdated
    );

    window.addEventListener("storage", loadPOSSales);

    return () => {
      window.removeEventListener(
        "vetClinicPOSSalesUpdated",
        handlePOSSalesUpdated
      );

      window.removeEventListener("storage", loadPOSSales);
    };
  }, []);

  // MONEY + DATE

  const formatMoney = (value) => {
    return `$${Number(value || 0).toFixed(2)}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const value = new Date(date);

    if (!Number.isNaN(value.getTime())) {
      return value.toLocaleDateString();
    }

    return String(date);
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return String(date);
    }

    return value.toLocaleString();
  };

  // INVOICE TOTALS

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

  // STORE ORDER HELPERS

  const getOrderId = (order) => {
    return (
      order.orderNumber ||
      order.orderId ||
      order.id ||
      "-"
    );
  };

  const getOrderCustomer = (order) => {
    return (
      order.customer?.fullName ||
      order.customer?.name ||
      order.fullName ||
      order.customerName ||
      order.ownerName ||
      order.name ||
      "Customer"
    );
  };

  const getOrderPhone = (order) => {
    return order.customer?.phone || order.phone || "-";
  };

  const getOrderItems = (order) => {
    if (Array.isArray(order.items)) {
      return order.items;
    }

    if (Array.isArray(order.products)) {
      return order.products;
    }

    if (Array.isArray(order.cart)) {
      return order.cart;
    }

    return [];
  };

  const getOrderTotal = (order) => {
    if (
      order.total !== undefined &&
      order.total !== null
    ) {
      return Number(order.total) || 0;
    }

    if (
      order.totalPrice !== undefined &&
      order.totalPrice !== null
    ) {
      return Number(order.totalPrice) || 0;
    }

    if (
      order.grandTotal !== undefined &&
      order.grandTotal !== null
    ) {
      return Number(order.grandTotal) || 0;
    }

    return getOrderItems(order).reduce(
      (total, item) => {
        const price =
          Number(item.price ?? item.sellingPrice ?? 0) || 0;

        const quantity =
          Number(item.quantity || 1) || 1;

        return total + price * quantity;
      },
      0
    );
  };

  const getOrderDate = (order) => {
    return (
      order.date ||
      order.createdAt ||
      order.orderDate ||
      "-"
    );
  };

  const getOrderPayment = (order) => {
    return order.paymentMethod || order.payment || "-";
  };

  const getOrderStatus = (order) => {
    return order.status || "Pending";
  };

  const getOrderNote = (order) => {
    return (
      order.notes ||
      order.note ||
      order.customerNote ||
      "-"
    );
  };

  // POS SALE HELPERS

  const getSaleId = (sale) => {
    return sale.id || sale.saleId || sale.saleNumber || "-";
  };

  const getSaleCustomer = (sale) => {
    return (
      sale.owner ||
      sale.customer?.name ||
      sale.customerName ||
      "Walk-in Customer"
    );
  };

  const getSalePhone = (sale) => {
    return (
      sale.ownerPhone ||
      sale.customer?.phone ||
      sale.phone ||
      "-"
    );
  };

  const getSaleItems = (sale) => {
    return Array.isArray(sale.items) ? sale.items : [];
  };

  const getSaleTotal = (sale) => {
    return Number(sale.total || 0);
  };

  const getSaleDate = (sale) => {
    return sale.date || sale.createdAt || "-";
  };

  const getSalePayment = (sale) => {
    return sale.paymentMethod || "Cash";
  };

  // PRODUCT SUMMARY

  const getItemsSummary = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return "-";
    }

    return items
      .map((item) => {
        const name =
          item.name ||
          item.productName ||
          item.title ||
          "Product";

        const quantity = Number(item.quantity || 1);

        return `${name} × ${quantity}`;
      })
      .join(", ");
  };

  // FILTERED INVOICES

  const filteredInvoices = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const invoiceLines = invoice.lines || [];

      const matchesSearch =
        searchText === "" ||
        String(invoice.invoiceNumber || "")
          .toLowerCase()
          .includes(searchText) ||
        String(invoice.ownerName || "")
          .toLowerCase()
          .includes(searchText) ||
        String(invoice.date || "")
          .toLowerCase()
          .includes(searchText) ||
        String(invoice.status || "")
          .toLowerCase()
          .includes(searchText) ||
        invoiceLines.some((line) =>
          `${line.type || ""} ${line.description || ""}`
            .toLowerCase()
            .includes(searchText)
        );

      const matchesService =
        serviceFilter === "All" ||
        invoiceLines.some(
          (line) => line.type === serviceFilter
        );

      const matchesStatus =
        statusFilter === "All" ||
        invoice.status === statusFilter;

      return matchesSearch && matchesService && matchesStatus;
    });
  }, [
    invoices,
    search,
    serviceFilter,
    statusFilter,
  ]);

  // FILTERED STORE ORDERS

  const filteredStoreOrders = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return storeOrders.filter((order) => {
      const searchableText = [
        getOrderId(order),
        getOrderCustomer(order),
        getOrderPhone(order),
        getOrderPayment(order),
        getOrderStatus(order),
        getOrderNote(order),
        getItemsSummary(getOrderItems(order)),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchText ||
        searchableText.includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        getOrderStatus(order) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    storeOrders,
    search,
    statusFilter,
  ]);

  // FILTERED POS SALES

  const filteredPOSSales = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return posSales.filter((sale) => {
      const searchableText = [
        getSaleId(sale),
        getSaleCustomer(sale),
        getSalePhone(sale),
        getSalePayment(sale),
        sale.cashier || "",
        getItemsSummary(getSaleItems(sale)),
      ]
        .join(" ")
        .toLowerCase();

      return !searchText || searchableText.includes(searchText);
    });
  }, [posSales, search]);

  // CURRENT TAB DATA + PAGINATION

  const currentData = useMemo(() => {
    if (activeTab === "orders") {
      return filteredStoreOrders;
    }

    if (activeTab === "sales") {
      return filteredPOSSales;
    }

    return filteredInvoices;
  }, [
    activeTab,
    filteredInvoices,
    filteredStoreOrders,
    filteredPOSSales,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(currentData.length / rowsPerPage)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    activeTab,
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

  const startIndex = (currentPage - 1) * rowsPerPage;

  const paginatedInvoices = filteredInvoices.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const paginatedOrders = filteredStoreOrders.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const paginatedSales = filteredPOSSales.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // FILTER ACTIONS

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

  const changeTab = (tab) => {
    setActiveTab(tab);
    setSearch("");
    setServiceFilter("All");
    setStatusFilter("All");
    setCurrentPage(1);
  };

  // INVOICE FORM CHANGES

  const handleNewInvoiceChange = (event) => {
    const { name, value } = event.target;

    setNewInvoice((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setSelectedInvoice((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // NEW INVOICE LINES

  const handleNewLineChange = (lineId, field, value) => {
    setNewInvoice((previous) => ({
      ...previous,
      lines: previous.lines.map((line) =>
        line.id === lineId
          ? { ...line, [field]: value }
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

  // EDIT INVOICE LINES

  const handleEditLineChange = (lineId, field, value) => {
    setSelectedInvoice((previous) => ({
      ...previous,
      lines: previous.lines.map((line) =>
        line.id === lineId
          ? { ...line, [field]: value }
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

  // VALIDATE INVOICE

  const invoiceIsValid = (invoice) => {
    if (!invoice.lines || invoice.lines.length === 0) {
      alert("Please add at least one invoice line.");
      return false;
    }

    const invalidLine = invoice.lines.some(
      (line) =>
        !String(line.description || "").trim() ||
        Number(line.quantity) <= 0 ||
        Number(line.unitPrice) < 0
    );

    if (invalidLine) {
      alert("Please complete all invoice lines correctly.");
      return false;
    }

    return true;
  };

  // ADD / VIEW / EDIT / DELETE INVOICE

  const handleAddInvoice = (event) => {
    event.preventDefault();

    if (!invoiceIsValid(newInvoice)) {
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

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowViewModal(true);
  };

  const handleOpenEdit = (invoice) => {
    setSelectedInvoice({
      ...invoice,
      lines: invoice.lines.map((line) => ({
        ...line,
      })),
    });

    setShowEditModal(true);
  };

  const handleUpdateInvoice = (event) => {
    event.preventDefault();

    if (!invoiceIsValid(selectedInvoice)) {
      return;
    }

    const updatedInvoice = {
      ...selectedInvoice,
      lines: selectedInvoice.lines.map((line) => ({
        ...line,
        quantity: Number(line.quantity) || 1,
        unitPrice: Number(line.unitPrice) || 0,
      })),
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

  const handleDeleteInvoice = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this invoice?"
    );

    if (!confirmDelete) {
      return;
    }

    setInvoices((previous) =>
      previous.filter((invoice) => invoice.id !== id)
    );
  };

  // TRANSACTION DETAILS

  const handleViewOrder = (order) => {
    setSelectedTransaction({
      type: "Store Order",
      data: order,
    });

    setTransactionModalOpen(true);
  };

  const handleViewSale = (sale) => {
    setSelectedTransaction({
      type: "POS Sale",
      data: sale,
    });

    setTransactionModalOpen(true);
  };

  // STATUS

  const getStatusClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (
      value === "paid" ||
      value === "delivered" ||
      value === "completed" ||
      value === "confirmed"
    ) {
      return "status confirmed";
    }

    if (value === "partially paid") {
      return "status partially-paid";
    }

    if (value === "cancelled" || value === "canceled") {
      return "status cancelled";
    }

    return "status pending";
  };

  // ESCAPE HTML

  const escapeHTML = (value) => {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // PRINT INVOICE

  const handlePrintInvoice = (invoice) => {
    const printBrand = readPrintBrand();

    const printWindow = window.open(
      "",
      "_blank",
      "width=900,height=800"
    );

    if (!printWindow) {
      alert("Please allow pop-ups to print the invoice.");
      return;
    }

    const total = getInvoiceTotal(invoice);

    const logoHTML = printBrand.logo
      ? `<img
          class="brand-logo"
          src="${escapeHTML(printBrand.logo)}"
          alt="${escapeHTML(printBrand.name)}"
        />`
      : "";

    const linesHTML = (invoice.lines || [])
      .map(
        (line, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHTML(line.type)}</td>
            <td>${escapeHTML(line.description)}</td>
            <td>${Number(line.quantity || 0)}</td>
            <td>${formatMoney(line.unitPrice)}</td>
            <td>
              <strong>
                ${formatMoney(getLineTotal(line))}
              </strong>
            </td>
          </tr>
        `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />

          <title>
            ${escapeHTML(invoice.invoiceNumber)}
          </title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 40px;
              font-family: Arial, Helvetica, sans-serif;
              color: #253333;
            }

            .invoice {
              max-width: 900px;
              margin: 0 auto;
            }

            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding-bottom: 22px;
              border-bottom: 2px solid #169f9f;
            }

            .brand {
              display: flex;
              align-items: center;
              gap: 14px;
            }

            .brand-logo {
              display: block;
              width: 65px;
              height: 65px;
              flex-shrink: 0;
              object-fit: contain;
            }

            .brand h2 {
              margin: 0;
              color: #168f8f;
              overflow-wrap: anywhere;
            }

            .brand p {
              margin: 5px 0 0;
              color: #7b8c8b;
              font-size: 12px;
            }

            .invoice-title {
              text-align: right;
            }

            .invoice-title h1 {
              margin: 0;
              color: #344054;
            }

            .info {
              margin: 30px 0;
              padding: 18px;
              border-radius: 8px;
              background: #f8fbfb;
            }

            .info-row {
              margin: 8px 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            th {
              padding: 12px;
              background: #169f9f;
              color: white;
              text-align: left;
              font-size: 11px;
            }

            td {
              padding: 12px;
              border-bottom: 1px solid #e6ecec;
              font-size: 12px;
            }

            .grand-total {
              margin-top: 25px;
              padding: 16px;
              background: #f0f9f9;
              color: #167f7f;
              text-align: right;
              font-size: 20px;
              font-weight: 700;
            }
          </style>
        </head>

        <body>
          <div class="invoice">
            <div class="header">
              <div class="brand">
                ${logoHTML}

                <div>
                  <h2>${escapeHTML(printBrand.name)}</h2>
                  <p>${escapeHTML(clinic.subtitle)}</p>
                </div>
              </div>

              <div class="invoice-title">
                <h1>INVOICE</h1>
                <div>${escapeHTML(invoice.invoiceNumber)}</div>
              </div>
            </div>

            <div class="info">
              <div class="info-row">
                <strong>Bill To:</strong>
                ${escapeHTML(invoice.ownerName)}
              </div>

              <div class="info-row">
                <strong>Date:</strong>
                ${formatDate(invoice.date)}
              </div>

              <div class="info-row">
                <strong>Status:</strong>
                ${escapeHTML(invoice.status)}
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                ${linesHTML}
              </tbody>
            </table>

            <div class="grand-total">
              Grand Total:
              ${formatMoney(total)}
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

  // EXPORT

  const exportToExcel = () => {
    let data = [];
    let sheetName = "Billing";
    let fileName = "vet-clinic-billing.xlsx";

    if (activeTab === "invoices") {
      data = filteredInvoices.flatMap((invoice) =>
        (invoice.lines || []).map((line) => ({
          "Invoice #": invoice.invoiceNumber,
          Owner: invoice.ownerName,
          Date: formatDate(invoice.date),
          Type: line.type,
          Description: line.description,
          Quantity: Number(line.quantity || 0),
          "Unit Price": Number(line.unitPrice || 0),
          "Line Total": getLineTotal(line),
          "Invoice Total": getInvoiceTotal(invoice),
          Status: invoice.status,
        }))
      );

      sheetName = "Invoices";
      fileName = "vet-clinic-invoices.xlsx";
    }

    if (activeTab === "orders") {
      data = filteredStoreOrders.map((order) => ({
        "Order ID": getOrderId(order),
        Customer: getOrderCustomer(order),
        Phone: getOrderPhone(order),
        Products: getItemsSummary(getOrderItems(order)),
        Total: getOrderTotal(order),
        Payment: getOrderPayment(order),
        Date: formatDateTime(getOrderDate(order)),
        Status: getOrderStatus(order),
        Note: getOrderNote(order),
      }));

      sheetName = "Store Orders";
      fileName = "vet-clinic-store-orders.xlsx";
    }

    if (activeTab === "sales") {
      data = filteredPOSSales.map((sale) => ({
        "Sale ID": getSaleId(sale),
        Customer: getSaleCustomer(sale),
        Phone: getSalePhone(sale),
        Products: getItemsSummary(getSaleItems(sale)),
        Subtotal: Number(sale.subtotal || 0),
        Discount: Number(sale.discount || 0),
        Total: getSaleTotal(sale),
        Payment: getSalePayment(sale),
        Cashier: sale.cashier || "-",
        Delivery: sale.hasDelivery ? "Yes" : "No",
        Date: formatDateTime(getSaleDate(sale)),
      }));

      sheetName = "POS Sales";
      fileName = "vet-clinic-pos-sales.xlsx";
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      sheetName
    );

    XLSX.writeFile(workbook, fileName);
  };

  // BILLING LINES FORM

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
              medication or product to the same invoice.
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
                    onChange={(event) =>
                      handleChange(
                        line.id,
                        "type",
                        event.target.value
                      )
                    }
                  >
                    {billingTypes.map((type) => (
                      <option key={type} value={type}>
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
                    onChange={(event) =>
                      handleChange(
                        line.id,
                        "description",
                        event.target.value
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
                    onChange={(event) =>
                      handleChange(
                        line.id,
                        "quantity",
                        event.target.value
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
                    onChange={(event) =>
                      handleChange(
                        line.id,
                        "unitPrice",
                        event.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="billing-line-total-box">
                  <span>Line Total</span>
                  <strong>
                    {formatMoney(getLineTotal(line))}
                  </strong>
                </div>

                <button
                  type="button"
                  className="billing-remove-line-button"
                  onClick={() => removeLine(line.id)}
                  disabled={lines.length === 1}
                  title="Remove line"
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
                (total, line) => total + getLineTotal(line),
                0
              )
            )}
          </strong>
        </div>
      </div>
    );
  };

  // STATS

  const invoiceRevenue = useMemo(
    () =>
      invoices.reduce(
        (total, invoice) => total + getInvoiceTotal(invoice),
        0
      ),
    [invoices]
  );

  const storeRevenue = useMemo(
    () =>
      storeOrders.reduce(
        (total, order) => total + getOrderTotal(order),
        0
      ),
    [storeOrders]
  );

  const posRevenue = useMemo(
    () =>
      posSales.reduce(
        (total, sale) => total + getSaleTotal(sale),
        0
      ),
    [posSales]
  );

  const totalRevenue =
    invoiceRevenue + storeRevenue + posRevenue;  return (
      <div className="dashboard-layout">
        <Sidebar />
  
        <main className="dashboard-main billing-page">
          <style>{`
            /* BILLING PAGE */
  
            .billing-page {
              min-width: 0;
            }
  
            .billing-page-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 20px;
              margin-bottom: 22px;
            }
  
            .billing-title h1 {
              margin: 0 0 5px;
              color: #344054;
              font-size: 26px;
              font-weight: 700;
            }
  
            .billing-title p {
              margin: 0;
              color: #98a2b3;
              font-size: 12px;
            }
  
            .billing-header-actions {
              display: flex;
              align-items: center;
              gap: 10px;
            }
  
            .billing-export-button,
            .billing-add-button {
              height: 40px;
              padding: 0 15px;
              border-radius: 8px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 7px;
              cursor: pointer;
              font-size: 12px;
              font-weight: 600;
              transition: 0.2s ease;
            }
  
            .billing-export-button {
              border: 1px solid #d8e4e3;
              background: #ffffff;
              color: #475467;
            }
  
            .billing-export-button:hover {
              border-color: #159f9f;
              color: #159f9f;
            }
  
            .billing-add-button {
              border: 1px solid #159f9f;
              background: #159f9f;
              color: #ffffff;
            }
  
            .billing-add-button:hover {
              background: #118b8b;
            }
  
            /* SUMMARY CARDS */
  
            .billing-summary-grid {
              display: grid;
              grid-template-columns: repeat(4, minmax(0, 1fr));
              gap: 15px;
              margin-bottom: 22px;
            }
  
            .billing-summary-card {
              min-width: 0;
              padding: 18px;
              border: 1px solid #e2ebea;
              border-radius: 11px;
              background: #ffffff;
            }
  
            .billing-summary-top {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 12px;
              margin-bottom: 13px;
            }
  
            .billing-summary-icon {
              width: 38px;
              height: 38px;
              flex-shrink: 0;
              border-radius: 9px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #edf9f8;
              color: #159f9f;
              font-size: 15px;
            }
  
            .billing-summary-label {
              color: #98a2b3;
              font-size: 11px;
              font-weight: 600;
            }
  
            .billing-summary-value {
              margin: 0;
              color: #344054;
              font-size: 21px;
              font-weight: 700;
              word-break: break-word;
            }
  
            .billing-summary-small {
              margin-top: 4px;
              color: #98a2b3;
              font-size: 10px;
            }
  
            /* TABS */
  
            .billing-tabs {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              margin-bottom: 18px;
              padding: 6px;
              border: 1px solid #e1ebea;
              border-radius: 10px;
              background: #ffffff;
            }
  
            .billing-tab {
              min-width: 145px;
              height: 40px;
              padding: 0 15px;
              border: none;
              border-radius: 7px;
              background: transparent;
              color: #667085;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              cursor: pointer;
              font-size: 11px;
              font-weight: 600;
              transition: 0.2s ease;
            }
  
            .billing-tab:hover {
              background: #f3f9f8;
              color: #159f9f;
            }
  
            .billing-tab.active {
              background: #159f9f;
              color: #ffffff;
            }
  
            .billing-tab-count {
              min-width: 20px;
              height: 20px;
              padding: 0 6px;
              border-radius: 20px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              background: rgba(255, 255, 255, 0.22);
              font-size: 9px;
            }
  
            .billing-tab:not(.active) .billing-tab-count {
              background: #edf4f4;
              color: #667085;
            }
  
            /* SEARCH + FILTERS */
  
            .billing-filter-row {
              display: grid;
              grid-template-columns: minmax(300px, 1fr) 190px 190px;
              gap: 12px;
              align-items: center;
              margin-bottom: 18px;
            }
  
            .billing-search-box {
              position: relative;
              width: 100%;
              height: 44px;
              margin: 0;
              padding: 0;
              border: none;
              background: transparent;
            }
  
            .billing-search-icon {
              position: absolute;
              left: 15px;
              top: 50%;
              transform: translateY(-50%);
              z-index: 2;
              color: #7f9f9d;
              font-size: 14px;
              pointer-events: none;
            }
  
            .billing-search-box input {
              display: block;
              width: 100%;
              height: 44px;
              margin: 0;
              padding: 0 42px 0 43px;
              border: 1px solid #d5e3e2;
              border-radius: 8px;
              outline: none;
              background: #ffffff;
              box-shadow: none;
              color: #344054;
              font-family: inherit;
              font-size: 12px;
              transition:
                border-color 0.2s ease,
                box-shadow 0.2s ease;
            }
  
            .billing-search-box input::placeholder {
              color: #98a2b3;
            }
  
            .billing-search-box input:hover {
              border-color: #bfd3d1;
            }
  
            .billing-search-box input:focus {
              border-color: #159f9f;
              box-shadow: 0 0 0 3px rgba(21, 159, 159, 0.08);
            }
  
            .billing-clear-button {
              position: absolute;
              right: 10px;
              top: 50%;
              transform: translateY(-50%);
              z-index: 3;
              width: 25px;
              height: 25px;
              padding: 0;
              border: none;
              border-radius: 50%;
              background: #f2f6f6;
              color: #7b8d8c;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              font-size: 10px;
            }
  
            .billing-clear-button:hover {
              background: #e8f4f3;
              color: #159f9f;
            }
  
            .billing-filter-select {
              width: 100%;
              height: 44px;
              margin: 0;
              padding: 0 36px 0 13px;
              border: 1px solid #d5e3e2;
              border-radius: 8px;
              outline: none;
              background: #ffffff;
              color: #475467;
              font-family: inherit;
              font-size: 11px;
              cursor: pointer;
              transition:
                border-color 0.2s ease,
                box-shadow 0.2s ease;
            }
  
            .billing-filter-select:hover {
              border-color: #bfd3d1;
            }
  
            .billing-filter-select:focus {
              border-color: #159f9f;
              box-shadow: 0 0 0 3px rgba(21, 159, 159, 0.08);
            }
  
            /* TABLE */
  
            .billing-table-container {
              width: 100%;
              overflow: hidden;
              border: 1px solid #dce8e7;
              border-radius: 11px;
              background: #ffffff;
            }
  
            .billing-table-scroll {
              width: 100%;
              overflow-x: auto;
            }
  
            .billing-table {
              width: 100%;
              min-width: 1050px;
              border-collapse: collapse;
            }
  
            .billing-table th {
              padding: 14px 15px;
              background: #f3f8f7;
              color: #258e8b;
              text-align: left;
              font-size: 11px;
              font-weight: 700;
              white-space: nowrap;
            }
  
            .billing-table td {
              padding: 14px 15px;
              border-bottom: 1px solid #e7eeee;
              color: #344054;
              font-size: 11px;
              vertical-align: middle;
              white-space: nowrap;
            }
  
            .billing-table tbody tr:last-child td {
              border-bottom: none;
            }
  
            .billing-table tbody tr:hover {
              background: #fcfefe;
            }
  
            .billing-services-cell {
              min-width: 220px;
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
              font-size: 9px;
              font-weight: 700;
            }
  
            .billing-line-count {
              display: block;
              margin-top: 5px;
              color: #98a2b3;
              font-size: 9px;
            }
  
            .billing-products-summary {
              max-width: 280px;
              overflow: hidden;
              text-overflow: ellipsis;
              color: #667085;
              font-size: 11px;
            }
  
            .billing-source-badge {
              display: inline-flex;
              align-items: center;
              gap: 5px;
              padding: 5px 9px;
              border-radius: 20px;
              font-size: 9px;
              font-weight: 700;
            }
  
            .billing-source-badge.store {
              background: #edf8ff;
              color: #2970b8;
            }
  
            .billing-source-badge.pos {
              background: #f0f9f3;
              color: #21865d;
            }
  
            .billing-payment-badge {
              display: inline-flex;
              align-items: center;
              padding: 5px 9px;
              border-radius: 20px;
              background: #f2f4f7;
              color: #475467;
              font-size: 9px;
              font-weight: 700;
            }
  
            .billing-empty-row td {
              padding: 50px 20px !important;
              text-align: center;
            }
  
            .billing-empty {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 8px;
              color: #98a2b3;
            }
  
            .billing-empty svg {
              font-size: 30px;
              color: #b8cfcd;
            }
  
            .billing-empty strong {
              color: #667085;
              font-size: 13px;
            }
  
            .billing-empty span {
              font-size: 11px;
            }
  
            /* ACTION BUTTONS */
  
            .billing-table .table-actions {
              display: flex;
              align-items: center;
              gap: 7px;
            }
  
            .billing-table .icon-button {
              width: 32px;
              height: 32px;
              min-width: 32px;
              padding: 0;
              border: none;
              border-radius: 7px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: 0.2s ease;
            }
  
            .billing-table .view-button {
              background: #e4f7f5;
              color: #188c88;
            }
  
            .billing-table .view-button:hover {
              background: #d3f0ed;
            }
  
            .billing-table .edit-button {
              background: #50b8b4;
              color: #ffffff;
            }
  
            .billing-table .edit-button:hover {
              background: #3da8a4;
            }
  
            .billing-table .delete-button {
              background: #fff0ef;
              color: #d92d20;
            }
  
            .billing-table .delete-button:hover {
              background: #ffe2df;
            }
  
            .billing-print-button {
              background: #f2f4f7 !important;
              color: #667085 !important;
            }
  
            .billing-print-button:hover {
              background: #e8f3f2 !important;
              color: #159f9f !important;
            }
  
            /* STATUS */
  
            .billing-page .status {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              padding: 6px 11px;
              border-radius: 20px;
              font-size: 10px;
              font-weight: 700;
            }
  
            .billing-page .status.confirmed {
              background: #def4ef;
              color: #287f72;
            }
  
            .billing-page .status.pending {
              background: #fff2d8;
              color: #a86b00;
            }
  
            .billing-page .status.partially-paid {
              background: #fff2d8;
              color: #a86b00;
            }
  
            .billing-page .status.cancelled {
              background: #fee9e7;
              color: #c43227;
            }
  
            /* PAGINATION */
  
            .billing-pagination {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 15px;
              margin-top: 18px;
            }
  
            .billing-rows {
              display: flex;
              align-items: center;
              gap: 9px;
              color: #667085;
              font-size: 11px;
            }
  
            .billing-rows select {
              width: 62px;
              height: 34px;
              padding: 0 8px;
              border: 1px solid #d5e3e2;
              border-radius: 7px;
              outline: none;
              background: #ffffff;
              color: #475467;
              cursor: pointer;
            }
  
            .billing-page-controls {
              display: flex;
              align-items: center;
              gap: 6px;
            }
  
            .billing-pagination-arrow,
            .billing-page-number {
              width: 36px;
              min-width: 36px;
              height: 36px;
              padding: 0;
              border: 1px solid #d5e3e2;
              border-radius: 7px;
              background: #ffffff;
              color: #667085;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              font-family: inherit;
              font-size: 14px;
              font-weight: 700;
              transition: 0.2s ease;
            }
  
            .billing-pagination-arrow:hover:not(:disabled),
            .billing-page-number:hover:not(.active) {
              border-color: #159f9f;
              background: #f1fafa;
              color: #159f9f;
            }
  
            .billing-page-number.active {
              border-color: #159f9f;
              background: #159f9f;
              color: #ffffff;
            }
  
            .billing-pagination-arrow:disabled {
              background: #f6f8f8;
              color: #c0cccb;
              cursor: not-allowed;
            }
  
            /* INVOICE LINE FORM */
  
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
  
            /* VIEW DETAILS */
  
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
  
            .billing-transaction-header {
              margin-bottom: 18px;
              padding: 14px;
              border-radius: 8px;
              background: #f5fafa;
            }
  
            .billing-transaction-type {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              margin-bottom: 7px;
              color: #159f9f;
              font-size: 11px;
              font-weight: 700;
            }
  
            /* RESPONSIVE */
  
            @media (max-width: 1100px) {
              .billing-summary-grid {
                grid-template-columns: repeat(2, 1fr);
              }
  
              .billing-filter-row {
                grid-template-columns: 1fr 1fr;
              }
  
              .billing-search-box {
                grid-column: 1 / -1;
              }
            }
  
            @media (max-width: 900px) {
              .billing-line-grid {
                grid-template-columns: 1fr 1fr;
              }
  
              .billing-remove-line-button {
                width: 100% !important;
              }
  
              .billing-page-header {
                align-items: flex-start;
                flex-direction: column;
              }
            }
  
            @media (max-width: 650px) {
              .billing-summary-grid {
                grid-template-columns: 1fr;
              }
  
              .billing-tabs {
                display: flex;
                width: 100%;
                overflow-x: auto;
              }
  
              .billing-tab {
                min-width: 135px;
              }
  
              .billing-filter-row {
                grid-template-columns: 1fr;
              }
  
              .billing-search-box {
                grid-column: auto;
              }
  
              .billing-pagination {
                align-items: flex-start;
                flex-direction: column;
              }
  
              .billing-line-grid {
                grid-template-columns: 1fr;
              }
  
              .billing-lines-heading {
                flex-direction: column;
              }
  
              .billing-header-actions {
                width: 100%;
              }
  
              .billing-export-button,
              .billing-add-button {
                flex: 1;
              }
            }
          `}</style>
  
          {/* HEADER */}
  
          <div className="page-header billing-page-header">
            <div className="billing-title">
              <h1>Billing</h1>
              <p>
                Manage clinic invoices, Store orders and POS sales
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
  
              {activeTab === "invoices" && (
                <button
                  type="button"
                  className="billing-add-button"
                  onClick={() => {
                    setNewInvoice(createEmptyInvoice());
                    setShowAddModal(true);
                  }}
                >
                  + Add Invoice
                </button>
              )}
            </div>
          </div>
  
          {/* SUMMARY CARDS */}
  
          <div className="billing-summary-grid">
            <div className="billing-summary-card">
              <div className="billing-summary-top">
                <span className="billing-summary-label">
                  Clinic Invoices
                </span>
                <div className="billing-summary-icon">
                  <FaFileInvoiceDollar />
                </div>
              </div>
              <h3 className="billing-summary-value">
                {invoices.length}
              </h3>
              <div className="billing-summary-small">
                {formatMoney(invoiceRevenue)} total
              </div>
            </div>
  
            <div className="billing-summary-card">
              <div className="billing-summary-top">
                <span className="billing-summary-label">
                  Store Orders
                </span>
                <div className="billing-summary-icon">
                  <FaShoppingBag />
                </div>
              </div>
              <h3 className="billing-summary-value">
                {storeOrders.length}
              </h3>
              <div className="billing-summary-small">
                {formatMoney(storeRevenue)} total
              </div>
            </div>
  
            <div className="billing-summary-card">
              <div className="billing-summary-top">
                <span className="billing-summary-label">
                  POS Sales
                </span>
                <div className="billing-summary-icon">
                  <FaCashRegister />
                </div>
              </div>
              <h3 className="billing-summary-value">
                {posSales.length}
              </h3>
              <div className="billing-summary-small">
                {formatMoney(posRevenue)} total
              </div>
            </div>
  
            <div className="billing-summary-card">
              <div className="billing-summary-top">
                <span className="billing-summary-label">
                  Combined Revenue
                </span>
                <div className="billing-summary-icon">
                  <FaFileInvoiceDollar />
                </div>
              </div>
              <h3 className="billing-summary-value">
                {formatMoney(totalRevenue)}
              </h3>
              <div className="billing-summary-small">
                Invoices + Store + POS
              </div>
            </div>
          </div>
  
          {/* TABS */}
  
          <div className="billing-tabs">
            <button
              type="button"
              className={`billing-tab ${
                activeTab === "invoices" ? "active" : ""
              }`}
              onClick={() => changeTab("invoices")}
            >
              <FaFileInvoiceDollar />
              Invoices
              <span className="billing-tab-count">
                {invoices.length}
              </span>
            </button>
  
            <button
              type="button"
              className={`billing-tab ${
                activeTab === "orders" ? "active" : ""
              }`}
              onClick={() => changeTab("orders")}
            >
              <FaShoppingBag />
              Store Orders
              <span className="billing-tab-count">
                {storeOrders.length}
              </span>
            </button>
  
            <button
              type="button"
              className={`billing-tab ${
                activeTab === "sales" ? "active" : ""
              }`}
              onClick={() => changeTab("sales")}
            >
              <FaCashRegister />
              POS Sales
              <span className="billing-tab-count">
                {posSales.length}
              </span>
            </button>
          </div>
  
          {/* SEARCH + FILTERS */}
  
          <div className="billing-filter-row">
            <div className="billing-search-box">
              <FaSearch className="billing-search-icon" />
  
              <input
                type="text"
                placeholder={
                  activeTab === "invoices"
                    ? "Search invoices..."
                    : activeTab === "orders"
                      ? "Search Store orders..."
                      : "Search POS sales..."
                }
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
  
              {search.trim() !== "" && (
                <button
                  type="button"
                  className="billing-clear-button"
                  onClick={() => setSearch("")}
                  title="Clear search"
                >
                  <FaTimes />
                </button>
              )}
            </div>
  
            {activeTab === "invoices" && (
              <>
                <select
                  className="billing-filter-select"
                  value={serviceFilter}
                  onChange={(event) =>
                    setServiceFilter(event.target.value)
                  }
                >
                  <option value="All">All Types</option>
                  {billingTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
  
                <select
                  className="billing-filter-select"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                >
                  <option value="All">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Partially Paid">
                    Partially Paid
                  </option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </>
            )}
  
            {activeTab === "orders" && (
              <>
                <select
                  className="billing-filter-select"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Out for Delivery">
                    Out for Delivery
                  </option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <div />
              </>
            )}
  
            {activeTab === "sales" && (
              <>
                <div />
                <div />
              </>
            )}
          </div>
  
          {/* INVOICES TABLE */}
  
          {activeTab === "invoices" && (
            <div className="billing-table-container">
              <div className="billing-table-scroll">
                <table className="billing-table">
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
                      paginatedInvoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td>
                            <strong>{invoice.invoiceNumber}</strong>
                          </td>
                          <td>{invoice.ownerName}</td>
                          <td>{formatDate(invoice.date)}</td>
  
                          <td className="billing-services-cell">
                            <div className="billing-service-summary">
                              {[
                                ...new Set(
                                  (invoice.lines || []).map(
                                    (line) => line.type
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
                              {(invoice.lines || []).length}{" "}
                              {(invoice.lines || []).length === 1
                                ? "invoice line"
                                : "invoice lines"}
                            </span>
                          </td>
  
                          <td>
                            <strong>
                              {formatMoney(getInvoiceTotal(invoice))}
                            </strong>
                          </td>
  
                          <td>
                            <span className={getStatusClass(invoice.status)}>
                              {invoice.status}
                            </span>
                          </td>
  
                          <td>
                            <div className="table-actions">
                              <button
                                type="button"
                                className="view-button icon-button"
                                onClick={() => handleViewInvoice(invoice)}
                                title="View"
                              >
                                <FaEye />
                              </button>
  
                              <button
                                type="button"
                                className="edit-button icon-button"
                                onClick={() => handleOpenEdit(invoice)}
                                title="Edit"
                              >
                                <FaPen />
                              </button>
  
                              <button
                                type="button"
                                className="billing-print-button icon-button"
                                onClick={() => handlePrintInvoice(invoice)}
                                title="Print"
                              >
                                <FaPrint />
                              </button>
  
                              <button
                                type="button"
                                className="delete-button icon-button"
                                onClick={() =>
                                  handleDeleteInvoice(invoice.id)
                                }
                                title="Delete"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="billing-empty-row">
                        <td colSpan="7">
                          <div className="billing-empty">
                            <FaFileInvoiceDollar />
                            <strong>No invoices found</strong>
                            <span>
                              Add a new invoice or change your filters.
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
  
          {/* STORE ORDERS TABLE */}
  
          {activeTab === "orders" && (
            <div className="billing-table-container">
              <div className="billing-table-scroll">
                <table className="billing-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Source</th>
                      <th>Customer</th>
                      <th>Phone</th>
                      <th>Order Details</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
  
                  <tbody>
                    {paginatedOrders.length > 0 ? (
                      paginatedOrders.map((order, index) => (
                        <tr key={`${getOrderId(order)}-${index}`}>
                          <td>
                            <strong>{getOrderId(order)}</strong>
                          </td>
  
                          <td>
                            <span className="billing-source-badge store">
                              <FaShoppingBag />
                              Store
                            </span>
                          </td>
  
                          <td>{getOrderCustomer(order)}</td>
                          <td>{getOrderPhone(order)}</td>
  
                          <td>
                            <div
                              className="billing-products-summary"
                              title={getItemsSummary(getOrderItems(order))}
                            >
                              {getItemsSummary(getOrderItems(order))}
                            </div>
                          </td>
  
                          <td>
                            <strong>
                              {formatMoney(getOrderTotal(order))}
                            </strong>
                          </td>
  
                          <td>
                            <span className="billing-payment-badge">
                              {getOrderPayment(order)}
                            </span>
                          </td>
  
                          <td>{formatDateTime(getOrderDate(order))}</td>
  
                          <td>
                            <span
                              className={getStatusClass(getOrderStatus(order))}
                            >
                              {getOrderStatus(order)}
                            </span>
                          </td>
  
                          <td>
                            <button
                              type="button"
                              className="view-button icon-button"
                              onClick={() => handleViewOrder(order)}
                              title="View Order"
                            >
                              <FaEye />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="billing-empty-row">
                        <td colSpan="10">
                          <div className="billing-empty">
                            <FaShoppingBag />
                            <strong>No Store orders found</strong>
                            <span>
                              New Store orders will automatically appear here.
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
  
          {/* POS SALES TABLE */}
  
          {activeTab === "sales" && (
            <div className="billing-table-container">
              <div className="billing-table-scroll">
                <table className="billing-table">
                  <thead>
                    <tr>
                      <th>Sale ID</th>
                      <th>Source</th>
                      <th>Customer</th>
                      <th>Products</th>
                      <th>Items</th>
                      <th>Discount</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Cashier</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
  
                  <tbody>
                    {paginatedSales.length > 0 ? (
                      paginatedSales.map((sale, index) => (
                        <tr key={`${getSaleId(sale)}-${index}`}>
                          <td>
                            <strong>{getSaleId(sale)}</strong>
                          </td>
  
                          <td>
                            <span className="billing-source-badge pos">
                              <FaCashRegister />
                              POS
                            </span>
                          </td>
  
                          <td>{getSaleCustomer(sale)}</td>
  
                          <td>
                            <div
                              className="billing-products-summary"
                              title={getItemsSummary(getSaleItems(sale))}
                            >
                              {getItemsSummary(getSaleItems(sale))}
                            </div>
                          </td>
  
                          <td>
                            {getSaleItems(sale).reduce(
                              (total, item) =>
                                total + Number(item.quantity || 1),
                              0
                            )}
                          </td>
  
                          <td>{formatMoney(sale.discount || 0)}</td>
  
                          <td>
                            <strong>
                              {formatMoney(getSaleTotal(sale))}
                            </strong>
                          </td>
  
                          <td>
                            <span className="billing-payment-badge">
                              {getSalePayment(sale)}
                            </span>
                          </td>
  
                          <td>{sale.cashier || "Admin"}</td>
                          <td>{formatDateTime(getSaleDate(sale))}</td>
  
                          <td>
                            <button
                              type="button"
                              className="view-button icon-button"
                              onClick={() => handleViewSale(sale)}
                              title="View Sale"
                            >
                              <FaEye />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="billing-empty-row">
                        <td colSpan="11">
                          <div className="billing-empty">
                            <FaCashRegister />
                            <strong>No POS sales found</strong>
                            <span>
                              Completed POS sales will automatically appear here.
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
  
          {/* PAGINATION */}
  
          <div className="billing-pagination">
            <div className="billing-rows">
              <span>Rows per page:</span>
  
              <select
                value={rowsPerPage}
                onChange={(event) =>
                  setRowsPerPage(Number(event.target.value))
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
                className="billing-pagination-arrow"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((previous) =>
                    Math.max(previous - 1, 1)
                  )
                }
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
                  className={`billing-page-number ${
                    currentPage === page ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
  
              <button
                type="button"
                className="billing-pagination-arrow"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((previous) =>
                    Math.min(previous + 1, totalPages)
                  )
                }
                aria-label="Next page"
              >
                &gt;
              </button>
            </div>
          </div>
        </main>
  
        {/* ADD INVOICE MODAL */}
  
        {showAddModal && (
          <div
            className="modal-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setShowAddModal(false);
              }
            }}
          >
            <div className="modal-container billing-modal-wide">
              <div className="modal-header">
                <div>
                  <h2>Add Invoice</h2>
                  <p>
                    Add all services, medications and products under one invoice
                  </p>
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
                      placeholder="Example: INV-004"
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
                    <label>Status</label>
                    <select
                      name="status"
                      value={newInvoice.status}
                      onChange={handleNewInvoiceChange}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Cancelled">Cancelled</option>
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
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
  
                  <button type="submit" className="save-button">
                    Add Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
  
        {/* VIEW INVOICE MODAL */}
  
        {showViewModal && selectedInvoice && (
          <div
            className="modal-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setShowViewModal(false);
                setSelectedInvoice(null);
              }
            }}
          >
            <div className="modal-container billing-modal-wide">
              <div className="modal-header">
                <div>
                  <h2>Invoice Details</h2>
                  <p>View complete invoice information</p>
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
                <strong>{selectedInvoice.invoiceNumber}</strong>
              </div>
  
              <div className="detail-row">
                <span>Owner Name</span>
                <strong>{selectedInvoice.ownerName}</strong>
              </div>
  
              <div className="detail-row">
                <span>Date</span>
                <strong>{formatDate(selectedInvoice.date)}</strong>
              </div>
  
              <div className="detail-row">
                <span>Status</span>
                <strong>
                  <span className={getStatusClass(selectedInvoice.status)}>
                    {selectedInvoice.status}
                  </span>
                </strong>
              </div>
  
              <div className="billing-view-lines">
                <div className="billing-view-lines-header">
                  Invoice Lines
                </div>
  
                <div style={{ overflowX: "auto" }}>
                  <table className="billing-view-lines-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Qty</th>
                        <th className="money">Unit Price</th>
                        <th className="money">Total</th>
                      </tr>
                    </thead>
  
                    <tbody>
                      {(selectedInvoice.lines || []).map((line) => (
                        <tr key={line.id}>
                          <td>{line.type}</td>
                          <td>{line.description}</td>
                          <td>{line.quantity}</td>
                          <td className="money">
                            {formatMoney(line.unitPrice)}
                          </td>
                          <td className="money">
                            <strong>
                              {formatMoney(getLineTotal(line))}
                            </strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
  
              <div className="billing-view-total">
                <span>Grand Total</span>
                <strong>
                  {formatMoney(getInvoiceTotal(selectedInvoice))}
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
                  onClick={() => handlePrintInvoice(selectedInvoice)}
                >
                  <FaPrint />
                  Print Invoice
                </button>
  
                <button
                  type="button"
                  className="edit-button billing-modal-edit"
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedInvoice({
                      ...selectedInvoice,
                      lines: (selectedInvoice.lines || []).map((line) => ({
                        ...line,
                      })),
                    });
                    setShowEditModal(true);
                  }}
                >
                  <FaPen />
                  Edit Invoice
                </button>
              </div>
            </div>
          </div>
        )}
  
        {/* EDIT INVOICE MODAL */}
  
        {showEditModal && selectedInvoice && (
          <div
            className="modal-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
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
                    Update invoice information and billing lines
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
                    <label>Status</label>
                    <select
                      name="status"
                      value={selectedInvoice.status}
                      onChange={handleEditChange}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Cancelled">Cancelled</option>
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
  
                  <button type="submit" className="save-button">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
  
        {/* STORE ORDER / POS SALE DETAILS MODAL */}
  
        {transactionModalOpen && selectedTransaction && (
          <div
            className="modal-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setTransactionModalOpen(false);
                setSelectedTransaction(null);
              }
            }}
          >
            <div className="modal-container billing-modal-wide">
              <div className="modal-header">
                <div>
                  <h2>{selectedTransaction.type} Details</h2>
                  <p>Complete transaction information</p>
                </div>
  
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => {
                    setTransactionModalOpen(false);
                    setSelectedTransaction(null);
                  }}
                >
                  ×
                </button>
              </div>
  
              {selectedTransaction.type === "Store Order" ? (
                <>
                  <div className="billing-transaction-header">
                    <div className="billing-transaction-type">
                      <FaShoppingBag />
                      STORE ORDER
                    </div>
  
                    <div className="detail-row">
                      <span>Order ID</span>
                      <strong>
                        {getOrderId(selectedTransaction.data)}
                      </strong>
                    </div>
  
                    <div className="detail-row">
                      <span>Customer</span>
                      <strong>
                        {getOrderCustomer(selectedTransaction.data)}
                      </strong>
                    </div>
  
                    <div className="detail-row">
                      <span>Phone</span>
                      <strong>
                        {getOrderPhone(selectedTransaction.data)}
                      </strong>
                    </div>
  
                    <div className="detail-row">
                      <span>Date</span>
                      <strong>
                        {formatDateTime(getOrderDate(selectedTransaction.data))}
                      </strong>
                    </div>
  
                    <div className="detail-row">
                      <span>Payment</span>
                      <strong>
                        {getOrderPayment(selectedTransaction.data)}
                      </strong>
                    </div>
  
                    <div className="detail-row">
                      <span>Status</span>
                      <strong>
                        {getOrderStatus(selectedTransaction.data)}
                      </strong>
                    </div>
  
                    <div className="detail-row">
                      <span>Note</span>
                      <strong>
                        {getOrderNote(selectedTransaction.data)}
                      </strong>
                    </div>
                  </div>
  
                  <div className="billing-view-lines">
                    <div className="billing-view-lines-header">
                      Ordered Products
                    </div>
  
                    <div style={{ overflowX: "auto" }}>
                      <table className="billing-view-lines-table">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Qty</th>
                            <th className="money">Price</th>
                            <th className="money">Total</th>
                          </tr>
                        </thead>
  
                        <tbody>
                          {getOrderItems(selectedTransaction.data).map(
                            (item, index) => {
                              const quantity = Number(item.quantity || 1);
                              const price = Number(
                                item.price ?? item.sellingPrice ?? 0
                              );
  
                              return (
                                <tr key={item.id || index}>
                                  <td>
                                    {item.name ||
                                      item.productName ||
                                      item.title ||
                                      "Product"}
                                  </td>
                                  <td>{quantity}</td>
                                  <td className="money">
                                    {formatMoney(price)}
                                  </td>
                                  <td className="money">
                                    <strong>
                                      {formatMoney(price * quantity)}
                                    </strong>
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
  
                  <div className="billing-view-total">
                    <span>Order Total</span>
                    <strong>
                      {formatMoney(getOrderTotal(selectedTransaction.data))}
                    </strong>
                  </div>
                </>
              ) : (
                <>
                  <div className="billing-transaction-header">
                    <div className="billing-transaction-type">
                      <FaCashRegister />
                      POS SALE
                    </div>
  
                    <div className="detail-row">
                      <span>Sale ID</span>
                      <strong>
                        {getSaleId(selectedTransaction.data)}
                      </strong>
                    </div>
  
                    <div className="detail-row">
                      <span>Customer</span>
                      <strong>
                        {getSaleCustomer(selectedTransaction.data)}
                      </strong>
                    </div>
  
                    <div className="detail-row">
                      <span>Phone</span>
                      <strong>
                        {getSalePhone(selectedTransaction.data)}
                      </strong>
                    </div>
  
                    <div className="detail-row">
                      <span>Date</span>
                      <strong>
                        {formatDateTime(getSaleDate(selectedTransaction.data))}
                      </strong>
                    </div>
  
                    <div className="detail-row">
                      <span>Payment</span>
                      <strong>
                        {getSalePayment(selectedTransaction.data)}
                      </strong>
                    </div>
  
                    <div className="detail-row">
                      <span>Cashier</span>
                      <strong>
                        {selectedTransaction.data.cashier || "Admin"}
                      </strong>
                    </div>
  
                    <div className="detail-row">
                      <span>Delivery</span>
                      <strong>
                        {selectedTransaction.data.hasDelivery ? "Yes" : "No"}
                      </strong>
                    </div>
                  </div>
  
                  <div className="billing-view-lines">
                    <div className="billing-view-lines-header">
                      Products
                    </div>
  
                    <div style={{ overflowX: "auto" }}>
                      <table className="billing-view-lines-table">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Qty</th>
                            <th className="money">Price</th>
                            <th className="money">Total</th>
                          </tr>
                        </thead>
  
                        <tbody>
                          {getSaleItems(selectedTransaction.data).map(
                            (item, index) => {
                              const quantity = Number(item.quantity || 1);
                              const price = Number(item.price || 0);
  
                              return (
                                <tr key={item.id || index}>
                                  <td>{item.name || "Product"}</td>
                                  <td>{quantity}</td>
                                  <td className="money">
                                    {formatMoney(price)}
                                  </td>
                                  <td className="money">
                                    <strong>
                                      {formatMoney(price * quantity)}
                                    </strong>
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
  
                  <div className="detail-row">
                    <span>Subtotal</span>
                    <strong>
                      {formatMoney(selectedTransaction.data.subtotal || 0)}
                    </strong>
                  </div>
  
                  <div className="detail-row">
                    <span>Discount</span>
                    <strong>
                      {formatMoney(selectedTransaction.data.discount || 0)}
                    </strong>
                  </div>
  
                  <div className="billing-view-total">
                    <span>Sale Total</span>
                    <strong>
                      {formatMoney(getSaleTotal(selectedTransaction.data))}
                    </strong>
                  </div>
                </>
              )}
  
              <div className="form-actions">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={() => {
                    setTransactionModalOpen(false);
                    setSelectedTransaction(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  export default Billing;