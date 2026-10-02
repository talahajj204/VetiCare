import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import {
  FaSearch,
  FaShoppingCart,
  FaTrash,
  FaMinus,
  FaPlus,
  FaBoxOpen,
  FaUserPlus,
  FaTimes,
  FaCreditCard,
  FaCheckCircle,
  FaReceipt,
  FaChevronDown,
  FaUser,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

const initialProducts = [
  {
    id: 1,
    name: "Royal Canin Adult Dog",
    category: "Food",
    price: 28.5,
    stock: 14,
    image: "",
  },
  {
    id: 2,
    name: "Royal Canin Kitten",
    category: "Food",
    price: 24,
    stock: 8,
    image: "",
  },
  {
    id: 3,
    name: "Dental Care Chews",
    category: "Dental",
    price: 12.5,
    stock: 21,
    image: "",
  },
  {
    id: 4,
    name: "Pet Shampoo",
    category: "Grooming",
    price: 9.75,
    stock: 12,
    image: "",
  },
  {
    id: 5,
    name: "Flea & Tick Collar",
    category: "Accessories",
    price: 18,
    stock: 7,
    image: "",
  },
  {
    id: 6,
    name: "Vitamin Supplement",
    category: "Supplements",
    price: 16.25,
    stock: 5,
    image: "",
  },
  {
    id: 7,
    name: "Cat Litter",
    category: "Hygiene",
    price: 11,
    stock: 18,
    image: "",
  },
  {
    id: 8,
    name: "Ear Cleaning Solution",
    category: "Hygiene",
    price: 8.5,
    stock: 9,
    image: "",
  },
  {
    id: 9,
    name: "Pet Travel Bowl",
    category: "Accessories",
    price: 7.25,
    stock: 3,
    image: "",
  },
  {
    id: 10,
    name: "Puppy Training Pads",
    category: "Hygiene",
    price: 14,
    stock: 22,
    image: "",
  },
  {
    id: 11,
    name: "Dog Toy Ball",
    category: "Accessories",
    price: 6.5,
    stock: 15,
    image: "",
  },
  {
    id: 12,
    name: "Eye Drops",
    category: "Care",
    price: 10,
    stock: 11,
    image: "",
  },
];

const owners = [
  {
    id: 1,
    name: "John Smith",
    phone: "+961 70 123 456",
  },
  {
    id: 2,
    name: "Sarah Khalil",
    phone: "+961 71 234 567",
  },
  {
    id: 3,
    name: "Maya Haddad",
    phone: "+961 76 345 678",
  },
  {
    id: 4,
    name: "Omar Nassar",
    phone: "+961 81 456 789",
  },
];

function POS() {
  const navigate = useNavigate();

  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [selectedOwner, setSelectedOwner] = useState("");
  const [cart, setCart] = useState([]);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [amountReceived, setAmountReceived] = useState("");
  const [discount, setDiscount] = useState("0");

  const [saleComplete, setSaleComplete] = useState(false);
  const [lastSale, setLastSale] = useState(null);

  const [accountOpen, setAccountOpen] = useState(false);

  const categories = useMemo(() => {
    return [
      "All categories",
      ...Array.from(new Set(products.map((product) => product.category))),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const value = search.toLowerCase().trim();

    return products.filter((product) => {
      const searchMatch =
        !value ||
        product.name.toLowerCase().includes(value) ||
        product.category.toLowerCase().includes(value);

      const categoryMatch =
        category === "All categories" || product.category === category;

      return searchMatch && categoryMatch;
    });
  }, [products, search, category]);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const discountNumber = Math.min(Math.max(Number(discount) || 0, 0), subtotal);

  const total = Math.max(subtotal - discountNumber, 0);

  const received = Number(amountReceived) || 0;

  const change = Math.max(received - total, 0);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product) => {
    if (product.stock <= 0) return;

    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      if (existing.quantity >= product.stock) return;

      setCart((current) =>
        current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        )
      );

      return;
    }

    setCart((current) => [
      ...current,
      {
        ...product,
        quantity: 1,
      },
    ]);
  };

  const increaseQuantity = (id) => {
    setCart((current) =>
      current.map((item) => {
        if (item.id !== id) return item;

        const product = products.find((productItem) => productItem.id === id);

        if (!product || item.quantity >= product.stock) {
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      })
    );
  };

  const decreaseQuantity = (id) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const deleteItem = (id) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedOwner("");
    setDiscount("0");
    setAmountReceived("");
  };

  const openCheckout = () => {
    setDiscount("0");
    setAmountReceived(subtotal > 0 ? subtotal.toFixed(2) : "");
    setCheckoutOpen(true);
  };

  const finishSale = () => {
    if (received < total) {
      alert("Amount received is less than the amount due.");
      return;
    }

    const owner = owners.find(
      (ownerItem) => String(ownerItem.id) === String(selectedOwner)
    );

    const sale = {
      id: `POS-${Date.now()}`,
      owner: owner?.name || "Unknown Owner",
      items: [...cart],
      subtotal,
      discount: discountNumber,
      total,
      received,
      change,
      date: new Date(),
    };

    setProducts((current) =>
      current.map((product) => {
        const soldProduct = cart.find((item) => item.id === product.id);

        if (!soldProduct) return product;

        return {
          ...product,
          stock: Math.max(product.stock - soldProduct.quantity, 0),
        };
      })
    );

    setLastSale(sale);
    setCheckoutOpen(false);
    setSaleComplete(true);

    setCart([]);
    setSelectedOwner("");
    setAmountReceived("");
    setDiscount("0");
  };

  const handleLogout = () => {
    setAccountOpen(false);
    navigate("/");
  };

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

          /*
           * POS ONLY:
           * collapse the normal clinic sidebar.
           */

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

          .pos-dashboard-layout > .sidebar .sidebar-brand {
            justify-content: center !important;
          }

          .pos-dashboard-layout > .sidebar .sidebar-logo {
            justify-content: center !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
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
            flex: 1 1 auto;
            width: auto;
            min-width: 0;
            height: 100vh;
            overflow: hidden;
            background: #f8fafb;
          }

          .pos-main * {
            box-sizing: border-box;
          }

          /* =========================================
             TOP AREA
          ========================================= */

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

          /* =========================================
             ACCOUNT
          ========================================= */

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
            margin-bottom: 5px;
          }

          .pos-account-menu-header strong {
            display: block;
            color: #344054;
            font-size: 11px;
          }

          .pos-account-menu-header span {
            display: block;
            margin-top: 3px;
            color: #98a2b3;
            font-size: 9px;
          }

          .pos-account-menu button {
            width: 100% !important;
            border: 0 !important;
            background: transparent !important;
            padding: 9px 10px !important;
            border-radius: 6px !important;
            display: flex !important;
            align-items: center;
            gap: 9px;
            color: #475467 !important;
            font-size: 10px !important;
            cursor: pointer;
            text-align: left;
          }

          .pos-account-menu button:hover {
            background: #f4f9f8 !important;
            color: #159f9f !important;
          }

          .pos-account-menu button.logout {
            color: #d92d20 !important;
          }

          /* =========================================
             WORKSPACE
          ========================================= */

          .pos-workspace {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 335px;
            height: calc(100vh - 64px);
            min-width: 0;
          }

          /* =========================================
             PRODUCTS SIDE
          ========================================= */

          .pos-products-area {
            min-width: 0;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 16px 16px 24px;
          }

          .pos-toolbar {
            display: grid;
            grid-template-columns: minmax(200px, 1fr) 200px;
            gap: 10px;
            margin-bottom: 14px;
          }

          .pos-search-box {
            position: relative;
            min-width: 0;
          }

          .pos-search-box > svg {
            position: absolute;
            left: 13px;
            top: 50%;
            transform: translateY(-50%);
            color: #98a2b3;
            font-size: 12px;
            pointer-events: none;
          }

          .pos-search-box input {
            width: 100%;
            height: 42px;
            padding: 0 38px;
            border: 1px solid #dfe7e7;
            border-radius: 8px;
            background: #ffffff;
            color: #344054;
            font-size: 11px;
            outline: none;
          }

          .pos-search-box input:focus {
            border-color: #159f9f;
            box-shadow: 0 0 0 2px rgba(21,159,159,.08);
          }

          .pos-clear-search {
            position: absolute !important;
            right: 8px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
            width: 25px !important;
            min-width: 25px !important;
            height: 25px !important;
            padding: 0 !important;
            border: 0 !important;
            background: transparent !important;
            color: #98a2b3 !important;
            display: flex !important;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 9px !important;
          }

          .pos-category {
            width: 100%;
            height: 42px;
            padding: 0 12px;
            border: 1px solid #dfe7e7;
            border-radius: 8px;
            background: #ffffff;
            color: #475467;
            font-size: 11px;
            outline: none;
            cursor: pointer;
          }

          .pos-category:focus {
            border-color: #159f9f;
          }

          /* =========================================
             PRODUCT GRID
          ========================================= */

          .pos-products-grid {
            width: 100%;
            min-width: 0;
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 10px;
          }

          .pos-product-card {
            min-width: 0;
            overflow: hidden;
            border: 1px solid #e1e8e7;
            border-radius: 9px;
            background: #ffffff;
            cursor: pointer;
            transition:
              border-color .15s ease,
              box-shadow .15s ease,
              transform .15s ease;
          }

          .pos-product-card:hover {
            transform: translateY(-1px);
            border-color: #9ed4d0;
            box-shadow: 0 5px 16px rgba(16,24,40,.06);
          }

          .pos-product-card.out {
            opacity: .5;
            cursor: not-allowed;
          }

          .pos-product-card.out:hover {
            transform: none;
            box-shadow: none;
          }

          .pos-product-image {
            height: 105px;
            margin: 7px;
            overflow: hidden;
            border-radius: 7px;
            background: #f8faf9;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .pos-product-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .pos-product-image svg {
            color: #9baead;
            font-size: 24px;
          }

          .pos-product-content {
            padding: 5px 10px 10px;
          }

          .pos-product-name {
            overflow: hidden;
            margin: 0;
            color: #344054;
            font-size: 11px;
            font-weight: 700;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .pos-product-category-name {
            margin-top: 4px;
            color: #98a2b3;
            font-size: 9px;
          }

          .pos-product-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            margin-top: 8px;
          }

          .pos-product-price {
            color: #344054;
            font-size: 13px;
            font-weight: 700;
          }

          .pos-stock-badge {
            padding: 3px 6px;
            border-radius: 12px;
            background: #f0f7f6;
            color: #667085;
            font-size: 8px;
            font-weight: 600;
            white-space: nowrap;
          }

          .pos-stock-badge.low {
            background: #fff5eb;
            color: #b76a16;
          }

          .pos-stock-badge.empty {
            background: #fff0ef;
            color: #d92d20;
          }

          .pos-no-products {
            grid-column: 1 / -1;
            padding: 70px 20px;
            border: 1px dashed #dce6e5;
            border-radius: 9px;
            background: #ffffff;
            color: #98a2b3;
            text-align: center;
            font-size: 11px;
          }

          /* =========================================
             CART
          ========================================= */

          .pos-cart-panel {
            min-width: 0;
            height: 100%;
            display: flex;
            flex-direction: column;
            background: #ffffff;
            border-left: 1px solid #e4ebea;
            overflow: hidden;
          }

          .pos-cart-header {
            height: 58px;
            flex: 0 0 58px;
            padding: 0 15px;
            display: flex;
            align-items: center;
            border-bottom: 1px solid #edf1f1;
          }

          .pos-cart-heading {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .pos-cart-heading svg {
            color: #159f9f;
            font-size: 15px;
          }

          .pos-cart-heading strong {
            display: block;
            color: #344054;
            font-size: 12px;
          }

          .pos-cart-heading small {
            display: block;
            margin-top: 1px;
            color: #98a2b3;
            font-size: 8px;
          }

          .pos-owner-box {
            padding: 12px 14px;
            border-bottom: 1px solid #edf1f1;
          }

          .pos-owner-label-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 6px;
          }

          .pos-owner-label-row label {
            color: #98a2b3;
            font-size: 8px;
            font-weight: 700;
            text-transform: uppercase;
          }

          .pos-owner-add {
            width: 26px !important;
            min-width: 26px !important;
            height: 26px !important;
            padding: 0 !important;
            border: 1px solid #dfe7e7 !important;
            border-radius: 6px !important;
            background: #ffffff !important;
            color: #159f9f !important;
            display: flex !important;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 9px !important;
          }

          .pos-owner-select {
            width: 100%;
            height: 36px;
            padding: 0 10px;
            border: 1px solid #dfe7e7;
            border-radius: 6px;
            background: #ffffff;
            color: #475467;
            outline: none;
            font-size: 10px;
          }

          .pos-owner-select:focus {
            border-color: #159f9f;
          }

          .pos-cart-items {
            flex: 1;
            min-height: 0;
            overflow-y: auto;
            padding: 8px 12px;
          }

          .pos-empty-cart {
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #98a2b3;
            text-align: center;
          }

          .pos-empty-cart svg {
            margin-bottom: 10px;
            color: #b7ccca;
            font-size: 28px;
          }

          .pos-empty-cart strong {
            color: #667085;
            font-size: 11px;
          }

          .pos-empty-cart p {
            max-width: 180px;
            margin: 5px 0 0;
            font-size: 9px;
            line-height: 1.5;
          }

          .pos-cart-item {
            margin-bottom: 7px;
            padding: 9px;
            border: 1px solid #e6eceb;
            border-radius: 8px;
            background: #ffffff;
          }

          .pos-cart-item-name {
            margin-bottom: 7px;
            color: #344054;
            font-size: 10px;
            font-weight: 700;
          }

          .pos-cart-item-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
          }

          .pos-cart-price {
            color: #667085;
            font-size: 9px;
          }

          .pos-cart-controls {
            display: flex;
            align-items: center;
            gap: 5px;
          }

          .pos-quantity-button,
          .pos-delete-button {
            width: 23px !important;
            min-width: 23px !important;
            height: 23px !important;
            padding: 0 !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 7px !important;
          }

          .pos-quantity-button {
            border: 1px solid #dfe7e7 !important;
            background: #ffffff !important;
            color: #667085 !important;
          }

          .pos-quantity-button:hover {
            border-color: #159f9f !important;
            color: #159f9f !important;
          }

          .pos-delete-button {
            margin-left: 3px;
            border: 0 !important;
            background: #fff2f1 !important;
            color: #d92d20 !important;
          }

          .pos-cart-quantity {
            min-width: 18px;
            color: #344054;
            text-align: center;
            font-size: 10px;
            font-weight: 700;
          }

          .pos-cart-footer {
            flex: 0 0 auto;
            padding: 13px 14px;
            border-top: 1px solid #e8eeee;
            background: #ffffff;
          }

          .pos-summary-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 7px;
            color: #667085;
            font-size: 9px;
          }

          .pos-summary-row.total {
            margin-top: 10px;
            margin-bottom: 12px;
            padding-top: 10px;
            border-top: 1px solid #edf1f1;
            color: #344054;
            font-size: 12px;
            font-weight: 700;
          }

          .pos-summary-row.total strong {
            color: #159f9f;
            font-size: 18px;
          }

          .pos-checkout-btn {
            width: 100% !important;
            padding: 9px 12px !important;
            border: 1px solid #159f9f !important;
            border-radius: 6px !important;
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
            margin-top: 6px;
            padding: 8px 12px !important;
            border: 1px solid #dfe7e7 !important;
            border-radius: 6px !important;
            background: #ffffff !important;
            color: #667085 !important;
            cursor: pointer;
            font-size: 9px !important;
            font-weight: 600;
          }

          /* =========================================
             CHECKOUT
          ========================================= */

          .pos-modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 99999;
            padding: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(25,38,42,.52);
            backdrop-filter: blur(2px);
          }

          .pos-checkout-modal {
            width: min(920px, 96vw);
            max-height: 92vh;
            overflow: auto;
            border-radius: 12px;
            background: #ffffff;
            box-shadow: 0 24px 70px rgba(16,24,40,.22);
          }

          .pos-checkout-header {
            padding: 16px 20px;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            background: #159f9f;
            color: #ffffff;
          }

          .pos-checkout-header h2 {
            margin: 0;
            color: #ffffff;
            font-size: 17px;
          }

          .pos-checkout-header p {
            margin: 4px 0 0;
            color: rgba(255,255,255,.85);
            font-size: 10px;
          }

          .pos-checkout-close {
            width: 28px !important;
            min-width: 28px !important;
            height: 28px !important;
            padding: 0 !important;
            border: 0 !important;
            background: transparent !important;
            color: #ffffff !important;
            display: flex !important;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }

          .pos-checkout-branch {
            padding: 12px 16px;
            border-bottom: 1px solid #e8eeee;
          }

          .pos-checkout-branch label {
            display: block;
            margin-bottom: 5px;
            color: #475467;
            font-size: 9px;
            font-weight: 700;
          }

          .pos-checkout-branch select {
            width: 100%;
            height: 34px;
            padding: 0 10px;
            border: 1px solid #dfe7e7;
            border-radius: 6px;
            background: #ffffff;
            color: #475467;
            outline: none;
            font-size: 10px;
          }

          .pos-checkout-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .pos-checkout-column {
            min-width: 0;
          }

          .pos-checkout-column:first-child {
            border-right: 1px solid #e8eeee;
          }

          .pos-checkout-section-title {
            height: 42px;
            padding: 0 17px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #edf1f1;
            color: #344054;
            font-size: 11px;
            font-weight: 700;
          }

          .pos-checkout-section-title span:first-child {
            display: flex;
            align-items: center;
            gap: 7px;
          }

          .pos-checkout-section-title svg {
            color: #159f9f;
          }

          .pos-checkout-count {
            color: #98a2b3;
            font-size: 9px;
            font-weight: 500;
          }

          .pos-checkout-cart-body {
            padding: 14px 17px;
          }

          .pos-checkout-line {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 8px 0;
            border-bottom: 1px solid #f0f3f3;
          }

          .pos-checkout-line:last-child {
            border-bottom: 0;
          }

          .pos-checkout-line-name {
            color: #344054;
            font-size: 10px;
            font-weight: 700;
          }

          .pos-checkout-line-info {
            margin-top: 3px;
            color: #98a2b3;
            font-size: 8px;
          }

          .pos-checkout-line-total {
            color: #344054;
            font-size: 10px;
            font-weight: 700;
          }

          .pos-checkout-summary {
            margin-top: 9px;
            padding-top: 10px;
            border-top: 1px solid #e8eeee;
          }

          .pos-checkout-summary-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 9px;
            color: #667085;
            font-size: 10px;
          }

          .pos-discount-input {
            width: 100px;
            height: 30px;
            padding: 0 9px;
            border: 1px solid #dfe7e7;
            border-radius: 6px;
            outline: none;
            text-align: right;
            font-size: 10px;
          }

          .pos-discount-input:focus {
            border-color: #159f9f;
          }

          .pos-amount-due {
            margin-top: 12px;
            padding: 12px;
            border-radius: 7px;
            background: #eff9f8;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .pos-amount-due-label {
            color: #667085;
            font-size: 8px;
            font-weight: 700;
            text-transform: uppercase;
          }

          .pos-amount-due strong {
            color: #159f9f;
            font-size: 20px;
          }

          .pos-payment-body {
            padding: 15px 17px;
          }

          .pos-payment-field label {
            display: block;
            margin-bottom: 6px;
            color: #475467;
            font-size: 9px;
            font-weight: 700;
          }

          .pos-payment-field input {
            width: 100%;
            height: 40px;
            padding: 0 11px;
            border: 1px solid #dfe7e7;
            border-radius: 7px;
            outline: none;
            color: #344054;
            font-size: 12px;
            font-weight: 600;
          }

          .pos-payment-field input:focus {
            border-color: #159f9f;
            box-shadow: 0 0 0 2px rgba(21,159,159,.09);
          }

          .pos-payment-cards {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 13px;
          }

          .pos-payment-card {
            min-height: 93px;
            padding: 12px;
            border: 1px solid #e0e8e7;
            border-radius: 8px;
            background: #fafcfc;
          }

          .pos-payment-card span {
            display: block;
            margin-bottom: 7px;
            color: #98a2b3;
            font-size: 8px;
            font-weight: 700;
            text-transform: uppercase;
          }

          .pos-payment-card strong {
            display: block;
            color: #344054;
            font-size: 19px;
          }

          .pos-payment-card small {
            display: block;
            margin-top: 4px;
            color: #98a2b3;
            font-size: 8px;
          }

          .pos-payment-help {
            margin-top: 13px;
            color: #98a2b3;
            font-size: 8px;
          }

          .pos-payment-error {
            margin-top: 10px;
            padding: 8px 10px;
            border-radius: 6px;
            background: #fff2f1;
            color: #d92d20;
            font-size: 8px;
          }

          .pos-checkout-footer {
            padding: 12px 16px;
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            border-top: 1px solid #e8eeee;
            background: #fafcfc;
          }

          .pos-checkout-cancel {
            width: auto !important;
            padding: 8px 14px !important;
            border: 1px solid #dfe7e7 !important;
            border-radius: 6px !important;
            background: #ffffff !important;
            color: #667085 !important;
            cursor: pointer;
            font-size: 9px !important;
            font-weight: 600;
          }

          .pos-checkout-finish {
            width: auto !important;
            padding: 8px 14px !important;
            border: 1px solid #159f9f !important;
            border-radius: 6px !important;
            background: #159f9f !important;
            color: #ffffff !important;
            display: flex !important;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            font-size: 9px !important;
            font-weight: 700;
          }

          .pos-checkout-finish:disabled {
            opacity: .45;
            cursor: not-allowed;
          }

          /* =========================================
             SUCCESS
          ========================================= */

          .pos-success-modal {
            width: min(380px, 94vw);
            padding: 26px;
            border-radius: 12px;
            background: #ffffff;
            text-align: center;
            box-shadow: 0 24px 70px rgba(16,24,40,.22);
          }

          .pos-success-icon {
            width: 55px;
            height: 55px;
            margin: 0 auto 12px;
            border-radius: 50%;
            background: #e9f8f6;
            color: #159f9f;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 26px;
          }

          .pos-success-modal h3 {
            margin: 0;
            color: #344054;
            font-size: 18px;
          }

          .pos-success-modal > p {
            margin: 6px 0 18px;
            color: #98a2b3;
            font-size: 10px;
          }

          .pos-success-details {
            padding: 12px;
            border-radius: 8px;
            background: #f8faf9;
            text-align: left;
          }

          .pos-success-row {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            padding: 6px 0;
            color: #667085;
            font-size: 10px;
          }

          .pos-success-row.total {
            margin-top: 5px;
            padding-top: 10px;
            border-top: 1px solid #e3eae9;
            color: #344054;
            font-weight: 700;
          }

          .pos-success-row.total strong {
            color: #159f9f;
          }

          .pos-new-sale {
            width: 100% !important;
            margin-top: 15px;
            padding: 9px 12px !important;
            border: 0 !important;
            border-radius: 6px !important;
            background: #159f9f !important;
            color: #ffffff !important;
            cursor: pointer;
            font-size: 10px !important;
            font-weight: 700;
          }

          /* =========================================
             RESPONSIVE
          ========================================= */

          @media (max-width: 1150px) {
            .pos-products-grid {
              grid-template-columns: repeat(3, minmax(0,1fr));
            }

            .pos-workspace {
              grid-template-columns: minmax(0,1fr) 310px;
            }
          }

          @media (max-width: 900px) {
            .pos-workspace {
              grid-template-columns: 1fr;
              overflow-y: auto;
            }

            .pos-main {
              overflow-y: auto;
            }

            .pos-products-area {
              overflow: visible;
            }

            .pos-cart-panel {
              height: auto;
              min-height: 450px;
              border-left: 0;
              border-top: 1px solid #e4ebea;
            }

            .pos-products-grid {
              grid-template-columns: repeat(2,minmax(0,1fr));
            }

            .pos-checkout-content {
              grid-template-columns: 1fr;
            }

            .pos-checkout-column:first-child {
              border-right: 0;
              border-bottom: 1px solid #e8eeee;
            }
          }

          @media (max-width: 600px) {
            .pos-dashboard-layout > .sidebar {
              width: 0 !important;
              min-width: 0 !important;
              flex-basis: 0 !important;
            }

            .pos-topbar {
              padding: 0 12px;
            }

            .pos-staff-info,
            .pos-account-arrow {
              display: none;
            }

            .pos-products-area {
              padding: 12px;
            }

            .pos-toolbar {
              grid-template-columns: 1fr;
            }

            .pos-products-grid {
              grid-template-columns: 1fr;
            }

            .pos-payment-cards {
              grid-template-columns: 1fr;
            }

            .pos-modal-overlay {
              padding: 10px;
            }
          }
        `}</style>

        {/* TOP BAR */}
        <header className="pos-topbar">
          <h1 className="pos-page-title">POS</h1>

          <div className="pos-account-wrapper">
            <button
              type="button"
              className="pos-account-button"
              onClick={() => setAccountOpen((current) => !current)}
            >
              <div className="pos-staff-avatar">VC</div>

              <div className="pos-staff-info">
                <div className="pos-staff-name">Clinic Staff</div>

                <div className="pos-staff-role">Staff</div>
              </div>

              <FaChevronDown className="pos-account-arrow" />
            </button>

            {accountOpen && (
              <div className="pos-account-menu">
                <div className="pos-account-menu-header">
                  <strong>Clinic Staff</strong>
                  <span>Vet Clinic Account</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen(false);
                    navigate("/settings");
                  }}
                >
                  <FaUser />
                  Account Profile
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen(false);
                    navigate("/settings");
                  }}
                >
                  <FaCog />
                  Settings
                </button>

                <button type="button" className="logout" onClick={handleLogout}>
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="pos-workspace">
          {/* PRODUCTS */}
          <section className="pos-products-area">
            <div className="pos-toolbar">
              <div className="pos-search-box">
                <FaSearch />

                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                {search && (
                  <button
                    type="button"
                    className="pos-clear-search"
                    onClick={() => setSearch("")}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>

              <select
                className="pos-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="pos-products-grid">
              {filteredProducts.length === 0 ? (
                <div className="pos-no-products">No products found.</div>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`pos-product-card ${
                      product.stock === 0 ? "out" : ""
                    }`}
                    onClick={() => addToCart(product)}
                  >
                    <div className="pos-product-image">
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <FaBoxOpen />
                      )}
                    </div>

                    <div className="pos-product-content">
                      <h3 className="pos-product-name">{product.name}</h3>

                      <div className="pos-product-category-name">
                        {product.category}
                      </div>

                      <div className="pos-product-footer">
                        <span className="pos-product-price">
                          ${product.price.toFixed(2)}
                        </span>

                        <span
                          className={`pos-stock-badge ${
                            product.stock === 0
                              ? "empty"
                              : product.stock <= 5
                              ? "low"
                              : ""
                          }`}
                        >
                          {product.stock === 0
                            ? "Out of stock"
                            : `${product.stock} in stock`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
          {/* CART */}
          <aside className="pos-cart-panel">
            <div className="pos-cart-header">
              <div className="pos-cart-heading">
                <FaShoppingCart />

                <div>
                  <strong>Cart</strong>
                  <small>
                    {totalItems} {totalItems === 1 ? "item" : "items"}
                  </small>
                </div>
              </div>
            </div>

            {/* OWNER */}
            <div className="pos-owner-box">
              <div className="pos-owner-label-row">
                <label>Owner</label>

                <button
                  type="button"
                  className="pos-owner-add"
                  title="Add owner"
                  onClick={() => navigate("/owners")}
                >
                  <FaUserPlus />
                </button>
              </div>

              <select
                className="pos-owner-select"
                value={selectedOwner}
                onChange={(e) => setSelectedOwner(e.target.value)}
              >
                <option value="">Select owner</option>

                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name}
                  </option>
                ))}
              </select>
            </div>

            {/* CART ITEMS */}
            <div className="pos-cart-items">
              {cart.length === 0 ? (
                <div className="pos-empty-cart">
                  <FaShoppingCart />

                  <strong>Cart is empty</strong>

                  <p>Click a product card to add it to the current sale.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div className="pos-cart-item" key={item.id}>
                    <div className="pos-cart-item-name">{item.name}</div>

                    <div className="pos-cart-item-row">
                      <span className="pos-cart-price">
                        ${item.price.toFixed(2)} × {item.quantity}
                      </span>

                      <div className="pos-cart-controls">
                        <button
                          type="button"
                          className="pos-quantity-button"
                          onClick={() => decreaseQuantity(item.id)}
                          aria-label="Decrease quantity"
                        >
                          <FaMinus />
                        </button>

                        <span className="pos-cart-quantity">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          className="pos-quantity-button"
                          onClick={() => increaseQuantity(item.id)}
                          aria-label="Increase quantity"
                        >
                          <FaPlus />
                        </button>

                        <button
                          type="button"
                          className="pos-delete-button"
                          onClick={() => deleteItem(item.id)}
                          aria-label="Remove item"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* CART FOOTER */}
            <div className="pos-cart-footer">
              <div className="pos-summary-row">
                <span>Subtotal</span>

                <strong>${subtotal.toFixed(2)}</strong>
              </div>

              <div className="pos-summary-row total">
                <span>Total</span>

                <strong>${subtotal.toFixed(2)}</strong>
              </div>

              <button
                type="button"
                className="pos-checkout-btn"
                onClick={() => setCheckoutOpen(true)}
              >
                <FaShoppingCart />
                Checkout
              </button>

              <button
                type="button"
                className="pos-clear-btn"
                disabled={cart.length === 0}
                onClick={clearCart}
              >
                Clear cart
              </button>
            </div>
          </aside>
        </div>

        {/* =========================================
            CHECKOUT MODAL
        ========================================= */}

        {checkoutOpen && (
          <div
            className="pos-modal-overlay"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setCheckoutOpen(false);
              }
            }}
          >
            <div className="pos-checkout-modal">
              {/* HEADER */}
              <div className="pos-checkout-header">
                <div>
                  <h2>Checkout</h2>

                  <p>
                    Review the cart, enter amount received, then complete the
                    sale.
                  </p>
                </div>

                <button
                  type="button"
                  className="pos-checkout-close"
                  onClick={() => setCheckoutOpen(false)}
                  aria-label="Close checkout"
                >
                  <FaTimes />
                </button>
              </div>

              {/* BRANCH */}
              <div className="pos-checkout-branch">
                <label>Branch</label>

                <select defaultValue="Main Clinic">
                  <option value="Main Clinic">Main Clinic</option>

                  <option value=""></option>
                </select>
              </div>

              {/* CONTENT */}
              <div className="pos-checkout-content">
                {/* LEFT COLUMN */}
                <div className="pos-checkout-column">
                  <div className="pos-checkout-section-title">
                    <span>
                      <FaShoppingCart />
                      Cart details
                    </span>

                    <span className="pos-checkout-count">
                      {totalItems} {totalItems === 1 ? "item" : "items"}
                    </span>
                  </div>

                  <div className="pos-checkout-cart-body">
                    {cart.map((item) => (
                      <div className="pos-checkout-line" key={item.id}>
                        <div>
                          <div className="pos-checkout-line-name">
                            {item.name}
                          </div>

                          <div className="pos-checkout-line-info">
                            ${item.price.toFixed(2)} × {item.quantity}
                          </div>
                        </div>

                        <div className="pos-checkout-line-total">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}

                    <div className="pos-checkout-summary">
                      <div className="pos-checkout-summary-row">
                        <span>Subtotal</span>

                        <strong>${subtotal.toFixed(2)}</strong>
                      </div>

                      <div className="pos-checkout-summary-row">
                        <span>Discount</span>

                        <input
                          type="number"
                          min="0"
                          max={subtotal}
                          step="0.01"
                          className="pos-discount-input"
                          value={discount}
                          onChange={(e) => setDiscount(e.target.value)}
                        />
                      </div>

                      <div className="pos-amount-due">
                        <div>
                          <div className="pos-amount-due-label">Amount due</div>
                        </div>

                        <strong>${total.toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="pos-checkout-column">
                  <div className="pos-checkout-section-title">
                    <span>
                      <FaCreditCard />
                      Payment
                    </span>
                  </div>

                  <div className="pos-payment-body">
                    <div className="pos-payment-field">
                      <label>Amount received (USD)</label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={amountReceived}
                        onChange={(e) => setAmountReceived(e.target.value)}
                        placeholder="0.00"
                        autoFocus
                      />
                    </div>

                    <div className="pos-payment-cards">
                      <div className="pos-payment-card">
                        <span>Total received</span>

                        <strong>${received.toFixed(2)}</strong>

                        <small>Customer payment</small>
                      </div>

                      <div className="pos-payment-card">
                        <span>Change due</span>

                        <strong>${change.toFixed(2)}</strong>

                        <small>Return to customer</small>
                      </div>
                    </div>

                    <div className="pos-payment-help">
                      Enter the amount received. Change due updates
                      automatically.
                    </div>

                    {amountReceived !== "" && received < total && (
                      <div className="pos-payment-error">
                        Amount received is ${(total - received).toFixed(2)} less
                        than the amount due.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="pos-checkout-footer">
                <button
                  type="button"
                  className="pos-checkout-cancel"
                  onClick={() => setCheckoutOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="pos-checkout-finish"
                  disabled={amountReceived === "" || received < total}
                  onClick={finishSale}
                >
                  <FaReceipt />
                  Continue & Print
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            SALE COMPLETE MODAL
        ========================================= */}

        {saleComplete && lastSale && (
          <div className="pos-modal-overlay">
            <div className="pos-success-modal">
              <div className="pos-success-icon">
                <FaCheckCircle />
              </div>

              <h3>Sale completed</h3>

              <p>The payment was completed successfully.</p>

              <div className="pos-success-details">
                <div className="pos-success-row">
                  <span>Owner</span>

                  <strong>{lastSale.owner}</strong>
                </div>

                <div className="pos-success-row">
                  <span>Sale ID</span>

                  <strong>{lastSale.id}</strong>
                </div>

                <div className="pos-success-row">
                  <span>Subtotal</span>

                  <strong>${lastSale.subtotal.toFixed(2)}</strong>
                </div>

                {lastSale.discount > 0 && (
                  <div className="pos-success-row">
                    <span>Discount</span>

                    <strong>
                      -$
                      {lastSale.discount.toFixed(2)}
                    </strong>
                  </div>
                )}

                <div className="pos-success-row">
                  <span>Received</span>

                  <strong>${lastSale.received.toFixed(2)}</strong>
                </div>

                <div className="pos-success-row">
                  <span>Change</span>

                  <strong>${lastSale.change.toFixed(2)}</strong>
                </div>

                <div className="pos-success-row total">
                  <span>Total</span>

                  <strong>${lastSale.total.toFixed(2)}</strong>
                </div>
              </div>

              <button
                type="button"
                className="pos-new-sale"
                onClick={() => {
                  setSaleComplete(false);
                  setLastSale(null);
                }}
              >
                New Sale
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default POS;
