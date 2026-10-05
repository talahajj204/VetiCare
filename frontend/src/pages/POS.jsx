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
  const [amountReceivedLbp, setAmountReceivedLbp] = useState("");
  const [discount, setDiscount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [hasDelivery, setHasDelivery] = useState(false);

  const [saleComplete, setSaleComplete] = useState(false);
  const [lastSale, setLastSale] = useState(null);

  const [accountOpen, setAccountOpen] = useState(false);

  const USD_TO_LBP = 89500;

  const categories = useMemo(() => {
    return [
      "All categories",
      ...Array.from(
        new Set(products.map((product) => product.category))
      ),
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
        category === "All categories" ||
        product.category === category;

      return searchMatch && categoryMatch;
    });
  }, [products, search, category]);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const discountNumber = Math.min(
    Math.max(Number(discount) || 0, 0),
    subtotal
  );

  const total = Math.max(subtotal - discountNumber, 0);

  const received = Number(amountReceived) || 0;
  const receivedLbp = Number(amountReceivedLbp) || 0;

  const totalPaid =
    received + receivedLbp / USD_TO_LBP;

  const change = Math.max(totalPaid - total, 0);

  const totalLbp = total * USD_TO_LBP;

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const addToCart = (product) => {
    if (product.stock <= 0) return;

    const existing = cart.find(
      (item) => item.id === product.id
    );

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

        const product = products.find(
          (productItem) => productItem.id === id
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
    setCart((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  const clearCart = () => {
    setCart([]);
    setSelectedOwner("");
    setDiscount("0");
    setAmountReceived("");
    setAmountReceivedLbp("");
    setHasDelivery(false);
  };

  const openCheckout = () => {
    if (cart.length === 0) return;

    setDiscount("0");
    setAmountReceived("");
    setAmountReceivedLbp("");
    setPaymentMethod("Cash");
    setCheckoutOpen(true);
  };

  const handleExactPayment = () => {
    setAmountReceived(total.toFixed(2));
    setAmountReceivedLbp("");
  };

  const addQuickUsd = (amount) => {
    setAmountReceived((current) =>
      ((Number(current) || 0) + amount).toFixed(2)
    );
  };

  const addQuickLbp = (amount) => {
    setAmountReceivedLbp((current) =>
      String((Number(current) || 0) + amount)
    );
  };

  const handleRecall = () => {
    alert("Recall selected");
  };

  const handleRefund = () => {
    alert("Refund selected");
  };

  const finishSale = () => {
    if (totalPaid < total) {
      alert(
        "Amount received is less than the amount due."
      );
      return;
    }

    const owner = owners.find(
      (ownerItem) =>
        String(ownerItem.id) ===
        String(selectedOwner)
    );

    const sale = {
      id: `POS-${Date.now()}`,
      owner: owner?.name || "Unknown Owner",
      items: [...cart],
      subtotal,
      discount: discountNumber,
      total,
      received: totalPaid,
      change,
      paymentMethod,
      hasDelivery,
      date: new Date(),
    };

    setProducts((current) =>
      current.map((product) => {
        const soldProduct = cart.find(
          (item) => item.id === product.id
        );

        if (!soldProduct) return product;

        return {
          ...product,
          stock: Math.max(
            product.stock - soldProduct.quantity,
            0
          ),
        };
      })
    );

    setLastSale(sale);
    setCheckoutOpen(false);
    setSaleComplete(true);

    setCart([]);
    setSelectedOwner("");
    setAmountReceived("");
    setAmountReceivedLbp("");
    setDiscount("0");
    setHasDelivery(false);
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
            flex: 1;
            min-width: 0;
            height: 100vh;
            overflow: hidden;
            background: #f8fafb;
          }

          .pos-main * {
            box-sizing: border-box;
          }

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

          .pos-products-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 10px;
          }

          .pos-product-card {
            min-width: 0;
            min-height: 154px;
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

          .pos-product-image {
            height: 55px;
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
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .pos-product-name {
            margin-top: 8px;
            color: #344054;
            font-size: 10px;
            font-weight: 700;
            line-height: 1.3;
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

          /* NEW BOTTOM 3 BUTTONS */

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

          .pos-modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 9999;
            padding: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(16, 24, 40, .42);
          }

          /* NEW CHECKOUT */

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
          .pos-financial-value {
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

          .pos-financial-field input {
            background: #ffffff;
            outline: none;
          }

          .pos-financial-field input:focus {
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
          }

          .pos-reference-amount-due span {
            color: #667085;
            font-size: 8px;
            font-weight: 700;
          }

          .pos-reference-amount-due > div:last-child {
            text-align: right;
          }

          .pos-reference-amount-due strong {
            display: block;
            color: #159f9f;
            font-size: 20px;
          }

          .pos-reference-amount-due small {
            display: block;
            margin-top: 2px;
            color: #667085;
            font-size: 8px;
          }

          .pos-payment-method-row {
            display: flex;
            gap: 7px;
          }

          .pos-payment-method-row select {
            flex: 1;
            height: 38px;
            padding: 0 10px;
            border: 1px solid #dfe7e7;
            border-radius: 7px;
            background: #ffffff;
            color: #475467;
            outline: none;
            font-size: 10px;
          }

          .pos-payment-method-row button {
            width: 38px !important;
            min-width: 38px !important;
            height: 38px !important;
            padding: 0 !important;
            border: 1px solid #b8dfdc !important;
            border-radius: 7px !important;
            background: #eff9f8 !important;
            color: #159f9f !important;
          }

          .pos-received-title {
            margin-top: 14px;
          }

          .pos-received-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .pos-reference-field input {
            width: 100%;
            height: 43px;
            padding: 0 11px;
            border: 1px solid #dfe7e7;
            border-radius: 7px;
            background: #ffffff;
            color: #344054;
            outline: none;
            font-size: 14px;
            font-weight: 700;
          }

          .pos-reference-field input:focus {
            border-color: #159f9f;
            box-shadow: 0 0 0 2px rgba(21,159,159,.08);
          }

          .pos-exchange-rate {
            margin-top: 6px;
            color: #98a2b3;
            font-size: 8px;
          }

          .pos-quick-payments {
            margin-top: 11px;
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }

          .pos-quick-payments button {
            min-width: auto !important;
            padding: 7px 10px !important;
            border: 1px solid #dce6e5 !important;
            border-radius: 18px !important;
            background: #ffffff !important;
            color: #475467 !important;
            cursor: pointer;
            font-size: 9px !important;
            font-weight: 700;
          }

          .pos-quick-payments button:hover {
            border-color: #159f9f !important;
            background: #eff9f8 !important;
            color: #159f9f !important;
          }

          .pos-reference-payment-summary {
            margin-top: 16px;
            padding: 12px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            border-radius: 8px;
            background: #f7f9f9;
          }

          .pos-reference-payment-summary > div {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .pos-reference-payment-summary span {
            color: #667085;
            font-size: 8px;
          }

          .pos-reference-payment-summary strong {
            color: #344054;
            font-size: 14px;
          }

          .pos-payment-error {
            margin-top: 9px;
            padding: 8px 10px;
            border-radius: 6px;
            background: #fff2f1;
            color: #d92d20;
            font-size: 9px;
          }

          .pos-reference-checkout-footer {
            min-height: 66px;
            padding: 10px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-top: 1px solid #e7ecec;
          }

          .pos-reference-cancel {
            padding: 9px 15px !important;
            border: 1px solid #dfe7e7 !important;
            border-radius: 7px !important;
            background: #ffffff !important;
            color: #475467 !important;
            cursor: pointer;
            font-size: 10px !important;
            font-weight: 700;
          }

          .pos-reference-complete {
            padding: 10px 17px !important;
            border: 1px solid #159f9f !important;
            border-radius: 7px !important;
            background: #159f9f !important;
            color: #ffffff !important;
            display: flex !important;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            font-size: 10px !important;
            font-weight: 700;
          }

          .pos-reference-complete:disabled {
            opacity: .45;
            cursor: not-allowed;
          }

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
            font-size: 16px;
          }

          .pos-success-modal > p {
            margin: 6px 0 16px;
            color: #98a2b3;
            font-size: 10px;
          }

          .pos-success-details {
            padding: 10px 12px;
            border-radius: 8px;
            background: #f7f9f9;
          }

          .pos-success-row {
            padding: 6px 0;
            display: flex;
            justify-content: space-between;
            color: #667085;
            font-size: 9px;
          }

          .pos-success-row strong {
            color: #344054;
          }

          .pos-success-close {
            width: 100% !important;
            height: 37px !important;
            margin-top: 14px;
            border: 0 !important;
            border-radius: 7px !important;
            background: #159f9f !important;
            color: #ffffff !important;
            cursor: pointer;
            font-size: 10px !important;
            font-weight: 700;
          }

          @media (max-width: 1100px) {
            .pos-products-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }
          }

          @media (max-width: 850px) {
            .pos-content {
              grid-template-columns: 1fr;
              overflow-y: auto;
            }

            .pos-cart-panel {
              min-height: 500px;
              border-left: 0;
              border-top: 1px solid #e3eae9;
            }

            .pos-main {
              overflow-y: auto;
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

        {/* HEADER - SAME HEADER */}

        <header className="pos-topbar">
          <h1 className="pos-page-title">POS</h1>

          <div className="pos-account-wrapper">
            <button
              type="button"
              className="pos-account-button"
              onClick={() =>
                setAccountOpen((current) => !current)
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
                  Staff account
                </div>
              </div>

              <FaChevronDown className="pos-account-arrow" />
            </button>

            {accountOpen && (
              <div className="pos-account-menu">
                <div className="pos-account-menu-header">
                  <div className="pos-staff-name">
                    Clinic Staff
                  </div>

                  <div className="pos-staff-role">
                    staff@vetclinic.com
                  </div>
                </div>

                <button type="button">
                  <FaUser />
                  My account
                </button>

                <button type="button">
                  <FaCog />
                  Account settings
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

          {/* PRODUCTS */}

          <section className="pos-products-section">
            <div className="pos-tools">
              <div className="pos-search-box">
                <FaSearch />

                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />
              </div>

              <select
                className="pos-category-select"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="pos-products-grid">
              {filteredProducts.map((product) => (
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
                        ${product.price.toFixed(2)}
                      </div>

                      <div className="pos-product-stock">
                        Stock: {product.stock}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="pos-add-button"
                      disabled={product.stock <= 0}
                      onClick={() =>
                        addToCart(product)
                      }
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CART */}

          <aside className="pos-cart-panel">
            <div className="pos-cart-header">
              <h2>Cart</h2>

              <select
                className="pos-owner-select"
                value={selectedOwner}
                onChange={(e) =>
                  setSelectedOwner(e.target.value)
                }
              >
                <option value="">
                  Select owner
                </option>

                {owners.map((owner) => (
                  <option
                    key={owner.id}
                    value={owner.id}
                  >
                    {owner.name} — {owner.phone}
                  </option>
                ))}
              </select>
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
                    Tap a product to add it.
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
                      <span className="pos-cart-price">
                        ${item.price.toFixed(2)} ×{" "}
                        {item.quantity}
                      </span>

                      <div className="pos-cart-controls">
                        <button
                          type="button"
                          className="pos-quantity-button"
                          onClick={() =>
                            decreaseQuantity(item.id)
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
                            increaseQuantity(item.id)
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

            {/* CART FOOTER */}

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
                disabled={cart.length === 0}
                onClick={openCheckout}
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

              {/* NEW 3 BUTTONS */}

              <div className="pos-bottom-actions">
                <button
                  type="button"
                  className={`pos-bottom-action ${
                    hasDelivery ? "active" : ""
                  }`}
                  onClick={() =>
                    setHasDelivery(
                      (current) => !current
                    )
                  }
                >
                  <span className="pos-bottom-action-emoji">
                    🚚
                  </span>
                  <span>Delivery</span>
                </button>

                <button
                  type="button"
                  className="pos-bottom-action"
                  onClick={handleRecall}
                >
                  <span className="pos-bottom-action-emoji">
                    ↩️
                  </span>
                  <span>Recall</span>
                </button>

                <button
                  type="button"
                  className="pos-bottom-action"
                  onClick={handleRefund}
                >
                  <span className="pos-bottom-action-emoji">
                    ↪️
                  </span>
                  <span>Refund</span>
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* CHECKOUT */}

        {checkoutOpen && (
          <div
            className="pos-modal-overlay"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setCheckoutOpen(false);
              }
            }}
          >
            <div className="pos-checkout-reference">

              {/* HEADER */}

              <div className="pos-reference-checkout-header">
                <div>
                  <h2>Checkout</h2>

                  <p>
                    {hasDelivery
                      ? "Delivery"
                      : "Walk-in"}
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

              {/* CONTENT */}

              <div className="pos-reference-checkout-body">

                {/* FINANCIAL SUMMARY */}

                <section className="pos-financial-panel">
                  <h3>Financial summary</h3>

                  <div className="pos-financial-grid">
                    <div className="pos-financial-field">
                      <label>SUBTOTAL</label>

                      <div className="pos-financial-value">
                        ${subtotal.toFixed(2)}
                      </div>
                    </div>

                    <div className="pos-financial-field">
                      <label>DISCOUNT</label>

                      <input
                        type="number"
                        min="0"
                        max={subtotal}
                        step="0.01"
                        value={discount}
                        onChange={(e) =>
                          setDiscount(e.target.value)
                        }
                      />
                    </div>

                    <div className="pos-financial-field">
                      <label>
                        DISCOUNT AMOUNT
                      </label>

                      <div className="pos-financial-value">
                        $
                        {discountNumber.toFixed(
                          2
                        )}
                      </div>
                    </div>

                    <div className="pos-financial-field">
                      <label>DELIVERY FEE</label>

                      <div className="pos-financial-value">
                        $0.00
                      </div>
                    </div>
                  </div>

                  <div className="pos-reference-total-box">
                    <span>TOTAL AMOUNT</span>

                    <strong>
                      ${total.toFixed(2)}
                    </strong>
                  </div>

                  <label className="pos-delivery-checkbox">
                    <input
                      type="checkbox"
                      checked={hasDelivery}
                      onChange={(e) =>
                        setHasDelivery(
                          e.target.checked
                        )
                      }
                    />

                    <span>Has delivery</span>
                  </label>

                  <div className="pos-checkout-items-mini">
                    {cart.map((item) => (
                      <div
                        className="pos-checkout-mini-item"
                        key={item.id}
                      >
                        <div>
                          <strong>
                            {item.name}
                          </strong>

                          <span>
                            $
                            {item.price.toFixed(
                              2
                            )}{" "}
                            × {item.quantity}
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
                </section>

                {/* PAYMENT */}

                <section className="pos-reference-payment">
                  <h3>Payment</h3>

                  <div className="pos-reference-amount-due">
                    <div>
                      <span>AMOUNT DUE</span>
                    </div>

                    <div>
                      <strong>
                        ${total.toFixed(2)}
                      </strong>

                      <small>
                        {totalLbp.toLocaleString()}{" "}
                        LBP
                      </small>
                    </div>
                  </div>

                  <div className="pos-reference-field">
                    <label>METHOD</label>

                    <div className="pos-payment-method-row">
                      <select
                        value={paymentMethod}
                        onChange={(e) =>
                          setPaymentMethod(
                            e.target.value
                          )
                        }
                      >
                        <option value="Cash">
                          Cash
                        </option>

                        <option value="Card">
                          Card
                        </option>

                        <option value="Mixed">
                          Mixed
                        </option>
                      </select>

                      <button type="button">
                        <FaPlus />
                      </button>
                    </div>
                  </div>

                  <div className="pos-received-title">
                    AMOUNT RECEIVED
                  </div>

                  <div className="pos-received-grid">
                    <div className="pos-reference-field">
                      <label>USD</label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={amountReceived}
                        onChange={(e) =>
                          setAmountReceived(
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                        autoFocus
                      />
                    </div>

                    <div className="pos-reference-field">
                      <label>LBP</label>

                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={
                          amountReceivedLbp
                        }
                        onChange={(e) =>
                          setAmountReceivedLbp(
                            e.target.value
                          )
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="pos-exchange-rate">
                    1 USD ={" "}
                    {USD_TO_LBP.toLocaleString()}{" "}
                    LBP
                  </div>

                  {/* QUICK PAYMENTS */}

                  <div className="pos-quick-payments">
                    <button
                      type="button"
                      onClick={
                        handleExactPayment
                      }
                    >
                      Exact
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        addQuickUsd(10)
                      }
                    >
                      $10
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        addQuickUsd(20)
                      }
                    >
                      $20
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        addQuickUsd(50)
                      }
                    >
                      $50
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        addQuickUsd(100)
                      }
                    >
                      $100
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        addQuickLbp(100000)
                      }
                    >
                      100,000 LBP
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        addQuickLbp(200000)
                      }
                    >
                      200,000 LBP
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        addQuickLbp(500000)
                      }
                    >
                      500,000 LBP
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        addQuickLbp(1000000)
                      }
                    >
                      1,000,000 LBP
                    </button>
                  </div>

                  <div className="pos-reference-payment-summary">
                    <div>
                      <span>Total paid</span>

                      <strong>
                        ${totalPaid.toFixed(2)}
                      </strong>
                    </div>

                    <div>
                      <span>Change due</span>

                      <strong>
                        ${change.toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  {(amountReceived !== "" ||
                    amountReceivedLbp !== "") &&
                    totalPaid < total && (
                      <div className="pos-payment-error">
                        Remaining: $
                        {(
                          total - totalPaid
                        ).toFixed(2)}
                      </div>
                    )}
                </section>
              </div>

              {/* CHECKOUT FOOTER */}

              <div className="pos-reference-checkout-footer">
                <button
                  type="button"
                  className="pos-reference-cancel"
                  onClick={() =>
                    setCheckoutOpen(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="pos-reference-complete"
                  disabled={totalPaid < total}
                  onClick={finishSale}
                >
                  <FaReceipt />
                  Continue & Print
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SALE COMPLETE */}

        {saleComplete && lastSale && (
          <div className="pos-modal-overlay">
            <div className="pos-success-modal">
              <div className="pos-success-icon">
                <FaCheckCircle />
              </div>

              <h3>Sale completed</h3>

              <p>
                The payment was completed
                successfully.
              </p>

              <div className="pos-success-details">
                <div className="pos-success-row">
                  <span>Owner</span>
                  <strong>
                    {lastSale.owner}
                  </strong>
                </div>

                <div className="pos-success-row">
                  <span>Sale ID</span>
                  <strong>
                    {lastSale.id}
                  </strong>
                </div>

                <div className="pos-success-row">
                  <span>Total</span>

                  <strong>
                    $
                    {lastSale.total.toFixed(
                      2
                    )}
                  </strong>
                </div>

                <div className="pos-success-row">
                  <span>Received</span>

                  <strong>
                    $
                    {lastSale.received.toFixed(
                      2
                    )}
                  </strong>
                </div>

                <div className="pos-success-row">
                  <span>Change</span>

                  <strong>
                    $
                    {lastSale.change.toFixed(
                      2
                    )}
                  </strong>
                </div>
              </div>

              <button
                type="button"
                className="pos-success-close"
                onClick={() => {
                  setSaleComplete(false);
                  setLastSale(null);
                }}
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