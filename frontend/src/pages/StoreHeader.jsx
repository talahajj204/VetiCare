
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaShoppingCart, FaUser, FaBoxOpen, FaChevronDown,
  FaPaw, FaClipboardList, FaSignOutAlt, FaCog,
  FaHome, FaInfoCircle, FaEnvelope, FaBars, FaTimes,
} from "react-icons/fa";

import { storeTranslations } from "../translations/storeTranslations";
import {
  getStoreLanguage,
  setStoreLanguage,
} from "../translations/storeLanguage";

const DEFAULT_CATEGORIES = [
  "Food", "Care", "Hygiene", "Accessories",
  "Supplements", "Grooming", "Toys", "Treats",
  "Beds", "Bowls", "Dental Care", "Pet Essentials",
].map((title, index) => ({
  id: index + 1,
  title,
  description: "",
  image: null,
  sortOrder: index + 1,
}));

const DEFAULT_STORE_COLORS = {
  primaryColor: "#1aa6a6",
  secondaryColor: "#11797b",
  lightColor: "#e8f7f7",
  borderColor: "#dcebea",
};

function readCategories() {
  try {
    const saved = localStorage.getItem("vetClinicCategories");

    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return [...parsed].sort(
          (a, b) =>
            Number(a.sortOrder || 0) -
            Number(b.sortOrder || 0)
        );
      }
    }

    localStorage.setItem(
      "vetClinicCategories",
      JSON.stringify(DEFAULT_CATEGORIES)
    );
    return DEFAULT_CATEGORIES;
  } catch (error) {
    console.error("Categories error:", error);
    return DEFAULT_CATEGORIES;
  }
}

function readSettings() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("storeSettings") || "{}"
    );

    return {
      storeName: saved.storeName || "",
      storeBanner: saved.storeBanner || null,
      storeColors: {
        ...DEFAULT_STORE_COLORS,
        ...(saved.storeColors || {}),
      },
    };
  } catch (error) {
    console.error("Settings error:", error);
    return {
      storeName: "",
      storeBanner: null,
      storeColors: { ...DEFAULT_STORE_COLORS },
    };
  }
}

function readCartCount() {
  try {
    const cart = JSON.parse(
      localStorage.getItem("vetClinicStoreCart") || "[]"
    );

    if (!Array.isArray(cart)) return 0;

    return cart.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    );
  } catch {
    return 0;
  }
}

