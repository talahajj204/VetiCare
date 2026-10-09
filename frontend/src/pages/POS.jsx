
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import {
  FaSearch,
  FaShoppingCart,
  FaTrash,
  FaMinus,
  FaPlus,
  FaBoxOpen,
  FaTimes,
  FaCheckCircle,
  FaChevronDown,
  FaUser,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

// ==========================================
// LOCAL STORAGE KEYS
// ==========================================

const PRODUCTS_KEY = "vetClinicProducts";
const CATEGORIES_KEY = "vetClinicCategories";
const SALES_KEY = "vetClinicPOSSales";

// ==========================================
// READ LOCAL STORAGE
// ==========================================

const readStoredArray = (key) => {
  try {
    const saved = localStorage.getItem(key);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Failed to read ${key}:`, error);
    return [];
  }
};

// ==========================================
// POS COMPONENT
// ==========================================

function POS() {
  const navigate = useNavigate();

  // ========================================
  // INVENTORY PRODUCTS AND CATEGORIES
  // ========================================

  const [inventoryProducts, setInventoryProducts] =
    useState(() => readStoredArray(PRODUCTS_KEY));

  const [inventoryCategories, setInventoryCategories] =
    useState(() => readStoredArray(CATEGORIES_KEY));

  // ========================================
  // SEARCH AND CATEGORY FILTER
  // ========================================

  const [search, setSearch] = useState("");

  const [category, setCategory] =
    useState("All categories");

  // ========================================
  // SYNC WITH INVENTORY AND CATEGORIES
  // ========================================

  useEffect(() => {
    const refreshInventory = () => {
      setInventoryProducts(
        readStoredArray(PRODUCTS_KEY)
      );

      setInventoryCategories(
        readStoredArray(CATEGORIES_KEY)
      );
    };

    const onStorage = (event) => {
      if (
        !event.key ||
        event.key === PRODUCTS_KEY ||
        event.key === CATEGORIES_KEY
      ) {
        refreshInventory();
      }
    };

    const onProductsUpdated = (event) => {
      if (Array.isArray(event.detail)) {
        setInventoryProducts(event.detail);
      } else {
        setInventoryProducts(
          readStoredArray(PRODUCTS_KEY)
        );
      }
    };

    const onCategoriesUpdated = (event) => {
      if (Array.isArray(event.detail)) {
        setInventoryCategories(event.detail);
      } else {
        setInventoryCategories(
          readStoredArray(CATEGORIES_KEY)
        );
      }
    };

    window.addEventListener(
      "storage",
      onStorage
    );

    window.addEventListener(
      "focus",
      refreshInventory
    );

    window.addEventListener(
      "vetClinicProductsUpdated",
      onProductsUpdated
    );

    window.addEventListener(
      "vetClinicCategoriesUpdated",
      onCategoriesUpdated
    );

    refreshInventory();

    return () => {
      window.removeEventListener(
        "storage",
        onStorage
      );

      window.removeEventListener(
        "focus",
        refreshInventory
      );

      window.removeEventListener(
        "vetClinicProductsUpdated",
        onProductsUpdated
      );

      window.removeEventListener(
        "vetClinicCategoriesUpdated",
        onCategoriesUpdated
      );
    };
  }, []);

  // ========================================
  // PRODUCTS DISPLAYED ON POS
  // ========================================

  const products = useMemo(() => {
    return inventoryProducts
      .filter(
        (product) =>
          product.showOnPOS === true
      )
      .map((product) => ({
        id: product.id,
        name: String(product.name || ""),
        category: String(
          product.category || ""
        ),
        price:
          Number(product.sellingPrice) || 0,
        stock: Math.max(
          0,
          Number(product.quantity) || 0
        ),
        image: product.image || "",
      }));
  }, [inventoryProducts]);

  // ========================================
  // DYNAMIC CATEGORIES
  // SOURCE: Categories.jsx / Inventory.jsx
  // localStorage: vetClinicCategories
  // ========================================

  const categories = useMemo(() => {
    const sortedCategories = [
      ...inventoryCategories,
    ].sort((a, b) => {
      const orderA =
        Number(a?.sortOrder) || 0;

      const orderB =
        Number(b?.sortOrder) || 0;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return String(
        a?.title || ""
      ).localeCompare(
        String(b?.title || "")
      );
    });

    const categoryNames = sortedCategories
      .map((item) =>
        String(item?.title || "").trim()
      )
      .filter(Boolean);

    return [
      "All categories",
      ...new Set(categoryNames),
    ];
  }, [inventoryCategories]);

  // Reset category when deleted

  useEffect(() => {
    if (!categories.includes(category)) {
      setCategory("All categories");
    }
  }, [categories, category]);

  // ========================================
  // FILTER PRODUCTS
  // SEARCH + CATEGORY WORK TOGETHER
  // ========================================

  const filteredProducts = useMemo(() => {
    const searchValue =
      search.toLowerCase().trim();

    return products.filter((product) => {
      const matchesSearch =
        !searchValue ||
        product.name
          .toLowerCase()
          .includes(searchValue) ||
        product.category
          .toLowerCase()
          .includes(searchValue);

      const matchesCategory =
        category === "All categories" ||
        product.category === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [products, search, category]);

  // ========================================
  // OWNER INPUT
  // ========================================

  const [ownerSearch, setOwnerSearch] =
    useState("");

  // ========================================
  // CART STATES
  // ========================================

  const [cart, setCart] = useState([]);

  const [checkoutOpen, setCheckoutOpen] =
    useState(false);

  const [amountReceived, setAmountReceived] =
    useState("");

  const [
    amountReceivedLbp,
    setAmountReceivedLbp,
  ] = useState("");

  const [discount, setDiscount] =
    useState("0");

  const [paymentMethod, setPaymentMethod] =
    useState("Cash");

  const [hasDelivery, setHasDelivery] =
    useState(false);

  const [saleComplete, setSaleComplete] =
    useState(false);

  const [lastSale, setLastSale] =
    useState(null);

  const [accountOpen, setAccountOpen] =
    useState(false);

  const USD_TO_LBP = 89500;

  // ========================================
  // TOTAL CALCULATIONS
  // ========================================

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  const discountNumber = Math.min(
    Math.max(Number(discount) || 0, 0),
    subtotal
  );

  const total = Math.max(
    subtotal - discountNumber,
    0
  );

  const received = Math.max(
    Number(amountReceived) || 0,
    0
  );

  const receivedLbp = Math.max(
    Number(amountReceivedLbp) || 0,
    0
  );

  const totalPaid =
    received +
    receivedLbp / USD_TO_LBP;

  const change = Math.max(
    totalPaid - total,
    0
  );

  const totalLbp =
    total * USD_TO_LBP;

  // ========================================
  // ADD PRODUCT TO CART
  // ========================================

  const addToCart = (product) => {
    if (product.stock <= 0) return;

    setCart((current) => {
      const existing = current.find(
        (item) =>
          String(item.id) ===
          String(product.id)
      );

      if (existing) {
        if (
          existing.quantity >= product.stock
        ) {
          return current;
        }

        return current.map((item) =>
          String(item.id) ===
          String(product.id)
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...current,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  // ========================================
  // INCREASE CART QUANTITY
  // ========================================

  const increaseQuantity = (id) => {
    setCart((current) =>
      current.map((item) => {
        if (
          String(item.id) !== String(id)
        ) {
          return item;
        }

        const product = products.find(
          (productItem) =>
            String(productItem.id) ===
            String(id)
        );

        if (
          !product ||
          item.quantity >= product.stock
        ) {
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      })
    );
  };

  // ========================================
  // DECREASE CART QUANTITY
  // ========================================

  const decreaseQuantity = (id) => {
    setCart((current) =>
      current
        .map((item) =>
          String(item.id) === String(id)
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) => item.quantity > 0
        )
    );
  };

  // ========================================
  // DELETE ITEM FROM CART
  // ========================================

  const deleteItem = (id) => {
    setCart((current) =>
      current.filter(
        (item) =>
          String(item.id) !== String(id)
      )
    );
  };

  // ========================================
  // CLEAR CART
  // ========================================

  const clearCart = () => {
    setCart([]);
    setOwnerSearch("");
    setDiscount("0");
    setAmountReceived("");
    setAmountReceivedLbp("");
    setHasDelivery(false);
  };

  // ========================================
  // OPEN CHECKOUT
  // ========================================

  const openCheckout = () => {
    if (cart.length === 0) return;

    const latestInventory =
      readStoredArray(PRODUCTS_KEY);

    const unavailable = cart.find(
      (item) => {
        const product =
          latestInventory.find(
            (inventoryItem) =>
              String(inventoryItem.id) ===
              String(item.id)
          );

        return (
          !product ||
          product.showOnPOS !== true ||
          Number(product.quantity) <
            item.quantity
        );
      }
    );

    if (unavailable) {
      setInventoryProducts(
        latestInventory
      );

      alert(
        `Not enough stock for ${unavailable.name}.`
      );

      return;
    }

    setDiscount("0");
    setAmountReceived("");
    setAmountReceivedLbp("");
    setPaymentMethod("Cash");
    setCheckoutOpen(true);
  };

  // ========================================
  // PAYMENT HELPERS
  // ========================================

  const handleExactPayment = () => {
    setAmountReceived(
      total.toFixed(2)
    );

    setAmountReceivedLbp("");
  };

  const addQuickUsd = (amount) => {
    setAmountReceived((current) =>
      (
        (Number(current) || 0) +
        amount
      ).toFixed(2)
    );
  };

  const addQuickLbp = (amount) => {
    setAmountReceivedLbp((current) =>
      String(
        (Number(current) || 0) +
          amount
      )
    );
  };

  // ========================================
  // RECALL / REFUND
  // ========================================

  const handleRecall = () => {
    alert("Recall selected");
  };

  const handleRefund = () => {
    alert("Refund selected");
  };

  // ========================================
  // COMPLETE SALE
  // ========================================

  const finishSale = () => {
    if (cart.length === 0) return;

    if (totalPaid + 0.000001 < total) {
      alert(
        "Amount received is less than the amount due."
      );
      return;
    }

    const latestInventory =
      readStoredArray(PRODUCTS_KEY);

    // Verify stock

    for (const item of cart) {
      const product =
        latestInventory.find(
          (inventoryItem) =>
            String(inventoryItem.id) ===
            String(item.id)
        );

      if (
        !product ||
        product.showOnPOS !== true ||
        Number(product.quantity) <
          item.quantity
      ) {
        setInventoryProducts(
          latestInventory
        );

        alert(
          `Not enough stock for ${item.name}.`
        );

        return;
      }
    }

    // Prepare sale

    const sale = {
      id: `POS-${Date.now()}`,
      owner:
        ownerSearch.trim() ||
        "Walk-in Customer",
      ownerId: null,
      items: cart.map((item) => ({
        ...item,
      })),
      subtotal,
      discount: discountNumber,
      total,
      received: totalPaid,
      change,
      paymentMethod,
      hasDelivery,
      date: new Date().toISOString(),
    };

    // Deduct purchased quantities

    const updatedInventory =
      latestInventory.map((product) => {
        const soldProduct = cart.find(
          (item) =>
            String(item.id) ===
            String(product.id)
        );

        if (!soldProduct) {
          return product;
        }

        return {
          ...product,
          quantity: Math.max(
            Number(product.quantity) -
              soldProduct.quantity,
            0
          ),
        };
      });

    // Read sales history

    let previousSales;

    try {
      const savedSales =
        localStorage.getItem(
          SALES_KEY
        );

      const parsed = savedSales
        ? JSON.parse(savedSales)
        : [];

      if (!Array.isArray(parsed)) {
        throw new Error(
          "Invalid sales history"
        );
      }

      previousSales = parsed;
    } catch (error) {
      console.error(error);

      alert(
        "Could not read sales history."
      );

      return;
    }

    // Save sale and inventory

    const oldProducts =
      localStorage.getItem(
        PRODUCTS_KEY
      );

    const oldSales =
      localStorage.getItem(
        SALES_KEY
      );

    try {
      localStorage.setItem(
        PRODUCTS_KEY,
        JSON.stringify(
          updatedInventory
        )
      );

      localStorage.setItem(
        SALES_KEY,
        JSON.stringify([
          sale,
          ...previousSales,
        ])
      );
    } catch (error) {
      console.error(
        "Could not save sale:",
        error
      );

      // Restore previous data

      try {
        if (oldProducts === null) {
          localStorage.removeItem(
            PRODUCTS_KEY
          );
        } else {
          localStorage.setItem(
            PRODUCTS_KEY,
            oldProducts
          );
        }

        if (oldSales === null) {
          localStorage.removeItem(
            SALES_KEY
          );
        } else {
          localStorage.setItem(
            SALES_KEY,
            oldSales
          );
        }
      } catch (restoreError) {
        console.error(
          "Could not restore saved data:",
          restoreError
        );
      }

      alert("Could not save sale.");
      return;
    }

    // Update inventory immediately

    setInventoryProducts(
      updatedInventory
    );

    window.dispatchEvent(
      new CustomEvent(
        "vetClinicProductsUpdated",
        {
          detail: updatedInventory,
        }
      )
    );

    window.dispatchEvent(
      new Event(
        "vetClinicPOSSalesUpdated"
      )
    );

    setLastSale(sale);
    setCheckoutOpen(false);
    setSaleComplete(true);

    clearCart();
  };

  // ========================================
  // ACCOUNT / LOGOUT
  // ========================================

  const handleLogout = () => {
    setAccountOpen(false);
    navigate("/");
  };

  // ========================================
  // PART 2 STARTS WITH return (
  // ========================================

  return (
    <div className="dashboard-layout pos-dashboard-layout">
      <Sidebar />

      <main className="pos-main">
        <style>{`
          .pos-dashboard-layout {
            min-height: 100vh;
            display: flex;
            background: #f8fafb;
            overflow: hidden;
          }

          .pos-dashboard-layout > .sidebar {
            width: 74px !important;
            min-width: 74px !important;
            flex: 0 0 74px !important;
            overflow-x: hidden !important;
          }

          .pos-dashboard-layout > .sidebar .sidebar-text,
          .pos-dashboard-layout > .sidebar .sidebar-logo-text {
            display: none !important;
          }

          .pos-dashboard-layout > .sidebar .sidebar-brand,
          .pos-dashboard-layout > .sidebar .sidebar-logo {
            justify-content: center !important;
          }

          .pos-dashboard-layout > .sidebar .sidebar-nav a,
          .pos-dashboard-layout > .sidebar .sidebar-logout {
            width: 50px !important;
            min-width: 50px !important;
            height: 48px !important;
            margin-left: auto !important;
            margin-right: auto !important;
            padding: 0 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
          }

          .pos-dashboard-layout > .sidebar .sidebar-icon {
            margin: 0 !important;
            font-size: 18px !important;
          }

          .pos-main {
            flex: 1;
            min-width: 0;
            height: 100vh;
            overflow: hidden;
            background: #f8fafb;
          }

          .pos-main * {
            box-sizing: border-box;
          }

          /* HEADER */

          .pos-topbar {
            height: 64px;
            padding: 0 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #ffffff;
            border-bottom: 1px solid #e5eceb;
            position: relative;
            z-index: 50;
          }

          .pos-page-title {
            margin: 0;
            color: #344054;
            font-size: 19px;
            font-weight: 700;
          }

          .pos-account-wrapper {
            position: relative;
          }

          .pos-account-button {
            border: 0 !important;
            background: transparent !important;
            padding: 5px 7px !important;
            display: flex !important;
            align-items: center;
            gap: 9px;
            cursor: pointer;
            border-radius: 8px !important;
          }

          .pos-account-button:hover {
            background: #f5f9f8 !important;
          }

          .pos-staff-avatar {
            width: 35px;
            height: 35px;
            border-radius: 50%;
            background: #e7f7f5;
            color: #159f9f;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 700;
          }

          .pos-staff-info {
            text-align: left;
            line-height: 1.25;
          }

          .pos-staff-name {
            color: #344054;
            font-size: 11px;
            font-weight: 700;
          }

          .pos-staff-role {
            color: #98a2b3;
            font-size: 9px;
            margin-top: 2px;
          }

          .pos-account-arrow {
            color: #98a2b3;
            font-size: 9px;
          }

          .pos-account-menu {
            position: absolute;
            top: calc(100% + 7px);
            right: 0;
            width: 190px;
            padding: 6px;
            background: #ffffff;
            border: 1px solid #e3eae9;
            border-radius: 9px;
            box-shadow: 0 12px 35px rgba(16,24,40,.13);
            z-index: 500;
          }

          .pos-account-menu-header {
            padding: 9px 10px 10px;
            border-bottom: 1px solid #edf1f1;
          }

          .pos-account-menu button {
            width: 100%;
            border: 0;
            background: transparent;
            padding: 9px 10px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: #475467;
            cursor: pointer;
            font-size: 10px;
          }

          .pos-account-menu button:hover {
            background: #f5f9f8;
          }

          /* MAIN LAYOUT - CART WIDTH UNCHANGED */

          .pos-content {
            height: calc(100vh - 64px);
            display: grid;
            grid-template-columns: minmax(0, 1fr) 320px;
          }

          .pos-products-section {
            min-width: 0;
            padding: 14px 16px 20px;
            overflow-y: auto;
          }

          /* SEARCH AND CATEGORIES */

          .pos-tools {
            display: flex;
            gap: 9px;
            margin-bottom: 13px;
          }

          .pos-search-box {
            flex: 1;
            min-width: 0;
            height: 39px;
            padding: 0 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            border: 1px solid #dce7e6;
            border-radius: 8px;
            background: #ffffff;
          }

          .pos-search-box svg {
            color: #159f9f;
            font-size: 12px;
            flex-shrink: 0;
          }

          .pos-search-box input {
            width: 100%;
            border: 0;
            outline: none;
            background: transparent;
            color: #344054;
            font-size: 10px;
          }

          .pos-category-select {
            width: 160px;
            height: 39px;
            padding: 0 10px;
            border: 1px solid #dce7e6;
            border-radius: 8px;
            background: #ffffff;
            color: #475467;
            outline: none;
            font-size: 10px;
          }

          /* PRODUCTS - 4 PER ROW */

          .pos-products-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 10px;
          }

          .pos-product-card {
            min-width: 0;
            min-height: 205px;
            padding: 11px;
            border: 1px solid #dfe8e7;
            border-radius: 10px;
            background: #ffffff;
            display: flex;
            flex-direction: column;
            transition: .15s ease;
          }

          .pos-product-card:hover {
            border-color: #9ed9d5;
            box-shadow: 0 5px 15px rgba(16,24,40,.06);
          }

          /* BIGGER IMAGE AREA */

          .pos-product-image {
            height: 105px;
            width: 100%;
            border-radius: 7px;
            background: #f4f8f8;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #a8b6b5;
            font-size: 22px;
            overflow: hidden;
          }

          .pos-product-image img {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: contain;
          }

          .pos-product-name {
            margin-top: 8px;
            color: #344054;
            font-size: 10px;
            font-weight: 700;
            line-height: 1.3;
            overflow-wrap: anywhere;
          }

          .pos-product-category {
            margin-top: 2px;
            color: #98a2b3;
            font-size: 8px;
          }

          .pos-product-bottom {
            margin-top: auto;
            padding-top: 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 5px;
          }

          .pos-product-price {
            color: #159f9f;
            font-size: 12px;
            font-weight: 800;
          }

          .pos-product-stock {
            color: #98a2b3;
            font-size: 8px;
          }

          .pos-add-button {
            width: 27px !important;
            min-width: 27px !important;
            height: 27px !important;
            padding: 0 !important;
            border: 0 !important;
            border-radius: 50% !important;
            background: #e8f7f5 !important;
            color: #159f9f !important;
            display: flex !important;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }

          .pos-add-button:disabled {
            opacity: .4;
            cursor: not-allowed;
          }

          /* CART - SAME LAYOUT */

          .pos-cart-panel {
            min-width: 0;
            height: 100%;
            background: #ffffff;
            border-left: 1px solid #e3eae9;
            display: flex;
            flex-direction: column;
          }

          .pos-cart-header {
            padding: 14px;
            border-bottom: 1px solid #edf1f1;
          }

          .pos-cart-header h2 {
            margin: 0 0 10px;
            color: #344054;
            font-size: 14px;
          }

          .pos-owner-select {
            width: 100%;
            height: 38px;
            padding: 0 9px;
            border: 1px solid #dfe7e7;
            border-radius: 7px;
            background: #ffffff;
            color: #475467;
            outline: none;
            font-size: 9px;
          }

          .pos-cart-body {
            flex: 1;
            min-height: 0;
            overflow-y: auto;
            padding: 10px 13px;
          }

          .pos-empty-cart {
            height: 100%;
            min-height: 220px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #98a2b3;
            text-align: center;
          }

          .pos-empty-icon {
            width: 62px;
            height: 62px;
            border-radius: 50%;
            background: #eff9f8;
            color: #159f9f;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 23px;
            margin-bottom: 10px;
          }

          .pos-empty-cart strong {
            color: #475467;
            font-size: 11px;
          }

          .pos-empty-cart span {
            margin-top: 4px;
            font-size: 9px;
          }

          .pos-cart-item {
            padding: 10px 0;
            border-bottom: 1px solid #edf1f1;
          }

          .pos-cart-item-name {
            color: #344054;
            font-size: 10px;
            font-weight: 700;
          }

          .pos-cart-item-row {
            margin-top: 7px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 7px;
          }

          .pos-cart-price {
            color: #159f9f;
            font-size: 9px;
            font-weight: 700;
          }

          .pos-cart-controls {
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .pos-quantity-button,
          .pos-delete-button {
            width: 25px !important;
            min-width: 25px !important;
            height: 25px !important;
            padding: 0 !important;
            border: 1px solid #dfe7e7 !important;
            border-radius: 5px !important;
            background: #ffffff !important;
            display: flex !important;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 8px !important;
          }

          .pos-quantity-button {
            color: #475467 !important;
          }

          .pos-delete-button {
            color: #d92d20 !important;
          }

          .pos-cart-quantity {
            min-width: 20px;
            text-align: center;
            color: #344054;
            font-size: 9px;
            font-weight: 700;
          }

          .pos-cart-footer {
            padding: 12px 13px;
            border-top: 1px solid #e3eae9;
            background: #ffffff;
          }

          .pos-summary-row {
            margin-bottom: 7px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: #667085;
            font-size: 9px;
          }

          .pos-summary-row strong {
            color: #344054;
          }

          .pos-summary-row.total {
            padding-top: 8px;
            margin-top: 7px;
            border-top: 1px solid #edf1f1;
            font-size: 12px;
            font-weight: 700;
          }

          .pos-summary-row.total strong {
            color: #159f9f;
            font-size: 15px;
          }

          .pos-checkout-btn {
            width: 100% !important;
            height: 38px !important;
            margin-top: 8px;
            border: 1px solid #159f9f !important;
            border-radius: 7px !important;
            background: #159f9f !important;
            color: #ffffff !important;
            display: flex !important;
            align-items: center;
            justify-content: center;
            gap: 6px;
            cursor: pointer;
            font-size: 10px !important;
            font-weight: 700;
          }

          .pos-checkout-btn:disabled {
            opacity: .45;
            cursor: not-allowed;
          }

          .pos-clear-btn {
            width: 100% !important;
            height: 34px !important;
            margin-top: 6px;
            border: 1px solid #e3eae9 !important;
            border-radius: 7px !important;
            background: #ffffff !important;
            color: #667085 !important;
            cursor: pointer;
            font-size: 9px !important;
          }

          .pos-clear-btn:disabled {
            opacity: .45;
            cursor: not-allowed;
          }

          .pos-bottom-actions {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
            margin-top: 8px;
          }

          .pos-bottom-action {
            min-width: 0;
            min-height: 54px;
            padding: 7px 4px !important;
            border: 1px solid #dfe7e7 !important;
            border-radius: 8px !important;
            background: #ffffff !important;
            color: #475467 !important;
            display: flex !important;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 3px;
            cursor: pointer;
            font-size: 9px !important;
            font-weight: 700 !important;
            transition: .15s ease;
          }

          .pos-bottom-action:hover,
          .pos-bottom-action.active {
            border-color: #159f9f !important;
            background: #eff9f8 !important;
            color: #159f9f !important;
          }

          .pos-bottom-action-emoji {
            font-size: 17px;
            line-height: 1;
          }

          /* CHECKOUT MODAL */

          .pos-modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 9999;
            padding: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(16,24,40,.42);
          }

          .pos-checkout-reference {
            width: min(1020px, 95vw);
            max-height: 90vh;
            overflow: hidden;
            border-radius: 13px;
            background: #ffffff;
            box-shadow: 0 24px 70px rgba(16,24,40,.22);
          }

          .pos-reference-checkout-header {
            min-height: 66px;
            padding: 13px 17px;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            border-bottom: 1px solid #e7ecec;
          }

          .pos-reference-checkout-header h2 {
            margin: 0;
            color: #344054;
            font-size: 16px;
          }

          .pos-reference-checkout-header p {
            margin: 4px 0 0;
            color: #98a2b3;
            font-size: 10px;
          }

          .pos-reference-close {
            width: 30px !important;
            min-width: 30px !important;
            height: 30px !important;
            padding: 0 !important;
            border: 1px solid #e2e8e7 !important;
            border-radius: 8px !important;
            background: #ffffff !important;
            color: #667085 !important;
            display: flex !important;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }

          .pos-reference-checkout-body {
            display: grid;
            grid-template-columns: 1fr 1.05fr;
            max-height: calc(90vh - 132px);
            overflow-y: auto;
          }

          .pos-financial-panel,
          .pos-reference-payment {
            padding: 15px;
          }

          .pos-financial-panel {
            border-right: 1px solid #e6eceb;
          }

          .pos-financial-panel h3,
          .pos-reference-payment h3 {
            margin: 0 0 14px;
            color: #344054;
            font-size: 12px;
          }

          .pos-financial-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .pos-financial-field label,
          .pos-reference-field label,
          .pos-received-title {
            display: block;
            margin-bottom: 5px;
            color: #667085;
            font-size: 8px;
            font-weight: 700;
          }

          .pos-financial-field input,
          .pos-financial-value,
          .pos-reference-field input {
            width: 100%;
            height: 39px;
            padding: 0 10px;
            border: 1px solid #e0e7e6;
            border-radius: 7px;
            background: #fafcfc;
            color: #475467;
            font-size: 10px;
          }

          .pos-financial-value {
            display: flex;
            align-items: center;
          }

          .pos-financial-field input,
          .pos-reference-field input {
            background: #ffffff;
            outline: none;
          }

          .pos-financial-field input:focus,
          .pos-reference-field input:focus {
            border-color: #159f9f;
          }

          .pos-reference-total-box {
            margin-top: 12px;
            padding: 11px 12px;
            border: 1px solid #a9deda;
            border-radius: 8px;
            background: #eff9f8;
          }

          .pos-reference-total-box span {
            display: block;
            margin-bottom: 5px;
            color: #667085;
            font-size: 8px;
            font-weight: 700;
          }

          .pos-reference-total-box strong {
            color: #159f9f;
            font-size: 18px;
          }

          .pos-delivery-checkbox {
            margin-top: 13px;
            display: flex;
            align-items: center;
            gap: 7px;
            color: #475467;
            font-size: 10px;
            cursor: pointer;
          }

          .pos-delivery-checkbox input {
            accent-color: #159f9f;
          }

          .pos-checkout-items-mini {
            margin-top: 14px;
            padding-top: 8px;
            border-top: 1px solid #edf1f1;
          }

          .pos-checkout-mini-item {
            padding: 8px 0;
            display: flex;
            justify-content: space-between;
            gap: 12px;
            border-bottom: 1px solid #f0f3f3;
            color: #475467;
            font-size: 9px;
          }

          .pos-checkout-mini-item div > strong {
            display: block;
            color: #344054;
            font-size: 9px;
          }

          .pos-checkout-mini-item div > span {
            display: block;
            margin-top: 3px;
            color: #98a2b3;
            font-size: 8px;
          }

          .pos-reference-amount-due {
            margin-bottom: 14px;
            padding: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border: 1px solid #a9deda;
            border-radius: 9px;
            background: #eff9f8;
            color: #344054;
            font-size: 11px;
          }

          .pos-reference-amount-due strong {
            color: #159f9f;
            font-size: 18px;
          }

          .pos-reference-field {
            margin-bottom: 12px;
          }

          .pos-reference-payment-methods {
            display: flex;
            gap: 8px;
            margin-bottom: 13px;
          }

          .pos-reference-payment-methods button {
            flex: 1;
            padding: 10px;
            border: 1px solid #dfe7e7;
            border-radius: 7px;
            background: white;
            color: #475467;
            cursor: pointer;
            font-size: 10px;
          }

          .pos-reference-payment-methods button.active {
            background: #eff9f8;
            color: #159f9f;
            border-color: #159f9f;
          }

          .pos-reference-quick-payments {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 7px;
          }

          .pos-reference-quick-payments button {
            padding: 7px 10px;
            border: 1px solid #dfe7e7;
            border-radius: 6px;
            background: #ffffff;
            color: #475467;
            cursor: pointer;
            font-size: 9px;
          }

          .pos-reference-quick-payments button:hover {
            border-color: #159f9f;
            color: #159f9f;
          }

          .pos-reference-payment-summary {
            margin-top: 13px;
            padding: 12px;
            background: #f8fafb;
            border-radius: 8px;
          }

          .pos-reference-payment-summary > div {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            color: #667085;
            font-size: 10px;
          }

          .pos-reference-payment-summary strong {
            color: #344054;
          }

          .pos-reference-checkout-footer {
            padding: 13px 17px;
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            border-top: 1px solid #e7ecec;
            background: #ffffff;
          }

          .pos-reference-checkout-footer button,
          .pos-success-button {
            min-height: 38px;
            padding: 0 18px;
            border-radius: 7px;
            border: 1px solid #dfe7e7;
            background: #ffffff;
            color: #475467;
            cursor: pointer;
            font-size: 10px;
            font-weight: 700;
          }

          .pos-reference-checkout-footer .pos-complete-sale,
          .pos-success-button {
            border-color: #159f9f;
            background: #159f9f;
            color: #ffffff;
          }

          .pos-reference-checkout-footer .pos-complete-sale:disabled {
            opacity: .5;
            cursor: not-allowed;
          }

          .pos-success-card {
            width: min(390px, 95vw);
            padding: 30px;
            border-radius: 13px;
            background: white;
            text-align: center;
            box-shadow: 0 24px 70px rgba(16,24,40,.22);
          }

          .pos-success-icon {
            font-size: 46px;
            color: #159f9f;
          }

          .pos-success-card h2 {
            color: #344054;
            font-size: 19px;
          }

          .pos-success-card p {
            color: #667085;
            font-size: 11px;
          }

          .pos-success-button {
            margin-top: 14px;
          }

          @media (max-width: 1050px) {
            .pos-content {
              grid-template-columns: minmax(0, 1fr) 300px;
            }

            .pos-products-grid {
              grid-template-columns: repeat(4, minmax(0, 1fr));
            }
          }

          @media (max-width: 760px) {
            .pos-main {
              height: auto;
              min-height: 100vh;
              overflow: visible;
            }

            .pos-content {
              height: auto;
              grid-template-columns: minmax(0, 1fr);
            }

            .pos-products-section {
              overflow: visible;
            }

            .pos-cart-panel {
              min-height: 400px;
            }

            .pos-products-grid {
              grid-template-columns: repeat(4, minmax(0, 1fr));
            }

            .pos-reference-checkout-body {
              grid-template-columns: 1fr;
            }

            .pos-financial-panel {
              border-right: 0;
              border-bottom: 1px solid #e6eceb;
            }
          }
        `}</style>

        {/* HEADER */}

        <header className="pos-topbar">
          <h1 className="pos-page-title">
            POS
          </h1>

          <div className="pos-account-wrapper">
            <button
              type="button"
              className="pos-account-button"
              onClick={() =>
                setAccountOpen(!accountOpen)
              }
            >
              <div className="pos-staff-avatar">
                CS
              </div>

              <div className="pos-staff-info">
                <div className="pos-staff-name">
                  Clinic Staff
                </div>
                <div className="pos-staff-role">
                  Staff
                </div>
              </div>

              <FaChevronDown
                className="pos-account-arrow"
              />
            </button>

            {accountOpen && (
              <div className="pos-account-menu">
                <div className="pos-account-menu-header">
                  <div className="pos-staff-name">
                    Clinic Staff
                  </div>
                  <div className="pos-staff-role">
                    Staff Account
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setAccountOpen(false)
                  }
                >
                  <FaUser />
                  Profile
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setAccountOpen(false)
                  }
                >
                  <FaCog />
                  Settings
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="pos-content">
          {/* PRODUCTS SECTION */}

          <section className="pos-products-section">
            <div className="pos-tools">
              {/* SEARCH WITH ICON */}

              <div className="pos-search-box">
                <FaSearch />

                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />
              </div>

              {/* DYNAMIC CATEGORIES */}

              <select
                className="pos-category-select"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
              >
                {categories.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* FOUR PRODUCTS PER ROW */}

            <div className="pos-products-grid">
              {filteredProducts.map((product) => {
                const cartItem = cart.find(
                  (item) =>
                    String(item.id) ===
                    String(product.id)
                );

                const quantityInCart =
                  cartItem?.quantity || 0;

                const canAdd =
                  product.stock >
                  quantityInCart;

                return (
                  <div
                    className="pos-product-card"
                    key={product.id}
                  >
                    <div className="pos-product-image">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                        />
                      ) : (
                        <FaBoxOpen />
                      )}
                    </div>

                    <div className="pos-product-name">
                      {product.name}
                    </div>

                    <div className="pos-product-category">
                      {product.category}
                    </div>

                    <div className="pos-product-bottom">
                      <div>
                        <div className="pos-product-price">
                          $
                          {product.price.toFixed(2)}
                        </div>

                        <div className="pos-product-stock">
                          Stock: {product.stock}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="pos-add-button"
                        onClick={() =>
                          addToCart(product)
                        }
                        disabled={!canAdd}
                        title={
                          canAdd
                            ? "Add to cart"
                            : "Out of stock"
                        }
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div
                style={{
                  padding: "45px 15px",
                  textAlign: "center",
                  color: "#98a2b3",
                  fontSize: "12px",
                }}
              >
                <FaBoxOpen
                  style={{
                    fontSize: "28px",
                    marginBottom: "10px",
                  }}
                />

                <div>
                  No products found.
                </div>
              </div>
            )}
          </section>

          {/* CART - SAME POSITION AND DESIGN */}

          <aside className="pos-cart-panel">
            <div className="pos-cart-header">
              <h2>Cart</h2>

              <input
                type="text"
                className="pos-owner-select"
                placeholder="Enter owner name"
                value={ownerSearch}
                onChange={(event) =>
                  setOwnerSearch(event.target.value)
                }
              />
            </div>

            <div className="pos-cart-body">
              {cart.length === 0 ? (
                <div className="pos-empty-cart">
                  <div className="pos-empty-icon">
                    <FaShoppingCart />
                  </div>

                  <strong>
                    Your cart is empty
                  </strong>

                  <span>
                    Add products to get started
                  </span>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    className="pos-cart-item"
                    key={item.id}
                  >
                    <div className="pos-cart-item-name">
                      {item.name}
                    </div>

                    <div className="pos-cart-item-row">
                      <div className="pos-cart-price">
                        $
                        {item.price.toFixed(2)}
                        {" x "}
                        {item.quantity}
                      </div>

                      <div className="pos-cart-controls">
                        <button
                          type="button"
                          className="pos-quantity-button"
                          onClick={() =>
                            decreaseQuantity(
                              item.id
                            )
                          }
                        >
                          <FaMinus />
                        </button>

                        <span className="pos-cart-quantity">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          className="pos-quantity-button"
                          onClick={() =>
                            increaseQuantity(
                              item.id
                            )
                          }
                          disabled={
                            item.quantity >=
                            (
                              products.find(
                                (product) =>
                                  String(
                                    product.id
                                  ) ===
                                  String(item.id)
                              )?.stock || 0
                            )
                          }
                        >
                          <FaPlus />
                        </button>

                        <button
                          type="button"
                          className="pos-delete-button"
                          onClick={() =>
                            deleteItem(item.id)
                          }
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pos-cart-footer">
              <div className="pos-summary-row">
                <span>Subtotal</span>

                <strong>
                  ${subtotal.toFixed(2)}
                </strong>
              </div>

              <div className="pos-summary-row total">
                <span>Total</span>

                <strong>
                  ${subtotal.toFixed(2)}
                </strong>
              </div>

              <button
                type="button"
                className="pos-checkout-btn"
                onClick={openCheckout}
                disabled={cart.length === 0}
              >
                <FaShoppingCart />
                Checkout
              </button>

              <button
                type="button"
                className="pos-clear-btn"
                onClick={clearCart}
                disabled={cart.length === 0}
              >
                Clear cart
              </button>

              <div className="pos-bottom-actions">
                <button
                  type="button"
                  className={`pos-bottom-action ${
                    hasDelivery ? "active" : ""
                  }`}
                  onClick={() =>
                    setHasDelivery(
                      !hasDelivery
                    )
                  }
                >
                  <span className="pos-bottom-action-emoji">
                    🚚
                  </span>
                  Delivery
                </button>

                <button
                  type="button"
                  className="pos-bottom-action"
                  onClick={handleRecall}
                >
                  <span className="pos-bottom-action-emoji">
                    ↩️
                  </span>
                  Recall
                </button>

                <button
                  type="button"
                  className="pos-bottom-action"
                  onClick={handleRefund}
                >
                  <span className="pos-bottom-action-emoji">
                    ↪️
                  </span>
                  Refund
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* CHECKOUT MODAL */}

        {checkoutOpen && (
          <div className="pos-modal-overlay">
            <div className="pos-checkout-reference">
              <div className="pos-reference-checkout-header">
                <div>
                  <h2>Checkout</h2>
                  <p>
                    Complete your transaction
                  </p>
                </div>

                <button
                  type="button"
                  className="pos-reference-close"
                  onClick={() =>
                    setCheckoutOpen(false)
                  }
                >
                  <FaTimes />
                </button>
              </div>

              <div className="pos-reference-checkout-body">
                {/* FINANCIAL SUMMARY */}

                <div className="pos-financial-panel">
                  <h3>Financial Summary</h3>

                  <div className="pos-financial-grid">
                    <div className="pos-financial-field">
                      <label>Subtotal (USD)</label>

                      <div className="pos-financial-value">
                        ${subtotal.toFixed(2)}
                      </div>
                    </div>

                    <div className="pos-financial-field">
                      <label>Discount (USD)</label>

                      <input
                        type="number"
                        min="0"
                        max={subtotal}
                        step="0.01"
                        value={discount}
                        onChange={(event) =>
                          setDiscount(
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div className="pos-financial-field">
                      <label>Discount Applied</label>

                      <div className="pos-financial-value">
                        $
                        {discountNumber.toFixed(2)}
                      </div>
                    </div>

                    <div className="pos-financial-field">
                      <label>Total (LBP)</label>

                      <div className="pos-financial-value">
                        {totalLbp.toLocaleString(
                          "en-US",
                          {
                            maximumFractionDigits: 0,
                          }
                        )}
                        {" LBP"}
                      </div>
                    </div>
                  </div>

                  <div className="pos-reference-total-box">
                    <span>
                      Total Amount Due
                    </span>

                    <strong>
                      ${total.toFixed(2)}
                    </strong>
                  </div>

                  <label className="pos-delivery-checkbox">
                    <input
                      type="checkbox"
                      checked={hasDelivery}
                      onChange={(event) =>
                        setHasDelivery(
                          event.target.checked
                        )
                      }
                    />

                    Delivery Order
                  </label>

                  <div className="pos-checkout-items-mini">
                    <h3>Order Items</h3>

                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="pos-checkout-mini-item"
                      >
                        <div>
                          <strong>
                            {item.name}
                          </strong>

                          <span>
                            $
                            {item.price.toFixed(2)}
                            {" x "}
                            {item.quantity}
                          </span>
                        </div>

                        <strong>
                          $
                          {(
                            item.price *
                            item.quantity
                          ).toFixed(2)}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PAYMENT */}

                <div className="pos-reference-payment">
                  <h3>Payment Details</h3>

                  <div className="pos-reference-amount-due">
                    <span>Amount Due</span>

                    <strong>
                      ${total.toFixed(2)}
                    </strong>
                  </div>

                  <div className="pos-received-title">
                    Payment Method
                  </div>

                  <div className="pos-reference-payment-methods">
                    {[
                      "Cash",
                      "Card",
                    ].map((method) => (
                      <button
                        key={method}
                        type="button"
                        className={
                          paymentMethod ===
                          method
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          setPaymentMethod(
                            method
                          )
                        }
                      >
                        {method}
                      </button>
                    ))}
                  </div>

                  <div className="pos-reference-field">
                    <label>
                      Amount Received (USD)
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={amountReceived}
                      onChange={(event) =>
                        setAmountReceived(
                          event.target.value
                        )
                      }
                    />

                    <div className="pos-reference-quick-payments">
                      <button
                        type="button"
                        onClick={
                          handleExactPayment
                        }
                      >
                        Exact
                      </button>

                      {[5, 10, 20, 50, 100].map(
                        (amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() =>
                              addQuickUsd(
                                amount
                              )
                            }
                          >
                            +${amount}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="pos-reference-field">
                    <label>
                      Amount Received (LBP)
                    </label>

                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={amountReceivedLbp}
                      onChange={(event) =>
                        setAmountReceivedLbp(
                          event.target.value
                        )
                      }
                    />

                    <div className="pos-reference-quick-payments">
                      {[
                        100000,
                        500000,
                        1000000,
                      ].map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() =>
                            addQuickLbp(
                              amount
                            )
                          }
                        >
                          +
                          {amount.toLocaleString(
                            "en-US"
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pos-reference-payment-summary">
                    <div>
                      <span>Total Paid</span>

                      <strong>
                        $
                        {totalPaid.toFixed(2)}
                      </strong>
                    </div>

                    <div>
                      <span>Remaining</span>

                      <strong>
                        $
                        {Math.max(
                          total - totalPaid,
                          0
                        ).toFixed(2)}
                      </strong>
                    </div>

                    <div>
                      <span>Change</span>

                      <strong>
                        ${change.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pos-reference-checkout-footer">
                <button
                  type="button"
                  onClick={() =>
                    setCheckoutOpen(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="pos-complete-sale"
                  onClick={finishSale}
                  disabled={
                    totalPaid + 0.000001 <
                    total
                  }
                >
                  Complete Sale
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SALE SUCCESS */}

        {saleComplete && (
          <div className="pos-modal-overlay">
            <div className="pos-success-card">
              <FaCheckCircle className="pos-success-icon" />

              <h2>Sale Completed!</h2>

              <p>
                Your transaction was
                completed successfully.
              </p>

              {lastSale && (
                <>
                  <p>
                    Sale ID: {lastSale.id}
                  </p>

                  <p>
                    Total: $
                    {lastSale.total.toFixed(2)}
                  </p>
                </>
              )}

              <button
                type="button"
                className="pos-success-button"
                onClick={() =>
                  setSaleComplete(false)
                }
              >
                Done
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default POS;
