import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";

import {
  FaEye,
  FaPen,
  FaTrash,
  FaFileExcel,
  FaSearch,
  FaTimes,
  FaImage,
} from "react-icons/fa";

import * as XLSX from "xlsx";

function Inventory() {
  // =====================================================
  // DATA
  // =====================================================

  const [items, setItems] = useState([
    {
      id: 1,
      name: "Syringes",
      category: "Medical Supplies",
      quantity: 120,
      minimumStock: 20,
      purchasePrice: 0.25,
      sellingPrice: 0.5,
      expiryDate: "",
      image: "",
      showOnStore: true,
      showOnPOS: true,
    },
    {
      id: 2,
      name: "Disposable Gloves",
      category: "Medical Supplies",
      quantity: 15,
      minimumStock: 20,
      purchasePrice: 5,
      sellingPrice: 8,
      expiryDate: "",
      image: "",
      showOnStore: false,
      showOnPOS: true,
    },
    {
      id: 3,
      name: "Rabies Vaccine",
      category: "Vaccines",
      quantity: 25,
      minimumStock: 10,
      purchasePrice: 12,
      sellingPrice: 20,
      expiryDate: "2026-10-25",
      image: "",
      showOnStore: false,
      showOnPOS: true,
    },
  ]);

  // =====================================================
  // EMPTY ITEM
  // =====================================================

  const getEmptyItem = () => ({
    name: "",
    category: "",
    quantity: "",
    minimumStock: "",
    purchasePrice: "",
    sellingPrice: "",
    expiryDate: "",
    image: "",
    showOnStore: false,
    showOnPOS: false,
  });

  // =====================================================
  // SEARCH + FILTERS
  // =====================================================

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("All");
  const [statusFilter, setStatusFilter] =
    useState("All");

  // =====================================================
  // PAGINATION
  // =====================================================

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // =====================================================
  // MODALS
  // =====================================================

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [showViewModal, setShowViewModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [selectedItem, setSelectedItem] =
    useState(null);

  const [itemToDelete, setItemToDelete] =
    useState(null);

  // =====================================================
  // NEW ITEM
  // =====================================================

  const [newItem, setNewItem] = useState(
    getEmptyItem()
  );

  // =====================================================
  // CATEGORIES
  // =====================================================

  const categories = [
    "Medical Supplies",
    "Vaccines",
    "Medications",
    "Equipment",
    "Pet Food",
    "Pet Accessories",
    "Other",
  ];

  // =====================================================
  // AUTOMATIC STOCK STATUS
  // =====================================================

  const getStockStatus = (item) => {
    const quantity = Number(item.quantity) || 0;
    const minimumStock =
      Number(item.minimumStock) || 0;

    if (quantity <= 0) {
      return "Out of Stock";
    }

    if (quantity <= minimumStock) {
      return "Low Stock";
    }

    return "In Stock";
  };

  // =====================================================
  // LOW STOCK
  // =====================================================

  const isLowStock = (item) => {
    const quantity = Number(item.quantity) || 0;
    const minimumStock =
      Number(item.minimumStock) || 0;

    return quantity <= minimumStock;
  };

  // =====================================================
  // EXPIRY HELPERS
  // Close to expiry = today through next 30 days
  // =====================================================

  const getExpiryInfo = (expiryDate) => {
    if (!expiryDate) {
      return {
        closeToExpiry: false,
        expired: false,
        daysLeft: null,
      };
    }

    const expiry = new Date(
      `${expiryDate}T23:59:59`
    );

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const difference =
      expiry.getTime() - today.getTime();

    const daysLeft = Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );

    return {
      closeToExpiry:
        daysLeft >= 0 && daysLeft <= 30,

      expired: daysLeft < 0,

      daysLeft,
    };
  };

  const isCloseToExpiry = (item) =>
    getExpiryInfo(item.expiryDate).closeToExpiry;

  const isExpired = (item) =>
    getExpiryInfo(item.expiryDate).expired;

  const needsAttention = (item) =>
    isLowStock(item) ||
    isCloseToExpiry(item) ||
    isExpired(item);

  // =====================================================
  // FILTERED ITEMS
  // =====================================================

  const filteredItems = useMemo(() => {
    const searchText = search
      .trim()
      .toLowerCase();

    return items.filter((item) => {
      const status = getStockStatus(item);

      const searchableValues = [
        item.name,
        item.category,
        item.quantity,
        item.minimumStock,
        item.purchasePrice,
        item.sellingPrice,
        item.expiryDate,
        status,
        item.showOnStore ? "store yes" : "store no",
        item.showOnPOS ? "pos yes" : "pos no",
      ];

      const matchesSearch =
        !searchText ||
        searchableValues.some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(searchText)
        );

      const matchesCategory =
        categoryFilter === "All" ||
        item.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All" ||
        status === statusFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    items,
    search,
    categoryFilter,
    statusFilter,
  ]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredItems.length / rowsPerPage
    )
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    categoryFilter,
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

  const paginatedItems = filteredItems.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("All");
    setStatusFilter("All");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    categoryFilter !== "All" ||
    statusFilter !== "All";

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleNewItemChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setNewItem((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleEditChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setSelectedItem((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =====================================================
  // IMAGE HANDLING
  // =====================================================

  const readImageFile = (
    file,
    setStateFunction
  ) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setStateFunction((previous) => ({
        ...previous,
        image: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleNewImageChange = (e) => {
    const file = e.target.files?.[0];

    readImageFile(file, setNewItem);
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files?.[0];

    readImageFile(
      file,
      setSelectedItem
    );
  };

  const removeNewImage = () => {
    setNewItem((previous) => ({
      ...previous,
      image: "",
    }));
  };

  const removeEditImage = () => {
    setSelectedItem((previous) => ({
      ...previous,
      image: "",
    }));
  };

  // =====================================================
  // ADD ITEM
  // =====================================================

  const handleAddItem = (e) => {
    e.preventDefault();

    const item = {
      id: Date.now(),

      ...newItem,

      quantity:
        Number(newItem.quantity) || 0,

      minimumStock:
        Number(newItem.minimumStock) || 0,

      purchasePrice:
        Number(newItem.purchasePrice) || 0,

      sellingPrice:
        Number(newItem.sellingPrice) || 0,
    };

    setItems((previous) => [
      ...previous,
      item,
    ]);

    setNewItem(getEmptyItem());

    setShowAddModal(false);
  };

  // =====================================================
  // VIEW
  // =====================================================

  const handleViewItem = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleOpenEdit = (item) => {
    setSelectedItem({
      ...item,
    });

    setShowEditModal(true);
  };

  const handleUpdateItem = (e) => {
    e.preventDefault();

    const updatedItem = {
      ...selectedItem,

      quantity:
        Number(selectedItem.quantity) || 0,

      minimumStock:
        Number(selectedItem.minimumStock) ||
        0,

      purchasePrice:
        Number(selectedItem.purchasePrice) ||
        0,

      sellingPrice:
        Number(selectedItem.sellingPrice) ||
        0,
    };

    setItems((previous) =>
      previous.map((item) =>
        item.id === updatedItem.id
          ? updatedItem
          : item
      )
    );

    setShowEditModal(false);
    setSelectedItem(null);
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDeleteItem = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const confirmDeleteItem = () => {
    if (!itemToDelete) return;

    setItems((previous) =>
      previous.filter(
        (item) =>
          item.id !== itemToDelete.id
      )
    );

    closeDeleteModal();
  };

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "—";

    const [year, month, day] =
      date.split("-");

    return `${day}/${month}/${year}`;
  };

  // =====================================================
  // PRICE FORMAT
  // =====================================================

  const formatPrice = (price) => {
    const number = Number(price);

    if (Number.isNaN(number)) {
      return "$0.00";
    }

    return `$${number.toFixed(2)}`;
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    if (status === "In Stock") {
      return "status confirmed";
    }

    if (status === "Low Stock") {
      return "status pending";
    }

    return "status cancelled";
  };

  // =====================================================
  // EXPORT TO EXCEL
  // =====================================================

  const exportToExcel = () => {
    const excelData =
      filteredItems.map((item) => ({
        "Item Name": item.name,
        Category: item.category,
        Quantity: item.quantity,

        "Minimum Stock":
          item.minimumStock,

        "Purchase Price":
          item.purchasePrice,

        "Selling Price":
          item.sellingPrice,

        "Expiry Date":
          formatDate(item.expiryDate),

        Status:
          getStockStatus(item),

        "Show on Store":
          item.showOnStore
            ? "Yes"
            : "No",

        "Show on POS":
          item.showOnPOS
            ? "Yes"
            : "No",

        "Low Stock":
          isLowStock(item)
            ? "Yes"
            : "No",

        "Close to Expiry":
          isCloseToExpiry(item)
            ? "Yes"
            : "No",

        Expired:
          isExpired(item)
            ? "Yes"
            : "No",
      }));

    const worksheet =
      XLSX.utils.json_to_sheet(
        excelData
      );

    worksheet["!cols"] = [
      { wch: 25 },
      { wch: 22 },
      { wch: 12 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 18 },
      { wch: 18 },
      { wch: 16 },
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
      { wch: 12 },
    ];

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Inventory"
    );

    XLSX.writeFile(
      workbook,
      "vet-clinic-inventory.xlsx"
    );
  };

  // =====================================================
  // PAGINATION STYLES
  // =====================================================

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

  // =====================================================
  // ITEM FORM
  // =====================================================

  const renderItemForm = (
    data,
    onChange,
    onImageChange,
    removeImage
  ) => (
    <>
      <div className="form-row">
        <div className="form-field">
          <label>Item Name</label>

          <input
            type="text"
            name="name"
            placeholder="Enter item name"
            value={data.name || ""}
            onChange={onChange}
            required
          />
        </div>

        <div className="form-field">
          <label>Category</label>

          <select
            name="category"
            value={data.category || ""}
            onChange={onChange}
            required
          >
            <option value="">
              Select category
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>Quantity</label>

          <input
            type="number"
            name="quantity"
            min="0"
            step="1"
            placeholder="Enter quantity"
            value={data.quantity ?? ""}
            onChange={onChange}
            required
          />
        </div>

        <div className="form-field">
          <label>
            Minimum Stock
          </label>

          <input
            type="number"
            name="minimumStock"
            min="0"
            step="1"
            placeholder="Minimum stock level"
            value={
              data.minimumStock ?? ""
            }
            onChange={onChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>
            Purchase Price
          </label>

          <div className="inventory-price-input">
            <span>$</span>

            <input
              type="number"
              name="purchasePrice"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={
                data.purchasePrice ?? ""
              }
              onChange={onChange}
              required
            />
          </div>
        </div>

        <div className="form-field">
          <label>
            Selling Price
          </label>

          <div className="inventory-price-input">
            <span>$</span>

            <input
              type="number"
              name="sellingPrice"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={
                data.sellingPrice ?? ""
              }
              onChange={onChange}
              required
            />
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>
            Expiry Date
          </label>

          <input
            type="date"
            name="expiryDate"
            value={
              data.expiryDate || ""
            }
            onChange={onChange}
          />

          <small className="inventory-field-help">
            Optional. Items expiring
            within 30 days are
            highlighted.
          </small>
        </div>

        <div className="form-field">
          <label>
            Image (Optional)
          </label>

          <label className="inventory-image-upload">
            <FaImage />

            <span>
              {data.image
                ? "Change image"
                : "Choose image"}
            </span>

            <input
              type="file"
              accept="image/*"
              onChange={
                onImageChange
              }
            />
          </label>
        </div>
      </div>

      {data.image && (
        <div className="inventory-image-preview-container">
          <img
            src={data.image}
            alt="Item preview"
            className="inventory-image-preview"
          />

          <button
            type="button"
            className="inventory-remove-image"
            onClick={removeImage}
          >
            <FaTrash />
            Remove Image
          </button>
        </div>
      )}

      <div className="inventory-visibility-section">
        <div className="inventory-visibility-title">
          Visibility
        </div>

        <label className="inventory-checkbox-card">
          <input
            type="checkbox"
            name="showOnStore"
            checked={
              Boolean(
                data.showOnStore
              )
            }
            onChange={onChange}
          />

          <div>
            <strong>
              Show on Store
            </strong>

            <span>
              Make this item visible
              in the online store
            </span>
          </div>
        </label>

        <label className="inventory-checkbox-card">
          <input
            type="checkbox"
            name="showOnPOS"
            checked={
              Boolean(data.showOnPOS)
            }
            onChange={onChange}
          />

          <div>
            <strong>
              Show on POS
            </strong>

            <span>
              Make this item available
              in the point of sale
            </span>
          </div>
        </label>
      </div>
    </>
  );

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main inventory-page">
        {/* =================================================
            EXTRA INVENTORY STYLES
        ================================================= */}

        <style>{`
          .inventory-table {
            min-width: 1500px;
          }

          .inventory-table th,
          .inventory-table td {
            white-space: nowrap;
          }

          .inventory-item-name-cell {
            min-width: 210px;
          }

          .inventory-item-name-wrapper {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .inventory-table-image,
          .inventory-table-image-placeholder {
            width: 38px;
            height: 38px;
            min-width: 38px;
            border-radius: 8px;
            object-fit: cover;
          }

          .inventory-table-image {
            border: 1px solid #e1ebea;
          }

          .inventory-table-image-placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f2f7f7;
            color: #9aafad;
            border: 1px solid #e1ebea;
          }

          .inventory-name-content {
            display: flex;
            align-items: center;
            gap: 7px;
          }

          .inventory-alert-dot {
            width: 9px;
            height: 9px;
            min-width: 9px;
            border-radius: 50%;
            background: #e53935;
            display: inline-block;
            box-shadow: 0 0 0 3px rgba(229,57,53,.10);
          }

          .inventory-alert-dot.large {
            width: 11px;
            height: 11px;
            min-width: 11px;
          }

          .inventory-alert-text {
            color: #d92d20;
            font-size: 11px;
            font-weight: 600;
            margin-top: 3px;
          }

          .inventory-expiry-cell {
            display: flex;
            align-items: center;
            gap: 7px;
          }

          .inventory-expiry-warning {
            color: #d92d20;
            font-weight: 600;
          }

          .inventory-visibility-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 46px;
            height: 25px;
            padding: 0 9px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
          }

          .inventory-visibility-badge.yes {
            background: #e7f8f3;
            color: #16856f;
          }

          .inventory-visibility-badge.no {
            background: #f2f4f7;
            color: #667085;
          }

          .inventory-price-input {
            position: relative;
            width: 100%;
          }

          .inventory-price-input > span {
            position: absolute;
            left: 13px;
            top: 50%;
            transform: translateY(-50%);
            color: #667085;
            font-size: 14px;
            z-index: 2;
          }

          .inventory-price-input input {
            width: 100%;
            padding-left: 29px !important;
            box-sizing: border-box;
          }

          .inventory-field-help {
            display: block;
            margin-top: 6px;
            color: #98a2b3;
            font-size: 11px;
            line-height: 1.4;
          }

          .inventory-image-upload {
            min-height: 43px;
            border: 1px dashed #b9cfcd;
            border-radius: 7px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            color: #52706e;
            cursor: pointer;
            background: #fbfdfd;
            box-sizing: border-box;
          }

          .inventory-image-upload:hover {
            border-color: #159f9f;
            color: #159f9f;
            background: #f5fbfb;
          }

          .inventory-image-upload input {
            display: none;
          }

          .inventory-image-preview-container {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 12px;
            margin-bottom: 15px;
            border: 1px solid #e3eceb;
            border-radius: 9px;
            background: #fbfdfd;
          }

          .inventory-image-preview {
            width: 70px;
            height: 70px;
            border-radius: 9px;
            object-fit: cover;
            border: 1px solid #dfe9e8;
          }

          .inventory-remove-image {
            width: auto !important;
            min-width: 0 !important;
            padding: 8px 11px !important;
            border: 1px solid #f1c6c4 !important;
            border-radius: 6px !important;
            background: #fff5f4 !important;
            color: #d92d20 !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
            cursor: pointer;
            font-size: 12px !important;
          }

          .inventory-visibility-section {
            margin: 8px 0 18px;
            padding: 15px;
            border: 1px solid #e1eae9;
            border-radius: 9px;
            background: #fafcfc;
          }

          .inventory-visibility-title {
            color: #344054;
            font-size: 13px;
            font-weight: 700;
            margin-bottom: 11px;
          }

          .inventory-checkbox-card {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            cursor: pointer;
            margin-bottom: 11px;
          }

          .inventory-checkbox-card:last-child {
            margin-bottom: 0;
          }

          .inventory-checkbox-card input {
            width: 17px !important;
            height: 17px !important;
            min-width: 17px;
            margin: 2px 0 0 !important;
            accent-color: #159f9f;
            cursor: pointer;
          }

          .inventory-checkbox-card div {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .inventory-checkbox-card strong {
            color: #344054;
            font-size: 13px;
          }

          .inventory-checkbox-card span {
            color: #98a2b3;
            font-size: 11px;
          }

          .inventory-view-image-wrapper {
            display: flex;
            justify-content: center;
            margin: 0 0 18px;
          }

          .inventory-view-image {
            width: 120px;
            height: 120px;
            object-fit: cover;
            border-radius: 12px;
            border: 1px solid #dfe9e8;
          }

          .inventory-view-placeholder {
            width: 120px;
            height: 120px;
            border-radius: 12px;
            background: #f3f7f7;
            border: 1px solid #dfe9e8;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 7px;
            color: #98a2b3;
          }

          .inventory-view-placeholder svg {
            font-size: 27px;
          }

          .inventory-view-placeholder span {
            font-size: 11px;
          }

          .inventory-warning-box {
            display: flex;
            align-items: flex-start;
            gap: 9px;
            margin: 0 0 15px;
            padding: 11px 13px;
            border-radius: 8px;
            border: 1px solid #f5c7c4;
            background: #fff5f4;
            color: #b42318;
            font-size: 12px;
            line-height: 1.5;
          }

          .inventory-warning-box .inventory-alert-dot {
            margin-top: 4px;
          }

          .inventory-row-attention {
            background: rgba(255, 248, 248, 0.45);
          }

          .inventory-row-attention:hover {
            background: rgba(255, 244, 244, 0.75);
          }

          @media (max-width: 768px) {
            .inventory-visibility-section {
              padding: 12px;
            }
          }
        `}</style>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="inventory-page-header">
          <div className="inventory-title">
            <h1>Inventory</h1>

            <p>
              Manage clinic inventory,
              stock levels and product
              visibility
            </p>
          </div>

          <div className="inventory-header-actions">
            <button
              type="button"
              className="inventory-export-button"
              onClick={exportToExcel}
            >
              <FaFileExcel />

              <span>Export</span>
            </button>

            <button
              type="button"
              className="inventory-add-button"
              onClick={() => {
                setNewItem(
                  getEmptyItem()
                );

                setShowAddModal(true);
              }}
            >
              + Add Item
            </button>
          </div>
        </div>

        {/* =================================================
            SEARCH + FILTERS
        ================================================= */}

        <div className="inventory-filter-row">
          <div className="inventory-search-box">
            <FaSearch className="inventory-search-icon" />

            <input
              type="text"
              placeholder="Search inventory..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

            {hasActiveFilters && (
              <button
                type="button"
                className="inventory-clear-button"
                onClick={clearFilters}
                title="Clear filters"
                aria-label="Clear filters"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <select
            className="inventory-filter-select"
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(
                e.target.value
              )
            }
          >
            <option value="All">
              All Categories
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              )
            )}
          </select>

          <select
            className="inventory-filter-select"
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

            <option value="In Stock">
              In Stock
            </option>

            <option value="Low Stock">
              Low Stock
            </option>

            <option value="Out of Stock">
              Out of Stock
            </option>
          </select>
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="owners-table-container inventory-table-container">
          <div className="inventory-table-scroll">
            <table className="owners-table inventory-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Min. Stock</th>
                  <th>Purchase Price</th>
                  <th>Selling Price</th>
                  <th>Expiry Date</th>
                  <th>Store</th>
                  <th>POS</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedItems.length >
                0 ? (
                  paginatedItems.map(
                    (item) => {
                      const status =
                        getStockStatus(
                          item
                        );

                      const lowStock =
                        isLowStock(item);

                      const expiryInfo =
                        getExpiryInfo(
                          item.expiryDate
                        );

                      const attention =
                        needsAttention(
                          item
                        );

                      return (
                        <tr
                          key={item.id}
                          className={
                            attention
                              ? "inventory-row-attention"
                              : ""
                          }
                        >
                          <td className="inventory-item-name-cell">
                            <div className="inventory-item-name-wrapper">
                              {item.image ? (
                                <img
                                  src={
                                    item.image
                                  }
                                  alt={
                                    item.name
                                  }
                                  className="inventory-table-image"
                                />
                              ) : (
                                <div className="inventory-table-image-placeholder">
                                  <FaImage />
                                </div>
                              )}

                              <div>
                                <div className="inventory-name-content">
                                  {attention && (
                                    <span
                                      className="inventory-alert-dot"
                                      title="This item needs attention"
                                    />
                                  )}

                                  <strong>
                                    {
                                      item.name
                                    }
                                  </strong>
                                </div>

                                {lowStock && (
                                  <div className="inventory-alert-text">
                                    Low stock
                                  </div>
                                )}

                                {expiryInfo.expired && (
                                  <div className="inventory-alert-text">
                                    Expired
                                  </div>
                                )}

                                {!expiryInfo.expired &&
                                  expiryInfo.closeToExpiry && (
                                    <div className="inventory-alert-text">
                                      Expires in{" "}
                                      {
                                        expiryInfo.daysLeft
                                      }{" "}
                                      day
                                      {expiryInfo.daysLeft !==
                                      1
                                        ? "s"
                                        : ""}
                                    </div>
                                  )}
                              </div>
                            </div>
                          </td>

                          <td>
                            {
                              item.category
                            }
                          </td>

                          <td>
                            <strong>
                              {
                                item.quantity
                              }
                            </strong>
                          </td>

                          <td>
                            {
                              item.minimumStock
                            }
                          </td>

                          <td>
                            {formatPrice(
                              item.purchasePrice
                            )}
                          </td>

                          <td>
                            <strong>
                              {formatPrice(
                                item.sellingPrice
                              )}
                            </strong>
                          </td>

                          <td>
                            <div className="inventory-expiry-cell">
                              {(expiryInfo.closeToExpiry ||
                                expiryInfo.expired) && (
                                <span className="inventory-alert-dot" />
                              )}

                              <span
                                className={
                                  expiryInfo.closeToExpiry ||
                                  expiryInfo.expired
                                    ? "inventory-expiry-warning"
                                    : ""
                                }
                              >
                                {formatDate(
                                  item.expiryDate
                                )}
                              </span>
                            </div>
                          </td>

                          <td>
                            <span
                              className={`inventory-visibility-badge ${
                                item.showOnStore
                                  ? "yes"
                                  : "no"
                              }`}
                            >
                              {item.showOnStore
                                ? "Yes"
                                : "No"}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`inventory-visibility-badge ${
                                item.showOnPOS
                                  ? "yes"
                                  : "no"
                              }`}
                            >
                              {item.showOnPOS
                                ? "Yes"
                                : "No"}
                            </span>
                          </td>

                          <td>
                            <span
                              className={getStatusClass(
                                status
                              )}
                            >
                              {status}
                            </span>
                          </td>

                          <td>
                            <div className="table-actions">
                              <button
                                type="button"
                                className="view-button icon-button"
                                onClick={() =>
                                  handleViewItem(
                                    item
                                  )
                                }
                                title="View"
                                aria-label="View inventory item"
                              >
                                <FaEye />
                              </button>

                              <button
                                type="button"
                                className="edit-button icon-button"
                                onClick={() =>
                                  handleOpenEdit(
                                    item
                                  )
                                }
                                title="Edit"
                                aria-label="Edit inventory item"
                              >
                                <FaPen />
                              </button>

                              <button
                                type="button"
                                className="delete-button icon-button"
                                onClick={() =>
                                  handleDeleteItem(
                                    item
                                  )
                                }
                                title="Delete"
                                aria-label="Delete inventory item"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="11"
                      className="no-results"
                    >
                      No inventory items
                      found
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

        <div className="inventory-pagination">
          <div className="inventory-rows">
            <span>
              Rows per page:
            </span>

            <select
              value={rowsPerPage}
              onChange={(e) =>
                setRowsPerPage(
                  Number(
                    e.target.value
                  )
                )
              }
            >
              <option value={5}>
                5
              </option>

              <option value={10}>
                10
              </option>

              <option value={20}>
                20
              </option>

              <option value={50}>
                50
              </option>
            </select>
          </div>

          <div
            className="inventory-page-controls"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <button
              type="button"
              className="inventory-pagination-button"
              disabled={
                currentPage === 1
              }
              onClick={() =>
                setCurrentPage(
                  (previous) =>
                    Math.max(
                      previous - 1,
                      1
                    )
                )
              }
              style={{
                ...paginationControlStyle,

                opacity:
                  currentPage === 1
                    ? 0.45
                    : 1,

                cursor:
                  currentPage === 1
                    ? "not-allowed"
                    : "pointer",
              }}
              aria-label="Previous page"
            >
              &lt;
            </button>

            {Array.from(
              {
                length: totalPages,
              },
              (_, index) =>
                index + 1
            ).map((page) => (
              <button
                type="button"
                key={page}
                className={`inventory-page-number ${
                  currentPage ===
                  page
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setCurrentPage(
                    page
                  )
                }
                style={
                  currentPage ===
                  page
                    ? activePageStyle
                    : normalPageStyle
                }
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              className="inventory-pagination-button"
              disabled={
                currentPage ===
                totalPages
              }
              onClick={() =>
                setCurrentPage(
                  (previous) =>
                    Math.min(
                      previous + 1,
                      totalPages
                    )
                )
              }
              style={{
                ...paginationControlStyle,

                opacity:
                  currentPage ===
                  totalPages
                    ? 0.45
                    : 1,

                cursor:
                  currentPage ===
                  totalPages
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

      {/* =====================================================
          ADD ITEM MODAL
      ===================================================== */}

      {showAddModal && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setShowAddModal(
                false
              );
            }
          }}
        >
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>
                  Add Inventory Item
                </h2>

                <p>
                  Enter inventory item
                  information
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setShowAddModal(
                    false
                  )
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                handleAddItem
              }
            >
              {renderItemForm(
                newItem,
                handleNewItemChange,
                handleNewImageChange,
                removeNewImage
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={() =>
                    setShowAddModal(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          VIEW ITEM MODAL
      ===================================================== */}

      {showViewModal &&
        selectedItem && (
          <div
            className="modal-overlay"
            onMouseDown={(e) => {
              if (
                e.target ===
                e.currentTarget
              ) {
                setShowViewModal(
                  false
                );

                setSelectedItem(
                  null
                );
              }
            }}
          >
            <div className="modal-container">
              <div className="modal-header">
                <div>
                  <h2>
                    Inventory Item
                    Details
                  </h2>

                  <p>
                    View inventory
                    information
                  </p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={() => {
                    setShowViewModal(
                      false
                    );

                    setSelectedItem(
                      null
                    );
                  }}
                >
                  ×
                </button>
              </div>

              <div className="inventory-view-image-wrapper">
                {selectedItem.image ? (
                  <img
                    src={
                      selectedItem.image
                    }
                    alt={
                      selectedItem.name
                    }
                    className="inventory-view-image"
                  />
                ) : (
                  <div className="inventory-view-placeholder">
                    <FaImage />
                    <span>
                      No image
                    </span>
                  </div>
                )}
              </div>

              {needsAttention(
                selectedItem
              ) && (
                <div className="inventory-warning-box">
                  <span className="inventory-alert-dot large" />

                  <div>
                    {isLowStock(
                      selectedItem
                    ) && (
                      <div>
                        <strong>
                          Low stock:
                        </strong>{" "}
                        Quantity is{" "}
                        {
                          selectedItem.quantity
                        }{" "}
                        and minimum stock
                        is{" "}
                        {
                          selectedItem.minimumStock
                        }
                        .
                      </div>
                    )}

                    {isExpired(
                      selectedItem
                    ) && (
                      <div>
                        <strong>
                          Expired:
                        </strong>{" "}
                        This item expired
                        on{" "}
                        {formatDate(
                          selectedItem.expiryDate
                        )}
                        .
                      </div>
                    )}

                    {!isExpired(
                      selectedItem
                    ) &&
                      isCloseToExpiry(
                        selectedItem
                      ) && (
                        <div>
                          <strong>
                            Close to
                            expiry:
                          </strong>{" "}
                          This item
                          expires in{" "}
                          {
                            getExpiryInfo(
                              selectedItem.expiryDate
                            )
                              .daysLeft
                          }{" "}
                          day(s).
                        </div>
                      )}
                  </div>
                </div>
              )}

              <div className="detail-row">
                <span>
                  Item Name
                </span>

                <strong>
                  {
                    selectedItem.name
                  }
                </strong>
              </div>

              <div className="detail-row">
                <span>
                  Category
                </span>

                <strong>
                  {
                    selectedItem.category
                  }
                </strong>
              </div>

              <div className="detail-row">
                <span>
                  Quantity
                </span>

                <strong>
                  {
                    selectedItem.quantity
                  }
                </strong>
              </div>

              <div className="detail-row">
                <span>
                  Minimum Stock
                </span>

                <strong>
                  {
                    selectedItem.minimumStock
                  }
                </strong>
              </div>

              <div className="detail-row">
                <span>
                  Purchase Price
                </span>

                <strong>
                  {formatPrice(
                    selectedItem.purchasePrice
                  )}
                </strong>
              </div>

              <div className="detail-row">
                <span>
                  Selling Price
                </span>

                <strong>
                  {formatPrice(
                    selectedItem.sellingPrice
                  )}
                </strong>
              </div>

              <div className="detail-row">
                <span>
                  Expiry Date
                </span>

                <strong>
                  {formatDate(
                    selectedItem.expiryDate
                  )}
                </strong>
              </div>

              <div className="detail-row">
                <span>
                  Show on Store
                </span>

                <strong>
                  <span
                    className={`inventory-visibility-badge ${
                      selectedItem.showOnStore
                        ? "yes"
                        : "no"
                    }`}
                  >
                    {selectedItem.showOnStore
                      ? "Yes"
                      : "No"}
                  </span>
                </strong>
              </div>

              <div className="detail-row">
                <span>
                  Show on POS
                </span>

                <strong>
                  <span
                    className={`inventory-visibility-badge ${
                      selectedItem.showOnPOS
                        ? "yes"
                        : "no"
                    }`}
                  >
                    {selectedItem.showOnPOS
                      ? "Yes"
                      : "No"}
                  </span>
                </strong>
              </div>

              <div className="detail-row">
                <span>
                  Status
                </span>

                <strong>
                  <span
                    className={getStatusClass(
                      getStockStatus(
                        selectedItem
                      )
                    )}
                  >
                    {getStockStatus(
                      selectedItem
                    )}
                  </span>
                </strong>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={() => {
                    setShowViewModal(
                      false
                    );

                    setSelectedItem(
                      null
                    );
                  }}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="edit-button inventory-modal-edit"
                  onClick={() => {
                    setShowViewModal(
                      false
                    );

                    setShowEditModal(
                      true
                    );
                  }}
                >
                  <FaPen />

                  <span>
                    Edit Item
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          EDIT ITEM MODAL
      ===================================================== */}

      {showEditModal &&
        selectedItem && (
          <div
            className="modal-overlay"
            onMouseDown={(e) => {
              if (
                e.target ===
                e.currentTarget
              ) {
                setShowEditModal(
                  false
                );

                setSelectedItem(
                  null
                );
              }
            }}
          >
            <div className="modal-container">
              <div className="modal-header">
                <div>
                  <h2>
                    Edit Inventory Item
                  </h2>

                  <p>
                    Update inventory
                    information
                  </p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={() => {
                    setShowEditModal(
                      false
                    );

                    setSelectedItem(
                      null
                    );
                  }}
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={
                  handleUpdateItem
                }
              >
                {renderItemForm(
                  selectedItem,
                  handleEditChange,
                  handleEditImageChange,
                  removeEditImage
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    className="modal-cancel-button"
                    onClick={() => {
                      setShowEditModal(
                        false
                      );

                      setSelectedItem(
                        null
                      );
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

      {/* =====================================================
          DELETE POPUP
      ===================================================== */}

      {showDeleteModal &&
        itemToDelete && (
          <div
            className="inventory-delete-overlay"
            onMouseDown={(e) => {
              if (
                e.target ===
                e.currentTarget
              ) {
                closeDeleteModal();
              }
            }}
          >
            <div
              className="inventory-delete-dialog"
              role="dialog"
              aria-modal="true"
            >
              <div className="inventory-delete-icon">
                <FaTrash />
              </div>

              <h3>Delete Item</h3>

              <p>
                Are you sure you want
                to delete{" "}
                <strong>
                  {itemToDelete.name}
                </strong>
                ?
              </p>

              <div className="inventory-delete-actions">
                <button
                  type="button"
                  className="inventory-delete-cancel"
                  onClick={
                    closeDeleteModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="inventory-delete-confirm"
                  onClick={
                    confirmDeleteItem
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export default Inventory;