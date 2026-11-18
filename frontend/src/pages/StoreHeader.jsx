import { useEffect, useState } from "react";
import {
  useNavigate,
} from "react-router-dom";

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

import { getStoreCategories } from "../api/storeCategoriesApi";
import { getPublicStoreSettings } from "../api/storeSettingsApi";
import { storeTranslations } from "../translations/storeTranslations";

import {
  getStoreLanguage,
  setStoreLanguage,
} from "../translations/storeLanguage";

const DEFAULT_STORE_COLORS = {
  primaryColor: "#1aa6a6",
  secondaryColor: "#11797b",
  lightColor: "#e8f7f7",
  borderColor: "#dcebea",
};

function normalizeSettings(settings = {}) {
  const colors = { ...DEFAULT_STORE_COLORS };

  Object.keys(colors).forEach((key) => {
    const value = settings?.storeColors?.[key];

    if (
      typeof value === "string" &&
      /^#[0-9a-fA-F]{6}$/.test(value)
    ) {
      colors[key] = value;
    }
  });

  return {
    storeName:
      typeof settings.storeName === "string"
        ? settings.storeName
        : "",
    storeBanner:
      typeof settings.storeBanner === "string"
        ? settings.storeBanner
        : "",
    storeColors: colors,
  };
}

function readCartCount(clinicId) {
  try {
    const cart = JSON.parse(
      localStorage.getItem(
        `vetClinicStoreCart:${clinicId}`
      ) || "[]"
    );

    if (!Array.isArray(cart)) return 0;

    return cart.reduce((total, item) => {
      const quantity = Number(item?.quantity);

      if (
        !Number.isSafeInteger(quantity) ||
        quantity <= 0
      ) {
        return total;
      }

      if (
        item.clinicId != null &&
        Number(item.clinicId) !== Number(clinicId)
      ) {
        return total;
      }

      return total + quantity;
    }, 0);
  } catch {
    return 0;
  }
}

