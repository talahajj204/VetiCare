import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";

import {
  FaEye,
  FaPen,
  FaTrash,
  FaFileExcel,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

import * as XLSX from "xlsx";

function Inventory() {
  // =========================
  // DATA
  // =========================

  const [items, setItems] = useState([
    {
      id: 1,
      name: "Syringes",
      category: "Medical Supplies",
      quantity: 120,
      expiryDate: "",
      status: "In Stock",
    },
    {
      id: 2,
      name: "Disposable Gloves",
      category: "Medical Supplies",
      quantity: 15,
      expiryDate: "",
      status: "Low Stock",
    },
    {
      id: 3,
      name: "Rabies Vaccine",
      category: "Vaccines",
      quantity: 25,
      expiryDate: "2027-08-15",
      status: "In Stock",
    },
  ]);

  // =========================
  // SEARCH + FILTERS
  // =========================

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // =========================
  // PAGINATION
  // =========================

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // =========================
  // MODALS
  // =========================

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  // =========================
  // NEW ITEM
  // =========================

  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    quantity: "",
    expiryDate: "",
    status: "In Stock",
  });

  // =========================
  // CATEGORIES
  // =========================

  const categories = [
    "Medical Supplies",
    "Vaccines",
    "Medications",
    "Equipment",
    "Other",
  ];

  // =========================
  // FILTERED ITEMS
  // =========================

  const filteredItems = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !searchText ||
        item.name.toLowerCase().includes(searchText) ||
        item.category.toLowerCase().includes(searchText) ||
        item.quantity.toString().includes(searchText) ||
        item.expiryDate.toLowerCase().includes(searchText) ||
        item.status.toLowerCase().includes(searchText);

      const matchesCategory =
        categoryFilter === "All" || item.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [items, search, categoryFilter, statusFilter]);

  // =========================
  // PAGINATION
  // =========================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / rowsPerPage)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, statusFilter, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * rowsPerPage;

  const paginatedItems = filteredItems.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // =========================
  // CLEAR FILTERS
  // =========================

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

  // =========================
  // ADD INPUT CHANGE
  // =========================

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;

    setNewItem((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // ADD ITEM
  // =========================

  const handleAddItem = (e) => {
    e.preventDefault();

    const item = {
      id: Date.now(),
      ...newItem,
      quantity: Number(newItem.quantity),
    };

    setItems((previous) => [...previous, item]);

    setNewItem({
      name: "",
      category: "",
      quantity: "",
      expiryDate: "",
      status: "In Stock",
    });

    setShowAddModal(false);
  };

  // =========================
  // VIEW
  // =========================

  const handleViewItem = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  // =========================
  // OPEN EDIT
  // =========================

  const handleOpenEdit = (item) => {
    setSelectedItem({ ...item });
    setShowEditModal(true);
  };

  // =========================
  // EDIT INPUT CHANGE
  // =========================

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setSelectedItem((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // UPDATE ITEM
  // =========================

  const handleUpdateItem = (e) => {
    e.preventDefault();

    const updatedItem = {
      ...selectedItem,
      quantity: Number(selectedItem.quantity),
    };

    setItems((previous) =>
      previous.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      )
    );

    setShowEditModal(false);
    setSelectedItem(null);
  };

  // =========================
  // DELETE
  // =========================

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
      previous.filter((item) => item.id !== itemToDelete.id)
    );

    closeDeleteModal();
  };

  // =========================
  // DATE FORMAT
  // =========================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const [year, month, day] = date.split("-");

    return `${day}/${month}/${year}`;
  };

  // =========================
  // STATUS CLASS
  // =========================

  const getStatusClass = (status) => {
    if (status === "In Stock") {
      return "status confirmed";
    }

    if (status === "Low Stock") {
      return "status pending";
    }

    return "status cancelled";
  };

  // =========================
  // EXPORT TO EXCEL
  // =========================

  const exportToExcel = () => {
    const excelData = filteredItems.map((item) => ({
      "Item Name": item.name,
      Category: item.category,
      Quantity: item.quantity,
      "Expiry Date": formatDate(item.expiryDate),
      Status: item.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    worksheet["!cols"] = [
      { wch: 25 },
      { wch: 22 },
      { wch: 12 },
      { wch: 18 },
      { wch: 18 },
    ];

    const workbook = XLSX.utils.book_new();

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

  // =========================
  // PAGINATION STYLES
  // =========================

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
    width: "30px",
    minWidth: "30px",
    height: "30px",
    padding: "0",
    border: "1px solid #159f9f",
    borderRadius: "6px",
    backgroundColor: "#159f9f",
    color: "#ffffff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "600",
    lineHeight: "1",
    cursor: "pointer",
    boxShadow: "none",
  };

  const normalPageStyle = {
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
    fontSize: "13px",
    fontWeight: "600",
    lineHeight: "1",
    cursor: "pointer",
    boxShadow: "none",
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main inventory-page">

        {/* =========================
            HEADER
        ========================= */}

        <div className="inventory-page-header">
          <div className="inventory-title">
            <h1>Inventory</h1>
            <p>Manage clinic inventory and stock levels</p>
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
              onClick={() => setShowAddModal(true)}
            >
              + Add Item
            </button>
          </div>
        </div>

        {/* =========================
            SEARCH + FILTERS
        ========================= */}

        <div className="inventory-filter-row">
          <div className="inventory-search-box">
            <FaSearch className="inventory-search-icon" />

            <input
              type="text"
              placeholder="Search inventory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
              setCategoryFilter(e.target.value)
            }
          >
            <option value="All">All Categories</option>

            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>

          <select
            className="inventory-filter-select"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="All">All Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>

        {/* =========================
            TABLE
        ========================= */}

        <div className="owners-table-container inventory-table-container">
          <div className="inventory-table-scroll">
            <table className="owners-table inventory-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>

                      <td>{item.category}</td>

                      <td>{item.quantity}</td>

                      <td>
                        {formatDate(item.expiryDate)}
                      </td>

                      <td>
                        <span
                          className={getStatusClass(item.status)}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="view-button icon-button"
                            onClick={() =>
                              handleViewItem(item)
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
                              handleOpenEdit(item)
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
                              handleDeleteItem(item)
                            }
                            title="Delete"
                            aria-label="Delete inventory item"
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
                      colSpan="6"
                      className="no-results"
                    >
                      No inventory items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* =========================
            PAGINATION
        ========================= */}

        <div className="inventory-pagination">
          <div className="inventory-rows">
            <span>Rows per page:</span>

            <select
              value={rowsPerPage}
              onChange={(e) =>
                setRowsPerPage(Number(e.target.value))
              }
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
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
            {/* PREVIOUS */}
            <button
              type="button"
              className="inventory-pagination-button"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((previous) =>
                  Math.max(previous - 1, 1)
                )
              }
              style={{
                ...paginationControlStyle,
                opacity: currentPage === 1 ? 0.45 : 1,
                cursor:
                  currentPage === 1
                    ? "not-allowed"
                    : "pointer",
              }}
              aria-label="Previous page"
            >
              &lt;
            </button>

            {/* PAGE NUMBERS */}
            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <button
                type="button"
                key={page}
                className={`inventory-page-number ${
                  currentPage === page ? "active" : ""
                }`}
                onClick={() => setCurrentPage(page)}
                style={
                  currentPage === page
                    ? activePageStyle
                    : normalPageStyle
                }
              >
                {page}
              </button>
            ))}

            {/* NEXT */}
            <button
              type="button"
              className="inventory-pagination-button"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((previous) =>
                  Math.min(previous + 1, totalPages)
                )
              }
              style={{
                ...paginationControlStyle,
                opacity:
                  currentPage === totalPages ? 0.45 : 1,
                cursor:
                  currentPage === totalPages
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

      {/* =========================
          ADD ITEM MODAL
      ========================= */}

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>Add Inventory Item</h2>
                <p>Enter inventory item information</p>
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

            <form onSubmit={handleAddItem}>
              <div className="form-row">
                <div className="form-field">
                  <label>Item Name</label>

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter item name"
                    value={newItem.name}
                    onChange={handleNewItemChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Category</label>

                  <select
                    name="category"
                    value={newItem.category}
                    onChange={handleNewItemChange}
                    required
                  >
                    <option value="">
                      Select category
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ))}
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
                    placeholder="Enter quantity"
                    value={newItem.quantity}
                    onChange={handleNewItemChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Expiry Date</label>

                  <input
                    type="date"
                    name="expiryDate"
                    value={newItem.expiryDate}
                    onChange={handleNewItemChange}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Status</label>

                <select
                  name="status"
                  value={newItem.status}
                  onChange={handleNewItemChange}
                >
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
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================
          VIEW ITEM MODAL
      ========================= */}

      {showViewModal && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>Inventory Item Details</h2>
                <p>View inventory information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedItem(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="detail-row">
              <span>Item Name</span>
              <strong>{selectedItem.name}</strong>
            </div>

            <div className="detail-row">
              <span>Category</span>
              <strong>{selectedItem.category}</strong>
            </div>

            <div className="detail-row">
              <span>Quantity</span>
              <strong>{selectedItem.quantity}</strong>
            </div>

            <div className="detail-row">
              <span>Expiry Date</span>
              <strong>
                {formatDate(selectedItem.expiryDate)}
              </strong>
            </div>

            <div className="detail-row">
              <span>Status</span>

              <strong>
                <span
                  className={getStatusClass(
                    selectedItem.status
                  )}
                >
                  {selectedItem.status}
                </span>
              </strong>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="modal-cancel-button"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedItem(null);
                }}
              >
                Close
              </button>

              <button
                type="button"
                className="edit-button inventory-modal-edit"
                onClick={() => {
                  setShowViewModal(false);
                  setShowEditModal(true);
                }}
              >
                <FaPen />
                <span>Edit Item</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          EDIT ITEM MODAL
      ========================= */}

      {showEditModal && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>Edit Inventory Item</h2>
                <p>Update inventory information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedItem(null);
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateItem}>
              <div className="form-row">
                <div className="form-field">
                  <label>Item Name</label>

                  <input
                    type="text"
                    name="name"
                    value={selectedItem.name}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Category</label>

                  <select
                    name="category"
                    value={selectedItem.category}
                    onChange={handleEditChange}
                    required
                  >
                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ))}
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
                    value={selectedItem.quantity}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Expiry Date</label>

                  <input
                    type="date"
                    name="expiryDate"
                    value={selectedItem.expiryDate}
                    onChange={handleEditChange}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Status</label>

                <select
                  name="status"
                  value={selectedItem.status}
                  onChange={handleEditChange}
                >
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

              <div className="form-actions">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedItem(null);
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

      {/* =========================
          DELETE POPUP
      ========================= */}

      {showDeleteModal && itemToDelete && (
        <div className="inventory-delete-overlay">
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
              Are you sure you want to delete this?
            </p>

            <div className="inventory-delete-actions">
              <button
                type="button"
                className="inventory-delete-cancel"
                onClick={closeDeleteModal}
              >
                Cancel
              </button>

              <button
                type="button"
                className="inventory-delete-confirm"
                onClick={confirmDeleteItem}
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