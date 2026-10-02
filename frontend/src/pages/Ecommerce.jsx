import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaSearch,
  FaShoppingCart,
  FaHeart,
  FaUser,
  FaBoxOpen,
  FaChevronDown,
  FaPaw,
  FaBone,
  FaPumpSoap,
  FaCapsules,
  FaDog,
  FaPlus,
  FaClipboardList,
  FaSignOutAlt,
  FaCog,
  FaTimes,
} from "react-icons/fa";

const PRODUCTS = [
  {
    id: 1,
    name: "Royal Canin Adult Dog",
    category: "Food",
    price: 28.5,
    stock: 14,
    image: "",
    showOnStore: true,
  },
  {
    id: 2,
    name: "Royal Canin Kitten",
    category: "Food",
    price: 24,
    stock: 8,
    image: "",
    showOnStore: true,
  },
  {
    id: 3,
    name: "Dental Care Chews",
    category: "Care",
    price: 12.5,
    stock: 21,
    image: "",
    showOnStore: true,
  },
  {
    id: 4,
    name: "Pet Shampoo",
    category: "Grooming",
    price: 9.75,
    stock: 12,
    image: "",
    showOnStore: true,
  },
  {
    id: 5,
    name: "Flea & Tick Collar",
    category: "Accessories",
    price: 18,
    stock: 7,
    image: "",
    showOnStore: true,
  },
  {
    id: 6,
    name: "Vitamin Supplement",
    category: "Supplements",
    price: 16.25,
    stock: 5,
    image: "",
    showOnStore: true,
  },
  {
    id: 7,
    name: "Cat Litter",
    category: "Hygiene",
    price: 11,
    stock: 18,
    image: "",
    showOnStore: true,
  },
  {
    id: 8,
    name: "Ear Cleaning Solution",
    category: "Care",
    price: 8.5,
    stock: 9,
    image: "",
    showOnStore: true,
  },
  {
    id: 9,
    name: "Pet Travel Bowl",
    category: "Accessories",
    price: 7.25,
    stock: 3,
    image: "",
    showOnStore: true,
  },
  {
    id: 10,
    name: "Puppy Training Pads",
    category: "Hygiene",
    price: 14,
    stock: 22,
    image: "",
    showOnStore: true,
  },
  {
    id: 11,
    name: "Dog Toy Ball",
    category: "Accessories",
    price: 6.5,
    stock: 15,
    image: "",
    showOnStore: true,
  },
  {
    id: 12,
    name: "Eye Drops",
    category: "Care",
    price: 10,
    stock: 11,
    image: "",
    showOnStore: true,
  },
];

const CATEGORY_ITEMS = [
  {
    name: "Food",
    icon: <FaBone />,
  },
  {
    name: "Care",
    icon: <FaPaw />,
  },
  {
    name: "Hygiene",
    icon: <FaPumpSoap />,
  },
  {
    name: "Accessories",
    icon: <FaDog />,
  },
  {
    name: "Supplements",
    icon: <FaCapsules />,
  },
  {
    name: "Grooming",
    icon: <FaPumpSoap />,
  },
];

