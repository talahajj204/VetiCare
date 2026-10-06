import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaShoppingCart,
  FaUser,
  FaBoxOpen,
  FaChevronDown,
  FaPaw,
  FaBone,
  FaPumpSoap,
  FaCapsules,
  FaDog,
  FaClipboardList,
  FaSignOutAlt,
  FaCog,
  FaHome,
  FaInfoCircle,
  FaEnvelope,
} from "react-icons/fa";

import { storeTranslations } from "../translations/storeTranslations";

import {
  getStoreLanguage,
  setStoreLanguage,
} from "../translations/storeLanguage";


/* =========================================================
   CATEGORIES
========================================================= */

const CATEGORY_ITEMS = [
  {
    name: "Food",
    translationKey: "food",
    icon: <FaBone />,
  },
  {
    name: "Care",
    translationKey: "care",
    icon: <FaPaw />,
  },
  {
    name: "Hygiene",
    translationKey: "hygiene",
    icon: <FaPumpSoap />,
  },
  {
    name: "Accessories",
    translationKey: "accessories",
    icon: <FaDog />,
  },
  {
    name: "Supplements",
    translationKey: "supplements",
    icon: <FaCapsules />,
  },
  {
    name: "Grooming",
    translationKey: "grooming",
    icon: <FaPumpSoap />,
  },
];


/* =========================================================
   STORE HEADER
========================================================= */