function StoreHeader() {
  const navigate = useNavigate();

  const [storeSettings, setStoreSettings] = useState(readSettings);
  const [categories, setCategories] = useState(readCategories);
  const [cartCount, setCartCount] = useState(readCartCount);
  const [language, setLanguageState] = useState(getStoreLanguage);

  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const t = storeTranslations[language] || storeTranslations.en;

  useEffect(() => {
    const refreshSettings = () => setStoreSettings(readSettings());
    const refreshCategories = () => setCategories(readCategories());
    const refreshCart = () => setCartCount(readCartCount());

    const refreshAll = () => {
      refreshSettings();
      refreshCategories();
      refreshCart();
    };

    window.addEventListener("storage", refreshAll);
    window.addEventListener("storeSettingsUpdated", refreshSettings);
    window.addEventListener(
      "vetClinicCategoriesUpdated",
      refreshCategories
    );
    window.addEventListener("cartUpdated", refreshCart);

    return () => {
      window.removeEventListener("storage", refreshAll);
      window.removeEventListener(
        "storeSettingsUpdated",
        refreshSettings
      );
      window.removeEventListener(
        "vetClinicCategoriesUpdated",
        refreshCategories
      );
      window.removeEventListener("cartUpdated", refreshCart);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir =
      language === "ar" ? "rtl" : "ltr";

    const syncLanguage = (event) => {
      setLanguageState(event.detail || getStoreLanguage());
    };

    window.addEventListener("storeLanguageChanged", syncLanguage);
    return () =>
      window.removeEventListener(
        "storeLanguageChanged",
        syncLanguage
      );
  }, [language]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 700) setMobileOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeMenus = () => {
    setCategoriesOpen(false);
    setAccountOpen(false);
    setMobileOpen(false);
  };

  const goTo = (path) => {
    closeMenus();
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const changeLanguage = (nextLanguage) => {
    setLanguageState(nextLanguage);
    setStoreLanguage(nextLanguage);
    closeMenus();
  };

  const chooseCategory = (category) => {
    if (category === null) {
      goTo("/products");
      return;
    }
    goTo(`/products?category=${encodeURIComponent(category)}`);
  };

  const brandName =
    storeSettings.storeName?.trim() || "Pet Store";

  const colors =
    storeSettings.storeColors || DEFAULT_STORE_COLORS;

  const headerColors = {
    "--shx-primary": colors.primaryColor || "#1aa6a6",
    "--shx-secondary": colors.secondaryColor || "#11797b",
    "--shx-light": colors.lightColor || "#e8f7f7",
    "--shx-border": colors.borderColor || "#dcebea",
  };

  return (
    <>
      <style>{`
        .shx-header,
        .shx-header *,
        .shx-header *::before,
        .shx-header *::after {
          box-sizing: border-box;
        }

        .shx-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          min-height: 84px;
          padding: 0 24px;
          gap: 16px;
          background: var(--shx-primary);
          color: #fff;
          box-shadow: 0 7px 25px rgba(0,0,0,.09);
          font-family: inherit;
          direction: ltr;
        }

        .shx-header button {
          font-family: inherit;
          letter-spacing: normal;
          line-height: normal;
        }

        /* LOGO */
        .shx-logo {
          display: flex;
          align-items: center;
          flex: 0 1 185px;
          min-width: 105px;
          max-width: 185px;
          gap: 10px;
          padding: 0;
          margin: 0;
          border: 0;
          background: transparent;
          color: #fff;
          text-align: left;
          cursor: pointer;
        }

        .shx-logo-icon {
          flex-shrink: 0;
          font-size: 29px;
        }

        .shx-logo-image {
          display: block;
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          max-width: 48px;
          max-height: 48px;
          object-fit: cover;
          border-radius: 10px;
        }

        .shx-logo-text {
          min-width: 0;
          color: #fff;
          font-size: 18px;
          font-weight: 800;
          line-height: 1.2;
          overflow-wrap: anywhere;
        }

        /* CENTER NAVIGATION */
        .shx-nav {
          position: static;
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          align-items: center;
          justify-content: center;
          flex: 0 1 auto;
          width: auto;
          min-width: 0;
          height: auto;
          padding: 0;
          margin: 0;
          gap: 18px;
          background: transparent;
          box-shadow: none;
        }

        .shx-nav-link {
          position: relative;
          display: inline-flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: auto;
          min-width: 0;
          height: 42px;
          gap: 6px;
          padding: 0;
          margin: 0;
          border: 0;
          border-radius: 0;
          background: transparent;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          cursor: pointer;
        }

        .shx-nav-link svg {
          flex-shrink: 0;
          font-size: 12px;
        }

        .shx-chevron {
          font-size: 9px !important;
          transition: transform .2s;
        }

        .shx-chevron.open {
          transform: rotate(180deg);
        }

        /* DROPDOWNS */
        .shx-category-wrapper,
        .shx-account-wrapper {
          position: relative;
          flex-shrink: 0;
        }

        .shx-category-menu,
        .shx-account-menu {
          position: absolute;
          z-index: 1300;
          display: flex;
          flex-direction: column;
          padding: 8px;
          background: #fff;
          color: #344054;
          border: 1px solid var(--shx-border);
          border-radius: 14px;
          box-shadow: 0 18px 45px rgba(0,0,0,.15);
        }

        .shx-category-menu {
          top: calc(100% + 12px);
          left: 50%;
          width: 240px;
          max-height: min(65vh,480px);
          overflow-y: auto;
          transform: translateX(-50%);
        }

        .shx-menu-title {
          padding: 10px;
          color: #98a2b3;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .shx-category-menu button,
        .shx-account-menu button {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-start;
          width: 100%;
          min-height: 39px;
          gap: 10px;
          padding: 7px 9px;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: #475467;
          font-size: 12px;
          font-weight: 650;
          text-align: left;
          cursor: pointer;
          transition: background .2s ease, color .2s ease;
        }

        .shx-dropdown-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 30px;
          height: 30px;
          overflow: hidden;
          border-radius: 8px;
          background: var(--shx-light);
          color: var(--shx-primary);
        }

        .shx-category-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* RIGHT ACTIONS */
        .shx-actions {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-end;
          flex: 0 1 310px;
          min-width: 0;
          gap: 8px;
        }

        .shx-language {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          height: 36px;
          gap: 5px;
          padding: 0 10px;
          border: 1px solid rgba(255,255,255,.35);
          border-radius: 20px;
          background: rgba(255,255,255,.1);
          white-space: nowrap;
          transition: background .2s ease, border-color .2s ease;
        }

        .shx-language:hover {
          background: var(--shx-secondary);
          border-color: var(--shx-light);
        }

        .shx-language button {
          padding: 0;
          border: 0;
          background: transparent;
          color: rgba(255,255,255,.65);
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
          transition: color .2s ease;
        }

        .shx-language button:hover {
          color: var(--shx-light);
        }

        .shx-language button.active {
          color: #fff;
        }

        .shx-language span {
          color: rgba(255,255,255,.4);
        }

        .shx-icon-button,
        .shx-mobile-toggle {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          padding: 0;
          border: 1px solid rgba(255,255,255,.32);
          border-radius: 50%;
          background: rgba(255,255,255,.12);
          color: #fff;
          cursor: pointer;
          transition: background .2s ease, border-color .2s ease;
        }

        .shx-cart-count {
          position: absolute;
          top: -5px;
          right: -4px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 19px;
          height: 19px;
          padding: 0 4px;
          border: 2px solid var(--shx-primary);
          border-radius: 20px;
          background: #fff;
          color: var(--shx-secondary);
          font-size: 10px;
          font-weight: 800;
        }

        .shx-account-button {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          min-height: 42px;
          gap: 9px;
          padding: 5px 12px;
          border: 1px solid rgba(255,255,255,.32);
          border-radius: 24px;
          background: rgba(255,255,255,.12);
          color: #fff;
          white-space: nowrap;
          cursor: pointer;
          transition: background .2s ease, border-color .2s ease;
        }

        .shx-account-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 29px;
          height: 29px;
          border-radius: 50%;
          background: #fff;
          color: var(--shx-primary);
        }

        .shx-account-text {
          font-size: 11px;
          font-weight: 750;
        }

        .shx-account-menu {
          top: calc(100% + 9px);
          right: 0;
          width: 195px;
        }

        .shx-account-menu button svg {
          color: var(--shx-primary);
        }

        .shx-account-menu button.logout,
        .shx-account-menu button.logout svg {
          color: #d92d20;
        }

        .shx-mobile-toggle {
          display: none;
        }

        /* SMALLER DESKTOP */
        @media (max-width: 1250px) and (min-width: 701px) {
          .shx-header {
            padding: 0 14px;
            gap: 9px;
          }

          .shx-logo {
            flex: 0 1 145px;
            min-width: 95px;
            gap: 7px;
          }

          .shx-logo-text { font-size: 15px; }
          .shx-logo-icon { font-size: 25px; }
          .shx-logo-image { width: 40px; height: 40px; }
          .shx-nav { gap: 10px; }
          .shx-nav-link { gap: 4px; font-size: 11px; }
          .shx-actions { flex: 0 1 275px; gap: 5px; }
          .shx-icon-button { width: 36px; height: 36px; }
          .shx-account-button { gap: 6px; padding: 4px 8px; }
        }

        @media (max-width: 1000px) and (min-width: 701px) {
          .shx-header { padding: 0 10px; gap: 6px; }
          .shx-logo {
            flex: 0 1 112px;
            min-width: 75px;
            gap: 5px;
          }

          .shx-logo-text { font-size: 12px; }
          .shx-logo-icon { font-size: 21px; }
          .shx-logo-image { width: 32px; height: 32px; }
          .shx-nav { gap: 6px; }
          .shx-nav-link { gap: 3px; font-size: 10px; }
          .shx-nav-link svg { font-size: 10px; }
          .shx-actions { flex: 0 1 220px; gap: 4px; }
          .shx-language { height: 30px; gap: 3px; padding: 0 5px; }
          .shx-language button { font-size: 9px; }
          .shx-icon-button { width: 31px; height: 31px; }
          .shx-account-button {
            min-height: 32px;
            gap: 4px;
            padding: 3px 5px;
          }
          .shx-account-avatar { width: 23px; height: 23px; }
          .shx-account-text { font-size: 9px; }
        }

        /* MOBILE */
        @media (max-width: 700px) {
          .shx-header {
            min-height: 70px;
            padding: 10px 12px;
            gap: 8px;
          }

          .shx-logo {
            flex: 1 1 auto;
            min-width: 0;
          }

          .shx-logo-text { font-size: 13px; }
          .shx-logo-image { width: 36px; height: 36px; }

          .shx-actions {
            flex: 0 0 auto;
            gap: 5px;
          }

          .shx-nav {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            display: none;
            flex-direction: column;
            align-items: stretch;
            width: 100%;
            max-height: calc(100vh - 70px);
            overflow-y: auto;
            padding: 12px 20px 18px;
            gap: 2px;
            background: var(--shx-primary);
            box-shadow: 0 16px 25px rgba(0,0,0,.12);
          }

          .shx-nav.mobile-open { display: flex; }

          .shx-nav-link {
            justify-content: flex-start;
            width: 100%;
            height: 42px;
            padding: 0 12px;
            font-size: 12px;
          }

          .shx-category-menu {
            position: static;
            width: 100%;
            max-height: 250px;
            margin: 4px 0 8px;
            transform: none;
          }

          .shx-mobile-toggle { display: flex; }
          .shx-language { height: 32px; padding: 0 6px; }

          .shx-icon-button,
          .shx-mobile-toggle {
            width: 34px;
            height: 34px;
          }

          .shx-account-button {
            width: 34px;
            height: 34px;
            min-height: 34px;
            padding: 0;
          }

          .shx-account-avatar {
            width: 22px;
            height: 22px;
          }

          .shx-account-text,
          .shx-account-chevron {
            display: none;
          }

          .shx-account-menu { width: 185px; }
        }

        @media (max-width: 390px) {
          .shx-logo-text {
            max-width: 70px;
            font-size: 11px;
          }

          .shx-language { padding: 0 4px; gap: 3px; }
          .shx-actions { gap: 4px; }

          .shx-icon-button,
          .shx-mobile-toggle,
          .shx-account-button {
            width: 30px;
            height: 30px;
          }
        }

        /* REMOVE NAVBAR HOVER COMPLETELY */
        .shx-header .shx-nav-link,
        .shx-header .shx-nav-link:hover,
        .shx-header .shx-nav-link:focus,
        .shx-header .shx-nav-link:active {
          background: transparent !important;
          background-color: transparent !important;
          color: #fff !important;
          opacity: 1 !important;
          box-shadow: none !important;
          border: 0 !important;
          transform: none !important;
          filter: none !important;
          text-decoration: none !important;
        }

        .shx-header .shx-nav-link svg,
        .shx-header .shx-nav-link span,
        .shx-header .shx-nav-link:hover svg,
        .shx-header .shx-nav-link:hover span {
          color: inherit !important;
          background: transparent !important;
          opacity: 1 !important;
        }

        /* KEEP HOVER ON ACTION BUTTONS */
        .shx-header .shx-icon-button:hover,
        .shx-header .shx-mobile-toggle:hover,
        .shx-header .shx-account-button:hover {
          background: var(--shx-secondary) !important;
          border-color: var(--shx-light) !important;
          color: #fff !important;
        }

        /* KEEP DROPDOWN HOVER */
        .shx-header .shx-category-menu button:hover,
        .shx-header .shx-account-menu button:hover {
          background: var(--shx-light) !important;
          color: var(--shx-secondary) !important;
        }
        /* DISABLE LOGO HOVER ONLY */

.shx-header .shx-logo:hover {
  background: transparent !important;
  color: #fff !important;
  box-shadow: none !important;
  transform: none !important;
  filter: none !important;
  opacity: 1 !important;
}

.shx-header .shx-logo:hover .shx-logo-text,
.shx-header .shx-logo:hover .shx-logo-icon,
.shx-header .shx-logo:hover .shx-logo-image {
  transform: none !important;
  filter: none !important;
  opacity: 1 !important;
}
      `}</style>

      <header className="shx-header" style={headerColors}>
        {/* LOGO */}
        <button
          type="button"
          className="shx-logo"
          onClick={() => goTo("/store")}
          aria-label={`${brandName} home`}
        >
          {storeSettings.storeBanner ? (
            <img
              src={storeSettings.storeBanner}
              alt={`${brandName} logo`}
              className="shx-logo-image"
            />
          ) : (
            <FaPaw className="shx-logo-icon" />
          )}

          <span className="shx-logo-text">{brandName}</span>
        </button>

        {/* CENTER NAVIGATION */}
        <nav
          className={`shx-nav ${mobileOpen ? "mobile-open" : ""}`}
          aria-label="Store navigation"
        >
          <button
            type="button"
            className="shx-nav-link"
            onClick={() => goTo("/store")}
          >
            <FaHome />
            <span>{t.home || "Home"}</span>
          </button>

          {/* CATEGORIES */}
          <div className="shx-category-wrapper">
            <button
              type="button"
              className="shx-nav-link"
              aria-expanded={categoriesOpen}
              onClick={() => {
                setCategoriesOpen((previous) => !previous);
                setAccountOpen(false);
              }}
            >
              <FaBoxOpen />
              <span>{t.categories || "Categories"}</span>
              <FaChevronDown
                className={`shx-chevron ${
                  categoriesOpen ? "open" : ""
                }`}
              />
            </button>

            {categoriesOpen && (
              <div className="shx-category-menu">
                <div className="shx-menu-title">
                  {language === "ar"
                    ? "تسوق حسب الفئة"
                    : "Shop by Category"}
                </div>

                <button
                  type="button"
                  onClick={() => chooseCategory(null)}
                >
                  <span className="shx-dropdown-icon">
                    <FaBoxOpen />
                  </span>
                  <span>
                    {language === "ar"
                      ? "كل المنتجات"
                      : "All Products"}
                  </span>
                </button>

                {categories.map((category) => (
                  <button
                    type="button"
                    key={category.id}
                    onClick={() => chooseCategory(category.title)}
                  >
                    <span className="shx-dropdown-icon">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.title}
                          className="shx-category-image"
                        />
                      ) : (
                        <FaPaw />
                      )}
                    </span>
                    <span>{category.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ABOUT */}
          <button
            type="button"
            className="shx-nav-link"
            onClick={() => goTo("/about")}
          >
            <FaInfoCircle />
            <span>{t.aboutUs || "About Us"}</span>
          </button>

          {/* CONTACT */}
          <button
            type="button"
            className="shx-nav-link"
            onClick={() => goTo("/contact")}
          >
            <FaEnvelope />
            <span>{t.contactUs || "Contact Us"}</span>
          </button>
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="shx-actions">
          {/* LANGUAGE */}
          <div className="shx-language">
            <button
              type="button"
              className={language === "en" ? "active" : ""}
              onClick={() => changeLanguage("en")}
            >
              EN
            </button>

            <span>/</span>

            <button
              type="button"
              className={language === "ar" ? "active" : ""}
              onClick={() => changeLanguage("ar")}
            >
              عربي
            </button>
          </div>

          {/* ORDERS */}
          <button
            type="button"
            className="shx-icon-button"
            title="My Orders"
            aria-label="My Orders"
            onClick={() => goTo("/orders")}
          >
            <FaClipboardList />
          </button>

          {/* CART */}
          <button
            type="button"
            className="shx-icon-button"
            title="Shopping Cart"
            aria-label="Shopping Cart"
            onClick={() => goTo("/cart")}
          >
            <FaShoppingCart />

            {cartCount > 0 && (
              <span className="shx-cart-count">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>

          {/* ACCOUNT */}
          <div className="shx-account-wrapper">
            <button
              type="button"
              className="shx-account-button"
              aria-expanded={accountOpen}
              onClick={() => {
                setAccountOpen((previous) => !previous);
                setCategoriesOpen(false);
              }}
            >
              <span className="shx-account-avatar">
                <FaUser />
              </span>

              <span className="shx-account-text">
                {language === "ar" ? "حسابي" : "My Account"}
              </span>

              <FaChevronDown
                className={`shx-chevron shx-account-chevron ${
                  accountOpen ? "open" : ""
                }`}
              />
            </button>

            {accountOpen && (
              <div className="shx-account-menu">
                <button
                  type="button"
                  onClick={() => goTo("/orders")}
                >
                  <FaClipboardList />
                  <span>
                    {language === "ar" ? "طلباتي" : "My Orders"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/cart")}
                >
                  <FaShoppingCart />
                  <span>
                    {language === "ar" ? "سلة التسوق" : "My Cart"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/settings")}
                >
                  <FaCog />
                  <span>
                    {language === "ar" ? "الإعدادات" : "Settings"}
                  </span>
                </button>

                <button
                  type="button"
                  className="logout"
                  onClick={() => goTo("/")}
                >
                  <FaSignOutAlt />
                  <span>
                    {language === "ar"
                      ? "تسجيل الخروج"
                      : "Logout"}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <button
            type="button"
            className="shx-mobile-toggle"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => {
              setMobileOpen((previous) => !previous);
              setCategoriesOpen(false);
              setAccountOpen(false);
            }}
          >
            {mobileOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </header>
    </>
  );
}

export default StoreHeader;
