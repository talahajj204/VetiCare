import {
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FaChartLine,
  FaUserCog,
  FaClipboard,
  FaCashRegister,
  FaBoxOpen,
  FaTags,
  FaClipboardList,
} from "react-icons/fa";

import {
  FaHouse,
  FaUsers,
  FaPaw,
  FaCalendarDays,
  FaNotesMedical,
  FaSyringe,
  FaBell,
  FaPills,
  FaPrescriptionBottleMedical,
  FaBoxesStacked,
  FaFileInvoiceDollar,
  FaChartColumn,
  FaGear,
  FaRightFromBracket,
  FaBars,
  FaXmark,
  FaChevronDown,
  FaChevronRight,
  FaArrowTrendUp,
  FaArrowTrendDown,
} from "react-icons/fa6";


function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const sidebarRef = useRef(null);

  const SIDEBAR_SCROLL_KEY =
    "vetClinicSidebarScroll";

  const isPOSPage =
    location.pathname === "/pos";


  // =========================================================
  // FINANCIAL
  // =========================================================

  const isFinancialPage =
    location.pathname === "/financial";

  const financialTab =
    new URLSearchParams(
      location.search
    ).get("tab");

  const isFinancialOverview =
    isFinancialPage && !financialTab;

  const isRevenuePage =
    isFinancialPage &&
    financialTab === "revenue";

  const isExpensesPage =
    isFinancialPage &&
    financialTab === "expenses";

  const [
    financialOpen,
    setFinancialOpen,
  ] = useState(isFinancialPage);

  useEffect(() => {
    if (isFinancialPage) {
      setFinancialOpen(true);
    }
  }, [isFinancialPage]);


  // =========================================================
  // INVENTORY
  // =========================================================

  const isInventoryPage =
    location.pathname.startsWith(
      "/inventory"
    );

  const isProductsPage =
    location.pathname ===
    "/inventory/products";

  const isCategoriesPage =
    location.pathname ===
    "/inventory/categories";

  const [
    inventoryOpen,
    setInventoryOpen,
  ] = useState(isInventoryPage);

  useEffect(() => {
    if (isInventoryPage) {
      setInventoryOpen(true);
    }
  }, [isInventoryPage]);


  // =========================================================
  // RESTORE SIDEBAR SCROLL
  // =========================================================

  useEffect(() => {
    const sidebar =
      sidebarRef.current;

    if (!sidebar) return;

    const savedScrollPosition =
      Number(
        sessionStorage.getItem(
          SIDEBAR_SCROLL_KEY
        ) || 0
      );

    const frame =
      requestAnimationFrame(() => {
        sidebar.scrollTop =
          savedScrollPosition;
      });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [
    location.pathname,
    location.search,
  ]);


  // =========================================================
  // SAVE SIDEBAR SCROLL
  // =========================================================

  const saveSidebarScroll = () => {
    const sidebar =
      sidebarRef.current;

    if (!sidebar) return;

    sessionStorage.setItem(
      SIDEBAR_SCROLL_KEY,
      String(sidebar.scrollTop)
    );
  };


  const handleSidebarScroll = () => {
    saveSidebarScroll();
  };


  // =========================================================
  // NORMAL NAVIGATION
  // =========================================================

  const handleNavigation = () => {
    saveSidebarScroll();

    setMenuOpen(false);
  };


  // =========================================================
  // FINANCIAL PARENT
  // =========================================================

  const handleFinancialParent = () => {
    saveSidebarScroll();

    if (!isFinancialOverview) {
      navigate("/financial");

      setFinancialOpen(true);

      setMenuOpen(false);

      return;
    }

    setFinancialOpen(
      (previous) => !previous
    );
  };


  // =========================================================
  // FINANCIAL CHILD
  // =========================================================

  const handleFinancialNavigation = (
    tab
  ) => {
    saveSidebarScroll();

    navigate(
      `/financial?tab=${tab}`
    );

    setFinancialOpen(true);

    setMenuOpen(false);
  };


  // =========================================================
  // INVENTORY PARENT
  // =========================================================

  const handleInventoryParent = () => {
    saveSidebarScroll();

    setInventoryOpen(
      (previous) => !previous
    );
  };


  // =========================================================
  // INVENTORY CHILD
  // =========================================================

  const handleInventoryNavigation = (
    page
  ) => {
    saveSidebarScroll();

    navigate(
      `/inventory/${page}`
    );

    setInventoryOpen(true);

    setMenuOpen(false);
  };


  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    sessionStorage.removeItem(
      SIDEBAR_SCROLL_KEY
    );

    setMenuOpen(false);

    navigate("/");
  };


  // =========================================================
  // MOBILE CLOSE
  // =========================================================

  const closeMenu = () => {
    saveSidebarScroll();

    setMenuOpen(false);
  };


  return (
    <>
      <style>{`

        /* =====================================================
           POS COLLAPSED SIDEBAR
        ===================================================== */

        .sidebar.sidebar-pos-collapsed {
          width: 72px !important;
          min-width: 72px !important;
          max-width: 72px !important;

          padding-left: 8px !important;
          padding-right: 8px !important;

          overflow-x: hidden;
        }


        .sidebar.sidebar-pos-collapsed
        .sidebar-logo {
          justify-content:
            center !important;

          padding-left: 0 !important;
          padding-right: 0 !important;
        }


        .sidebar.sidebar-pos-collapsed
        .sidebar-brand {
          width: 100%;

          display: flex;

          align-items: center;

          justify-content: center;
        }


        .sidebar.sidebar-pos-collapsed
        .sidebar-logo-icon {
          margin: 0 !important;

          font-size: 25px;
        }


        .sidebar.sidebar-pos-collapsed
        .sidebar-logo-text {
          display: none !important;
        }


        .sidebar.sidebar-pos-collapsed
        .sidebar-nav {
          width: 100%;
        }


        .sidebar.sidebar-pos-collapsed
        .sidebar-nav a,

        .sidebar.sidebar-pos-collapsed
        .financial-parent-button,

        .sidebar.sidebar-pos-collapsed
        .inventory-parent-button {
          width: 100% !important;

          min-width: 0 !important;

          height: 46px;

          margin: 4px 0 !important;

          padding: 0 !important;

          display: flex !important;

          align-items:
            center !important;

          justify-content:
            center !important;

          gap: 0 !important;

          border-radius: 9px;
        }


        .sidebar.sidebar-pos-collapsed
        .sidebar-nav
        a
        .sidebar-icon,

        .sidebar.sidebar-pos-collapsed
        .financial-parent-button
        .sidebar-icon,

        .sidebar.sidebar-pos-collapsed
        .inventory-parent-button
        .sidebar-icon {
          width: 18px !important;

          min-width: 18px !important;

          margin: 0 !important;

          font-size: 18px;
        }


        .sidebar.sidebar-pos-collapsed
        .sidebar-text,

        .sidebar.sidebar-pos-collapsed
        .financial-parent-arrow,

        .sidebar.sidebar-pos-collapsed
        .inventory-parent-arrow {
          display: none !important;
        }


        .sidebar.sidebar-pos-collapsed
        .sidebar-nav
        a.active {
          background: #2f7f7b;

          color: #ffffff;
        }


        .sidebar.sidebar-pos-collapsed
        .financial-parent-button.active,

        .sidebar.sidebar-pos-collapsed
        .inventory-parent-button.active {
          background: #2f7f7b;

          color: #ffffff;
        }


        .sidebar.sidebar-pos-collapsed
        .financial-submenu,

        .sidebar.sidebar-pos-collapsed
        .inventory-submenu {
          display: none !important;
        }


        .sidebar.sidebar-pos-collapsed
        .sidebar-logout {
          width: 100% !important;

          min-width: 0 !important;

          height: 46px;

          padding: 0 !important;

          margin: 0 !important;

          display: flex !important;

          align-items:
            center !important;

          justify-content:
            center !important;

          gap: 0 !important;

          border-radius: 9px;
        }


        .sidebar.sidebar-pos-collapsed
        .sidebar-logout
        .sidebar-icon {
          width: 18px !important;

          min-width: 18px !important;

          margin: 0 !important;

          font-size: 18px;
        }


        /* =====================================================
           FINANCIAL + INVENTORY PARENTS
        ===================================================== */

        .financial-sidebar-group,
        .inventory-sidebar-group {
          width: 100%;
        }


        .financial-parent-button,
        .inventory-parent-button {
          width: 100%;

          border: none;

          outline: none;

          background: transparent;

          color: inherit;

          font-family: inherit;

          cursor: pointer;

          display: flex;

          align-items: center;

          box-sizing: border-box;

          text-align: left;

          transition:
            background 0.18s ease,
            color 0.18s ease;
        }


        .financial-parent-button:hover,
        .inventory-parent-button:hover {
          background:
            rgba(
              255,
              255,
              255,
              0.12
            );
        }


        .financial-parent-button.active,
        .inventory-parent-button.active {
          background: #2f7f7b;

          color: #ffffff;
        }


        .financial-parent-arrow,
        .inventory-parent-arrow {
          margin-left: auto;

          width: 14px;

          min-width: 14px;

          font-size: 11px;

          display: flex;

          align-items: center;

          justify-content: center;
        }


        /* =====================================================
           FINANCIAL + INVENTORY SUBMENUS
        ===================================================== */

        .financial-submenu,
        .inventory-submenu {
          width: 100%;

          padding:
            4px 0 5px 0;

          display: flex;

          flex-direction: column;

          gap: 3px;

          box-sizing: border-box;
        }


        .financial-submenu-button,
        .inventory-submenu-button {
          width:
            calc(
              100% - 16px
            );

          min-height: 39px;

          margin-left: 16px;

          padding:
            8px 14px
            8px 44px;

          border: none;

          outline: none;

          border-radius: 8px;

          background: transparent;

          color: inherit;

          font-family: inherit;

          font-size: 13px;

          font-weight: 500;

          cursor: pointer;

          display: flex;

          align-items: center;

          gap: 9px;

          box-sizing: border-box;

          text-align: left;

          transition:
            background 0.18s ease,
            color 0.18s ease;
        }


        .financial-submenu-button svg,
        .inventory-submenu-button svg {
          width: 13px;

          min-width: 13px;

          font-size: 13px;
        }


        .financial-submenu-button:hover,
        .inventory-submenu-button:hover {
          background:
            rgba(
              255,
              255,
              255,
              0.12
            );
        }


        .financial-submenu-button.active,
        .inventory-submenu-button.active {
          background:
            rgba(
              47,
              127,
              123,
              0.75
            );

          color: #ffffff;

          font-weight: 700;
        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 768px) {

          .sidebar.sidebar-pos-collapsed {
            width:
              260px !important;

            min-width:
              260px !important;

            max-width:
              260px !important;

            padding-left:
              initial !important;

            padding-right:
              initial !important;
          }


          .sidebar.sidebar-pos-collapsed
          .sidebar-logo {
            justify-content:
              space-between !important;
          }


          .sidebar.sidebar-pos-collapsed
          .sidebar-brand {
            width: auto;

            justify-content:
              flex-start;
          }


          .sidebar.sidebar-pos-collapsed
          .sidebar-logo-text {
            display:
              block !important;
          }


          .sidebar.sidebar-pos-collapsed
          .sidebar-text,

          .sidebar.sidebar-pos-collapsed
          .financial-parent-arrow,

          .sidebar.sidebar-pos-collapsed
          .inventory-parent-arrow {
            display:
              flex !important;
          }


          .sidebar.sidebar-pos-collapsed
          .sidebar-nav a,

          .sidebar.sidebar-pos-collapsed
          .financial-parent-button,

          .sidebar.sidebar-pos-collapsed
          .inventory-parent-button {
            height: auto;

            padding:
              12px 16px !important;

            justify-content:
              flex-start !important;

            gap: 12px !important;
          }


          .sidebar.sidebar-pos-collapsed
          .financial-submenu,

          .sidebar.sidebar-pos-collapsed
          .inventory-submenu {
            display:
              flex !important;
          }


          .sidebar.sidebar-pos-collapsed
          .sidebar-logout {
            height: auto;

            padding:
              12px 16px !important;

            justify-content:
              flex-start !important;

            gap: 12px !important;
          }

        }

      `}</style>


      {/* MOBILE BUTTON */}

      <button
        className="mobile-menu-button"
        onClick={() =>
          setMenuOpen(true)
        }
        aria-label="Open menu"
      >
        <FaBars />
      </button>


      {/* MOBILE OVERLAY */}

      {menuOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeMenu}
        />
      )}


      {/* SIDEBAR */}

      <aside
        ref={sidebarRef}
        onScroll={
          handleSidebarScroll
        }
        className={`sidebar ${
          menuOpen
            ? "sidebar-open"
            : ""
        } ${
          isPOSPage
            ? "sidebar-pos-collapsed"
            : ""
        }`}
      >

        <div>


          {/* LOGO */}

          <div className="sidebar-logo">

            <div className="sidebar-brand">

              <FaPaw
                className="sidebar-logo-icon"
              />

              <h2 className="sidebar-logo-text">
                Vet Clinic
              </h2>

            </div>


            <button
              className="mobile-close-button"
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <FaXmark />
            </button>

          </div>


          {/* NAVIGATION */}

          <nav className="sidebar-nav">


            {/* DASHBOARD */}

            <NavLink
              to="/dashboard"
              onClick={
                handleNavigation
              }
              data-label="Dashboard"
              title={
                isPOSPage
                  ? "Dashboard"
                  : ""
              }
            >

              <FaHouse className="sidebar-icon" />

              <span className="sidebar-text">
                Dashboard
              </span>

            </NavLink>


            {/* OWNERS */}

            <NavLink
              to="/owners"
              onClick={
                handleNavigation
              }
              data-label="Owners"
              title={
                isPOSPage
                  ? "Owners"
                  : ""
              }
            >

              <FaUsers className="sidebar-icon" />

              <span className="sidebar-text">
                Owners
              </span>

            </NavLink>


            {/* PETS */}

            <NavLink
              to="/pets"
              onClick={
                handleNavigation
              }
              data-label="Pets"
              title={
                isPOSPage
                  ? "Pets"
                  : ""
              }
            >

              <FaPaw className="sidebar-icon" />

              <span className="sidebar-text">
                Pets
              </span>

            </NavLink>


            {/* APPOINTMENTS */}

            <NavLink
              to="/appointments"
              onClick={
                handleNavigation
              }
              data-label="Appointments"
              title={
                isPOSPage
                  ? "Appointments"
                  : ""
              }
            >

              <FaCalendarDays className="sidebar-icon" />

              <span className="sidebar-text">
                Appointments
              </span>

            </NavLink>


            {/* MEDICAL RECORDS */}

            <NavLink
              to="/medical-records"
              onClick={
                handleNavigation
              }
              data-label="Medical Records"
              title={
                isPOSPage
                  ? "Medical Records"
                  : ""
              }
            >

              <FaNotesMedical className="sidebar-icon" />

              <span className="sidebar-text">
                Medical Records
              </span>

            </NavLink>


            {/* VACCINATIONS */}

            <NavLink
              to="/vaccinations"
              onClick={
                handleNavigation
              }
              data-label="Vaccinations"
              title={
                isPOSPage
                  ? "Vaccinations"
                  : ""
              }
            >

              <FaSyringe className="sidebar-icon" />

              <span className="sidebar-text">
                Vaccinations
              </span>

            </NavLink>


            {/* REMINDERS */}

            <NavLink
              to="/reminders"
              onClick={
                handleNavigation
              }
              data-label="Reminders"
              title={
                isPOSPage
                  ? "Reminders"
                  : ""
              }
            >

              <FaBell className="sidebar-icon" />

              <span className="sidebar-text">
                Reminders
              </span>

            </NavLink>


            {/* MEDICATIONS */}

            <NavLink
              to="/medications"
              onClick={
                handleNavigation
              }
              data-label="Medications"
              title={
                isPOSPage
                  ? "Medications"
                  : ""
              }
            >

              <FaPills className="sidebar-icon" />

              <span className="sidebar-text">
                Medications
              </span>

            </NavLink>


            {/* PRESCRIPTIONS */}

            <NavLink
              to="/prescriptions"
              onClick={
                handleNavigation
              }
              data-label="Prescriptions"
              title={
                isPOSPage
                  ? "Prescriptions"
                  : ""
              }
            >

              <FaPrescriptionBottleMedical
                className="sidebar-icon"
              />

              <span className="sidebar-text">
                Prescriptions
              </span>

            </NavLink>


            {/* ===============================================
                INVENTORY + SUBMENU
            =============================================== */}

            <div className="inventory-sidebar-group">

              <button
                type="button"
                className={`inventory-parent-button ${
                  isInventoryPage
                    ? "active"
                    : ""
                }`}
                onClick={
                  handleInventoryParent
                }
                title={
                  isPOSPage
                    ? "Inventory"
                    : ""
                }
              >

                <FaBoxesStacked className="sidebar-icon" />

                <span className="sidebar-text">
                  Inventory
                </span>

                <span className="inventory-parent-arrow">

                  {inventoryOpen ? (
                    <FaChevronDown />
                  ) : (
                    <FaChevronRight />
                  )}

                </span>

              </button>


              {inventoryOpen && (

                <div className="inventory-submenu">


                  {/* PRODUCTS */}

                  <button
                    type="button"
                    className={`inventory-submenu-button ${
                      location.pathname ===
                      "/inventory"
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {
                      saveSidebarScroll();

                      navigate(
                        "/inventory"
                      );

                      setInventoryOpen(
                        true
                      );

                      setMenuOpen(
                        false
                      );
                    }}
                  >

                    <FaBoxOpen />

                    <span>
                      Products
                    </span>

                  </button>


                  {/* CATEGORIES */}

                  <button
                    type="button"
                    className={`inventory-submenu-button ${
                      isCategoriesPage
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handleInventoryNavigation(
                        "categories"
                      )
                    }
                  >

                    <FaTags />

                    <span>
                      Categories
                    </span>

                  </button>

                </div>

              )}

            </div>
                        {/* ===============================================
                POS
            =============================================== */}

<NavLink
              to="/pos"
              onClick={
                handleNavigation
              }
              data-label="POS"
              title={
                isPOSPage
                  ? "POS"
                  : ""
              }
            >

              <FaCashRegister className="sidebar-icon" />

              <span className="sidebar-text">
                POS
              </span>

            </NavLink>


            {/* ===============================================
                ORDERS
            =============================================== */}

            <NavLink
              to="/admin/orders"
              onClick={
                handleNavigation
              }
              data-label="Orders"
              title={
                isPOSPage
                  ? "Orders"
                  : ""
              }
            >

              <FaClipboardList className="sidebar-icon" />

              <span className="sidebar-text">
                Orders
              </span>

            </NavLink>


            {/* ===============================================
                SALES
            =============================================== */}

            <NavLink
              to="/admin/sales"
              onClick={
                handleNavigation
              }
              data-label="Sales"
              title={
                isPOSPage
                  ? "Sales"
                  : ""
              }
            >

              <FaChartLine className="sidebar-icon" />

              <span className="sidebar-text">
                Sales
              </span>

            </NavLink>


            {/* ===============================================
                BILLING
            =============================================== */}

            <NavLink
              to="/billing"
              onClick={
                handleNavigation
              }
              data-label="Billing"
              title={
                isPOSPage
                  ? "Billing"
                  : ""
              }
            >

              <FaFileInvoiceDollar
                className="sidebar-icon"
              />

              <span className="sidebar-text">
                Billing
              </span>

            </NavLink>


            {/* ===============================================
                FINANCIAL + SUBMENU
            =============================================== */}

            <div className="financial-sidebar-group">

              <button
                type="button"
                className={`financial-parent-button ${
                  isFinancialPage
                    ? "active"
                    : ""
                }`}
                onClick={
                  handleFinancialParent
                }
                title={
                  isPOSPage
                    ? "Financial"
                    : ""
                }
              >

                <FaChartLine className="sidebar-icon" />

                <span className="sidebar-text">
                  Financial
                </span>

                <span className="financial-parent-arrow">

                  {financialOpen ? (
                    <FaChevronDown />
                  ) : (
                    <FaChevronRight />
                  )}

                </span>

              </button>


              {financialOpen && (

                <div className="financial-submenu">


                  {/* REVENUE */}

                  <button
                    type="button"
                    className={`financial-submenu-button ${
                      isRevenuePage
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handleFinancialNavigation(
                        "revenue"
                      )
                    }
                  >

                    <FaArrowTrendUp />

                    <span>
                      Revenue
                    </span>

                  </button>


                  {/* EXPENSES */}

                  <button
                    type="button"
                    className={`financial-submenu-button ${
                      isExpensesPage
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handleFinancialNavigation(
                        "expenses"
                      )
                    }
                  >

                    <FaArrowTrendDown />

                    <span>
                      Expenses
                    </span>

                  </button>

                </div>

              )}

            </div>


            {/* ===============================================
                REPORTS
            =============================================== */}

            <NavLink
              to="/reports"
              onClick={
                handleNavigation
              }
              data-label="Reports"
              title={
                isPOSPage
                  ? "Reports"
                  : ""
              }
            >

              <FaChartColumn className="sidebar-icon" />

              <span className="sidebar-text">
                Reports
              </span>

            </NavLink>


            {/* ===============================================
                USERS
            =============================================== */}

            <NavLink
              to="/users"
              onClick={
                handleNavigation
              }
              data-label="Users"
              title={
                isPOSPage
                  ? "Users"
                  : ""
              }
            >

              <FaUserCog className="sidebar-icon" />

              <span className="sidebar-text">
                Users
              </span>

            </NavLink>


            {/* ===============================================
                AUDIT LOG
            =============================================== */}

            <NavLink
              to="/audit-log"
              onClick={
                handleNavigation
              }
              data-label="Audit Log"
              title={
                isPOSPage
                  ? "Audit Log"
                  : ""
              }
            >

              <FaClipboard className="sidebar-icon" />

              <span className="sidebar-text">
                Audit Log
              </span>

            </NavLink>


            {/* ===============================================
                SETTINGS
            =============================================== */}

            <NavLink
              to="/settings"
              onClick={
                handleNavigation
              }
              data-label="Settings"
              title={
                isPOSPage
                  ? "Settings"
                  : ""
              }
            >

              <FaGear className="sidebar-icon" />

              <span className="sidebar-text">
                Settings
              </span>

            </NavLink>

          </nav>

        </div>


        {/* ===============================================
            LOGOUT
        =============================================== */}

        <button
          className="sidebar-logout"
          onClick={
            handleLogout
          }
          title={
            isPOSPage
              ? "Logout"
              : ""
          }
        >

          <FaRightFromBracket className="sidebar-icon" />

          <span className="sidebar-text">
            Logout
          </span>

        </button>

      </aside>

    </>
  );
}


export default Sidebar;