function StoreHeader() {
  const navigate = useNavigate();

  const [categoriesOpen, setCategoriesOpen] =
    useState(false);

  const [accountOpen, setAccountOpen] =
    useState(false);

  const [storeSettings, setStoreSettings] =
    useState({
      storeName: "",
      storeBanner: null,
    });

  const [cartCount, setCartCount] =
    useState(0);


  /* =========================================================
     LANGUAGE
  ========================================================= */

  const [language, setLanguageState] =
    useState(() => getStoreLanguage());

  const t =
    storeTranslations[language] ||
    storeTranslations.en;


  useEffect(() => {
    document.documentElement.lang =
      language;

    document.documentElement.dir =
      language === "ar"
        ? "rtl"
        : "ltr";

    const handleLanguageChange = (
      event
    ) => {
      const newLanguage =
        event.detail ||
        getStoreLanguage();

      setLanguageState(newLanguage);
    };

    window.addEventListener(
      "storeLanguageChanged",
      handleLanguageChange
    );

    return () => {
      window.removeEventListener(
        "storeLanguageChanged",
        handleLanguageChange
      );
    };
  }, [language]);


  const changeLanguage = (
    newLanguage
  ) => {
    setLanguageState(newLanguage);

    setStoreLanguage(newLanguage);

    setCategoriesOpen(false);
    setAccountOpen(false);
  };


  /* =========================================================
     LOAD STORE SETTINGS
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
            storeBanner: null,
          });

          return;
        }

        const settings =
          JSON.parse(saved);

        setStoreSettings({
          storeName:
            settings.storeName || "",

          storeBanner:
            settings.storeBanner ||
            null,
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
     LOAD CART COUNT
  ========================================================= */

  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart =
          localStorage.getItem(
            "vetClinicStoreCart"
          );

        if (!savedCart) {
          setCartCount(0);
          return;
        }

        const cart =
          JSON.parse(savedCart);

        const count =
          Array.isArray(cart)
            ? cart.reduce(
                (total, item) =>
                  total +
                  (item.quantity || 0),
                0
              )
            : 0;

        setCartCount(count);
      } catch (error) {
        console.error(
          "Could not load cart:",
          error
        );

        setCartCount(0);
      }
    };

    loadCart();

    window.addEventListener(
      "storage",
      loadCart
    );

    window.addEventListener(
      "cartUpdated",
      loadCart
    );

    return () => {
      window.removeEventListener(
        "storage",
        loadCart
      );

      window.removeEventListener(
        "cartUpdated",
        loadCart
      );
    };
  }, []);


  /* =========================================================
     NAVIGATION
  ========================================================= */

  const goHome = () => {
    setCategoriesOpen(false);
    setAccountOpen(false);

    navigate("/store");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  const goToAbout = () => {
    setCategoriesOpen(false);
    setAccountOpen(false);

    navigate("/store");

    setTimeout(() => {
      document
        .getElementById(
          "store-about"
        )
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 100);
  };


  const goToContact = () => {
    setCategoriesOpen(false);
    setAccountOpen(false);

    navigate("/store");

    setTimeout(() => {
      document
        .getElementById(
          "store-contact-anchor"
        )
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 100);
  };


  const chooseCategory = (
    categoryName
  ) => {
    setCategoriesOpen(false);
    setAccountOpen(false);

    if (
      categoryName ===
      "All categories"
    ) {
      navigate("/products");
      return;
    }

    navigate(
      `/products?category=${encodeURIComponent(
        categoryName
      )}`
    );
  };


  const openCart = () => {
    setCategoriesOpen(false);
    setAccountOpen(false);

    navigate("/cart");
  };


  const handleLogout = () => {
    setAccountOpen(false);
    setCategoriesOpen(false);

    navigate("/");
  };


  return (
    <>
      <style>{`

        /* =====================================================
           HEADER VARIABLES
        ===================================================== */

        .store-header {
          --teal: #1aa6a6;
          --teal-dark: #11797b;
          --teal-deep: #0d6668;
          --teal-light: #e8f7f7;
          --border: #dcebea;
          --text: #263b4f;

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

          background: var(--teal);

          border-bottom:
            1px solid
            rgba(255,255,255,0.18);

          box-shadow:
            0 7px 25px
            rgba(17,121,123,0.14);

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

          object-position: left center;

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
            rgba(255,255,255,0.88);

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
            rgba(13,102,104,0.16);

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

        .store-category-menu button:hover {
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

          justify-content:
            flex-end;

          gap: 10px;
        }


        /* =====================================================
           LANGUAGE SWITCHER
        ===================================================== */

        .store-language-switcher {
          height: 36px;

          padding: 0 10px;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 5px;

          border:
            1px solid
            rgba(255,255,255,0.35);

          border-radius: 20px;

          background:
            rgba(255,255,255,0.10);

          white-space: nowrap;
        }

        .store-language-switcher button {
          padding: 0;

          border: none;

          outline: none;

          background: transparent;

          color:
            rgba(255,255,255,0.65);

          font-size: 10px;

          font-weight: 800;

          cursor: pointer;

          transition:
            color 0.2s ease,
            transform 0.2s ease;
        }

        .store-language-switcher button:hover {
          color: #ffffff;
        }

        .store-language-switcher button.active {
          color: #ffffff;
        }

        .store-language-switcher button:hover {
          transform:
            translateY(-1px);
        }

        .store-language-switcher span {
          color:
            rgba(255,255,255,0.4);

          font-size: 10px;
        }


        /* =====================================================
           ICON BUTTON
        ===================================================== */

        .store-icon-button {
          width: 42px;

          height: 42px;

          padding: 0;

          border:
            1px solid
            rgba(255,255,255,0.32);

          border-radius: 50%;

          background:
            rgba(255,255,255,0.12);

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
            rgba(255,255,255,0.23);

          border-color:
            rgba(255,255,255,0.65);

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

          color:
            var(--teal-dark);

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
            rgba(255,255,255,0.32);

          border-radius: 24px;

          background:
            rgba(255,255,255,0.12);

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
            rgba(255,255,255,0.23);

          border-color:
            rgba(255,255,255,0.65);

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

          top:
            calc(100% + 12px);

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
            rgba(16,24,40,0.14);

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
           ARABIC RTL
        ===================================================== */

        html[dir="rtl"] .store-header-logo-image {
          object-position: right center;
        }

        html[dir="rtl"] .store-nav-chevron {
          margin-left: 0;
          margin-right: 2px;
        }

        html[dir="rtl"] .store-account-menu {
          right: auto;
          left: 0;
        }

        html[dir="rtl"] .store-category-menu button,
        html[dir="rtl"] .store-account-menu button {
          text-align: right;
        }

        html[dir="rtl"] .store-cart-count {
          right: auto;
          left: -4px;
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

          .store-header-actions {
            gap: 7px;
          }

          .store-language-switcher {
            padding: 0 8px;
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
            grid-column:
              1 / -1;

            width: 100%;

            height: 55px;

            justify-content:
              center;

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
        }


        @media (max-width: 760px) {

          .store-account-name,
          .store-account-arrow {
            display: none;
          }

          .store-account-button {
            width: 42px;

            padding: 0;

            justify-content:
              center;
          }

          .store-account-avatar {
            width: 30px;

            height: 30px;
          }

          .store-language-switcher {
            height: 34px;

            padding: 0 7px;
          }

          .store-language-switcher button {
            font-size: 9px;
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
            gap: 5px;
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

          .store-language-switcher {
            height: 32px;

            padding: 0 6px;

            gap: 4px;
          }

          .store-language-switcher button {
            font-size: 8px;
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
        }

      `}</style>


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="store-header">


        {/* LOGO */}

        <div
          className="store-logo"
          onClick={goHome}
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
            onClick={goHome}
          >
            <FaHome />

            <span>
              {t.home}
            </span>
          </button>


          <button
            type="button"
            className="store-nav-link"
            onClick={goToAbout}
          >
            <FaInfoCircle />

            <span>
              {t.about}
            </span>
          </button>


          {/* CATEGORIES */}

          <div className="store-category-dropdown">

            <button
              type="button"
              className="store-nav-link"
              onClick={() => {
                setCategoriesOpen(
                  (current) =>
                    !current
                );

                setAccountOpen(false);
              }}
            >
              <FaBoxOpen />

              <span>
                {t.categories}
              </span>

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
                  {t.shopByCategory}
                </div>


                <button
                  type="button"
                  onClick={() =>
                    chooseCategory(
                      "All categories"
                    )
                  }
                >
                  <span className="store-dropdown-icon">
                    <FaBoxOpen />
                  </span>

                  {t.allProducts}
                </button>


                {CATEGORY_ITEMS.map(
                  (item) => (
                    <button
                      type="button"
                      key={item.name}
                      onClick={() =>
                        chooseCategory(
                          item.name
                        )
                      }
                    >
                      <span className="store-dropdown-icon">
                        {item.icon}
                      </span>

                      {
                        t[
                          item.translationKey
                        ]
                      }
                    </button>
                  )
                )}

              </div>
            )}

          </div>


          <button
            type="button"
            className="store-nav-link"
            onClick={goToContact}
          >
            <FaEnvelope />

            <span>
              {t.contact}
            </span>
          </button>

        </nav>


        {/* HEADER ACTIONS */}

        <div className="store-header-actions">


          {/* LANGUAGE */}

          <div className="store-language-switcher">

            <button
              type="button"
              className={
                language === "en"
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeLanguage("en")
              }
            >
              EN
            </button>

            <span>|</span>

            <button
              type="button"
              className={
                language === "ar"
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeLanguage("ar")
              }
            >
              عربي
            </button>

          </div>


          {/* ORDERS */}

          <button
            type="button"
            className="store-icon-button"
            title={t.myOrders}
            onClick={() =>
              navigate("/orders")
            }
          >
            <FaClipboardList />
          </button>


          {/* CART */}

          <button
            type="button"
            className="store-icon-button"
            title={t.cart}
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
                {t.myAccount}
              </span>

              <FaChevronDown className="store-account-arrow" />
            </button>


            {accountOpen && (
              <div className="store-account-menu">

                <div className="store-account-menu-header">

                  <strong>
                    {t.myAccount}
                  </strong>

                  <span>
                    {language === "ar"
                      ? "إدارة حساب المتجر"
                      : "Manage your store account"}
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

                  {t.myOrders}
                </button>


                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen(false);

                    navigate("/owners");
                  }}
                >
                  <FaUser />

                  {language === "ar"
                    ? "المالكون"
                    : "Owners"}
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

                  {t.settings}
                </button>


                <button
                  type="button"
                  className="logout"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt />

                  {t.logout}
                </button>

              </div>
            )}

          </div>

        </div>

      </header>
    </>
  );
}

export default StoreHeader;