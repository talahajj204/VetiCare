import { useEffect, useMemo, useRef, useState } from "react";
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

import SupplierStockInvoice from "../components/SupplierStockInvoice";
import { getCategories } from "../api/categoriesApi";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/productsApi";

function Inventory() {
  const PRODUCTS_STORAGE_KEY = "vetClinicProducts";

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);

  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [categoriesError, setCategoriesError] = useState("");
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const productsRef = useRef([]);
  const savingProductRef = useRef(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const getEmptyItem = () => ({
    name: "",
    categoryId: "",
    category: "",
    description: "",
    quantity: "",
    minimumStock: "",
    purchasePrice: "",
    sellingPrice: "",
    expiryDate: "",
    image: "",
    showOnStore: false,
    showOnPOS: false,
    featured: false,
  });

  const [newItem, setNewItem] = useState(getEmptyItem);

  const publishProducts = (products) => {
    productsRef.current = products;
    setItems(products);

    // Compatibility cache for the current Store and POS.
    // Product changes are saved through the API.
    try {
      localStorage.setItem(
        PRODUCTS_STORAGE_KEY,
        JSON.stringify(products)
      );
    } catch (error) {
      console.error("Could not update product cache:", error);
    }

    window.dispatchEvent(
      new CustomEvent("vetClinicProductsUpdated", {
        detail: products,
      })
    );
  };

  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      try {
        const products = await getProducts({
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        publishProducts(products);
        setProductsError("");
      } catch (error) {
        if (!controller.signal.aborted) {
          setProductsError(
            error.message || "Could not load products."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingProducts(false);
        }
      }
    };

    loadProducts();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    let controller;

    const loadCategories = async () => {
      controller?.abort();
      controller = new AbortController();

      const signal = controller.signal;

      try {
        const records = await getCategories({ signal });

        if (signal.aborted) return;

        setCategories(
          [...records].sort(
            (a, b) =>
              a.sortOrder - b.sortOrder ||
              a.title.localeCompare(b.title)
          )
        );

        setCategoriesError("");
      } catch (error) {
        if (!signal.aborted) {
          setCategories([]);
          setCategoriesError(
            error.message || "Could not load categories."
          );
        }
      } finally {
        if (!signal.aborted) {
          setIsLoadingCategories(false);
        }
      }
    };

    loadCategories();

    window.addEventListener("focus", loadCategories);

    window.addEventListener(
      "vetClinicCategoriesUpdated",
      loadCategories
    );

    return () => {
      controller?.abort();

      window.removeEventListener("focus", loadCategories);

      window.removeEventListener(
        "vetClinicCategoriesUpdated",
        loadCategories
      );
    };
  }, []);

  const getStockStatus = (item) => {
    const quantity = Number(item.quantity) || 0;
    const minimumStock = Number(item.minimumStock) || 0;

    if (quantity <= 0) {
      return "Out of Stock";
    }

    if (quantity <= minimumStock) {
      return "Low Stock";
    }

    return "In Stock";
  };

  const isLowStock = (item) =>
    (Number(item.quantity) || 0) <=
    (Number(item.minimumStock) || 0);

  const getExpiryInfo = (expiryDate) => {
    if (!expiryDate) {
      return {
        closeToExpiry: false,
        expired: false,
        daysLeft: null,
      };
    }

    const expiry = new Date(`${expiryDate}T23:59:59`);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const daysLeft = Math.ceil(
      (expiry.getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    return {
      closeToExpiry: daysLeft >= 0 && daysLeft <= 30,
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

  const filteredItems = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return items.filter((item) => {
      const status = getStockStatus(item);

      const searchableValues = [
        item.name,
        item.category,
        item.description,
        item.quantity,
        item.minimumStock,
        item.purchasePrice,
        item.sellingPrice,
        item.expiryDate,
        status,
        item.showOnStore ? "store yes" : "store no",
        item.showOnPOS ? "pos yes" : "pos no",
        item.featured ? "featured yes" : "featured no",
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

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [items, search, categoryFilter, statusFilter]);

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

  const handleNewItemChange = (event) => {
    if (savingProductRef.current) return;

    const { name, value, type, checked } = event.target;

    setNewItem((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditChange = (event) => {
    if (savingProductRef.current) return;

    const { name, value, type, checked } = event.target;

    setSelectedItem((previous) =>
      previous
        ? {
            ...previous,
            [name]: type === "checkbox" ? checked : value,
          }
        : previous
    );
  };

  const readImageFile = (file, setStateFunction) => {
    if (!file || savingProductRef.current) return;

    if (!file.type.startsWith("image/")) {
      window.alert("Please select an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result !== "string" ||
        savingProductRef.current
      ) {
        return;
      }

      const image = reader.result;

      setStateFunction((previous) =>
        previous ? { ...previous, image } : previous
      );
    };

    reader.onerror = () => {
      window.alert("Could not read this image.");
    };

    reader.readAsDataURL(file);
  };

  const handleNewImageChange = (event) => {
    readImageFile(event.target.files?.[0], setNewItem);
    event.target.value = "";
  };

  const handleEditImageChange = (event) => {
    readImageFile(event.target.files?.[0], setSelectedItem);
    event.target.value = "";
  };

  const removeNewImage = () => {
    if (savingProductRef.current) return;

    setNewItem((previous) => ({
      ...previous,
      image: "",
    }));
  };

  const removeEditImage = () => {
    if (savingProductRef.current) return;

    setSelectedItem((previous) =>
      previous ? { ...previous, image: "" } : previous
    );
  };

  const readWholeNumber = (value, label) => {
    const number = Number(value);

    if (
      String(value ?? "").trim() === "" ||
      !Number.isInteger(number) ||
      number < 0 ||
      number > 2147483647
    ) {
      throw new Error(
        `${label} must be a non-negative whole number.`
      );
    }

    return number;
  };

  const readPrice = (value, label) => {
    const number = Number(value);

    if (
      String(value ?? "").trim() === "" ||
      !Number.isFinite(number) ||
      number < 0
    ) {
      throw new Error(`Please enter a valid ${label}.`);
    }

    return number;
  };

  const buildProductPayload = (data) => {
    const name = String(data.name || "").trim();

    if (!name) {
      throw new Error("Please enter a product name.");
    }

    const category = categories.find(
      (item) =>
        String(item.id) === String(data.categoryId)
    );

    if (!category) {
      throw new Error("Please select a valid category.");
    }

    return {
      name,
      categoryId: category.id,
      description: String(data.description || "").trim(),
      quantity: readWholeNumber(data.quantity, "Quantity"),
      minimumStock: readWholeNumber(
        data.minimumStock,
        "Minimum stock"
      ),
      purchasePrice: readPrice(
        data.purchasePrice,
        "purchase price"
      ),
      sellingPrice: readPrice(
        data.sellingPrice,
        "selling price"
      ),
      expiryDate: data.expiryDate || null,
      image: data.image || "",
      showOnStore: Boolean(data.showOnStore),
      showOnPOS: Boolean(data.showOnPOS),
      featured: Boolean(data.featured),
    };
  };

  const handleAddItem = async (event) => {
    event.preventDefault();

    if (
      savingProductRef.current ||
      isLoadingProducts ||
      productsError ||
      categoriesError
    ) {
      return;
    }

    savingProductRef.current = true;
    setIsSavingProduct(true);

    try {
      const product = await createProduct(
        buildProductPayload(newItem)
      );

      publishProducts([
        ...productsRef.current,
        product,
      ]);

      setNewItem(getEmptyItem());
      setShowAddModal(false);
    } catch (error) {
      window.alert(error.message || "Could not add product.");
    } finally {
      savingProductRef.current = false;
      setIsSavingProduct(false);
    }
  };

  const handleViewItem = (item) => {
    if (savingProductRef.current) return;

    setSelectedItem({ ...item });
    setShowViewModal(true);
  };

  const handleOpenEdit = (item) => {
    if (savingProductRef.current) return;

    setSelectedItem({
      ...item,
      description: item.description || "",
      featured: Boolean(item.featured),
    });

    setShowEditModal(true);
  };

  const handleUpdateItem = async (event) => {
    event.preventDefault();

    if (
      !selectedItem ||
      savingProductRef.current ||
      categoriesError
    ) {
      return;
    }

    savingProductRef.current = true;
    setIsSavingProduct(true);

    try {
      const product = await updateProduct(
        selectedItem.id,
        buildProductPayload(selectedItem)
      );

      publishProducts(
        productsRef.current.map((item) =>
          item.id === product.id ? product : item
        )
      );

      setShowEditModal(false);
      setSelectedItem(null);
    } catch (error) {
      window.alert(
        error.message || "Could not update product."
      );
    } finally {
      savingProductRef.current = false;
      setIsSavingProduct(false);
    }
  };

  const handleDeleteItem = (item) => {
    if (savingProductRef.current) return;

    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (savingProductRef.current) return;

    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete || savingProductRef.current) return;

    savingProductRef.current = true;
    setIsSavingProduct(true);

    try {
      const id = itemToDelete.id;

      await deleteProduct(id);

      publishProducts(
        productsRef.current.filter((item) => item.id !== id)
      );

      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (error) {
      window.alert(
        error.message || "Could not delete product."
      );
    } finally {
      savingProductRef.current = false;
      setIsSavingProduct(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const [year, month, day] = date.split("-");

    return `${day}/${month}/${year}`;
  };

  const formatPrice = (price) => {
    const number = Number(price);

    return Number.isNaN(number)
      ? "$0.00"
      : `$${number.toFixed(2)}`;
  };

  const getStatusClass = (status) => {
    if (status === "In Stock") {
      return "status confirmed";
    }

    if (status === "Low Stock") {
      return "status pending";
    }

    return "status cancelled";
  };

  const exportToExcel = () => {
    const excelData = filteredItems.map((item) => ({
      "Product Name": item.name,
      Category: item.category,
      Description: item.description || "",
      Quantity: item.quantity,
      "Minimum Stock": item.minimumStock,
      "Purchase Price": item.purchasePrice,
      "Selling Price": item.sellingPrice,
      "Expiry Date": formatDate(item.expiryDate),
      Status: getStockStatus(item),
      "Show on Store": item.showOnStore ? "Yes" : "No",
      "Show on POS": item.showOnPOS ? "Yes" : "No",
      Featured: item.featured ? "Yes" : "No",
      "Low Stock": isLowStock(item) ? "Yes" : "No",
      "Close to Expiry": isCloseToExpiry(item) ? "Yes" : "No",
      Expired: isExpired(item) ? "Yes" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    worksheet["!cols"] = [
      { wch: 25 },
      { wch: 22 },
      { wch: 40 },
      { wch: 12 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 18 },
      { wch: 18 },
      { wch: 16 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
      { wch: 12 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Products"
    );

    XLSX.writeFile(
      workbook,
      "vet-clinic-products.xlsx"
    );
  };

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

  const renderItemForm = (
    data,
    onChange,
    onImageChange,
    removeImage
  ) => (
    <>
      <div className="form-row">
        <div className="form-field">
          <label>Product Name</label>

          <input
            type="text"
            name="name"
            placeholder="Enter product name"
            value={data.name || ""}
            onChange={onChange}
            maxLength={200}
            disabled={isSavingProduct}
            required
          />
        </div>

        <div className="form-field">
          <label>Category</label>

          <select
            name="categoryId"
            value={data.categoryId ?? ""}
            onChange={onChange}
            disabled={
              isSavingProduct ||
              isLoadingCategories ||
              Boolean(categoriesError)
            }
            required
          >
            <option value="">
              {isLoadingCategories
                ? "Loading categories..."
                : "Select category"}
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-field">
        <label>Product Description</label>

        <textarea
          name="description"
          placeholder="Enter product description shown on the store"
          value={data.description || ""}
          onChange={onChange}
          rows="4"
          maxLength={4000}
          disabled={isSavingProduct}
          style={{
            width: "100%",
            minHeight: "100px",
            resize: "vertical",
            padding: "12px",
            border: "1px solid #d0d5dd",
            borderRadius: "8px",
            fontFamily: "inherit",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>Quantity</label>

          <input
            type="number"
            name="quantity"
            min="0"
            max="2147483647"
            step="1"
            placeholder="0"
            value={data.quantity}
            onChange={onChange}
            disabled={isSavingProduct}
            required
          />
        </div>

        <div className="form-field">
          <label>Minimum Stock</label>

          <input
            type="number"
            name="minimumStock"
            min="0"
            max="2147483647"
            step="1"
            placeholder="0"
            value={data.minimumStock}
            onChange={onChange}
            disabled={isSavingProduct}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>Purchase Price</label>

          <input
            type="number"
            name="purchasePrice"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={data.purchasePrice}
            onChange={onChange}
            disabled={isSavingProduct}
            required
          />
        </div>

        <div className="form-field">
          <label>Selling Price</label>

          <input
            type="number"
            name="sellingPrice"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={data.sellingPrice}
            onChange={onChange}
            disabled={isSavingProduct}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>Expiry Date</label>

          <input
            type="date"
            name="expiryDate"
            value={data.expiryDate || ""}
            onChange={onChange}
            disabled={isSavingProduct}
          />
        </div>

        <div className="form-field">
          <label>Product Image</label>

          <input
            type="file"
            accept="image/*"
            onChange={onImageChange}
            disabled={isSavingProduct}
          />
        </div>
      </div>

      {data.image && (
        <div className="inventory-image-preview-section">
          <div className="inventory-image-preview-wrapper">
            <img
              src={data.image}
              alt={data.name || "Product"}
              className="inventory-image-preview"
            />

            <button
              type="button"
              className="inventory-remove-image"
              onClick={removeImage}
              disabled={isSavingProduct}
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      <div className="inventory-visibility-section">
        <label className="inventory-checkbox-row">
          <input
            type="checkbox"
            name="showOnStore"
            checked={Boolean(data.showOnStore)}
            onChange={onChange}
            disabled={isSavingProduct}
          />

          <span>Show on Store</span>
        </label>

        <label className="inventory-checkbox-row">
          <input
            type="checkbox"
            name="showOnPOS"
            checked={Boolean(data.showOnPOS)}
            onChange={onChange}
            disabled={isSavingProduct}
          />

          <span>Show on POS</span>
        </label>

        <label className="inventory-checkbox-row">
          <input
            type="checkbox"
            name="featured"
            checked={Boolean(data.featured)}
            onChange={onChange}
            disabled={isSavingProduct}
          />

          <span>Featured Product</span>
        </label>
      </div>
    </>
  );  return (
    <div className="dashboard-layout page">
      <Sidebar />

      <main className="dashboard-main main">
        <style>{`
          .page {
            min-height: 100vh;
            background: #f5fafa;
          }

          .main {
            margin-left: 280px;
            width: calc(100% - 280px);
            min-height: 100vh;
            padding: 30px;
            box-sizing: border-box;
            overflow-x: hidden;
          }

          .inventory-page-header {
            width: 100%;
            box-sizing: border-box;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 24px;
          }

          .inventory-title {
            min-width: 0;
          }

          .inventory-title h1 {
            margin: 0 0 6px;
            color: #344054;
            font-size: 28px;
            font-weight: 700;
          }

          .inventory-title p {
            margin: 0;
            color: #667085;
            font-size: 14px;
            line-height: 1.5;
          }

          .inventory-header-actions {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
            flex-shrink: 0;
          }

          .inventory-export-button,
          .inventory-add-button {
            height: 42px;
            padding: 0 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: .2s ease;
          }

          .inventory-export-button {
            border: 1px solid #159f9f;
            background: white;
            color: #159f9f;
          }

          .inventory-export-button:hover {
            background: #f0fbfb;
          }

          .inventory-add-button {
            border: 1px solid #159f9f;
            background: #159f9f;
            color: white;
          }

          .inventory-add-button:hover {
            background: #118b8b;
          }

          .inventory-filters {
            width: 100%;
            box-sizing: border-box;
            display: grid;
            grid-template-columns:
              minmax(250px, 1fr)
              minmax(160px, 190px)
              minmax(160px, 190px)
              auto;
            gap: 12px;
            align-items: center;
            padding: 18px;
            margin-bottom: 20px;
            background: white;
            border: 1px solid #e4e7ec;
            border-radius: 12px;
          }

          .inventory-search-box {
            position: relative;
            width: 100%;
            min-width: 0;
          }

          .inventory-search-icon {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: #98a2b3;
            font-size: 14px;
            pointer-events: none;
          }

          .inventory-search-box input {
            width: 100%;
            height: 42px;
            padding: 0 40px;
            box-sizing: border-box;
            border: 1px solid #d0d5dd;
            border-radius: 8px;
            background: white;
            color: #344054;
            outline: none;
          }

          .inventory-search-box input:focus,
          .inventory-filter-select:focus {
            border-color: #159f9f;
            box-shadow: 0 0 0 3px rgba(21,159,159,.08);
          }

          .inventory-clear-search {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            width: 25px;
            height: 25px;
            border: none;
            background: transparent;
            color: #98a2b3;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .inventory-filter-select {
            width: 100%;
            height: 42px;
            padding: 0 12px;
            box-sizing: border-box;
            border: 1px solid #d0d5dd;
            border-radius: 8px;
            background: white;
            color: #475467;
            outline: none;
          }

          .inventory-clear-filters {
            height: 42px;
            padding: 0 15px;
            border: 1px solid #d0d5dd;
            border-radius: 8px;
            background: white;
            color: #475467;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            white-space: nowrap;
          }

          .inventory-clear-filters:hover {
            background: #f8fafc;
          }

          .inventory-table-container {
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            overflow: hidden;
            background: white;
            border: 1px solid #e4e7ec;
            border-radius: 12px;
          }

          .inventory-table-scroll {
            width: 100%;
            max-width: 100%;
            overflow-x: auto;
            overflow-y: hidden;
          }

          .inventory-table {
            width: 100%;
            min-width: 1250px;
            border-collapse: collapse;
          }

          .inventory-table thead {
            background: #f8fafc;
          }

          .inventory-table th {
            padding: 13px 15px;
            color: #667085;
            font-size: 12px;
            font-weight: 700;
            text-align: left;
            white-space: nowrap;
            border-bottom: 1px solid #e4e7ec;
          }

          .inventory-table td {
            padding: 14px 15px;
            color: #475467;
            font-size: 13px;
            border-bottom: 1px solid #eef2f2;
            vertical-align: middle;
          }

          .inventory-table tbody tr:last-child td {
            border-bottom: none;
          }

          .inventory-table tbody tr:hover {
            background: #fcfefe;
          }

          .inventory-item-cell {
            display: flex;
            align-items: center;
            gap: 11px;
            min-width: 190px;
          }

          .inventory-table-image {
            width: 45px;
            height: 45px;
            flex-shrink: 0;
            border-radius: 8px;
            object-fit: cover;
            border: 1px solid #e4e7ec;
            background: #f8fafc;
          }

          .inventory-table-image-placeholder {
            width: 45px;
            height: 45px;
            flex-shrink: 0;
            border-radius: 8px;
            border: 1px dashed #c9d7d6;
            background: #f7fbfb;
            color: #98a2b3;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .inventory-item-cell strong {
            color: #344054;
            font-size: 13px;
            font-weight: 700;
          }

          .inventory-item-name-row {
            display: flex;
            align-items: center;
            gap: 7px;
          }

          .inventory-alert-dot {
            width: 8px;
            height: 8px;
            min-width: 8px;
            display: inline-block;
            border-radius: 50%;
            background: #f04438;
            box-shadow: 0 0 0 3px rgba(240,68,56,.1);
          }

          .inventory-alert-dot.large {
            width: 10px;
            height: 10px;
            min-width: 10px;
            margin-top: 5px;
          }

          .status {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 5px 10px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
          }

          .status.confirmed {
            background: #ecfdf3;
            color: #027a48;
          }

          .status.pending {
            background: #fffaeb;
            color: #b54708;
          }

          .status.cancelled {
            background: #fef3f2;
            color: #b42318;
          }

          .inventory-visibility-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 42px;
            padding: 5px 9px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 700;
          }

          .inventory-visibility-badge.yes {
            background: #ecfdf3;
            color: #027a48;
          }

          .inventory-visibility-badge.no {
            background: #f2f4f7;
            color: #667085;
          }

          .inventory-featured-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 5px 9px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 700;
            background: #eff8ff;
            color: #175cd3;
          }

          .inventory-action-buttons {
            display: flex;
            align-items: center;
            gap: 7px;
          }

          .inventory-action-buttons button {
            width: 35px;
            height: 35px;
            padding: 0;
            border-radius: 7px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: .2s ease;
            font-size: 13px;
          }

          .inventory-view-button {
            border: 1px solid #b8e3e1;
            background: #effafa;
            color: #159f9f;
          }

          .inventory-edit-button {
            border: 1px solid #c9d8f7;
            background: #f2f6ff;
            color: #3b6edc;
          }

          .inventory-delete-button {
            border: 1px solid #f4c7c3;
            background: #fff4f3;
            color: #d92d20;
          }

          .inventory-action-buttons button:hover {
            transform: translateY(-1px);
          }

          .inventory-empty-state {
            padding: 50px !important;
            text-align: center !important;
            color: #98a2b3 !important;
          }

          .inventory-pagination {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            padding: 15px 18px;
            border-top: 1px solid #e4e7ec;
          }

          .inventory-pagination-left {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #667085;
            font-size: 12px;
          }

          .inventory-pagination-left select {
            height: 32px;
            padding: 0 8px;
            border: 1px solid #d0d5dd;
            border-radius: 6px;
            background: white;
            color: #475467;
          }

          .inventory-pagination-right {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .inventory-pagination-button:disabled {
            opacity: .45;
          }

          .modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 25px;
            background: rgba(16,24,40,.48);
            overflow-y: auto;
          }

          .modal-container {
            width: min(720px, 96vw);
            max-height: 92vh;
            overflow-y: auto;
            background: white;
            border-radius: 14px;
            box-shadow: 0 24px 60px rgba(16,24,40,.28);
          }

          .modal-header {
            min-height: 85px;
            padding: 20px 25px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            background: #55b8b4;
          }

          .modal-header h2 {
            margin: 0 0 5px;
            color: white;
            font-size: 22px;
            font-weight: 700;
          }

          .modal-header p {
            margin: 0;
            color: rgba(255,255,255,.9);
            font-size: 13px;
          }

          .modal-close {
            width: 35px;
            height: 35px;
            min-width: 35px;
            padding: 0;
            border: none;
            border-radius: 50%;
            background: white;
            color: #52706e;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            line-height: 1;
            cursor: pointer;
          }

          .modal-container form {
            padding: 25px;
          }

          .form-row {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 17px;
            margin-bottom: 17px;
          }

          .form-field {
            width: 100%;
            margin-bottom: 17px;
          }

          .form-row .form-field {
            margin-bottom: 0;
          }

          .form-field label {
            display: block;
            margin-bottom: 7px;
            color: #344054;
            font-size: 12px;
            font-weight: 700;
          }

          .form-field input,
          .form-field select {
            width: 100%;
            height: 42px;
            padding: 0 12px;
            box-sizing: border-box;
            border: 1px solid #d0d5dd;
            border-radius: 8px;
            background: white;
            color: #344054;
            font-family: inherit;
            font-size: 13px;
            outline: none;
          }

          .form-field textarea {
            width: 100%;
            box-sizing: border-box;
          }

          .form-field input:focus,
          .form-field select:focus,
          .form-field textarea:focus {
            border-color: #159f9f !important;
            box-shadow: 0 0 0 3px rgba(21,159,159,.08);
          }

          .inventory-image-preview-section {
            margin-bottom: 20px;
          }

          .inventory-image-preview-wrapper {
            position: relative;
            width: 120px;
            height: 120px;
          }

          .inventory-image-preview {
            width: 120px;
            height: 120px;
            border-radius: 10px;
            object-fit: cover;
            border: 1px solid #e4e7ec;
          }

          .inventory-remove-image {
            position: absolute;
            top: -8px;
            right: -8px;
            width: 27px;
            height: 27px;
            padding: 0;
            border: none;
            border-radius: 50%;
            background: #d92d20;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }

          .inventory-visibility-section {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            padding: 15px;
            margin-top: 5px;
            border: 1px solid #e4e7ec;
            border-radius: 10px;
            background: #f9fbfb;
          }

          .inventory-checkbox-row {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 9px 12px;
            border: 1px solid #e4e7ec;
            border-radius: 8px;
            background: white;
            color: #475467;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
          }

          .inventory-checkbox-row input {
            width: 16px;
            height: 16px;
            accent-color: #159f9f;
            cursor: pointer;
          }

          .form-actions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 23px;
            padding-top: 20px;
            border-top: 1px solid #eef2f2;
          }

          .modal-cancel-button,
          .save-button {
            min-width: 110px;
            height: 42px;
            padding: 0 16px;
            border-radius: 7px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
          }

          .modal-cancel-button {
            border: 1px solid #d0d5dd;
            background: white;
            color: #475467;
          }

          .save-button {
            border: 1px solid #159f9f;
            background: #159f9f;
            color: white;
          }

          .inventory-view-body {
            padding: 25px;
          }

          .inventory-view-image-wrapper {
            padding: 25px 25px 10px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .inventory-view-image {
            width: 170px;
            height: 170px;
            object-fit: cover;
            border-radius: 13px;
            border: 1px solid #e4e7ec;
          }

          .inventory-view-placeholder {
            width: 170px;
            height: 170px;
            border: 1px dashed #b8cfcd;
            border-radius: 13px;
            background: #f7fbfb;
            color: #98a2b3;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 9px;
          }

          .inventory-view-placeholder svg {
            font-size: 32px;
          }

          .inventory-warning-box {
            margin: 15px 25px;
            padding: 13px 15px;
            display: flex;
            align-items: flex-start;
            gap: 11px;
            border: 1px solid #fedf89;
            border-radius: 8px;
            background: #fffaeb;
            color: #93370d;
            font-size: 12px;
            line-height: 1.6;
          }

          .detail-row {
            margin: 0 25px;
            padding: 13px 0;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 25px;
            border-bottom: 1px solid #eef2f2;
          }

          .detail-row > span {
            color: #667085;
            font-size: 13px;
          }

          .detail-row > strong {
            max-width: 65%;
            color: #344054;
            font-size: 13px;
            font-weight: 700;
            text-align: right;
            line-height: 1.5;
            overflow-wrap: anywhere;
          }

          .inventory-description-value {
            white-space: pre-wrap;
          }

          .inventory-modal-edit {
            min-width: 110px;
            height: 42px;
            padding: 0 16px;
            border: 1px solid #159f9f;
            border-radius: 7px;
            background: #159f9f;
            color: white;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
          }

          .inventory-delete-overlay {
            position: fixed;
            inset: 0;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: rgba(16,24,40,.48);
          }

          .inventory-delete-dialog {
            width: min(420px, 95vw);
            padding: 30px;
            box-sizing: border-box;
            border-radius: 14px;
            background: white;
            text-align: center;
            box-shadow: 0 24px 60px rgba(16,24,40,.28);
          }

          .inventory-delete-icon {
            width: 55px;
            height: 55px;
            margin: 0 auto 16px;
            border-radius: 50%;
            background: #fef3f2;
            color: #d92d20;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 21px;
          }

          .inventory-delete-dialog h3 {
            margin: 0 0 10px;
            color: #344054;
            font-size: 20px;
          }

          .inventory-delete-dialog p {
            margin: 0;
            color: #667085;
            font-size: 13px;
            line-height: 1.6;
          }

          .inventory-delete-dialog p strong {
            color: #344054;
          }

          .inventory-delete-actions {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 24px;
          }

          .inventory-delete-cancel,
          .inventory-delete-confirm {
            min-width: 105px;
            height: 40px;
            border-radius: 7px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
          }

          .inventory-delete-cancel {
            border: 1px solid #d0d5dd;
            background: white;
            color: #475467;
          }

          .inventory-delete-confirm {
            border: 1px solid #d92d20;
            background: #d92d20;
            color: white;
          }

          @media (max-width: 1200px) {
            .inventory-filters {
              grid-template-columns: 1fr 170px 170px;
            }

            .inventory-clear-filters {
              grid-column: 1 / -1;
              justify-self: start;
            }
          }

          @media (max-width: 900px) {
            .main {
              margin-left: 0;
              width: 100%;
              padding: 20px;
            }

            .inventory-filters {
              grid-template-columns: 1fr 1fr;
            }
          }

          @media (max-width: 700px) {
            .main {
              padding: 16px;
            }

            .inventory-page-header {
              flex-direction: column;
            }

            .inventory-header-actions {
              width: 100%;
            }

            .inventory-export-button,
            .inventory-add-button {
              flex: 1;
            }

            .inventory-filters {
              grid-template-columns: 1fr;
            }

            .inventory-clear-filters {
              width: 100%;
            }

            .form-row {
              grid-template-columns: 1fr;
            }

            .modal-overlay {
              padding: 10px;
            }

            .modal-header {
              padding: 18px;
            }

            .modal-container form {
              padding: 18px;
            }

            .inventory-pagination {
              flex-direction: column;
              align-items: flex-start;
            }

            .detail-row {
              flex-direction: column;
              gap: 5px;
            }

            .detail-row > strong {
              max-width: 100%;
              text-align: left;
            }
          }
        `}</style>

        <div className="inventory-page-header">
          <div className="inventory-title">
            <h1>Products</h1>

            <p>
              Manage products, stock levels, store visibility and
              product information.
            </p>
          </div>

          <div className="inventory-header-actions">
            <button
              type="button"
              className="inventory-export-button"
              onClick={exportToExcel}
              disabled={
                isLoadingProducts ||
                Boolean(productsError) ||
                isSavingProduct
              }
            >
              <FaFileExcel />
              Export
            </button>

            <button
  type="button"
  className="add-button"
  onClick={() => setShowInvoiceModal(true)}
  disabled={
    isLoadingProducts ||
    isLoadingCategories ||
    Boolean(productsError) ||
    Boolean(categoriesError) ||
    isSavingProduct
  }
>
  + Add Invoice
</button>

            <button
              type="button"
              className="inventory-add-button"
              disabled={
                isLoadingProducts ||
                isLoadingCategories ||
                Boolean(productsError) ||
                Boolean(categoriesError) ||
                isSavingProduct
              }
              onClick={() => {
                if (savingProductRef.current) return;

                setNewItem(getEmptyItem());
                setShowAddModal(true);
              }}
            >
              + Add Product
            </button>
          </div>
        </div>

        {categoriesError && (
          <p role="alert" style={{ color: "#b42318" }}>
            {categoriesError}
          </p>
        )}

        <div className="inventory-filters">
          <div className="inventory-search-box">
            <FaSearch className="inventory-search-icon" />

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button
                type="button"
                className="inventory-clear-search"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <select
            className="inventory-filter-select"
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
          >
            <option value="All">All Categories</option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.title}
              >
                {category.title}
              </option>
            ))}
          </select>

          <select
            className="inventory-filter-select"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="All">All Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              className="inventory-clear-filters"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="inventory-table-container">
          <div className="inventory-table-scroll">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Min. Stock</th>
                  <th>Purchase Price</th>
                  <th>Selling Price</th>
                  <th>Expiry Date</th>
                  <th>Store</th>
                  <th>POS</th>
                  <th>Featured</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {isLoadingProducts ? (
                  <tr>
                    <td
                      colSpan="12"
                      className="inventory-empty-state"
                    >
                      Loading products...
                    </td>
                  </tr>
                ) : productsError ? (
                  <tr>
                    <td
                      colSpan="12"
                      className="inventory-empty-state"
                    >
                      <span role="alert">{productsError}</span>
                    </td>
                  </tr>
                ) : paginatedItems.length > 0 ? (
                  paginatedItems.map((item) => {
                    const status = getStockStatus(item);

                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="inventory-item-cell">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="inventory-table-image"
                              />
                            ) : (
                              <div className="inventory-table-image-placeholder">
                                <FaImage />
                              </div>
                            )}

                            <div className="inventory-item-name-row">
                              {needsAttention(item) && (
                                <span
                                  className="inventory-alert-dot"
                                  title="This product needs attention"
                                />
                              )}

                              <strong>{item.name}</strong>
                            </div>
                          </div>
                        </td>

                        <td>{item.category || "—"}</td>
                        <td>{item.quantity}</td>
                        <td>{item.minimumStock}</td>

                        <td>
                          {formatPrice(item.purchasePrice)}
                        </td>

                        <td>
                          {formatPrice(item.sellingPrice)}
                        </td>

                        <td>{formatDate(item.expiryDate)}</td>

                        <td>
                          <span
                            className={`inventory-visibility-badge ${
                              item.showOnStore ? "yes" : "no"
                            }`}
                          >
                            {item.showOnStore ? "Yes" : "No"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`inventory-visibility-badge ${
                              item.showOnPOS ? "yes" : "no"
                            }`}
                          >
                            {item.showOnPOS ? "Yes" : "No"}
                          </span>
                        </td>

                        <td>
                          {item.featured ? (
                            <span className="inventory-featured-badge">
                              Featured
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td>
                          <span className={getStatusClass(status)}>
                            {status}
                          </span>
                        </td>

                        <td>
                          <div className="inventory-action-buttons">
                            <button
                              type="button"
                              className="inventory-view-button"
                              title="View"
                              disabled={isSavingProduct}
                              onClick={() => handleViewItem(item)}
                            >
                              <FaEye />
                            </button>

                            <button
                              type="button"
                              className="inventory-edit-button"
                              title="Edit"
                              disabled={
                                isSavingProduct ||
                                isLoadingCategories ||
                                Boolean(categoriesError)
                              }
                              onClick={() => handleOpenEdit(item)}
                            >
                              <FaPen />
                            </button>

                            <button
                              type="button"
                              className="inventory-delete-button"
                              title="Delete"
                              disabled={isSavingProduct}
                              onClick={() => handleDeleteItem(item)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="12"
                      className="inventory-empty-state"
                    >
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="inventory-pagination">
            <div className="inventory-pagination-left">
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
              </select>

              <span>
                {filteredItems.length === 0
                  ? "0 products"
                  : `${startIndex + 1}-${Math.min(
                      startIndex + rowsPerPage,
                      filteredItems.length
                    )} of ${filteredItems.length}`}
              </span>
            </div>

            <div className="inventory-pagination-right">
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
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </main>

      {showAddModal && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !savingProductRef.current
            ) {
              setShowAddModal(false);
              setNewItem(getEmptyItem());
            }
          }}
        >
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>Add Product</h2>

                <p>
                  Add product information, image, category and
                  store visibility.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                disabled={isSavingProduct}
                onClick={() => {
                  if (savingProductRef.current) return;

                  setShowAddModal(false);
                  setNewItem(getEmptyItem());
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddItem}>
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
                  disabled={isSavingProduct}
                  onClick={() => {
                    if (savingProductRef.current) return;

                    setShowAddModal(false);
                    setNewItem(getEmptyItem());
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                  disabled={
                    isSavingProduct ||
                    isLoadingCategories ||
                    Boolean(categoriesError)
                  }
                >
                  {isSavingProduct ? "Saving..." : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedItem && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !savingProductRef.current
            ) {
              setShowViewModal(false);
              setSelectedItem(null);
            }
          }}
        >
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>Product Details</h2>
                <p>View product and store information.</p>
              </div>

              <button
                type="button"
                className="modal-close"
                disabled={isSavingProduct}
                onClick={() => {
                  if (savingProductRef.current) return;

                  setShowViewModal(false);
                  setSelectedItem(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="inventory-view-image-wrapper">
              {selectedItem.image ? (
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="inventory-view-image"
                />
              ) : (
                <div className="inventory-view-placeholder">
                  <FaImage />
                  <span>No image</span>
                </div>
              )}
            </div>

            {needsAttention(selectedItem) && (
              <div className="inventory-warning-box">
                <span className="inventory-alert-dot large" />

                <div>
                  {isLowStock(selectedItem) && (
                    <div>
                      <strong>Low stock:</strong>{" "}
                      Quantity is {selectedItem.quantity} and
                      minimum stock is {selectedItem.minimumStock}.
                    </div>
                  )}

                  {isExpired(selectedItem) && (
                    <div>
                      <strong>Expired:</strong> This product
                      expired on{" "}
                      {formatDate(selectedItem.expiryDate)}.
                    </div>
                  )}

                  {!isExpired(selectedItem) &&
                    isCloseToExpiry(selectedItem) && (
                      <div>
                        <strong>Close to expiry:</strong>{" "}
                        This product expires in{" "}
                        {
                          getExpiryInfo(selectedItem.expiryDate)
                            .daysLeft
                        }{" "}
                        day(s).
                      </div>
                    )}
                </div>
              </div>
            )}

            <div className="detail-row">
              <span>Product Name</span>
              <strong>{selectedItem.name}</strong>
            </div>

            <div className="detail-row">
              <span>Category</span>
              <strong>{selectedItem.category || "—"}</strong>
            </div>

            <div className="detail-row">
              <span>Description</span>

              <strong className="inventory-description-value">
                {selectedItem.description || "—"}
              </strong>
            </div>

            <div className="detail-row">
              <span>Quantity</span>
              <strong>{selectedItem.quantity}</strong>
            </div>

            <div className="detail-row">
              <span>Minimum Stock</span>
              <strong>{selectedItem.minimumStock}</strong>
            </div>

            <div className="detail-row">
              <span>Purchase Price</span>
              <strong>
                {formatPrice(selectedItem.purchasePrice)}
              </strong>
            </div>

            <div className="detail-row">
              <span>Selling Price</span>
              <strong>
                {formatPrice(selectedItem.sellingPrice)}
              </strong>
            </div>

            <div className="detail-row">
              <span>Expiry Date</span>
              <strong>{formatDate(selectedItem.expiryDate)}</strong>
            </div>

            <div className="detail-row">
              <span>Show on Store</span>

              <strong>
                <span
                  className={`inventory-visibility-badge ${
                    selectedItem.showOnStore ? "yes" : "no"
                  }`}
                >
                  {selectedItem.showOnStore ? "Yes" : "No"}
                </span>
              </strong>
            </div>

            <div className="detail-row">
              <span>Show on POS</span>

              <strong>
                <span
                  className={`inventory-visibility-badge ${
                    selectedItem.showOnPOS ? "yes" : "no"
                  }`}
                >
                  {selectedItem.showOnPOS ? "Yes" : "No"}
                </span>
              </strong>
            </div>

            <div className="detail-row">
              <span>Featured Product</span>
              <strong>{selectedItem.featured ? "Yes" : "No"}</strong>
            </div>

            <div className="detail-row">
              <span>Status</span>

              <strong>
                <span
                  className={getStatusClass(
                    getStockStatus(selectedItem)
                  )}
                >
                  {getStockStatus(selectedItem)}
                </span>
              </strong>
            </div>

            <div
              className="form-actions"
              style={{
                marginLeft: "25px",
                marginRight: "25px",
                marginBottom: "25px",
              }}
            >
              <button
                type="button"
                className="modal-cancel-button"
                disabled={isSavingProduct}
                onClick={() => {
                  if (savingProductRef.current) return;

                  setShowViewModal(false);
                  setSelectedItem(null);
                }}
              >
                Close
              </button>

              <button
                type="button"
                className="inventory-modal-edit"
                disabled={
                  isSavingProduct ||
                  isLoadingCategories ||
                  Boolean(categoriesError)
                }
                onClick={() => {
                  if (savingProductRef.current) return;

                  setShowViewModal(false);
                  handleOpenEdit(selectedItem);
                }}
              >
                <FaPen />
                Edit Product
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedItem && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !savingProductRef.current
            ) {
              setShowEditModal(false);
              setSelectedItem(null);
            }
          }}
        >
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>Edit Product</h2>

                <p>
                  Update product information displayed in your
                  store.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                disabled={isSavingProduct}
                onClick={() => {
                  if (savingProductRef.current) return;

                  setShowEditModal(false);
                  setSelectedItem(null);
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateItem}>
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
                  disabled={isSavingProduct}
                  onClick={() => {
                    if (savingProductRef.current) return;

                    setShowEditModal(false);
                    setSelectedItem(null);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                  disabled={
                    isSavingProduct ||
                    isLoadingCategories ||
                    Boolean(categoriesError)
                  }
                >
                  {isSavingProduct ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && itemToDelete && (
        <div
          className="inventory-delete-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
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

            <h3>Delete Product</h3>

            <p>
              Are you sure you want to delete{" "}
              <strong>{itemToDelete.name}</strong>?
              <br />
              If this product is displayed on the Store, it will
              also disappear from the Store.
            </p>

            <div className="inventory-delete-actions">
              <button
                type="button"
                className="inventory-delete-cancel"
                onClick={closeDeleteModal}
                disabled={isSavingProduct}
              >
                Cancel
              </button>

              <button
                type="button"
                className="inventory-delete-confirm"
                onClick={confirmDeleteItem}
                disabled={isSavingProduct}
              >
                {isSavingProduct ? "Deleting..." : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}

{showInvoiceModal && (
  <SupplierStockInvoice
    products={items}
    categories={categories}
    onClose={() => setShowInvoiceModal(false)}
    onSaved={(updatedProducts) => {
      publishProducts(updatedProducts);
      setShowInvoiceModal(false);
    }}
  />
)}
    </div>
  );
}

export default Inventory;