function StoreHeader({ clinicId, storeBasePath }) {
  const navigate = useNavigate();

  const [branding, setBranding] = useState(() => ({
    clinicId: String(clinicId),
    settings: normalizeSettings(),
  }));

  const storeSettings =
    branding.clinicId === String(clinicId)
      ? branding.settings
      : normalizeSettings();

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] =
    useState(true);
  const [categoriesError, setCategoriesError] =
    useState("");

  const [cartCount, setCartCount] = useState(() =>
    readCartCount(clinicId)
  );

  const [language, setLanguageState] =
    useState(getStoreLanguage);

  const [categoriesOpen, setCategoriesOpen] =
    useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const t =
    storeTranslations[language] || storeTranslations.en;

  useEffect(() => {
    let controller = null;
    let disposed = false;

    setBranding({
      clinicId: String(clinicId),
      settings: normalizeSettings(),
    });

    const loadSettings = async () => {
      controller?.abort();

      const currentController = new AbortController();
      controller = currentController;

      try {
        const result = await getPublicStoreSettings(
          clinicId,
          { signal: currentController.signal }
        );

        if (
          disposed ||
          currentController.signal.aborted
        ) {
          return;
        }

        setBranding({
          clinicId: String(clinicId),
          settings: normalizeSettings(result),
        });
      } catch {
        // Keep the current clinic's last loaded branding.
        // Initial loading uses the existing default colors.
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadSettings();
      }
    };

    loadSettings();

    window.addEventListener(
      "storeSettingsUpdated",
      loadSettings
    );
    window.addEventListener(
      "clinic-branding-updated",
      loadSettings
    );
    window.addEventListener("focus", loadSettings);
    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      disposed = true;
      controller?.abort();

      window.removeEventListener(
        "storeSettingsUpdated",
        loadSettings
      );
      window.removeEventListener(
        "clinic-branding-updated",
        loadSettings
      );
      window.removeEventListener("focus", loadSettings);
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [clinicId]);

  useEffect(() => {
    const refreshCart = () =>
      setCartCount(readCartCount(clinicId));

    const handleStorage = (event) => {
      if (
        event.key === null ||
        event.key === `vetClinicStoreCart:${clinicId}`
      ) {
        refreshCart();
      }
    };

    refreshCart();
    setCategoriesOpen(false);
    setAccountOpen(false);
    setMobileOpen(false);

    window.addEventListener("storage", handleStorage);
    window.addEventListener("cartUpdated", refreshCart);
    window.addEventListener("focus", refreshCart);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("cartUpdated", refreshCart);
      window.removeEventListener("focus", refreshCart);
    };
  }, [clinicId]);

  useEffect(() => {
    let controller = null;
    let disposed = false;

    const loadCategories = async () => {
      controller?.abort();

      const currentController = new AbortController();
      controller = currentController;

      setCategoriesLoading(true);

      try {
        const result = await getStoreCategories(clinicId, {
          signal: currentController.signal,
        });

        if (
          disposed ||
          currentController.signal.aborted
        ) {
          return;
        }

        setCategories(result);
        setCategoriesError("");
      } catch (exception) {
        if (
          disposed ||
          currentController.signal.aborted
        ) {
          return;
        }

        setCategoriesError(
          exception.message || "Unable to load categories."
        );
      } finally {
        if (
          !disposed &&
          !currentController.signal.aborted
        ) {
          setCategoriesLoading(false);
        }
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadCategories();
      }
    };

    setCategories([]);
    setCategoriesError("");
    loadCategories();

    window.addEventListener(
      "vetClinicCategoriesUpdated",
      loadCategories
    );
    window.addEventListener("focus", loadCategories);
    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      disposed = true;
      controller?.abort();

      window.removeEventListener(
        "vetClinicCategoriesUpdated",
        loadCategories
      );
      window.removeEventListener("focus", loadCategories);
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [clinicId]);

  useEffect(() => {
    const previousLanguage = document.documentElement.lang;
    const previousDirection = document.documentElement.dir;

    document.documentElement.lang = language;
    document.documentElement.dir =
      language === "ar" ? "rtl" : "ltr";

    return () => {
      document.documentElement.lang = previousLanguage;
      document.documentElement.dir = previousDirection;
    };
  }, [language]);

  useEffect(() => {
    const syncLanguage = () =>
      setLanguageState(getStoreLanguage());

    window.addEventListener(
      "storeLanguageChanged",
      syncLanguage
    );

    return () => {
      window.removeEventListener(
        "storeLanguageChanged",
        syncLanguage
      );
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 700) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () =>
      window.removeEventListener("resize", handleResize);
  }, []);

  const closeMenus = () => {
    setCategoriesOpen(false);
    setAccountOpen(false);
    setMobileOpen(false);
  };

  const goTo = (path) => {
    closeMenus();

    let destination = path;

    if (path === "/store") {
      destination = storeBasePath;
    } else if (
      path === "/about" ||
      path === "/contact" ||
      path === "/cart" ||
      path === "/orders" ||
      path === "/products" ||
      path.startsWith("/products?")
    ) {
      destination = `${storeBasePath}${path}`;
    }

    navigate(destination);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const changeLanguage = (nextLanguage) => {
    if (!["en", "ar"].includes(nextLanguage)) return;

    setLanguageState(nextLanguage);
    setStoreLanguage(nextLanguage);
    closeMenus();
  };

  const chooseCategory = (category) => {
    goTo(
      category === null
        ? "/products"
        : `/products?category=${encodeURIComponent(category)}`
    );
  };

  const brandName =
    storeSettings.storeName.trim() || "Pet Store";

  const colors = storeSettings.storeColors;

  const headerColors = {
    "--shx-primary": colors.primaryColor,
    "--shx-secondary": colors.secondaryColor,
    "--shx-light": colors.lightColor,
    "--shx-border": colors.borderColor,
  };

  return (
    <>
      <style>{headerStyles}</style>

      <header className="shx-header" style={headerColors}>
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

        <nav
          className={`shx-nav ${
            mobileOpen ? "mobile-open" : ""
          }`}
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

                {categoriesLoading &&
                  categories.length === 0 && (
                    <div
                      className="shx-menu-title"
                      role="status"
                    >
                      {language === "ar"
                        ? "جارٍ تحميل الفئات..."
                        : "Loading categories..."}
                    </div>
                  )}

                {categoriesError && (
                  <div
                    className="shx-menu-title"
                    role="alert"
                  >
                    {language === "ar"
                      ? "تعذّر تحميل الفئات. أعيدي المحاولة لاحقًا."
                      : "Unable to load categories. Please try again later."}
                  </div>
                )}

                {categories.map((category) => (
                  <button
                    type="button"
                    key={category.id}
                    onClick={() =>
                      chooseCategory(category.title)
                    }
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

          <button
            type="button"
            className="shx-nav-link"
            onClick={() => goTo("/about")}
          >
            <FaInfoCircle />
            <span>{t.aboutUs || "About Us"}</span>
          </button>

          <button
            type="button"
            className="shx-nav-link"
            onClick={() => goTo("/contact")}
          >
            <FaEnvelope />
            <span>{t.contactUs || "Contact Us"}</span>
          </button>
        </nav>

        <div className="shx-actions">
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

          <button
            type="button"
            className="shx-icon-button"
            title="My Orders"
            aria-label="My Orders"
            onClick={() => goTo("/orders")}
          >
            <FaClipboardList />
          </button>

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

          <button
            type="button"
            className="shx-mobile-toggle"
            aria-label={
              mobileOpen ? "Close menu" : "Open menu"
            }
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

export default StoreHeader;const headerStyles = `
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
  font-family: Arial, Helvetica, sans-serif;
  direction: ltr;
}

.shx-header button {
  font-family: inherit;
  letter-spacing: normal;
  line-height: normal;
}

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

@media (max-width:1250px) and (min-width:701px) {
  .shx-header { padding:0 14px; gap:9px; }
  .shx-logo { flex:0 1 145px; min-width:95px; gap:7px; }
  .shx-logo-text { font-size:15px; }
  .shx-logo-icon { font-size:25px; }
  .shx-logo-image { width:40px; height:40px; }
  .shx-nav { gap:10px; }
  .shx-nav-link { gap:4px; font-size:11px; }
  .shx-actions { flex:0 1 275px; gap:5px; }
  .shx-icon-button { width:36px; height:36px; }
  .shx-account-button { gap:6px; padding:4px 8px; }
}

@media (max-width:1000px) and (min-width:701px) {
  .shx-header { padding:0 10px; gap:6px; }
  .shx-logo { flex:0 1 112px; min-width:75px; gap:5px; }
  .shx-logo-text { font-size:12px; }
  .shx-logo-icon { font-size:21px; }
  .shx-logo-image { width:32px; height:32px; }
  .shx-nav { gap:6px; }
  .shx-nav-link { gap:3px; font-size:10px; }
  .shx-nav-link svg { font-size:10px; }
  .shx-actions { flex:0 1 220px; gap:4px; }
  .shx-language { height:30px; gap:3px; padding:0 5px; }
  .shx-language button { font-size:9px; }
  .shx-icon-button { width:31px; height:31px; }
  .shx-account-button {
    min-height:32px;
    gap:4px;
    padding:3px 5px;
  }
  .shx-account-avatar { width:23px; height:23px; }
  .shx-account-text { font-size:9px; }
}

@media (max-width:700px) {
  .shx-header {
    min-height:70px;
    padding:10px 12px;
    gap:8px;
  }

  .shx-logo { flex:1 1 auto; min-width:0; }
  .shx-logo-text { font-size:13px; }
  .shx-logo-image { width:36px; height:36px; }
  .shx-actions { flex:0 0 auto; gap:5px; }

  .shx-nav {
    position:absolute;
    top:100%;
    left:0;
    right:0;
    display:none;
    flex-direction:column;
    align-items:stretch;
    width:100%;
    max-height:calc(100vh - 70px);
    overflow-y:auto;
    padding:12px 20px 18px;
    gap:2px;
    background:var(--shx-primary);
    box-shadow:0 16px 25px rgba(0,0,0,.12);
  }

  .shx-nav.mobile-open { display:flex; }

  .shx-nav-link {
    justify-content:flex-start;
    width:100%;
    height:42px;
    padding:0 12px;
    font-size:12px;
  }

  .shx-category-menu {
    position:static;
    width:100%;
    max-height:250px;
    margin:4px 0 8px;
    transform:none;
  }

  .shx-mobile-toggle { display:flex; }
  .shx-language { height:32px; padding:0 6px; }

  .shx-icon-button,
  .shx-mobile-toggle {
    width:34px;
    height:34px;
  }

  .shx-account-button {
    width:34px;
    height:34px;
    min-height:34px;
    padding:0;
  }

  .shx-account-avatar { width:22px; height:22px; }

  .shx-account-text,
  .shx-account-chevron {
    display:none;
  }

  .shx-account-menu { width:185px; }
}

@media (max-width:390px) {
  .shx-logo-text {
    max-width:70px;
    font-size:11px;
  }

  .shx-language { padding:0 4px; gap:3px; }
  .shx-actions { gap:4px; }

  .shx-icon-button,
  .shx-mobile-toggle,
  .shx-account-button {
    width:30px;
    height:30px;
  }
}

.shx-header .shx-nav-link,
.shx-header .shx-nav-link:hover,
.shx-header .shx-nav-link:focus,
.shx-header .shx-nav-link:active {
  background:transparent!important;
  background-color:transparent!important;
  color:#fff!important;
  opacity:1!important;
  box-shadow:none!important;
  border:0!important;
  transform:none!important;
  filter:none!important;
  text-decoration:none!important;
}

.shx-header .shx-nav-link svg,
.shx-header .shx-nav-link span,
.shx-header .shx-nav-link:hover svg,
.shx-header .shx-nav-link:hover span {
  color:inherit!important;
  background:transparent!important;
  opacity:1!important;
}

.shx-header .shx-icon-button:hover,
.shx-header .shx-mobile-toggle:hover,
.shx-header .shx-account-button:hover {
  background:var(--shx-secondary)!important;
  border-color:var(--shx-light)!important;
  color:#fff!important;
}

.shx-header .shx-category-menu button:hover,
.shx-header .shx-account-menu button:hover {
  background:var(--shx-light)!important;
  color:var(--shx-secondary)!important;
}

.shx-header .shx-logo:hover {
  background:transparent!important;
  color:#fff!important;
  box-shadow:none!important;
  transform:none!important;
  filter:none!important;
  opacity:1!important;
}

.shx-header .shx-logo:hover .shx-logo-text,
.shx-header .shx-logo:hover .shx-logo-icon,
.shx-header .shx-logo:hover .shx-logo-image {
  transform:none!important;
  filter:none!important;
  opacity:1!important;
}
`;