function Ecommerce() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");

  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [accountOpen, setAccountOpen] = useState(false);

  const products = useMemo(
    () => PRODUCTS.filter((product) => product.showOnStore),
    []
  );

  const filteredProducts = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return products.filter((product) => {
      const matchesSearch =
        !searchValue ||
        product.name.toLowerCase().includes(searchValue) ||
        product.category.toLowerCase().includes(searchValue);

      const matchesCategory =
        category === "All categories" ||
        product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const addToCart = (product) => {
    if (product.stock <= 0) return;

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          return currentCart;
        }

        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  const toggleFavorite = (productId) => {
    setFavorites((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  };

  const openCart = () => {
    /*
      We save the current demo cart so Cart.jsx
      can read it in the next step.
    */

    localStorage.setItem(
      "vetClinicStoreCart",
      JSON.stringify(cart)
    );

    navigate("/cart");
  };

  const handleLogout = () => {
    setAccountOpen(false);
    navigate("/");
  };

  return (
    <div className="store-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        .store-page {
          min-height: 100vh;
          background: #f7faf9;
          color: #344054;
          font-family: Arial, Helvetica, sans-serif;
        }

        /* ================================
           HEADER
        ================================= */

        .store-header {
          height: 72px;
          padding: 0 5%;
          background: #ffffff;
          border-bottom: 1px solid #e6eceb;

          display: flex;
          align-items: center;
          justify-content: space-between;

          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .store-logo {
          display: flex;
          align-items: center;
          gap: 10px;

          cursor: pointer;
        }

        .store-logo-icon {
          color: #159f9f;
          font-size: 27px;
        }

        .store-logo-text {
          margin: 0;

          color: #176d6a;
          font-size: 20px;
          font-weight: 800;
        }

        .store-logo-text span {
          color: #159f9f;
        }

        .store-nav {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .store-nav button {
          padding: 0;
          border: 0;
          background: transparent;

          color: #667085;
          font-size: 13px;
          font-weight: 600;

          cursor: pointer;
        }

        .store-nav button:hover {
          color: #159f9f;
        }

        .store-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .store-icon-button {
          width: 39px;
          height: 39px;

          border: 1px solid #e1e8e7;
          border-radius: 50%;
          background: #ffffff;

          color: #667085;

          display: flex;
          align-items: center;
          justify-content: center;

          cursor: pointer;
          position: relative;
        }

        .store-icon-button:hover {
          border-color: #159f9f;
          color: #159f9f;
          background: #f4fbfa;
        }

        .store-cart-count {
          position: absolute;

          top: -5px;
          right: -4px;

          min-width: 18px;
          height: 18px;

          padding: 0 5px;

          border: 2px solid #ffffff;
          border-radius: 20px;

          background: #159f9f;
          color: #ffffff;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 9px;
          font-weight: 700;
        }

        /* ================================
           ACCOUNT
        ================================= */

        .store-account-wrapper {
          position: relative;
        }

        .store-account-button {
          height: 40px;

          padding: 0 11px;

          border: 1px solid #e1e8e7;
          border-radius: 20px;
          background: #ffffff;

          display: flex;
          align-items: center;
          gap: 8px;

          color: #475467;

          cursor: pointer;
        }

        .store-account-avatar {
          width: 27px;
          height: 27px;

          border-radius: 50%;

          background: #e4f7f5;
          color: #159f9f;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 11px;
        }

        .store-account-name {
          font-size: 11px;
          font-weight: 700;
        }

        .store-account-arrow {
          font-size: 8px;
          color: #98a2b3;
        }

        .store-account-menu {
          position: absolute;

          top: calc(100% + 8px);
          right: 0;

          width: 200px;

          padding: 7px;

          border: 1px solid #e2e9e8;
          border-radius: 10px;

          background: #ffffff;

          box-shadow: 0 12px 35px rgba(16, 24, 40, 0.12);
        }

        .store-account-menu-header {
          padding: 10px;

          border-bottom: 1px solid #edf1f1;

          margin-bottom: 5px;
        }

        .store-account-menu-header strong {
          display: block;

          font-size: 11px;
          color: #344054;
        }

        .store-account-menu-header span {
          display: block;

          margin-top: 3px;

          color: #98a2b3;
          font-size: 9px;
        }

        .store-account-menu button {
          width: 100%;

          padding: 9px 10px;

          border: 0;
          border-radius: 6px;

          background: transparent;

          color: #475467;

          display: flex;
          align-items: center;
          gap: 9px;

          text-align: left;

          font-size: 10px;

          cursor: pointer;
        }

        .store-account-menu button:hover {
          background: #f3f9f8;
          color: #159f9f;
        }

        .store-account-menu .logout {
          color: #d92d20;
        }

        /* ================================
           MAIN
        ================================= */

        .store-container {
          width: min(1400px, 92%);
          margin: 0 auto;
        }

        /* ================================
           HERO
        ================================= */

        .store-hero {
          min-height: 300px;

          margin-top: 26px;

          padding: 48px 54px;

          border: 1px solid #dcebea;
          border-radius: 20px;

          background:
            radial-gradient(
              circle at 85% 35%,
              rgba(21, 159, 159, 0.15),
              transparent 25%
            ),
            linear-gradient(
              120deg,
              #f3fbfa 0%,
              #eef8f7 50%,
              #e3f4f2 100%
            );

          display: flex;
          align-items: center;
          justify-content: space-between;

          overflow: hidden;

          position: relative;
        }

        .store-hero-content {
          width: 55%;
          position: relative;
          z-index: 2;
        }

        .store-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;

          margin-bottom: 15px;

          padding: 6px 11px;

          border-radius: 20px;

          background: #ffffff;
          color: #159f9f;

          font-size: 10px;
          font-weight: 700;
        }

        .store-hero h1 {
          margin: 0;

          max-width: 580px;

          color: #24364b;

          font-size: clamp(34px, 4vw, 55px);
          line-height: 1.03;
          letter-spacing: -2px;
        }

        .store-hero h1 span {
          color: #159f9f;
        }

        .store-hero p {
          max-width: 520px;

          margin: 18px 0 24px;

          color: #667085;

          font-size: 14px;
          line-height: 1.7;
        }

        .store-shop-now {
          padding: 11px 20px;

          border: 0;
          border-radius: 7px;

          background: #159f9f;
          color: #ffffff;

          font-size: 11px;
          font-weight: 700;

          cursor: pointer;
        }

        .store-shop-now:hover {
          background: #118887;
        }

        .store-hero-visual {
          width: 38%;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .store-hero-circle {
          width: 240px;
          height: 240px;

          border-radius: 50%;

          background: rgba(255, 255, 255, 0.75);

          display: flex;
          align-items: center;
          justify-content: center;

          position: relative;
        }

        .store-hero-paw {
          color: #159f9f;
          font-size: 95px;
          opacity: 0.75;
        }

        .store-hero-mini-paw {
          position: absolute;

          color: #92d6d1;

          font-size: 27px;
        }

        .store-hero-mini-paw.one {
          top: 30px;
          right: 22px;

          transform: rotate(20deg);
        }

        .store-hero-mini-paw.two {
          bottom: 31px;
          left: 23px;

          transform: rotate(-20deg);
        }

        /* ================================
           BENEFITS
        ================================= */

        .store-benefits {
          display: grid;
          grid-template-columns: repeat(4, 1fr);

          margin: 18px 0 0;

          border: 1px solid #e2eae9;
          border-radius: 12px;

          background: #ffffff;

          overflow: hidden;
        }

        .store-benefit {
          padding: 17px;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;

          border-right: 1px solid #edf1f1;
        }

        .store-benefit:last-child {
          border-right: 0;
        }

        .store-benefit-icon {
          width: 34px;
          height: 34px;

          border-radius: 50%;

          background: #e9f8f6;
          color: #159f9f;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 13px;
        }

        .store-benefit strong {
          display: block;

          color: #344054;
          font-size: 10px;
        }

        .store-benefit span {
          display: block;

          margin-top: 2px;

          color: #98a2b3;
          font-size: 8px;
        }

        /* ================================
           SECTIONS
        ================================= */

        .store-section {
          margin-top: 36px;
        }

        .store-section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-bottom: 16px;
        }

        .store-section-heading h2 {
          margin: 0;

          color: #344054;

          font-size: 21px;
        }

        .store-section-heading p {
          margin: 5px 0 0;

          color: #98a2b3;

          font-size: 10px;
        }

        /* ================================
           CATEGORIES
        ================================= */

        .store-categories {
          display: grid;
          grid-template-columns: repeat(6, 1fr);

          gap: 12px;
        }

        .store-category-card {
          min-height: 100px;

          padding: 15px;

          border: 1px solid #e2e9e8;
          border-radius: 12px;

          background: #ffffff;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          cursor: pointer;

          transition: 0.2s;
        }

        .store-category-card:hover,
        .store-category-card.active {
          border-color: #159f9f;

          background: #f0faf9;

          transform: translateY(-2px);
        }

        .store-category-icon {
          width: 40px;
          height: 40px;

          margin-bottom: 8px;

          border-radius: 50%;

          background: #e9f8f6;
          color: #159f9f;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 16px;
        }

        .store-category-card strong {
          color: #475467;

          font-size: 10px;
        }

        /* ================================
           SEARCH
        ================================= */

        .store-products-toolbar {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 220px;

          gap: 10px;

          margin-bottom: 16px;
        }

        .store-search {
          position: relative;
        }

        .store-search > svg {
          position: absolute;

          left: 15px;
          top: 50%;

          transform: translateY(-50%);

          color: #98a2b3;

          font-size: 12px;
        }

        .store-search input {
          width: 100%;
          height: 44px;

          padding: 0 42px;

          border: 1px solid #dfe7e7;
          border-radius: 8px;

          background: #ffffff;

          outline: none;

          color: #344054;

          font-size: 11px;
        }

        .store-search input:focus {
          border-color: #159f9f;

          box-shadow: 0 0 0 3px rgba(21, 159, 159, 0.08);
        }

        .store-search-clear {
          position: absolute;

          right: 9px;
          top: 50%;

          transform: translateY(-50%);

          width: 26px;
          height: 26px;

          border: 0;
          background: transparent;

          color: #98a2b3;

          cursor: pointer;
        }

        .store-category-select {
          width: 100%;
          height: 44px;

          padding: 0 12px;

          border: 1px solid #dfe7e7;
          border-radius: 8px;

          background: #ffffff;

          color: #475467;

          outline: none;

          font-size: 11px;

          cursor: pointer;
        }

        /* ================================
           PRODUCTS
        ================================= */

        .store-products-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));

          gap: 15px;

          padding-bottom: 50px;
        }

        .store-product-card {
          min-width: 0;

          border: 1px solid #e1e8e7;
          border-radius: 12px;

          background: #ffffff;

          overflow: hidden;

          transition: 0.2s;

          position: relative;
        }

        .store-product-card:hover {
          transform: translateY(-3px);

          border-color: #afdcd8;

          box-shadow: 0 9px 24px rgba(16, 24, 40, 0.07);
        }

        .store-favorite-button {
          position: absolute;

          top: 10px;
          right: 10px;

          z-index: 5;

          width: 31px;
          height: 31px;

          border: 1px solid #e2e9e8;
          border-radius: 50%;

          background: rgba(255, 255, 255, 0.94);

          color: #98a2b3;

          display: flex;
          align-items: center;
          justify-content: center;

          cursor: pointer;

          font-size: 11px;
        }

        .store-favorite-button.active {
          color: #d95050;

          border-color: #f0caca;

          background: #fff5f5;
        }

        .store-product-image {
          height: 190px;

          margin: 9px;

          border-radius: 9px;

          background: #f7f9f9;

          display: flex;
          align-items: center;
          justify-content: center;

          overflow: hidden;
        }

        .store-product-image img {
          width: 100%;
          height: 100%;

          object-fit: cover;
        }

        .store-product-image svg {
          color: #a5b9b7;

          font-size: 43px;
        }

        .store-product-info {
          padding: 8px 14px 14px;
        }

        .store-product-name {
          margin: 0;

          color: #344054;

          font-size: 12px;
          font-weight: 700;

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .store-product-category {
          margin-top: 5px;

          color: #98a2b3;

          font-size: 9px;
        }

        .store-product-meta {
          margin-top: 13px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 8px;
        }

        .store-product-price {
          color: #24364b;

          font-size: 15px;
          font-weight: 800;
        }

        .store-stock {
          padding: 4px 7px;

          border-radius: 20px;

          background: #edf7f6;
          color: #58716f;

          font-size: 8px;
          font-weight: 700;
        }

        .store-stock.low {
          background: #fff4e8;
          color: #b66a17;
        }

        .store-stock.out {
          background: #fff0ef;
          color: #d92d20;
        }

        .store-add-cart {
          width: 100%;

          margin-top: 12px;

          padding: 9px 12px;

          border: 1px solid #159f9f;
          border-radius: 7px;

          background: #159f9f;
          color: #ffffff;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;

          font-size: 10px;
          font-weight: 700;

          cursor: pointer;
        }

        .store-add-cart:hover {
          background: #118887;
        }

        .store-add-cart:disabled {
          border-color: #d7dfde;
          background: #d7dfde;

          cursor: not-allowed;
        }

        .store-no-products {
          grid-column: 1 / -1;

          padding: 70px 20px;

          border: 1px dashed #dce6e5;
          border-radius: 12px;

          background: #ffffff;

          text-align: center;

          color: #98a2b3;
        }

        .store-no-products svg {
          margin-bottom: 12px;

          font-size: 35px;
        }

        .store-no-products h3 {
          margin: 0 0 5px;

          color: #667085;

          font-size: 14px;
        }

        .store-no-products p {
          margin: 0;

          font-size: 10px;
        }

        /* ================================
           RESPONSIVE
        ================================= */

        @media (max-width: 1050px) {
          .store-products-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .store-categories {
            grid-template-columns: repeat(3, 1fr);
          }

          .store-nav {
            display: none;
          }
        }

        @media (max-width: 760px) {
          .store-header {
            padding: 0 16px;
          }

          .store-account-name,
          .store-account-arrow {
            display: none;
          }

          .store-account-button {
            width: 40px;
            padding: 0;

            justify-content: center;
          }

          .store-hero {
            padding: 35px 25px;
          }

          .store-hero-content {
            width: 100%;
          }

          .store-hero-visual {
            display: none;
          }

          .store-benefits {
            grid-template-columns: repeat(2, 1fr);
          }

          .store-benefit:nth-child(2) {
            border-right: 0;
          }

          .store-benefit:nth-child(-n + 2) {
            border-bottom: 1px solid #edf1f1;
          }

          .store-products-toolbar {
            grid-template-columns: 1fr;
          }

          .store-products-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 500px) {
          .store-logo-text {
            font-size: 16px;
          }

          .store-categories {
            grid-template-columns: repeat(2, 1fr);
          }

          .store-products-grid {
            grid-template-columns: 1fr;
          }

          .store-benefits {
            grid-template-columns: 1fr;
          }

          .store-benefit {
            border-right: 0;
            border-bottom: 1px solid #edf1f1;
          }

          .store-benefit:last-child {
            border-bottom: 0;
          }
        }
      `}</style>

      {/* =================================
          HEADER
      ================================= */}

      <header className="store-header">
        <div
          className="store-logo"
          onClick={() => navigate("/store")}
        >
          <FaPaw className="store-logo-icon" />

          <h2 className="store-logo-text">
            Vet <span>Clinic</span>
          </h2>
        </div>

        <nav className="store-nav">
          <button
            type="button"
            onClick={() => navigate("/store")}
          >
            Shop
          </button>

          <button
            type="button"
            onClick={() => navigate("/orders")}
          >
            My Orders
          </button>
        </nav>

        <div className="store-header-actions">
          <button
            type="button"
            className="store-icon-button"
            title="My Orders"
            onClick={() => navigate("/orders")}
          >
            <FaClipboardList />
          </button>

          <button
            type="button"
            className="store-icon-button"
            title="Cart"
            onClick={openCart}
          >
            <FaShoppingCart />

            {cartCount > 0 && (
              <span className="store-cart-count">
                {cartCount}
              </span>
            )}
          </button>

          <div className="store-account-wrapper">
            <button
              type="button"
              className="store-account-button"
              onClick={() =>
                setAccountOpen((current) => !current)
              }
            >
              <span className="store-account-avatar">
                <FaUser />
              </span>

              <span className="store-account-name">
                My Account
              </span>

              <FaChevronDown className="store-account-arrow" />
            </button>

            {accountOpen && (
              <div className="store-account-menu">
                <div className="store-account-menu-header">
                  <strong>Pet Owner</strong>
                  <span>Owner account</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen(false);
                    navigate("/owners");
                  }}
                >
                  <FaUser />
                  My Profile
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen(false);
                    navigate("/orders");
                  }}
                >
                  <FaClipboardList />
                  My Orders
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

                <button
                  type="button"
                  className="logout"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="store-container">
        {/* =================================
            HERO
        ================================= */}

        <section className="store-hero">
          <div className="store-hero-content">
            <div className="store-hero-badge">
              <FaPaw />
              Vet Clinic Pet Store
            </div>

            <h1>
              Happy Pets,
              <br />
              <span>Healthier Lives.</span>
            </h1>

            <p>
              Everything your pet needs in one place.
              Shop trusted food, care products, hygiene
              essentials, supplements and accessories.
            </p>

            <button
              type="button"
              className="store-shop-now"
              onClick={() =>
                document
                  .getElementById("store-products")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              Shop Products
            </button>
          </div>

          <div className="store-hero-visual">
            <div className="store-hero-circle">
              <FaPaw className="store-hero-paw" />

              <FaPaw className="store-hero-mini-paw one" />

              <FaPaw className="store-hero-mini-paw two" />
            </div>
          </div>
        </section>

        {/* =================================
            BENEFITS
        ================================= */}

        <section className="store-benefits">
          <div className="store-benefit">
            <div className="store-benefit-icon">
              <FaPaw />
            </div>

            <div>
              <strong>Trusted Products</strong>
              <span>Selected for pets</span>
            </div>
          </div>

          <div className="store-benefit">
            <div className="store-benefit-icon">
              <FaHeart />
            </div>

            <div>
              <strong>Quality Care</strong>
              <span>Vet clinic products</span>
            </div>
          </div>

          <div className="store-benefit">
            <div className="store-benefit-icon">
              <FaShoppingCart />
            </div>

            <div>
              <strong>Easy Shopping</strong>
              <span>Simple checkout</span>
            </div>
          </div>

          <div className="store-benefit">
            <div className="store-benefit-icon">
              <FaBoxOpen />
            </div>

            <div>
              <strong>Same Inventory</strong>
              <span>Clinic & online store</span>
            </div>
          </div>
        </section>

        {/* =================================
            CATEGORIES
        ================================= */}

        <section className="store-section">
          <div className="store-section-heading">
            <div>
              <h2>Shop by Category</h2>

              <p>
                Find exactly what your pet needs.
              </p>
            </div>
          </div>

          <div className="store-categories">
            {CATEGORY_ITEMS.map((item) => (
              <button
                type="button"
                key={item.name}
                className={`store-category-card ${
                  category === item.name ? "active" : ""
                }`}
                onClick={() =>
                  setCategory((current) =>
                    current === item.name
                      ? "All categories"
                      : item.name
                  )
                }
              >
                <span className="store-category-icon">
                  {item.icon}
                </span>

                <strong>{item.name}</strong>
              </button>
            ))}
          </div>
        </section>

        {/* =================================
            PRODUCTS
        ================================= */}

        <section
          className="store-section"
          id="store-products"
        >
          <div className="store-section-heading">
            <div>
              <h2>All Products</h2>

              <p>
                Browse products available from the clinic.
              </p>
            </div>
          </div>

          <div className="store-products-toolbar">
            <div className="store-search">
              <FaSearch />

              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              {search && (
                <button
                  type="button"
                  className="store-search-clear"
                  onClick={() => setSearch("")}
                >
                  <FaTimes />
                </button>
              )}
            </div>

            <select
              className="store-category-select"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
            >
              <option value="All categories">
                All categories
              </option>

              {CATEGORY_ITEMS.map((item) => (
                <option
                  key={item.name}
                  value={item.name}
                >
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="store-products-grid">
            {filteredProducts.length === 0 ? (
              <div className="store-no-products">
                <FaBoxOpen />

                <h3>No products found</h3>

                <p>
                  Try another search or category.
                </p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const favorite = favorites.includes(
                  product.id
                );

                return (
                  <article
                    className="store-product-card"
                    key={product.id}
                  >
                    <button
                      type="button"
                      className={`store-favorite-button ${
                        favorite ? "active" : ""
                      }`}
                      onClick={() =>
                        toggleFavorite(product.id)
                      }
                      aria-label="Favorite"
                    >
                      <FaHeart />
                    </button>

                    <div className="store-product-image">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                        />
                      ) : (
                        <FaBoxOpen />
                      )}
                    </div>

                    <div className="store-product-info">
                      <h3 className="store-product-name">
                        {product.name}
                      </h3>

                      <div className="store-product-category">
                        {product.category}
                      </div>

                      <div className="store-product-meta">
                        <span className="store-product-price">
                          ${product.price.toFixed(2)}
                        </span>

                        <span
                          className={`store-stock ${
                            product.stock === 0
                              ? "out"
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

                      <button
                        type="button"
                        className="store-add-cart"
                        disabled={product.stock === 0}
                        onClick={() =>
                          addToCart(product)
                        }
                      >
                        <FaPlus />

                        {product.stock === 0
                          ? "Out of Stock"
                          : "Add to Cart"}
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Ecommerce;