
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaUser,
  FaBoxOpen,
  FaChevronDown,
  FaPaw,
  FaClipboardList,
  FaSignOutAlt,
  FaCog,
  FaHome,
  FaInfoCircle,
  FaEnvelope,
  FaBars,
  FaTimes,
} from "react-icons/fa";

import { storeTranslations } from "../translations/storeTranslations";
import {
  getStoreLanguage,
  setStoreLanguage,
} from "../translations/storeLanguage";

const DEFAULT_CATEGORIES = [
  "Food",
  "Care",
  "Hygiene",
  "Accessories",
  "Supplements",
  "Grooming",
  "Toys",
  "Treats",
  "Beds",
  "Bowls",
  "Dental Care",
  "Pet Essentials",
].map((title, index) => ({
  id: index + 1,
  title,
  description: "",
  image: null,
  sortOrder: index + 1,
}));

const readCategories = () => {
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
};

const readSettings = () => {
  try {
    const saved = JSON.parse(
      localStorage.getItem("storeSettings") || "{}"
    );

    return {
      storeName: saved.storeName || "",
      storeBanner: saved.storeBanner || null,
    };
  } catch (error) {
    console.error("Settings error:", error);
    return { storeName: "", storeBanner: null };
  }
};

const readCartCount = () => {
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
};

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

    window.addEventListener(
      "storeLanguageChanged",
      syncLanguage
    );

    return () =>
      window.removeEventListener(
        "storeLanguageChanged",
        syncLanguage
      );
  }, [language]);

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

    goTo(
      `/products?category=${encodeURIComponent(category)}`
    );
  };

  const brandName =
    storeSettings.storeName?.trim() || "Pet Store";

  return (
    <>
      <style>{`
        .store-header {
          --sh-teal: #1aa6a6;
          --sh-dark: #11797b;
          --sh-light: #e8f7f7;
          --sh-border: #dcebea;

          position: sticky;
          top: 0;
          z-index: 1000;
          width: 100%;
          min-height: 84px;
          padding: 0 4%;
          display: grid;
          grid-template-columns:
            minmax(190px, 1fr)
            auto
            minmax(260px, 1fr);
          align-items: center;
          gap: 24px;
          background: var(--sh-teal);
          box-shadow: 0 7px 25px rgba(17,121,123,.14);
          box-sizing: border-box;
        }

        .store-header *,
        .store-header *::before,
        .store-header *::after {
          box-sizing: border-box;
        }

        .store-logo {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          width: fit-content;
          max-width: 100%;
          min-width: 0;
          padding: 0;
          border: 0;
          background: transparent;
          color: white;
          cursor: pointer;
          text-align: start;
        }

        .store-header .store-header-logo-image {
          display: block;
          width: 60px !important;
          height: 60px !important;
          min-width: 60px;
          min-height: 60px;
          max-width: 60px;
          max-height: 60px;
          flex-shrink: 0;
          object-fit: cover;
          object-position: center;
          border-radius: 12px !important;
          overflow: hidden;
        }

        .store-logo-icon {
          font-size: 29px;
          flex-shrink: 0;
        }

        .store-logo-text {
          color: white;
          font-size: 19px;
          font-weight: 800;
          letter-spacing: -.4px;
          line-height: 1.2;
          overflow-wrap: anywhere;
        }

        .store-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 27px;
          height: 84px;
        }

        .store-nav-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          height: 48px;
          padding: 0;
          border: 0;
          background: transparent !important;
          color: rgba(255,255,255,.91);
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
          cursor: pointer;
          transition: color .2s;
        }

        .store-nav-link:hover {
          color: white;
        }

        .store-nav-link svg {
          font-size: 12px;
        }

        .store-nav-link::after {
          content: "";
          position: absolute;
          bottom: 5px;
          left: 50%;
          width: 0;
          height: 2px;
          border-radius: 4px;
          background: white;
          transform: translateX(-50%);
          transition: width .2s;
        }

        .store-nav-link:hover::after {
          width: 100%;
        }

        .store-category-dropdown,
        .store-account-wrapper {
          position: relative;
        }

        .store-nav-chevron {
          font-size: 9px !important;
          transition: transform .2s;
        }

        .store-nav-chevron.open,
        .store-account-chevron.open {
          transform: rotate(180deg);
        }

        .store-category-menu,
        .store-account-menu {
          position: absolute;
          z-index: 1300;
          padding: 8px;
          background: white;
          border: 1px solid var(--sh-border);
          border-radius: 14px;
          box-shadow: 0 18px 45px rgba(13,102,104,.17);
          color: #344054;
        }

        .store-category-menu {
          top: calc(100% + 14px);
          left: 50%;
          width: 240px;
          max-height: min(65vh, 480px);
          overflow-y: auto;
          transform: translateX(-50%);
          scrollbar-width: thin;
        }

        .store-category-menu-title {
          position: sticky;
          top: -8px;
          z-index: 1;
          padding: 10px;
          background: white;
          color: #98a2b3;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .store-category-menu button,
        .store-account-menu button {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          min-height: 39px;
          padding: 7px 9px;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: #475467;
          text-align: start;
          font-size: 12px;
          font-weight: 650;
          cursor: pointer;
        }

        .store-category-menu button:hover,
        .store-account-menu button:hover {
          background: var(--sh-light);
          color: var(--sh-dark);
        }

        .store-dropdown-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 30px;
          height: 30px;
          overflow: hidden;
          border-radius: 8px;
          background: var(--sh-light);
          color: var(--sh-teal);
        }

        .store-dropdown-category-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .store-header-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
        }

        .store-language-switcher {
          display: flex;
          align-items: center;
          gap: 5px;
          height: 36px;
          padding: 0 10px;
          border: 1px solid rgba(255,255,255,.35);
          border-radius: 20px;
          background: rgba(255,255,255,.1);
        }

        .store-language-switcher button {
          padding: 0;
          border: 0;
          background: transparent;
          color: rgba(255,255,255,.65);
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
        }

        .store-language-switcher button.active {
          color: white;
        }

        .store-language-switcher span {
          color: rgba(255,255,255,.4);
        }

        .store-icon-button,
        .store-mobile-toggle {
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
          color: white;
          cursor: pointer;
        }

        .store-icon-button:hover,
        .store-mobile-toggle:hover {
          background: rgba(255,255,255,.23);
        }

        .store-cart-count {
          position: absolute;
          top: -5px;
          right: -4px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 19px;
          height: 19px;
          padding: 0 4px;
          border: 2px solid var(--sh-teal);
          border-radius: 20px;
          background: white;
          color: var(--sh-dark);
          font-size: 10px;
          font-weight: 800;
        }

        .store-account-button {
          display: flex;
          align-items: center;
          gap: 9px;
          min-height: 42px;
          padding: 5px 12px;
          border: 1px solid rgba(255,255,255,.32);
          border-radius: 24px;
          background: rgba(255,255,255,.12);
          color: white;
          cursor: pointer;
        }

        .store-account-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 29px;
          height: 29px;
          border-radius: 50%;
          background: white;
          color: var(--sh-teal);
        }

        .store-account-text {
          font-size: 11px;
          font-weight: 750;
          white-space: nowrap;
        }

        .store-account-chevron {
          font-size: 9px;
          transition: transform .2s;
        }

        .store-account-menu {
          top: calc(100% + 9px);
          right: 0;
          width: 195px;
        }

        .store-account-menu button svg {
          color: var(--sh-teal);
        }

        .store-account-menu button.logout,
        .store-account-menu button.logout svg {
          color: #d92d20;
        }

        .store-mobile-toggle {
          display: none;
        }

        @media (max-width: 1200px) {
          .store-header {
            padding: 0 2.5%;
            gap: 15px;
            grid-template-columns:
              minmax(155px, 1fr)
              auto
              minmax(215px, 1fr);
          }

          .store-nav {
            gap: 16px;
          }

          .store-logo-text {
            font-size: 16px;
          }
        }

        @media (max-width: 1000px) {
          .store-header {
            min-height: 70px;
            padding: 10px 20px;
            grid-template-columns: minmax(0,1fr) auto;
            gap: 12px;
          }

          .store-nav {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            display: none;
            flex-direction: column;
            align-items: stretch;
            gap: 2px;
            height: auto;
            padding: 12px 20px 18px;
            background: var(--sh-teal);
            box-shadow: 0 16px 25px rgba(0,0,0,.12);
          }

          .store-nav.mobile-open {
            display: flex;
          }

          .store-nav-link {
            justify-content: flex-start;
            width: 100%;
            height: 42px;
            padding: 0 12px;
          }

          .store-nav-link::after {
            display: none;
          }

          .store-category-menu {
            position: static;
            width: 100%;
            max-height: 250px;
            margin: 4px 0 8px;
            transform: none;
          }

          .store-mobile-toggle {
            display: flex;
          }
        }

        @media (max-width: 560px) {
          .store-header {
            padding: 10px 12px;
            gap: 8px;
          }

          .store-header .store-header-logo-image {
            width: 38px !important;
            height: 38px !important;
            min-width: 38px;
            min-height: 38px;
            max-width: 38px;
            max-height: 38px;
            border-radius: 10px !important;
          }

          .store-logo {
            gap: 7px;
          }

          .store-logo-text {
            font-size: 13px;
          }

          .store-header-actions {
            gap: 5px;
          }

          .store-language-switcher {
            height: 32px;
            padding: 0 6px;
          }

          .store-icon-button,
          .store-mobile-toggle {
            width: 34px;
            height: 34px;
          }

          .store-account-button {
            width: 34px;
            height: 34px;
            min-height: 34px;
            padding: 0;
            justify-content: center;
          }

          .store-account-avatar {
            width: 22px;
            height: 22px;
          }

          .store-account-text,
          .store-account-chevron {
            display: none;
          }

          .store-account-menu {
            right: 0;
            width: 185px;
          }
        }

        html[dir="rtl"] .store-account-menu {
          right: auto;
          left: 0;
        }

        html[dir="rtl"] .store-nav-link {
          text-align: right;
        }
      `}</style>

      {/* PART 2 CONTINUES HERE */}

      <header className="store-header">
        {/* LOGO + STORE NAME */}
        <button
          type="button"
          className="store-logo"
          onClick={() => goTo("/store")}
          aria-label={`${brandName} home`}
        >
          {storeSettings.storeBanner ? (
            <img
              src={storeSettings.storeBanner}
              alt={`${brandName} logo`}
              className="store-header-logo-image"
            />
          ) : (
            <FaPaw className="store-logo-icon" />
          )}

          <span className="store-logo-text">
            {brandName}
          </span>
        </button>

        {/* NAVIGATION */}
        <nav
          className={`store-nav ${
            mobileOpen ? "mobile-open" : ""
          }`}
          aria-label="Store navigation"
        >
          {/* 1. HOME */}
          <button
            type="button"
            className="store-nav-link home"
            onClick={() => goTo("/store")}
          >
            <FaHome />
            <span>{t.home || "Home"}</span>
          </button>

          {/* 2. CATEGORIES */}
          <div className="store-category-dropdown">
            <button
              type="button"
              className="store-nav-link"
              aria-expanded={categoriesOpen}
              onClick={() => {
                setCategoriesOpen(!categoriesOpen);
                setAccountOpen(false);
              }}
            >
              <FaBoxOpen />
              <span>{t.categories || "Categories"}</span>
              <FaChevronDown
                className={`store-nav-chevron ${
                  categoriesOpen ? "open" : ""
                }`}
              />
            </button>

            {categoriesOpen && (
              <div className="store-category-menu">
                <div className="store-category-menu-title">
                  {language === "ar"
                    ? "تسوق حسب الفئة"
                    : "Shop by Category"}
                </div>

                <button
                  type="button"
                  onClick={() => chooseCategory(null)}
                >
                  <span className="store-dropdown-icon">
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
                    onClick={() =>
                      chooseCategory(category.title)
                    }
                  >
                    <span className="store-dropdown-icon">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.title}
                          className="store-dropdown-category-image"
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

          {/* 3. ABOUT US */}
          <button
            type="button"
            className="store-nav-link"
            onClick={() => goTo("/about")}
          >
            <FaInfoCircle />
            <span>{t.aboutUs || "About Us"}</span>
          </button>

          {/* 4. CONTACT US */}
          <button
            type="button"
            className="store-nav-link"
            onClick={() => goTo("/contact")}
          >
            <FaEnvelope />
            <span>{t.contactUs || "Contact Us"}</span>
          </button>
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="store-header-actions">
          {/* LANGUAGE */}
          <div className="store-language-switcher">
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
            className="store-icon-button"
            title="My Orders"
            aria-label="My Orders"
            onClick={() => goTo("/orders")}
          >
            <FaClipboardList />
          </button>

          {/* CART */}
          <button
            type="button"
            className="store-icon-button"
            title="Shopping Cart"
            aria-label="Shopping Cart"
            onClick={() => goTo("/cart")}
          >
            <FaShoppingCart />

            {cartCount > 0 && (
              <span className="store-cart-count">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>

          {/* ACCOUNT */}
          <div className="store-account-wrapper">
            <button
              type="button"
              className="store-account-button"
              aria-expanded={accountOpen}
              onClick={() => {
                setAccountOpen(!accountOpen);
                setCategoriesOpen(false);
              }}
            >
              <span className="store-account-avatar">
                <FaUser />
              </span>

              <span className="store-account-text">
                {language === "ar"
                  ? "حسابي"
                  : "My Account"}
              </span>

              <FaChevronDown
                className={`store-account-chevron ${
                  accountOpen ? "open" : ""
                }`}
              />
            </button>

            {accountOpen && (
              <div className="store-account-menu">
                <button
                  type="button"
                  onClick={() => goTo("/orders")}
                >
                  <FaClipboardList />
                  <span>
                    {language === "ar"
                      ? "طلباتي"
                      : "My Orders"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/cart")}
                >
                  <FaShoppingCart />
                  <span>
                    {language === "ar"
                      ? "سلة التسوق"
                      : "My Cart"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/settings")}
                >
                  <FaCog />
                  <span>
                    {language === "ar"
                      ? "الإعدادات"
                      : "Settings"}
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

          {/* MOBILE HAMBURGER */}
          <button
            type="button"
            className="store-mobile-toggle"
            aria-label={
              mobileOpen ? "Close menu" : "Open menu"
            }
            aria-expanded={mobileOpen}
            onClick={() => {
              setMobileOpen(!mobileOpen);
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
