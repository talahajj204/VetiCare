// import { NavLink, useNavigate } from "react-router-dom";
// import { useState } from "react";
// import { FaChartLine } from "react-icons/fa";

// import {
//   FaHouse,
//   FaUsers,
//   FaPaw,
//   FaCalendarDays,
//   FaNotesMedical,
//   FaSyringe,
//   FaBell,
//   FaPills,
//   FaPrescriptionBottleMedical,
//   FaBoxesStacked,
//   FaFileInvoiceDollar,
//   FaChartColumn,
//   FaGear,
//   FaRightFromBracket,
//   FaBars,
//   FaXmark,
// } from "react-icons/fa6";

// function Sidebar() {
//   const navigate = useNavigate();
//   const [menuOpen, setMenuOpen] = useState(false);

//   const handleLogout = () => {
//     setMenuOpen(false);
//     navigate("/");
//   };

//   const closeMenu = () => {
//     setMenuOpen(false);
//   };

//   return (
//     <>
//       {/* MOBILE HAMBURGER */}
//       <button
//         className="mobile-menu-button"
//         onClick={() => setMenuOpen(true)}
//         aria-label="Open menu"
//       >
//         <FaBars />
//       </button>

//       {/* MOBILE DARK OVERLAY */}
//       {menuOpen && <div className="sidebar-overlay" onClick={closeMenu} />}

//       {/* SIDEBAR */}
//       <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
//         <div>
//           {/* LOGO */}
//           <div className="sidebar-logo">
//             <div className="sidebar-brand">
//               <FaPaw className="sidebar-logo-icon" />

//               <h2 className="sidebar-logo-text">Vet Clinic</h2>
//             </div>

//             {/* MOBILE CLOSE */}
//             <button
//               className="mobile-close-button"
//               onClick={closeMenu}
//               aria-label="Close menu"
//             >
//               <FaXmark />
//             </button>
//           </div>

//           {/* NAVIGATION */}
//           <nav className="sidebar-nav">
//             <NavLink to="/dashboard" onClick={closeMenu}>
//               <FaHouse className="sidebar-icon" />
//               <span className="sidebar-text">Dashboard</span>
//             </NavLink>

//             <NavLink to="/owners" onClick={closeMenu}>
//               <FaUsers className="sidebar-icon" />
//               <span className="sidebar-text">Owners</span>
//             </NavLink>

//             <NavLink to="/pets" onClick={closeMenu}>
//               <FaPaw className="sidebar-icon" />
//               <span className="sidebar-text">Pets</span>
//             </NavLink>

//             <NavLink to="/appointments" onClick={closeMenu}>
//               <FaCalendarDays className="sidebar-icon" />
//               <span className="sidebar-text">Appointments</span>
//             </NavLink>

//             <NavLink to="/medical-records" onClick={closeMenu}>
//               <FaNotesMedical className="sidebar-icon" />
//               <span className="sidebar-text">Medical Records</span>
//             </NavLink>

//             <NavLink to="/vaccinations" onClick={closeMenu}>
//               <FaSyringe className="sidebar-icon" />
//               <span className="sidebar-text">Vaccinations</span>
//             </NavLink>

//             <NavLink to="/reminders" onClick={closeMenu}>
//               <FaBell className="sidebar-icon" />
//               <span className="sidebar-text">Reminders</span>
//             </NavLink>

//             <NavLink to="/medications" onClick={closeMenu}>
//               <FaPills className="sidebar-icon" />
//               <span className="sidebar-text">Medications</span>
//             </NavLink>

//             <NavLink to="/prescriptions" onClick={closeMenu}>
//               <FaPrescriptionBottleMedical className="sidebar-icon" />
//               <span className="sidebar-text">Prescriptions</span>
//             </NavLink>

//             <NavLink to="/inventory" onClick={closeMenu}>
//               <FaBoxesStacked className="sidebar-icon" />
//               <span className="sidebar-text">Inventory</span>
//             </NavLink>

//             <NavLink to="/billing" onClick={closeMenu}>
//               <FaFileInvoiceDollar className="sidebar-icon" />
//               <span className="sidebar-text">Billing</span>
//             </NavLink>
//             <NavLink to="/financial">
//               <FaChartLine className="sidebar-icon" />
//               <span className="sidebar-text">Financial</span>
//             </NavLink>

//             <NavLink to="/reports" onClick={closeMenu}>
//               <FaChartColumn className="sidebar-icon" />
//               <span className="sidebar-text">Reports</span>
//             </NavLink>

//             <NavLink to="/settings" onClick={closeMenu}>
//               <FaGear className="sidebar-icon" />
//               <span className="sidebar-text">Settings</span>
//             </NavLink>
//           </nav>
//         </div>

//         {/* LOGOUT */}
//         <button className="sidebar-logout" onClick={handleLogout}>
//           <FaRightFromBracket className="sidebar-icon" />

//           <span className="sidebar-text">Logout</span>
//         </button>
//       </aside>
//     </>
//   );
// }

// export default Sidebar;
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

import { FaChartLine } from "react-icons/fa";

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

  const [menuOpen, setMenuOpen] = useState(false);

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    setMenuOpen(false);
    navigate("/");
  };

  // =========================
  // CLOSE MOBILE MENU
  // =========================

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      {/* =========================
          MOBILE HAMBURGER
      ========================= */}

      <button
        className="mobile-menu-button"
        onClick={() => setMenuOpen(true)}
        aria-label="Open menu"
      >
        <FaBars />
      </button>

      {/* =========================
          MOBILE OVERLAY
      ========================= */}

      {menuOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeMenu}
        />
      )}

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside
        className={`sidebar ${
          menuOpen ? "sidebar-open" : ""
        }`}
      >
        <div>

          {/* =========================
              LOGO
          ========================= */}

          <div className="sidebar-logo">

            <div className="sidebar-brand">

              <FaPaw className="sidebar-logo-icon" />

              <h2 className="sidebar-logo-text">
                Vet Clinic
              </h2>

            </div>

            {/* MOBILE CLOSE BUTTON */}

            <button
              className="mobile-close-button"
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <FaXmark />
            </button>

          </div>

          {/* =========================
              NAVIGATION
          ========================= */}

          <nav className="sidebar-nav">

            {/* DASHBOARD */}

            <NavLink
              to="/dashboard"
              onClick={closeMenu}
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
            >
              <FaBoxesStacked className="sidebar-icon" />

              <span className="sidebar-text">
                Inventory
              </span>
            </NavLink>

            {/* BILLING */}

            <NavLink
              to="/billing"
              onClick={closeMenu}
            >
              <FaFileInvoiceDollar
                className="sidebar-icon"
              />

              <span className="sidebar-text">
                Billing
              </span>
            </NavLink>

            {/* =========================
                FINANCIAL
            ========================= */}

            <NavLink
              to="/financial"
              onClick={closeMenu}
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
            >
              <FaChartColumn className="sidebar-icon" />

              <span className="sidebar-text">
                Reports
              </span>
            </NavLink>

            {/* SETTINGS */}

            <NavLink
              to="/settings"
              onClick={closeMenu}
            >
              <FaGear className="sidebar-icon" />

              <span className="sidebar-text">
                Settings
              </span>
            </NavLink>

          </nav>

        </div>

        {/* =========================
            LOGOUT
        ========================= */}

        <button
          className="sidebar-logout"
          onClick={handleLogout}
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