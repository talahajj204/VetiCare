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
} from "react-icons/fa";

import { storeTranslations } from "../translations/storeTranslations";

import {
  getStoreLanguage,
  setStoreLanguage,
} from "../translations/storeLanguage";

/* =========================================================
   DEFAULT CATEGORIES
   These are used only if localStorage is empty.
   After that, Categories.jsx controls everything.
========================================================= */

const DEFAULT_CATEGORIES = [
  {
    id: 1,
    title: "Food",
    description: "",
    image: null,
    sortOrder: 1,
  },
  {
    id: 2,
    title: "Care",
    description: "",
    image: null,
    sortOrder: 2,
  },
  {
    id: 3,
    title: "Hygiene",
    description: "",
    image: null,
    sortOrder: 3,
  },
  {
    id: 4,
    title: "Accessories",
    description: "",
    image: null,
    sortOrder: 4,
  },
  {
    id: 5,
    title: "Supplements",
    description: "",
    image: null,
    sortOrder: 5,
  },
  {
    id: 6,
    title: "Grooming",
    description: "",
    image: null,
    sortOrder: 6,
  },
  {
    id: 7,
    title: "Toys",
    description: "",
    image: null,
    sortOrder: 7,
  },
  {
    id: 8,
    title: "Treats",
    description: "",
    image: null,
    sortOrder: 8,
  },
  {
    id: 9,
    title: "Beds",
    description: "",
    image: null,
    sortOrder: 9,
  },
  {
    id: 10,
    title: "Bowls",
    description: "",
    image: null,
    sortOrder: 10,
  },
  {
    id: 11,
    title: "Dental Care",
    description: "",
    image: null,
    sortOrder: 11,
  },
  {
    id: 12,
    title: "Pet Essentials",
    description: "",
    image: null,
    sortOrder: 12,
  },
];

/* =========================================================
   LOAD CATEGORIES
========================================================= */

