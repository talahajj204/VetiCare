import {
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useState } from "react";

import {
  FaChartLine,
  FaUserCog,
  FaClipboard,
  FaCashRegister,
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
} from "react-icons/fa6";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  // ==========================================
  // COLLAPSE SIDEBAR AUTOMATICALLY ON POS ONLY
  // ==========================================

  const isPOSPage = location.pathname === "/pos";

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    setMenuOpen(false);
    navigate("/");
  };

  // ==========================================
  // CLOSE MOBILE MENU
  // ==========================================

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      {/* ======================================
          POS COLLAPSED SIDEBAR CSS
      ====================================== */}

      <style>{`
        /* =====================================
           POS SIDEBAR ONLY
        ===================================== */

        .sidebar.sidebar-pos-collapsed {
          width: 72px !important;
          min-width: 72px !important;
          max-width: 72px !important;

          padding-left: 8px !important;
          padding-right: 8px !important;

          overflow-x: hidden;
        }

        /* LOGO */

        .sidebar.sidebar-pos-collapsed
        .sidebar-logo {
          justify-content: center !important;
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

        /* =====================================
           NAVIGATION
        ===================================== */

        .sidebar.sidebar-pos-collapsed
        .sidebar-nav {
          width: 100%;
        }

        .sidebar.sidebar-pos-collapsed
        .sidebar-nav a {
          width: 100% !important;
          min-width: 0 !important;

          height: 46px;

          margin: 4px 0 !important;
          padding: 0 !important;

          display: flex !important;
          align-items: center !important;
          justify-content: center !important;

          gap: 0 !important;

          border-radius: 9px;
        }

        .sidebar.sidebar-pos-collapsed
        .sidebar-nav a .sidebar-icon {
          width: 18px !important;
          min-width: 18px !important;

          margin: 0 !important;

          font-size: 18px;
        }

        .sidebar.sidebar-pos-collapsed
        .sidebar-text {
          display: none !important;
        }

        /* ACTIVE PAGE */

        .sidebar.sidebar-pos-collapsed
        .sidebar-nav a.active {
          background: #2f7f7b;
          color: #ffffff;
        }

        /* =====================================
           LOGOUT
        ===================================== */

        .sidebar.sidebar-pos-collapsed
        .sidebar-logout {
          width: 100% !important;
          min-width: 0 !important;

          height: 46px;

          padding: 0 !important;
          margin: 0 !important;

          display: flex !important;
          align-items: center !important;
          justify-content: center !important;

          gap: 0 !important;

          border-radius: 9px;
        }

        .sidebar.sidebar-pos-collapsed
        .sidebar-logout .sidebar-icon {
          width: 18px !important;
          min-width: 18px !important;

          margin: 0 !important;

          font-size: 18px;
        }

        /* =====================================
           TOOLTIP ON POS
        ===================================== */

        .sidebar.sidebar-pos-collapsed
        .sidebar-nav a {
          position: relative;
        }

        .sidebar.sidebar-pos-collapsed
        .sidebar-nav a::after {
          content: attr(data-label);

          position: absolute;

          left: 57px;
          top: 50%;

          transform: translateY(-50%);

          z-index: 99999;

          padding: 6px 9px;

          border-radius: 5px;

          background: #263837;
          color: #ffffff;

          font-size: 11px;
          font-weight: 500;

          white-space: nowrap;

          opacity: 0;
          visibility: hidden;

          pointer-events: none;

          transition:
            opacity 0.15s ease,
            visibility 0.15s ease;
        }

        .sidebar.sidebar-pos-collapsed
        .sidebar-nav a:hover::after {
          opacity: 1;
          visibility: visible;
        }

        /* =====================================
           MOBILE
        ===================================== */

        @media (max-width: 768px) {

          .sidebar.sidebar-pos-collapsed {
            width: 260px !important;
            min-width: 260px !important;
            max-width: 260px !important;

            padding-left: initial !important;
            padding-right: initial !important;
          }

          .sidebar.sidebar-pos-collapsed
          .sidebar-logo {
            justify-content: space-between !important;
          }

          .sidebar.sidebar-pos-collapsed
          .sidebar-brand {
            width: auto;
            justify-content: flex-start;
          }

          .sidebar.sidebar-pos-collapsed
          .sidebar-logo-text {
            display: block !important;
          }

          .sidebar.sidebar-pos-collapsed
          .sidebar-text {
            display: inline !important;
          }

          .sidebar.sidebar-pos-collapsed
          .sidebar-nav a {
            height: auto;

            padding: 12px 16px !important;

            justify-content: flex-start !important;

            gap: 12px !important;
          }

          .sidebar.sidebar-pos-collapsed
          .sidebar-logout {
            height: auto;

            padding: 12px 16px !important;

            justify-content: flex-start !important;

            gap: 12px !important;
          }

          .sidebar.sidebar-pos-collapsed
          .sidebar-nav a::after {
            display: none;
          }
        }
      `}</style>

      {/* ======================================
          MOBILE HAMBURGER
      ====================================== */}

      <button
        className="mobile-menu-button"
        onClick={() => setMenuOpen(true)}
        aria-label="Open menu"
      >
        <FaBars />
      </button>

      {/* ======================================
          MOBILE OVERLAY
      ====================================== */}

      {menuOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeMenu}
        />
      )}

      {/* ======================================
          SIDEBAR
      ====================================== */}

      <aside
        className={`sidebar ${
          menuOpen ? "sidebar-open" : ""
        } ${
          isPOSPage ? "sidebar-pos-collapsed" : ""
        }`}
      >
        <div>

          {/* ==================================
              LOGO
          ================================== */}

          <div className="sidebar-logo">

            <div className="sidebar-brand">

              <FaPaw className="sidebar-logo-icon" />

              <h2 className="sidebar-logo-text">
                Vet Clinic
              </h2>

            </div>

            {/* MOBILE CLOSE */}

            <button
              className="mobile-close-button"
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <FaXmark />
            </button>

          </div>

          {/* ==================================
              NAVIGATION
          ================================== */}

          <nav className="sidebar-nav">

            {/* DASHBOARD */}

            <NavLink
              to="/dashboard"
              onClick={closeMenu}
              data-label="Dashboard"
              title={isPOSPage ? "Dashboard" : ""}
            >
              <FaHouse className="sidebar-icon" />

              <span className="sidebar-text">
                Dashboard
              </span>
            </NavLink>

            {/* OWNERS */}

            <NavLink
              to="/owners"
              onClick={closeMenu}
              data-label="Owners"
              title={isPOSPage ? "Owners" : ""}
            >
              <FaUsers className="sidebar-icon" />

              <span className="sidebar-text">
                Owners
              </span>
            </NavLink>

            {/* PETS */}

            <NavLink
              to="/pets"
              onClick={closeMenu}
              data-label="Pets"
              title={isPOSPage ? "Pets" : ""}
            >
              <FaPaw className="sidebar-icon" />

              <span className="sidebar-text">
                Pets
              </span>
            </NavLink>

            {/* APPOINTMENTS */}

            <NavLink
              to="/appointments"
              onClick={closeMenu}
              data-label="Appointments"
              title={isPOSPage ? "Appointments" : ""}
            >
              <FaCalendarDays className="sidebar-icon" />

              <span className="sidebar-text">
                Appointments
              </span>
            </NavLink>

            {/* MEDICAL RECORDS */}

            <NavLink
              to="/medical-records"
              onClick={closeMenu}
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
              onClick={closeMenu}
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
              onClick={closeMenu}
              data-label="Reminders"
              title={isPOSPage ? "Reminders" : ""}
            >
              <FaBell className="sidebar-icon" />

              <span className="sidebar-text">
                Reminders
              </span>
            </NavLink>

            {/* MEDICATIONS */}

            <NavLink
              to="/medications"
              onClick={closeMenu}
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
              onClick={closeMenu}
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

            {/* INVENTORY */}

            <NavLink
              to="/inventory"
              onClick={closeMenu}
              data-label="Inventory"
              title={isPOSPage ? "Inventory" : ""}
            >
              <FaBoxesStacked className="sidebar-icon" />

              <span className="sidebar-text">
                Inventory
              </span>
            </NavLink>

            {/* ==================================
                POS
            ================================== */}

            <NavLink
              to="/pos"
              onClick={closeMenu}
              data-label="POS"
              title={isPOSPage ? "POS" : ""}
            >
              <FaCashRegister className="sidebar-icon" />

              <span className="sidebar-text">
                POS
              </span>
            </NavLink>

            {/* BILLING */}

            <NavLink
              to="/billing"
              onClick={closeMenu}
              data-label="Billing"
              title={isPOSPage ? "Billing" : ""}
            >
              <FaFileInvoiceDollar
                className="sidebar-icon"
              />

              <span className="sidebar-text">
                Billing
              </span>
            </NavLink>

            {/* FINANCIAL */}

            <NavLink
              to="/financial"
              onClick={closeMenu}
              data-label="Financial"
              title={isPOSPage ? "Financial" : ""}
            >
              <FaChartLine className="sidebar-icon" />

              <span className="sidebar-text">
                Financial
              </span>
            </NavLink>

            {/* REPORTS */}

            <NavLink
              to="/reports"
              onClick={closeMenu}
              data-label="Reports"
              title={isPOSPage ? "Reports" : ""}
            >
              <FaChartColumn className="sidebar-icon" />

              <span className="sidebar-text">
                Reports
              </span>
            </NavLink>

            {/* USERS */}

            <NavLink
              to="/users"
              onClick={closeMenu}
              data-label="Users"
              title={isPOSPage ? "Users" : ""}
            >
              <FaUserCog className="sidebar-icon" />

              <span className="sidebar-text">
                Users
              </span>
            </NavLink>

            {/* AUDIT LOG */}

            <NavLink
              to="/audit-log"
              onClick={closeMenu}
              data-label="Audit Log"
              title={isPOSPage ? "Audit Log" : ""}
            >
              <FaClipboard className="sidebar-icon" />

              <span className="sidebar-text">
                Audit Log
              </span>
            </NavLink>

            {/* SETTINGS */}

            <NavLink
              to="/settings"
              onClick={closeMenu}
              data-label="Settings"
              title={isPOSPage ? "Settings" : ""}
            >
              <FaGear className="sidebar-icon" />

              <span className="sidebar-text">
                Settings
              </span>
            </NavLink>

          </nav>
        </div>

        {/* ======================================
            LOGOUT
        ====================================== */}

        <button
          className="sidebar-logout"
          onClick={handleLogout}
          title={isPOSPage ? "Logout" : ""}
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