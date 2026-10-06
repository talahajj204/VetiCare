import { useEffect, useMemo, useState } from "react";
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
  FaHome,
  FaInfoCircle,
  FaEnvelope,
} from "react-icons/fa";

/* =========================================================
   PRODUCTS
========================================================= */

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

/* =========================================================
   CATEGORIES
========================================================= */

const CATEGORY_ITEMS = [
  { name: "Food", icon: <FaBone /> },
  { name: "Care", icon: <FaPaw /> },
  { name: "Hygiene", icon: <FaPumpSoap /> },
  { name: "Accessories", icon: <FaDog /> },
  { name: "Supplements", icon: <FaCapsules /> },
  { name: "Grooming", icon: <FaPumpSoap /> },
];

/* =========================================================
   ECOMMERCE
========================================================= */

function Ecommerce() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState("All categories");

  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] =
    useState([]);

  const [accountOpen, setAccountOpen] =
    useState(false);

  const [categoriesOpen, setCategoriesOpen] =
    useState(false);

  /* =========================================================
     STORE SETTINGS

     IMPORTANT:
     Nothing from the Home Banner is predefined here.
     Everything comes from Settings.jsx.
  ========================================================= */

  const [storeSettings, setStoreSettings] =
    useState({
      storeName: "",
      storeDescription: "",
      storeBanner: null,

      // HOME BANNER
      homeBanner: null,
      homeBannerTitle: "",
      homeBannerDescription: "",
      homeBannerButtonText: "",
    });

  /* =========================================================
     LOAD SETTINGS
  ========================================================= */

  useEffect(() => {
    const loadStoreSettings = () => {
      try {
        const saved =
          localStorage.getItem(
            "storeSettings"
          );

        if (!saved) {
          setStoreSettings({
            storeName: "",
            storeDescription: "",
            storeBanner: null,

            homeBanner: null,
            homeBannerTitle: "",
            homeBannerDescription: "",
            homeBannerButtonText: "",
          });

          return;
        }

        const settings =
          JSON.parse(saved);

        setStoreSettings({
          storeName:
            settings.storeName || "",

          storeDescription:
            settings.storeDescription ||
            "",

          // HEADER + FOOTER LOGO
          storeBanner:
            settings.storeBanner || null,

          // HOME BANNER IMAGE
          homeBanner:
            settings.homeBanner || null,

          // HOME BANNER CONTENT
          // NO fallback words here
          homeBannerTitle:
            settings.homeBannerTitle ||
            "",

          homeBannerDescription:
            settings.homeBannerDescription ||
            "",

          homeBannerButtonText:
            settings.homeBannerButtonText ||
            "",
        });
      } catch (error) {
        console.error(
          "Could not load store settings:",
          error
        );
      }
    };

    loadStoreSettings();

    window.addEventListener(
      "storage",
      loadStoreSettings
    );

    window.addEventListener(
      "storeSettingsUpdated",
      loadStoreSettings
    );

    return () => {
      window.removeEventListener(
        "storage",
        loadStoreSettings
      );

      window.removeEventListener(
        "storeSettingsUpdated",
        loadStoreSettings
      );
    };
  }, []);

  /* =========================================================
     PRODUCTS
  ========================================================= */

  const products = useMemo(
    () =>
      PRODUCTS.filter(
        (product) =>
          product.showOnStore
      ),
    []
  );

  const filteredProducts =
    useMemo(() => {
      const value =
        search
          .toLowerCase()
          .trim();

      return products.filter(
        (product) => {
          const matchesSearch =
            !value ||
            product.name
              .toLowerCase()
              .includes(value) ||
            product.category
              .toLowerCase()
              .includes(value);

          const matchesCategory =
            category ===
              "All categories" ||
            product.category ===
              category;

          return (
            matchesSearch &&
            matchesCategory
          );
        }
      );
    }, [
      products,
      search,
      category,
    ]);

  /* =========================================================
     CART
  ========================================================= */

  const cartCount = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  const addToCart = (product) => {
    if (product.stock <= 0) return;

    setCart((currentCart) => {
      const existingItem =
        currentCart.find(
          (item) =>
            item.id === product.id
        );

      if (existingItem) {
        if (
          existingItem.quantity >=
          product.stock
        ) {
          return currentCart;
        }

        return currentCart.map(
          (item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity:
                    item.quantity +
                    1,
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

  const toggleFavorite = (
    productId
  ) => {
    setFavorites((current) =>
      current.includes(productId)
        ? current.filter(
            (id) =>
              id !== productId
          )
        : [...current, productId]
    );
  };

  const openCart = () => {
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

  /* =========================================================
     SCROLL
  ========================================================= */

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollToProducts = () => {
    document
      .getElementById(
        "store-products"
      )
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  const scrollToAbout = () => {
    document
      .getElementById(
        "store-about"
      )
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  const scrollToContact = () => {
    document
      .getElementById(
        "store-contact-anchor"
      )
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  const chooseCategory = (
    categoryName
  ) => {
    setCategory(categoryName);
    setCategoriesOpen(false);

    setTimeout(() => {
      scrollToProducts();
    }, 80);
  };

  return (
    <div className="store-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
        }

        button,
        input,
        select {
          font: inherit;
        }

        .store-page {
          --teal: #1aa6a6;
          --teal-dark: #11797b;
          --teal-deep: #0d6668;
          --teal-light: #e8f7f7;
          --teal-soft: #f1fbfa;
          --text: #263b4f;
          --muted: #728197;
          --border: #dcebea;

          min-height: 100vh;

          background: #f8fbfa;
          color: var(--text);

          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .store-header {
          min-height: 84px;
          width: 100%;

          padding: 0 4%;

          display: grid;

          grid-template-columns:
            minmax(160px, 1fr)
            auto
            minmax(260px, 1fr);

          align-items: center;

          gap: 30px;

          background:
            var(--teal);

          border-bottom:
            1px solid
            rgba(
              255,
              255,
              255,
              0.18
            );

          box-shadow:
            0 7px 25px
            rgba(
              17,
              121,
              123,
              0.14
            );

          position: sticky;
          top: 0;

          z-index: 1000;
        }

        /* =====================================================
           LOGO
        ===================================================== */

        .store-logo {
          width: fit-content;
          min-width: 150px;
          height: 64px;

          display: flex;
          align-items: center;

          gap: 10px;

          cursor: pointer;
        }

        .store-header-logo-image {
          display: block;

          width: auto;
          max-width: 190px;

          height: 60px;
          max-height: 60px;

          object-fit: contain;
          object-position:
            left center;

          border-radius: 10px;
        }

        .store-logo-fallback {
          display: flex;
          align-items: center;

          gap: 10px;

          color: white;
        }

        .store-logo-icon {
          font-size: 29px;
          color: white;
        }

        .store-logo-text {
          margin: 0;

          color: white;

          font-size: 20px;
          font-weight: 800;

          letter-spacing: -0.4px;

          white-space: nowrap;
        }

        /* =====================================================
           NAVBAR
        ===================================================== */

        .store-nav {
          height: 84px;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 34px;

          background: transparent;
        }

        .store-nav-link {
          height: 84px;

          padding: 0;

          border: none;
          outline: none;

          background:
            transparent !important;

          color:
            rgba(
              255,
              255,
              255,
              0.88
            );

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          position: relative;

          font-size: 13px;
          font-weight: 700;

          white-space: nowrap;

          cursor: pointer;

          transition:
            color 0.2s ease,
            transform 0.2s ease;
        }

        .store-nav-link svg {
          font-size: 11px;

          color: currentColor;
        }

        .store-nav-link:hover {
          color: #ffffff;

          transform:
            translateY(-1px);
        }

        .store-nav-link::after {
          content: "";

          position: absolute;

          left: 50%;
          bottom: 19px;

          width: 0;
          height: 2px;

          border-radius: 20px;

          background: #ffffff;

          transform:
            translateX(-50%);

          transition:
            width 0.22s ease;
        }

        .store-nav-link:hover::after {
          width: 100%;
        }

        .store-nav-link.home {
          color: #ffffff;
        }

        /* =====================================================
           CATEGORY DROPDOWN
        ===================================================== */

        .store-category-dropdown {
          height: 84px;

          display: flex;
          align-items: center;

          position: relative;
        }

        .store-nav-chevron {
          margin-left: 2px;

          font-size:
            7px !important;

          transition:
            transform 0.2s ease;
        }

        .store-nav-chevron.open {
          transform:
            rotate(180deg);
        }

        .store-category-menu {
          position: absolute;

          top: 72px;
          left: 50%;

          width: 220px;

          padding: 8px;

          border:
            1px solid
            var(--border);

          border-radius: 14px;

          background: #ffffff;

          box-shadow:
            0 18px 45px
            rgba(
              13,
              102,
              104,
              0.16
            );

          transform:
            translateX(-50%);

          z-index: 1300;
        }

        .store-category-menu::before {
          content: "";

          position: absolute;

          top: -6px;
          left: 50%;

          width: 12px;
          height: 12px;

          background: white;

          border-left:
            1px solid
            var(--border);

          border-top:
            1px solid
            var(--border);

          transform:
            translateX(-50%)
            rotate(45deg);
        }

        .store-category-menu-title {
          padding: 8px 10px;

          color: #98a2b3;

          font-size: 9px;
          font-weight: 800;

          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .store-category-menu button {
          width: 100%;
          min-height: 40px;

          padding: 6px 9px;

          border: none;
          border-radius: 9px;

          background: transparent;

          color: #475467;

          display: flex;
          align-items: center;

          gap: 10px;

          text-align: left;

          font-size: 11px;
          font-weight: 650;

          cursor: pointer;

          transition: 0.18s ease;
        }

        .store-category-menu button:hover,
        .store-category-menu button.active {
          background:
            var(--teal-light);

          color:
            var(--teal-dark);
        }

        .store-dropdown-icon {
          width: 29px;
          height: 29px;

          border-radius: 8px;

          background:
            var(--teal-light);

          color: var(--teal);

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          font-size: 11px;
        }

        /* =====================================================
           HEADER RIGHT
        ===================================================== */

        .store-header-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;

          gap: 10px;
        }

        .store-icon-button {
          width: 42px;
          height: 42px;

          padding: 0;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.32
            );

          border-radius: 50%;

          background:
            rgba(
              255,
              255,
              255,
              0.12
            );

          color: #ffffff;

          display: flex;
          align-items: center;
          justify-content: center;

          position: relative;

          cursor: pointer;

          transition:
            background 0.2s ease,
            transform 0.2s ease,
            border-color 0.2s ease;
        }

        .store-icon-button:hover {
          background:
            rgba(
              255,
              255,
              255,
              0.23
            );

          border-color:
            rgba(
              255,
              255,
              255,
              0.65
            );

          transform:
            translateY(-2px);
        }

        .store-cart-count {
          position: absolute;

          top: -5px;
          right: -4px;

          min-width: 18px;
          height: 18px;

          padding: 0 5px;

          border:
            2px solid
            var(--teal);

          border-radius: 20px;

          background: #ffffff;
          color: var(--teal-dark);

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 9px;
          font-weight: 800;
        }

        /* =====================================================
           ACCOUNT
        ===================================================== */

        .store-account-wrapper {
          position: relative;
        }

        .store-account-button {
          height: 42px;

          padding:
            0 14px 0 7px;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.32
            );

          border-radius: 24px;

          background:
            rgba(
              255,
              255,
              255,
              0.12
            );

          color: #ffffff;

          display: flex;
          align-items: center;

          gap: 9px;

          cursor: pointer;

          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease;
        }

        .store-account-button:hover {
          background:
            rgba(
              255,
              255,
              255,
              0.23
            );

          border-color:
            rgba(
              255,
              255,
              255,
              0.65
            );

          transform:
            translateY(-1px);
        }

        .store-account-avatar {
          width: 29px;
          height: 29px;

          border-radius: 50%;

          background: #ffffff;
          color: var(--teal);

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 11px;
        }

        .store-account-name {
          font-size: 11px;
          font-weight: 750;
        }

        .store-account-arrow {
          font-size: 8px;
          opacity: 0.8;
        }

        .store-account-menu {
          position: absolute;

          top: calc(100% + 12px);
          right: 0;

          width: 205px;

          padding: 7px;

          border:
            1px solid
            var(--border);

          border-radius: 14px;

          background: #ffffff;

          box-shadow:
            0 18px 45px
            rgba(
              16,
              24,
              40,
              0.14
            );

          z-index: 1300;
        }

        .store-account-menu-header {
          padding: 10px;

          border-bottom:
            1px solid #edf1f1;

          margin-bottom: 5px;
        }

        .store-account-menu-header strong {
          display: block;

          color: var(--text);

          font-size: 11px;
        }

        .store-account-menu-header span {
          display: block;

          margin-top: 3px;

          color: #98a2b3;

          font-size: 9px;
        }

        .store-account-menu button {
          width: 100%;

          padding: 10px;

          border: none;
          border-radius: 8px;

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
          background:
            var(--teal-light);

          color:
            var(--teal-dark);
        }

        .store-account-menu .logout {
          color: #d92d20;
        }

        /* =====================================================
           MAIN
        ===================================================== */

        .store-container {
          width:
            min(1400px, 92%);

          margin: 0 auto;

          padding-bottom: 60px;
        }

        /* =====================================================
           HOME BANNER / HERO
        ===================================================== */

        .store-hero {
          min-height: 390px;

          margin-top: 28px;

          padding: 55px 60px;

          border:
            1px solid #d7ebe9;

          border-radius: 24px;

          background:
            radial-gradient(
              circle at 84% 38%,
              rgba(
                26,
                166,
                166,
                0.16
              ),
              transparent 28%
            ),
            linear-gradient(
              120deg,
              #f7fcfb 0%,
              #eef9f8 50%,
              #e4f6f4 100%
            );

          display: flex;
          align-items: center;
          justify-content:
            space-between;

          overflow: hidden;

          position: relative;

          isolation: isolate;
        }

        /* Banner uploaded from Settings */

        .store-hero.has-banner {
          min-height: 430px;

          border: none;

          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;

          box-shadow:
            0 18px 45px
            rgba(
              17,
              121,
              123,
              0.12
            );
        }

        .store-hero-overlay {
          position: absolute;

          inset: 0;

          z-index: 0;

          background:
            linear-gradient(
              90deg,
              rgba(
                8,
                50,
                52,
                0.82
              ) 0%,
              rgba(
                8,
                50,
                52,
                0.69
              ) 34%,
              rgba(
                8,
                50,
                52,
                0.42
              ) 58%,
              rgba(
                8,
                50,
                52,
                0.12
              ) 82%,
              rgba(
                8,
                50,
                52,
                0.05
              ) 100%
            );
        }

        .store-hero-content {
          width: 57%;

          position: relative;

          z-index: 2;
        }

        .store-hero.has-banner
        .store-hero-content {
          width: 60%;

          max-width: 690px;
        }

        .store-hero-badge {
          display: inline-flex;
          align-items: center;

          gap: 7px;

          margin-bottom: 17px;

          padding: 7px 12px;

          border:
            1px solid
            rgba(
              26,
              166,
              166,
              0.12
            );

          border-radius: 30px;

          background:
            rgba(
              255,
              255,
              255,
              0.9
            );

          color:
            var(--teal-dark);

          font-size: 10px;
          font-weight: 800;
        }

        .store-hero.has-banner
        .store-hero-badge {
          border-color:
            rgba(
              255,
              255,
              255,
              0.25
            );

          background:
            rgba(
              255,
              255,
              255,
              0.15
            );

          color: #ffffff;

          backdrop-filter:
            blur(9px);

          -webkit-backdrop-filter:
            blur(9px);
        }

        .store-hero h1 {
          margin: 0;

          max-width: 650px;

          color: #263b4f;

          font-size:
            clamp(
              38px,
              4vw,
              58px
            );

          line-height: 1.03;

          letter-spacing: -2.4px;
        }

        .store-hero.has-banner h1 {
          color: #ffffff;

          text-shadow:
            0 3px 18px
            rgba(
              0,
              0,
              0,
              0.18
            );
        }

        .store-hero p {
          max-width: 570px;

          margin:
            20px 0 27px;

          color: #667085;

          font-size: 14px;

          line-height: 1.75;
        }

        .store-hero.has-banner p {
          color:
            rgba(
              255,
              255,
              255,
              0.9
            );

          text-shadow:
            0 2px 8px
            rgba(
              0,
              0,
              0,
              0.14
            );
        }

       .store-shop-now {
  min-width: 0 !important;
  width: fit-content !important;
  height: 30px !important;
  padding: 0 12px !important;

  border: none;
  border-radius: 8px;

  background: var(--teal);
  color: #ffffff;

  font-size: 10px !important;
  font-weight: 800;

  cursor: pointer;

  box-shadow:
    0 6px 14px
    rgba(26, 166, 166, 0.18);

  transition:
    background 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

        .store-shop-now:hover {
          background:
            var(--teal-dark);

          transform:
            translateY(-2px);

          box-shadow:
            0 11px 22px
            rgba(
              17,
              121,
              123,
              0.22
            );
        }

        .store-hero.has-banner
        .store-shop-now {
          background: #ffffff;

          color:
            var(--teal-dark);

          box-shadow:
            0 10px 25px
            rgba(
              0,
              0,
              0,
              0.16
            );
        }

        .store-hero.has-banner
        .store-shop-now:hover {
          background:
            var(--teal-light);

          transform:
            translateY(-2px);

          box-shadow:
            0 13px 28px
            rgba(
              0,
              0,
              0,
              0.2
            );
        }

        /*
          Paw fallback stays only when
          no Home Banner image exists.
        */

        .store-hero-visual {
          width: 36%;

          display: flex;
          align-items: center;
          justify-content: center;

          position: relative;

          z-index: 1;
        }

        .store-hero-circle {
          width: 245px;
          height: 245px;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.7
            );

          border-radius: 50%;

          background:
            rgba(
              255,
              255,
              255,
              0.72
            );

          display: flex;
          align-items: center;
          justify-content: center;

          position: relative;

          box-shadow:
            0 20px 45px
            rgba(
              26,
              166,
              166,
              0.08
            );
        }

        .store-hero-paw {
          color: var(--teal);

          font-size: 92px;

          opacity: 0.72;
        }

        .store-hero-mini-paw {
          position: absolute;

          color: #86d4cf;

          font-size: 28px;
        }

        .store-hero-mini-paw.one {
          top: 30px;
          right: 24px;

          transform:
            rotate(20deg);
        }

        .store-hero-mini-paw.two {
          bottom: 30px;
          left: 24px;

          transform:
            rotate(-20deg);
        }

        /* =====================================================
           PART 2 CONTINUES HERE
        ===================================================== */
        /* =====================================================
        BENEFITS
     ===================================================== */

     .store-benefits {
       display: grid;
       grid-template-columns: repeat(4, 1fr);

       margin-top: 20px;

       border: 1px solid #e1eceb;
       border-radius: 14px;

       background: #ffffff;

       overflow: hidden;
     }

     .store-benefit {
       min-height: 76px;

       padding: 16px 20px;

       display: flex;
       align-items: center;
       justify-content: center;

       gap: 11px;

       border-right:
         1px solid #edf2f1;
     }

     .store-benefit:last-child {
       border-right: none;
     }

     .store-benefit-icon {
       width: 38px;
       height: 38px;

       border-radius: 50%;

       background:
         var(--teal-light);

       color: var(--teal);

       display: flex;
       align-items: center;
       justify-content: center;

       flex-shrink: 0;

       font-size: 14px;
     }

     .store-benefit strong {
       display: block;

       color: #344054;

       font-size: 10px;
     }

     .store-benefit span {
       display: block;

       margin-top: 3px;

       color: #98a2b3;

       font-size: 8px;
     }

     /* =====================================================
        SECTION HEADINGS
     ===================================================== */

     .store-section {
       margin-top: 40px;
     }

     .store-section-heading {
       display: flex;
       align-items: flex-end;
       justify-content: space-between;

       margin-bottom: 17px;
     }

     .store-section-heading h2 {
       margin: 0;

       color: #304156;

       font-size: 23px;

       letter-spacing: -0.5px;
     }

     .store-section-heading p {
       margin: 6px 0 0;

       color: #98a2b3;

       font-size: 10px;
     }

     /* =====================================================
        CATEGORY CARDS
     ===================================================== */

     .store-categories {
       display: grid;

       grid-template-columns:
         repeat(6, 1fr);

       gap: 13px;
     }

     .store-category-card {
       min-height: 108px;

       padding: 15px;

       border:
         1px solid #e1e9e8;

       border-radius: 14px;

       background: #ffffff;
       color: #475467;

       display: flex;
       flex-direction: column;
       align-items: center;
       justify-content: center;

       cursor: pointer;

       transition:
         border-color 0.2s ease,
         background 0.2s ease,
         transform 0.2s ease,
         box-shadow 0.2s ease;
     }

     .store-category-card:hover,
     .store-category-card.active {
       border-color:
         rgba(26, 166, 166, 0.5);

       background:
         var(--teal-soft);

       transform:
         translateY(-3px);

       box-shadow:
         0 10px 25px
         rgba(17, 121, 123, 0.08);
     }

     .store-category-icon {
       width: 43px;
       height: 43px;

       margin-bottom: 9px;

       border-radius: 50%;

       background:
         var(--teal-light);

       color: var(--teal);

       display: flex;
       align-items: center;
       justify-content: center;

       font-size: 16px;
     }

     .store-category-card strong {
       font-size: 10px;
     }

     /* =====================================================
        TOOLBAR
     ===================================================== */

     .store-products-toolbar {
       margin-bottom: 18px;

       display: grid;

       grid-template-columns:
         1fr 190px;

       gap: 12px;
     }

     .store-search {
       height: 45px;

       padding: 0 15px;

       border:
         1px solid #dce7e6;

       border-radius: 11px;

       background: #ffffff;

       display: flex;
       align-items: center;

       gap: 10px;

       color: #98a2b3;

       transition:
         border-color 0.2s ease,
         box-shadow 0.2s ease;
     }

     .store-search:focus-within {
       border-color:
         rgba(26, 166, 166, 0.65);

       box-shadow:
         0 0 0 3px
         rgba(26, 166, 166, 0.08);
     }

     .store-search input {
       width: 100%;

       border: none;
       outline: none;

       background: transparent;

       color: #344054;

       font-size: 11px;
     }

     .store-search input::placeholder {
       color: #a4adb9;
     }

     .store-search-clear {
       width: 26px;
       height: 26px;

       padding: 0;

       border: none;
       border-radius: 50%;

       background: #f1f5f4;
       color: #7d8998;

       display: flex;
       align-items: center;
       justify-content: center;

       cursor: pointer;
     }

     .store-category-select {
       height: 45px;

       padding: 0 13px;

       border:
         1px solid #dce7e6;

       border-radius: 11px;

       outline: none;

       background: #ffffff;
       color: #475467;

       font-size: 11px;

       cursor: pointer;
     }

     /* =====================================================
        PRODUCTS
     ===================================================== */

     .store-products-grid {
       display: grid;

       grid-template-columns:
         repeat(4, 1fr);

       gap: 18px;
     }

     .store-product-card {
       min-width: 0;

       border:
         1px solid #e1e9e8;

       border-radius: 16px;

       background: #ffffff;

       overflow: hidden;

       position: relative;

       transition:
         transform 0.22s ease,
         box-shadow 0.22s ease,
         border-color 0.22s ease;
     }

     .store-product-card:hover {
       border-color:
         rgba(26, 166, 166, 0.28);

       transform:
         translateY(-4px);

       box-shadow:
         0 14px 35px
         rgba(17, 121, 123, 0.09);
     }

     .store-favorite-button {
       width: 30px;
       height: 30px;

       padding: 0;

       border: none;
       border-radius: 50%;

       background: #ffffff;
       color: #b4bdc8;

       display: flex;
       align-items: center;
       justify-content: center;

       position: absolute;

       top: 11px;
       right: 11px;

       z-index: 5;

       cursor: pointer;

       box-shadow:
         0 4px 12px
         rgba(0, 0, 0, 0.08);

       transition: 0.2s ease;
     }

     .store-favorite-button:hover,
     .store-favorite-button.active {
       color: #e25555;

       transform: scale(1.06);
     }

     .store-product-image {
       height: 190px;

       background:
         linear-gradient(
           145deg,
           #f2fbfa,
           #e9f7f6
         );

       display: flex;
       align-items: center;
       justify-content: center;

       color: #83d0cb;

       font-size: 42px;

       overflow: hidden;
     }

     .store-product-image img {
       width: 100%;
       height: 100%;

       object-fit: cover;
     }

     .store-product-info {
       padding: 16px;
     }

     .store-product-name {
       min-height: 32px;

       margin: 0;

       color: #344054;

       font-size: 12px;
       font-weight: 800;

       line-height: 1.4;
     }

     .store-product-category {
       margin-top: 4px;

       color: #98a2b3;

       font-size: 9px;
     }

     .store-product-meta {
       margin: 13px 0;

       display: flex;
       align-items: center;
       justify-content: space-between;

       gap: 10px;
     }

     .store-product-price {
       color: #263b4f;

       font-size: 13px;
       font-weight: 850;
     }

     .store-stock {
       padding: 4px 7px;

       border-radius: 20px;

       background: #edf9f5;
       color: #288264;

       font-size: 8px;
       font-weight: 700;
     }

     .store-stock.low {
       background: #fff6e8;
       color: #b87519;
     }

     .store-stock.out {
       background: #fff0f0;
       color: #c84c4c;
     }

     .store-add-cart {
       width: 100%;
       height: 39px;

       border: none;
       border-radius: 9px;

       background:
         var(--teal);

       color: #ffffff;

       display: flex;
       align-items: center;
       justify-content: center;

       gap: 7px;

       font-size: 10px;
       font-weight: 800;

       cursor: pointer;

       transition:
         background 0.2s ease,
         transform 0.2s ease;
     }

     .store-add-cart:hover:not(:disabled) {
       background:
         var(--teal-dark);

       transform:
         translateY(-1px);
     }

     .store-add-cart:disabled {
       background: #d8e2e1;
       color: #8c9998;

       cursor: not-allowed;
     }

     /* =====================================================
        EMPTY PRODUCTS
     ===================================================== */

     .store-empty-products {
       grid-column: 1 / -1;

       padding: 50px 20px;

       border:
         1px dashed #cfe0df;

       border-radius: 16px;

       background: #ffffff;

       text-align: center;

       color: #98a2b3;
     }

     .store-empty-products svg {
       margin-bottom: 12px;

       color: var(--teal);

       font-size: 35px;
     }

     .store-empty-products h3 {
       margin: 0 0 7px;

       color: #475467;

       font-size: 15px;
     }

     .store-empty-products p {
       margin: 0;

       font-size: 10px;
     }

     /* =====================================================
        CONTACT ANCHOR
     ===================================================== */

     #store-contact-anchor {
       height: 1px;
       width: 100%;
     }

     /* =====================================================
        RESPONSIVE
     ===================================================== */

     @media (max-width: 1180px) {
       .store-header {
         grid-template-columns:
           auto 1fr auto;

         gap: 18px;

         padding: 0 3%;
       }

       .store-nav {
         gap: 20px;
       }

       .store-products-grid {
         grid-template-columns:
           repeat(3, 1fr);
       }

       .store-categories {
         grid-template-columns:
           repeat(3, 1fr);
       }

       .store-hero {
         padding: 45px;
       }
     }

     @media (max-width: 960px) {
       .store-header {
         min-height: auto;

         grid-template-columns:
           1fr auto;

         padding:
           10px 4% 0;

         gap: 8px 16px;
       }

       .store-logo {
         height: 58px;
       }

       .store-header-logo-image {
         height: 54px;
         max-height: 54px;
       }

       .store-header-actions {
         grid-column: 2;
         grid-row: 1;
       }

       .store-nav {
         grid-column: 1 / -1;

         width: 100%;
         height: 55px;

         justify-content: center;

         gap: 28px;

         overflow-x: auto;
       }

       .store-nav-link,
       .store-category-dropdown {
         height: 55px;
       }

       .store-nav-link::after {
         bottom: 7px;
       }

       .store-category-menu {
         top: 49px;
       }

       .store-hero {
         min-height: 380px;

         padding: 45px 40px;
       }

       .store-hero.has-banner {
         min-height: 410px;
       }

       .store-hero-content {
         width: 60%;
       }

       .store-hero.has-banner
       .store-hero-content {
         width: 70%;
       }

       .store-hero-visual {
         width: 35%;
       }

       .store-hero-circle {
         width: 200px;
         height: 200px;
       }

       .store-hero-paw {
         font-size: 75px;
       }

       .store-benefits {
         grid-template-columns:
           repeat(2, 1fr);
       }

       .store-benefit:nth-child(2) {
         border-right: none;
       }

       .store-benefit:nth-child(-n + 2) {
         border-bottom:
           1px solid #edf2f1;
       }
     }

     @media (max-width: 760px) {
       .store-account-name,
       .store-account-arrow {
         display: none;
       }

       .store-account-button {
         width: 42px;

         padding: 0;

         justify-content: center;
       }

       .store-account-avatar {
         width: 30px;
         height: 30px;
       }

       .store-products-grid {
         grid-template-columns:
           repeat(2, 1fr);
       }

       .store-products-toolbar {
         grid-template-columns: 1fr;
       }

       .store-categories {
         grid-template-columns:
           repeat(2, 1fr);
       }

       .store-hero,
       .store-hero.has-banner {
         min-height: 390px;

         padding: 38px 30px;

         border-radius: 18px;
       }

       .store-hero-content,
       .store-hero.has-banner
       .store-hero-content {
         width: 72%;
       }

       .store-hero h1 {
         font-size: 40px;
       }

       .store-hero-visual {
         position: absolute;

         right: -30px;
         bottom: -30px;

         width: auto;

         opacity: 0.35;
       }

       .store-hero.has-banner
       .store-hero-overlay {
         background:
           linear-gradient(
             90deg,
             rgba(
               8,
               50,
               52,
               0.88
             ) 0%,
             rgba(
               8,
               50,
               52,
               0.72
             ) 55%,
             rgba(
               8,
               50,
               52,
               0.25
             ) 100%
           );
       }
     }

     @media (max-width: 560px) {
       .store-header {
         padding:
           8px 3% 0;
       }

       .store-logo {
         min-width: 0;
       }

       .store-header-logo-image {
         max-width: 130px;

         height: 48px;
       }

       .store-logo-text {
         font-size: 16px;
       }

       .store-header-actions {
         gap: 6px;
       }

       .store-icon-button,
       .store-account-button {
         width: 37px;
         height: 37px;
       }

       .store-account-avatar {
         width: 27px;
         height: 27px;
       }

       .store-nav {
         justify-content:
           flex-start;

         gap: 24px;

         padding: 0 4px;
       }

       .store-nav-link {
         font-size: 11px;
       }

       .store-nav-link svg {
         display: none;
       }

       .store-container {
         width: 94%;
       }

       .store-hero,
       .store-hero.has-banner {
         min-height: 410px;

         margin-top: 18px;

         padding: 34px 24px;

         align-items: center;

         background-position: center;
       }

       .store-hero-content,
       .store-hero.has-banner
       .store-hero-content {
         width: 100%;
       }

       .store-hero.has-banner
       .store-hero-overlay {
         background:
           linear-gradient(
             90deg,
             rgba(
               8,
               50,
               52,
               0.89
             ) 0%,
             rgba(
               8,
               50,
               52,
               0.75
             ) 60%,
             rgba(
               8,
               50,
               52,
               0.5
             ) 100%
           );
       }

       .store-hero h1 {
         max-width: 340px;

         font-size: 36px;

         letter-spacing: -1.5px;
       }

       .store-hero p {
         max-width: 340px;

         font-size: 12px;
       }

       .store-hero-visual {
         display: none;
       }

       .store-benefits {
         grid-template-columns: 1fr;
       }

       .store-benefit {
         justify-content:
           flex-start;

         border-right: none;

         border-bottom:
           1px solid #edf2f1;
       }

       .store-benefit:last-child {
         border-bottom: none;
       }

       .store-categories {
         gap: 9px;
       }

       .store-products-grid {
         grid-template-columns: 1fr;
       }

       .store-product-image {
         height: 220px;
       }
     }
   `}</style>

   {/* =====================================================
       HEADER
   ===================================================== */}

   <header className="store-header">

     {/* LOGO */}

     <div
       className="store-logo"
       onClick={scrollToTop}
     >
       {storeSettings.storeBanner ? (
         <img
           src={
             storeSettings.storeBanner
           }
           alt={
             storeSettings.storeName ||
             "Store Logo"
           }
           className="store-header-logo-image"
         />
       ) : (
         <div className="store-logo-fallback">
           <FaPaw className="store-logo-icon" />

           {storeSettings.storeName && (
             <h2 className="store-logo-text">
               {
                 storeSettings.storeName
               }
             </h2>
           )}
         </div>
       )}
     </div>

     {/* NAVIGATION */}

     <nav className="store-nav">

       <button
         type="button"
         className="store-nav-link home"
         onClick={() => {
           setCategoriesOpen(false);
           setAccountOpen(false);
           scrollToTop();
         }}
       >
         <FaHome />
         <span>Home</span>
       </button>

       <button
         type="button"
         className="store-nav-link"
         onClick={() => {
           setCategoriesOpen(false);
           setAccountOpen(false);
           scrollToAbout();
         }}
       >
         <FaInfoCircle />
         <span>About Us</span>
       </button>

       {/* CATEGORIES */}

       <div className="store-category-dropdown">
         <button
           type="button"
           className="store-nav-link"
           onClick={() => {
             setCategoriesOpen(
               (current) => !current
             );

             setAccountOpen(false);
           }}
         >
           <FaBoxOpen />

           <span>Categories</span>

           <FaChevronDown
             className={`store-nav-chevron ${
               categoriesOpen
                 ? "open"
                 : ""
             }`}
           />
         </button>

         {categoriesOpen && (
           <div className="store-category-menu">

             <div className="store-category-menu-title">
               Shop by category
             </div>

             <button
               type="button"
               className={
                 category ===
                 "All categories"
                   ? "active"
                   : ""
               }
               onClick={() =>
                 chooseCategory(
                   "All categories"
                 )
               }
             >
               <span className="store-dropdown-icon">
                 <FaBoxOpen />
               </span>

               All Products
             </button>

             {CATEGORY_ITEMS.map(
               (item) => (
                 <button
                   type="button"
                   key={item.name}
                   className={
                     category ===
                     item.name
                       ? "active"
                       : ""
                   }
                   onClick={() =>
                     chooseCategory(
                       item.name
                     )
                   }
                 >
                   <span className="store-dropdown-icon">
                     {item.icon}
                   </span>

                   {item.name}
                 </button>
               )
             )}
           </div>
         )}
       </div>

       <button
         type="button"
         className="store-nav-link"
         onClick={() => {
           setCategoriesOpen(false);
           setAccountOpen(false);
           scrollToContact();
         }}
       >
         <FaEnvelope />
         <span>Contact Us</span>
       </button>
     </nav>

     {/* HEADER ACTIONS */}

     <div className="store-header-actions">

       <button
         type="button"
         className="store-icon-button"
         title="My Orders"
         onClick={() =>
           navigate("/orders")
         }
       >
         <FaClipboardList />
       </button>

       <button
         type="button"
         className="store-icon-button"
         title="Shopping Cart"
         onClick={openCart}
       >
         <FaShoppingCart />

         {cartCount > 0 && (
           <span className="store-cart-count">
             {cartCount}
           </span>
         )}
       </button>

       {/* ACCOUNT */}

       <div className="store-account-wrapper">

         <button
           type="button"
           className="store-account-button"
           onClick={() => {
             setAccountOpen(
               (current) =>
                 !current
             );

             setCategoriesOpen(false);
           }}
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
               <strong>
                 My Account
               </strong>

               <span>
                 Manage your store
                 account
               </span>
             </div>

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
                 navigate("/owners");
               }}
             >
               <FaUser />
               Owners
             </button>

             <button
               type="button"
               onClick={() => {
                 setAccountOpen(false);
                 navigate(
                   "/settings"
                 );
               }}
             >
               <FaCog />
               Settings
             </button>

             <button
               type="button"
               className="logout"
               onClick={
                 handleLogout
               }
             >
               <FaSignOutAlt />
               Logout
             </button>
           </div>
         )}
       </div>
     </div>
   </header>

   {/* =====================================================
       MAIN
   ===================================================== */}

   <main className="store-container">

     {/* =====================================================
         HOME BANNER

         ALL BANNER CONTENT COMES FROM SETTINGS.
         NO DEFAULT BANNER WORDS.
     ===================================================== */}

     <section
       className={`store-hero ${
         storeSettings.homeBanner
           ? "has-banner"
           : ""
       }`}
       id="store-about"
       style={
         storeSettings.homeBanner
           ? {
               backgroundImage:
                 `url(${storeSettings.homeBanner})`,
             }
           : undefined
       }
     >

       {storeSettings.homeBanner && (
         <div className="store-hero-overlay" />
       )}

       <div className="store-hero-content">

         {/* Store name only appears if
             the owner defined it */}

         {storeSettings.storeName && (
           <div className="store-hero-badge">
             <FaPaw />

             {
               storeSettings.storeName
             }
           </div>
         )}

         {/* Banner title only appears
             if entered in Settings */}

         {storeSettings.homeBannerTitle && (
           <h1>
             {
               storeSettings.homeBannerTitle
             }
           </h1>
         )}

         {/* Banner description only appears
             if entered in Settings */}

         {storeSettings.homeBannerDescription && (
           <p>
             {
               storeSettings.homeBannerDescription
             }
           </p>
         )}

         {/* Button only appears if button text
             was entered in Settings */}

         {storeSettings.homeBannerButtonText && (
           <button
             type="button"
             className="store-shop-now"
             onClick={
               scrollToProducts
             }
           >
             {
               storeSettings.homeBannerButtonText
             }
           </button>
         )}
       </div>

       {/* Paw fallback appears only when
           no banner image was uploaded */}

       {!storeSettings.homeBanner && (
         <div className="store-hero-visual">

           <div className="store-hero-circle">

             <FaPaw className="store-hero-paw" />

             <FaPaw className="store-hero-mini-paw one" />

             <FaPaw className="store-hero-mini-paw two" />

           </div>
         </div>
       )}
     </section>

     {/* =====================================================
         BENEFITS
     ===================================================== */}

     <section className="store-benefits">

       <div className="store-benefit">
         <div className="store-benefit-icon">
           <FaPaw />
         </div>

         <div>
           <strong>
             Pet Friendly
           </strong>

           <span>
             Products selected with care
           </span>
         </div>
       </div>

       <div className="store-benefit">
         <div className="store-benefit-icon">
           <FaBoxOpen />
         </div>

         <div>
           <strong>
             Quality Products
           </strong>

           <span>
             Trusted essentials
           </span>
         </div>
       </div>

       <div className="store-benefit">
         <div className="store-benefit-icon">
           <FaShoppingCart />
         </div>

         <div>
           <strong>
             Easy Shopping
           </strong>

           <span>
             Simple and fast ordering
           </span>
         </div>
       </div>

       <div className="store-benefit">
         <div className="store-benefit-icon">
           <FaHeart />
         </div>

         <div>
           <strong>
             Made With Care
           </strong>

           <span>
             Everything pets need
           </span>
         </div>
       </div>
     </section>

     {/* =====================================================
         CATEGORIES
     ===================================================== */}

     <section className="store-section">

       <div className="store-section-heading">
         <div>
           <h2>
             Shop by Category
           </h2>

           <p>
             Find the right products
             for your pet.
           </p>
         </div>
       </div>

       <div className="store-categories">

         {CATEGORY_ITEMS.map(
           (item) => (
             <button
               type="button"
               key={item.name}
               className={`store-category-card ${
                 category ===
                 item.name
                   ? "active"
                   : ""
               }`}
               onClick={() =>
                 chooseCategory(
                   item.name
                 )
               }
             >
               <span className="store-category-icon">
                 {item.icon}
               </span>

               <strong>
                 {item.name}
               </strong>
             </button>
           )
         )}
       </div>
     </section>

     {/* =====================================================
         PRODUCTS
     ===================================================== */}

     <section
       className="store-section"
       id="store-products"
     >
       <div className="store-section-heading">
         <div>
           <h2>
             Our Products
           </h2>

           <p>
             Browse our pet care
             collection.
           </p>
         </div>
       </div>

       {/* SEARCH + FILTER */}

       <div className="store-products-toolbar">

         <div className="store-search">

           <FaSearch />

           <input
             type="text"
             placeholder="Search products..."
             value={search}
             onChange={(event) =>
               setSearch(
                 event.target.value
               )
             }
           />

           {search && (
             <button
               type="button"
               className="store-search-clear"
               onClick={() =>
                 setSearch("")
               }
             >
               <FaTimes />
             </button>
           )}
         </div>

         <select
           className="store-category-select"
           value={category}
           onChange={(event) =>
             setCategory(
               event.target.value
             )
           }
         >
           <option>
             All categories
           </option>

           {CATEGORY_ITEMS.map(
             (item) => (
               <option
                 key={item.name}
                 value={item.name}
               >
                 {item.name}
               </option>
             )
           )}
         </select>
       </div>

       {/* PRODUCT GRID */}

       <div className="store-products-grid">

         {filteredProducts.length ===
         0 ? (
           <div className="store-empty-products">

             <FaBoxOpen />

             <h3>
               No products found
             </h3>

             <p>
               Try another search or
               category.
             </p>
           </div>
         ) : (
           filteredProducts.map(
             (product) => {
               const isFavorite =
                 favorites.includes(
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
                       isFavorite
                         ? "active"
                         : ""
                     }`}
                     onClick={() =>
                       toggleFavorite(
                         product.id
                       )
                     }
                   >
                     <FaHeart />
                   </button>

                   <div className="store-product-image">

                     {product.image ? (
                       <img
                         src={
                           product.image
                         }
                         alt={
                           product.name
                         }
                       />
                     ) : (
                       <FaPaw />
                     )}
                   </div>

                   <div className="store-product-info">

                     <h3 className="store-product-name">
                       {
                         product.name
                       }
                     </h3>

                     <div className="store-product-category">
                       {
                         product.category
                       }
                     </div>

                     <div className="store-product-meta">

                       <span className="store-product-price">
                         $
                         {product.price.toFixed(
                           2
                         )}
                       </span>

                       <span
                         className={`store-stock ${
                           product.stock ===
                           0
                             ? "out"
                             : product.stock <=
                               5
                             ? "low"
                             : ""
                         }`}
                       >
                         {product.stock ===
                         0
                           ? "Out of stock"
                           : `${product.stock} in stock`}
                       </span>
                     </div>

                     <button
                       type="button"
                       className="store-add-cart"
                       disabled={
                         product.stock <=
                         0
                       }
                       onClick={() =>
                         addToCart(
                           product
                         )
                       }
                     >
                       <FaPlus />

                       {product.stock > 0
                         ? "Add to Cart"
                         : "Out of Stock"}
                     </button>
                   </div>
                 </article>
               );
             }
           )
         )}
       </div>
     </section>

     {/* Footer comes after Ecommerce in App.jsx */}

     <div id="store-contact-anchor" />

   </main>
 </div>
);
}

export default Ecommerce;