const loadStoredCategories = () => {
  try {
    const savedCategories =
      localStorage.getItem(
        "vetClinicCategories"
      );

    if (savedCategories) {
      const parsedCategories =
        JSON.parse(savedCategories);

      if (
        Array.isArray(parsedCategories) &&
        parsedCategories.length > 0
      ) {
        return [...parsedCategories].sort(
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
    console.error(
      "Could not load categories:",
      error
    );

    return DEFAULT_CATEGORIES;
  }
};

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

  /*
    IMPORTANT:
    Categories are NOT hardcoded anymore.

    They come from:

    Admin
      → Inventory
      → Categories
      → vetClinicCategories
      → Store Header
  */

  const [categories, setCategories] =
    useState(() =>
      loadStoredCategories()
    );

  /* =========================================================
     LOAD CATEGORIES
  ========================================================= */

  useEffect(() => {
    const loadCategories = () => {
      const loadedCategories =
        loadStoredCategories();

      setCategories(
        [...loadedCategories].sort(
          (a, b) =>
            Number(a.sortOrder || 0) -
            Number(b.sortOrder || 0)
        )
      );
    };

    loadCategories();

    /*
      "storage":
      updates when localStorage changes
      from another tab/window.

      "vetClinicCategoriesUpdated":
      updates immediately in the same tab
      after Add / Edit / Delete.
    */

    window.addEventListener(
      "storage",
      loadCategories
    );

    window.addEventListener(
      "vetClinicCategoriesUpdated",
      loadCategories
    );

    return () => {
      window.removeEventListener(
        "storage",
        loadCategories
      );

      window.removeEventListener(
        "vetClinicCategoriesUpdated",
        loadCategories
      );
    };
  }, []);

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

  /* =========================================================
     ABOUT US PAGE
  ========================================================= */

  const goToAbout = () => {
    setCategoriesOpen(false);

    setAccountOpen(false);

    navigate("/about");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =========================================================
     CONTACT US PAGE
  ========================================================= */

  const goToContact = () => {
    setCategoriesOpen(false);

    setAccountOpen(false);

    navigate("/contact");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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

          width: 240px;

          /*
            All categories remain available.

            If the admin adds many categories,
            the menu becomes scrollable instead
            of hiding them.
          */

          max-height:
            calc(100vh - 110px);

          overflow-y: auto;

          overflow-x: hidden;

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

          scrollbar-width: thin;

          scrollbar-color:
            #b7dcda transparent;
        }

        .store-category-menu::-webkit-scrollbar {
          width: 6px;
        }

        .store-category-menu::-webkit-scrollbar-track {
          background: transparent;
        }

        .store-category-menu::-webkit-scrollbar-thumb {
          background: #b7dcda;

          border-radius: 20px;
        }

        .store-category-menu::-webkit-scrollbar-thumb:hover {
          background: #8bc8c5;
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

          position: sticky;

          top: -8px;

          z-index: 2;

          background: #ffffff;
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

          overflow: hidden;
        }

        /*
          If a category has an image uploaded
          from Categories.jsx, show it here.
        */

        .store-dropdown-category-image {
          width: 100%;
          height: 100%;

          display: block;

          object-fit: cover;
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
          min-width: 135px;
          height: 42px;

          padding: 0 14px;

          border:
            1px solid
            rgba(255,255,255,0.32);

          border-radius: 22px;

          background:
            rgba(255,255,255,0.12);

          color: #ffffff;

          display: flex;

          align-items: center;

          justify-content: center;

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

          flex-shrink: 0;

          font-size: 12px;
        }

        .store-account-text {
          font-size: 10px;

          font-weight: 750;

          white-space: nowrap;
        }

        .store-account-chevron {
          font-size: 7px;

          transition:
            transform 0.2s ease;
        }

        .store-account-chevron.open {
          transform:
            rotate(180deg);
        }

        .store-account-menu {
          position: absolute;

          top: 51px;

          right: 0;

          width: 190px;

          padding: 8px;

          border:
            1px solid
            var(--border);

          border-radius: 13px;

          background: #ffffff;

          box-shadow:
            0 18px 45px
            rgba(13,102,104,0.16);

          z-index: 1300;
        }

        .store-account-menu button {
          width: 100%;

          min-height: 40px;

          padding: 7px 10px;

          border: none;

          border-radius: 8px;

          background: transparent;

          color: #475467;

          display: flex;

          align-items: center;

          gap: 10px;

          text-align: left;

          font-size: 10px;

          font-weight: 650;

          cursor: pointer;

          transition:
            background 0.18s ease,
            color 0.18s ease;
        }

        .store-account-menu button svg {
          width: 15px;

          color: var(--teal);

          font-size: 12px;
        }

        .store-account-menu button:hover {
          background:
            var(--teal-light);

          color:
            var(--teal-dark);
        }

        .store-account-menu button.logout {
          margin-top: 4px;

          border-top:
            1px solid #edf2f2;

          border-radius:
            0 0 8px 8px;

          color: #d92d20;
        }

        .store-account-menu button.logout svg {
          color: #d92d20;
        }        /* =====================================================
        RTL
     ===================================================== */

     html[dir="rtl"] .store-category-menu button,
     html[dir="rtl"] .store-account-menu button {
       text-align: right;
     }

     html[dir="rtl"] .store-nav-chevron {
       margin-left: 0;
       margin-right: 2px;
     }

     html[dir="rtl"] .store-account-menu {
       right: auto;
       left: 0;
     }

     html[dir="rtl"] .store-header-logo-image {
       object-position: right center;
     }

     /* =====================================================
        RESPONSIVE
     ===================================================== */

     @media (max-width: 1200px) {
       .store-header {
         padding: 0 2.5%;

         grid-template-columns:
           minmax(130px, 1fr)
           auto
           minmax(220px, 1fr);

         gap: 18px;
       }

       .store-nav {
         gap: 20px;
       }

       .store-account-button {
         min-width: 115px;
         padding: 0 10px;
       }
     }

     @media (max-width: 1000px) {
       .store-header {
         min-height: auto;

         padding: 12px 20px;

         grid-template-columns:
           1fr auto;

         grid-template-areas:
           "logo actions"
           "nav nav";

         gap: 10px 20px;
       }

       .store-logo {
         grid-area: logo;
         height: 55px;
       }

       .store-header-actions {
         grid-area: actions;
       }

       .store-nav {
         grid-area: nav;

         width: 100%;
         height: 50px;

         gap: 30px;
       }

       .store-nav-link,
       .store-category-dropdown {
         height: 50px;
       }

       .store-nav-link::after {
         bottom: 3px;
       }

       .store-category-menu {
         top: 47px;

         max-height:
           calc(100vh - 160px);
       }
     }

     @media (max-width: 720px) {
       .store-header {
         padding: 10px 14px;

         grid-template-columns:
           1fr;

         grid-template-areas:
           "logo"
           "actions"
           "nav";
       }

       .store-logo {
         width: 100%;

         justify-content: center;
       }

       .store-header-logo-image {
         max-width: 160px;
       }

       .store-header-actions {
         width: 100%;

         justify-content: center;

         flex-wrap: wrap;
       }

       .store-nav {
         width: 100%;

         overflow-x: auto;

         justify-content:
           flex-start;

         gap: 22px;

         scrollbar-width: none;
       }

       .store-nav::-webkit-scrollbar {
         display: none;
       }

       .store-nav-link {
         flex-shrink: 0;
       }

       .store-category-dropdown {
         flex-shrink: 0;
       }

       .store-category-menu {
         position: fixed;

         top: auto;

         left: 50%;

         width:
           min(
             92vw,
             340px
           );

         max-height: 65vh;

         transform:
           translateX(-50%);
       }

       .store-category-menu::before {
         display: none;
       }
     }

     @media (max-width: 480px) {
       .store-language-switcher {
         height: 34px;
       }

       .store-icon-button {
         width: 38px;
         height: 38px;
       }

       .store-account-button {
         min-width: auto;

         width: 42px;
         height: 42px;

         padding: 0;

         border-radius: 50%;
       }

       .store-account-text,
       .store-account-chevron {
         display: none;
       }

       .store-account-avatar {
         width: auto;
         height: auto;

         background: transparent;

         color: #ffffff;
       }

       .store-account-menu {
         position: fixed;

         top: auto;

         right: 4%;

         width: 190px;
       }

       html[dir="rtl"] .store-account-menu {
         right: auto;
         left: 4%;
       }
     }
   `}</style>

   {/* =====================================================
       HEADER
   ===================================================== */}

   <header className="store-header">

     {/* =================================================
         LOGO
     ================================================== */}

     <div
       className="store-logo"
       onClick={goHome}
       role="button"
       tabIndex={0}
       onKeyDown={(event) => {
         if (
           event.key === "Enter" ||
           event.key === " "
         ) {
           goHome();
         }
       }}
     >
       {storeSettings.storeBanner ? (
         <img
           src={
             storeSettings.storeBanner
           }
           alt={
             storeSettings.storeName ||
             "Store"
           }
           className="store-header-logo-image"
         />
       ) : (
         <div className="store-logo-fallback">
           <FaPaw className="store-logo-icon" />

           <span className="store-logo-text">
             {storeSettings.storeName ||
               "Pet Store"}
           </span>
         </div>
       )}
     </div>

     {/* =================================================
         NAVIGATION
     ================================================== */}

     <nav className="store-nav">

       {/* HOME */}

       <button
         type="button"
         className="store-nav-link home"
         onClick={goHome}
       >
         <FaHome />

         <span>
           {t.home || "Home"}
         </span>
       </button>

       {/* ABOUT */}

       <button
         type="button"
         className="store-nav-link"
         onClick={goToAbout}
       >
         <FaInfoCircle />

         <span>
           {t.aboutUs ||
             "About Us"}
         </span>
       </button>

       {/* =============================================
           DYNAMIC CATEGORIES
       ============================================== */}

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
             {t.categories ||
               "Categories"}
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
               {language === "ar"
                 ? "تسوق حسب الفئة"
                 : "Shop by Category"}
             </div>

             {/* ALL PRODUCTS */}

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

               <span>
                 {language === "ar"
                   ? "كل المنتجات"
                   : "All Products"}
               </span>
             </button>

             {/* =========================================
                 CATEGORIES FROM Categories.jsx

                 No hardcoded category names here.

                 Add Category:
                 appears automatically.

                 Edit Category:
                 updates automatically.

                 Delete Category:
                 disappears automatically.
             ========================================== */}

             {categories.map(
               (category) => {
                 const categoryName =
                   String(
                     category.title ||
                       category.name ||
                       ""
                   ).trim();

                 if (!categoryName) {
                   return null;
                 }

                 return (
                   <button
                     type="button"
                     key={
                       category.id ||
                       categoryName
                     }
                     onClick={() =>
                       chooseCategory(
                         categoryName
                       )
                     }
                   >
                     <span className="store-dropdown-icon">
                       {category.image ? (
                         <img
                           src={
                             category.image
                           }
                           alt={
                             categoryName
                           }
                           className="store-dropdown-category-image"
                         />
                       ) : (
                         <FaPaw />
                       )}
                     </span>

                     <span>
                       {categoryName}
                     </span>
                   </button>
                 );
               }
             )}
           </div>
         )}
       </div>

       {/* CONTACT */}

       <button
         type="button"
         className="store-nav-link"
         onClick={goToContact}
       >
         <FaEnvelope />

         <span>
           {t.contactUs ||
             "Contact Us"}
         </span>
       </button>
     </nav>

     {/* =================================================
         RIGHT SIDE
     ================================================== */}

     <div className="store-header-actions">

       {/* ===============================================
           LANGUAGE
       ================================================ */}

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

       {/* ===============================================
           ORDERS
       ================================================ */}

       <button
         type="button"
         className="store-icon-button"
         title={
           language === "ar"
             ? "طلباتي"
             : "My Orders"
         }
         onClick={() => {
           setCategoriesOpen(false);

           setAccountOpen(false);

           navigate("/orders");
         }}
       >
         <FaClipboardList />
       </button>

       {/* ===============================================
           CART
       ================================================ */}

       <button
         type="button"
         className="store-icon-button"
         title={
           t.cart || "Cart"
         }
         onClick={openCart}
       >
         <FaShoppingCart />

         {cartCount > 0 && (
           <span className="store-cart-count">
             {cartCount > 99
               ? "99+"
               : cartCount}
           </span>
         )}
       </button>

       {/* ===============================================
           ACCOUNT
       ================================================ */}

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

           <span className="store-account-text">
             {language === "ar"
               ? "حسابي"
               : "My Account"}
           </span>

           <FaChevronDown
             className={`store-account-chevron ${
               accountOpen
                 ? "open"
                 : ""
             }`}
           />
         </button>

         {accountOpen && (
           <div className="store-account-menu">

             {/* MY ORDERS */}

             <button
               type="button"
               onClick={() => {
                 setAccountOpen(
                   false
                 );

                 navigate(
                   "/orders"
                 );
               }}
             >
               <FaClipboardList />

               <span>
                 {language === "ar"
                   ? "طلباتي"
                   : "My Orders"}
               </span>
             </button>

             {/* MY ACCOUNT */}

             <button
               type="button"
               onClick={() => {
                 setAccountOpen(
                   false
                 );

                 navigate(
                   "/account"
                 );
               }}
             >
               <FaUser />

               <span>
                 {language === "ar"
                   ? "حسابي"
                   : "My Account"}
               </span>
             </button>

             {/* ACCOUNT SETTINGS */}

             <button
               type="button"
               onClick={() => {
                 setAccountOpen(
                   false
                 );

                 navigate(
                   "/account/settings"
                 );
               }}
             >
               <FaCog />

               <span>
                 {language === "ar"
                   ? "الإعدادات"
                   : "Settings"}
               </span>
             </button>

             {/* LOGOUT */}

             <button
               type="button"
               className="logout"
               onClick={
                 handleLogout
               }
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
     </div>
   </header>
 </>
);
}

export default StoreHeader;