import { useState } from "react";
import Sidebar from "../components/Sidebar";

import {
  FaEye,
  FaPen,
  FaTrash,
  FaFileExcel,
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
  // SEARCH
  // =========================

  const [search, setSearch] = useState("");

  // =========================
  // MODALS
  // =========================

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);

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
  // SEARCH FILTER
  // =========================

  const filteredItems = items.filter((item) => {
    const searchText = search.trim().toLowerCase();

    return (
      item.name.toLowerCase().includes(searchText) ||
      item.category.toLowerCase().includes(searchText) ||
      item.quantity.toString().includes(searchText) ||
      item.expiryDate.toLowerCase().includes(searchText) ||
      item.status.toLowerCase().includes(searchText)
    );
  });

  // =========================
  // ADD INPUT CHANGE
  // =========================

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;

    setNewItem({
      ...newItem,
      [name]: value,
    });
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

    setItems([...items, item]);

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

    setSelectedItem({
      ...selectedItem,
      [name]: value,
    });
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

    setItems(
      items.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      )
    );

    setShowEditModal(false);
    setSelectedItem(null);
  };

  // =========================
  // DELETE
  // =========================

  const handleDeleteItem = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this inventory item?"
    );

    if (confirmDelete) {
      setItems(items.filter((item) => item.id !== id));
    }
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
    const excelData = items.map((item) => ({
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

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">

        {/* HEADER */}
        <div className="page-header">
          <div>
            <h1>Inventory</h1>
            <p>Manage clinic inventory</p>
          </div>
        </div>

        {/* SEARCH + EXPORT + ADD */}
        <div className="inventory-toolbar">

          <div className="search-container inventory-search">
            <input
              type="text"
              placeholder="Search inventory..."
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
              + Add Item
            </button>

          </div>
        </div>

        {/* TABLE */}
        <div className="owners-table-container">
          <table className="owners-table">

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
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
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
                          onClick={() => handleViewItem(item)}
                          title="View"
                          aria-label="View inventory item"
                        >
                          <FaEye />
                        </button>

                        <button
                          type="button"
                          className="edit-button icon-button"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit"
                          aria-label="Edit inventory item"
                        >
                          <FaPen />
                        </button>

                        <button
                          type="button"
                          className="delete-button icon-button"
                          onClick={() =>
                            handleDeleteItem(item.id)
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
                onClick={() => setShowAddModal(false)}
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

                    <option value="Medical Supplies">
                      Medical Supplies
                    </option>

                    <option value="Vaccines">
                      Vaccines
                    </option>

                    <option value="Medications">
                      Medications
                    </option>

                    <option value="Equipment">
                      Equipment
                    </option>

                    <option value="Other">
                      Other
                    </option>
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
                  onClick={() => setShowAddModal(false)}
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
              <strong>
                {selectedItem.name}
              </strong>
            </div>

            <div className="detail-row">
              <span>Category</span>
              <strong>
                {selectedItem.category}
              </strong>
            </div>

            <div className="detail-row">
              <span>Quantity</span>
              <strong>
                {selectedItem.quantity}
              </strong>
            </div>

            <div className="detail-row">
              <span>Expiry Date</span>
              <strong>
                {formatDate(
                  selectedItem.expiryDate
                )}
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
                className="edit-button"
                onClick={() => {
                  setShowViewModal(false);
                  setShowEditModal(true);
                }}
              >
                <FaPen />

                <span
                  style={{ marginLeft: "7px" }}
                >
                  Edit Item
                </span>
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
                    <option value="Medical Supplies">
                      Medical Supplies
                    </option>

                    <option value="Vaccines">
                      Vaccines
                    </option>

                    <option value="Medications">
                      Medications
                    </option>

                    <option value="Equipment">
                      Equipment
                    </option>

                    <option value="Other">
                      Other
                    </option>
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

    </div>
  );
}

export default Inventory;