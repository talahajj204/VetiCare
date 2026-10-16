import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
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

const SCROLL_KEY = "vetClinicSidebarScroll";
const COLLAPSE_KEY = "vetClinicSidebarCollapsed";

const navigationLinks = [
  { path: "/dashboard", label: "Dashboard", icon: FaHouse },
  { path: "/owners", label: "Owners", icon: FaUsers },
  { path: "/pets", label: "Pets", icon: FaPaw },
  {
    path: "/appointments",
    label: "Appointments",
    icon: FaCalendarDays,
  },
  {
    path: "/medical-records",
    label: "Medical Records",
    icon: FaNotesMedical,
  },
  {
    path: "/vaccinations",
    label: "Vaccinations",
    icon: FaSyringe,
  },
  { path: "/reminders", label: "Reminders", icon: FaBell },
  { path: "/medications", label: "Medications", icon: FaPills },
  {
    path: "/prescriptions",
    label: "Prescriptions",
    icon: FaPrescriptionBottleMedical,
  },
];

const salesLinks = [
  { path: "/pos", label: "POS", icon: FaCashRegister },
  {
    path: "/admin/orders",
    label: "Orders",
    icon: FaClipboardList,
  },
  { path: "/admin/sales", label: "Sales", icon: FaChartLine },
  {
    path: "/billing",
    label: "Billing",
    icon: FaFileInvoiceDollar,
  },
];

const otherLinks = [
  { path: "/reports", label: "Reports", icon: FaChartColumn },
  { path: "/users", label: "Users", icon: FaUserCog },
  { path: "/audit-log", label: "Audit Log", icon: FaClipboard },
  { path: "/settings", label: "Settings", icon: FaGear },
];

const sidebarStyles = `
  :root {
    --vet-sidebar-open-width: 260px;
    --vet-sidebar-closed-width: 72px;
  }

  @media (min-width: 769px) {
    .dashboard-layout {
      display: flex !important;
      flex-direction: row !important;
      align-items: stretch !important;
      width: 100% !important;
      max-width: none !important;
      min-width: 0 !important;
      min-height: 100vh !important;
      box-sizing: border-box !important;
      padding-left: var(--vet-sidebar-open-width) !important;
      transition: padding-left .25s ease;
    }

    .dashboard-layout:has(> .sidebar.sidebar-pos-collapsed) {
      padding-left: var(--vet-sidebar-closed-width) !important;
    }

    .dashboard-layout > .sidebar {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      bottom: 0 !important;
      z-index: 1000 !important;
      flex: none !important;
      width: var(--vet-sidebar-open-width) !important;
      min-width: var(--vet-sidebar-open-width) !important;
      max-width: var(--vet-sidebar-open-width) !important;
      height: 100vh !important;
      height: 100dvh !important;
      align-self: auto !important;
    }

    .dashboard-layout > .sidebar.sidebar-pos-collapsed {
      width: var(--vet-sidebar-closed-width) !important;
      min-width: var(--vet-sidebar-closed-width) !important;
      max-width: var(--vet-sidebar-closed-width) !important;
    }

    .dashboard-layout:not(:has(> .sidebar-pos-page))
      > :is(
        .dashboard-main,
        main,
        .main-content,
        .settings-page,
        .settings-main
      ) {
      flex: 1 1 0% !important;
      width: auto !important;
      min-width: 0 !important;
      max-width: none !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
      left: auto !important;
      right: auto !important;
      box-sizing: border-box !important;
    }

    .dashboard-layout:has(> .sidebar-pos-page)
      > :not(.sidebar) {
      flex: 1 1 0%;
      min-width: 0;
      max-width: none;
      box-sizing: border-box;
    }
  }

  @media (max-width: 768px) {
    .dashboard-layout,
    .dashboard-layout:has(> .sidebar.sidebar-pos-collapsed) {
      display: block !important;
      width: 100% !important;
      min-width: 0 !important;
      padding-left: 0 !important;
      box-sizing: border-box !important;
    }

    .dashboard-layout
      > :is(
        .dashboard-main,
        main,
        .main-content,
        .settings-page,
        .settings-main
      ) {
      width: 100% !important;
      min-width: 0 !important;
      max-width: none !important;
      margin-left: 0 !important;
      box-sizing: border-box !important;
    }
  }

  .sidebar {
    --sidebar-bg: #49aaa6;
    --sidebar-hover: #348b87;
    --sidebar-active: #246d69;
    width: 260px;
    min-width: 260px;
    height: 100vh;
    height: 100dvh;
    padding: 14px 12px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: var(--sidebar-bg);
    color: #ffffff !important;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,.4) transparent;
    transition:
      width .25s ease,
      min-width .25s ease,
      flex-basis .25s ease;
  }

  .sidebar * {
    box-sizing: border-box;
  }

  .sidebar::-webkit-scrollbar {
    width: 5px;
  }

  .sidebar::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,.4);
    border-radius: 20px;
  }

  .sidebar-content {
    width: 100%;
    flex-shrink: 0;
  }

  .sidebar .sidebar-logo {
    width: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 0 18px;
    margin-bottom: 20px;
    border-bottom: 1px solid rgba(255,255,255,.22);
  }

  .sidebar .sidebar-brand {
    width: 100%;
    min-width: 0;
    padding: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border: 0 !important;
    border-radius: 12px;
    background: transparent;
    color: #ffffff !important;
    cursor: pointer;
    text-align: center;
    transition: background-color .2s ease;
  }

  .sidebar .sidebar-brand:hover {
    background: rgba(255,255,255,.12);
  }

  .sidebar .sidebar-logo-icon {
    font-size: 34px;
    color: #ffffff !important;
  }

  .sidebar .sidebar-logo-image {
    width: 62px;
    height: 62px;
    object-fit: contain;
    border-radius: 12px;
  }

  .sidebar .sidebar-logo-text {
    max-width: 100%;
    color: #ffffff !important;
    font-size: 17px;
    font-weight: 700;
    line-height: 1.4;
    text-align: center;
    overflow-wrap: anywhere;
  }

  .sidebar .sidebar-nav {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 5px;
    width: 100%;
  }

  .sidebar .sidebar-nav a,
  .sidebar .sidebar-nav .inventory-parent-button,
  .sidebar .sidebar-nav .financial-parent-button {
    width: 100% !important;
    min-height: 46px !important;
    height: 46px !important;
    margin: 0 !important;
    padding: 0 15px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 18px !important;
    border: 0 !important;
    border-radius: 10px !important;
    background: transparent;
    color: #ffffff !important;
    text-decoration: none !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    font-family: inherit !important;
    line-height: 20px !important;
    text-align: left !important;
    box-shadow: none !important;
    transform: none !important;
    translate: none !important;
    cursor: pointer;
    transition: background-color .2s ease !important;
  }

  .sidebar .sidebar-nav .sidebar-icon,
  .sidebar .sidebar-logout .sidebar-icon {
    display: block !important;
    width: 19px !important;
    min-width: 19px !important;
    max-width: 19px !important;
    height: 19px !important;
    min-height: 19px !important;
    max-height: 19px !important;
    flex: 0 0 19px !important;
    margin: 0 !important;
    padding: 0 !important;
    color: #ffffff !important;
    position: static !important;
    transform: none !important;
    translate: none !important;
    transition: none !important;
  }

  .sidebar .sidebar-nav .sidebar-text,
  .sidebar .sidebar-logout .sidebar-text {
    display: block;
    margin: 0 !important;
    padding: 0 !important;
    color: #ffffff !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    line-height: 20px !important;
    white-space: nowrap;
    position: static !important;
    transform: none !important;
    translate: none !important;
    transition: none !important;
  }

  .sidebar .sidebar-nav a:hover,
  .sidebar .sidebar-nav .inventory-parent-button:hover,
  .sidebar .sidebar-nav .financial-parent-button:hover,
  .sidebar .sidebar-logout:hover {
    background: var(--sidebar-hover) !important;
    color: #ffffff !important;
    border: 0 !important;
    box-shadow: none !important;
    transform: none !important;
  }

  .sidebar .sidebar-nav a.active,
  .sidebar .sidebar-nav .inventory-parent-button.active,
  .sidebar .sidebar-nav .financial-parent-button.active {
    background: var(--sidebar-active) !important;
    color: #ffffff !important;
    border: 0 !important;
    border-left: 0 !important;
    box-shadow: none !important;
    font-weight: 500 !important;
    transform: none !important;
    translate: none !important;
  }

  .sidebar .sidebar-nav a.active:hover,
  .sidebar .sidebar-nav .inventory-parent-button.active:hover,
  .sidebar .sidebar-nav .financial-parent-button.active:hover {
    background: var(--sidebar-active) !important;
  }

  .sidebar .sidebar-nav a:active,
  .sidebar .sidebar-nav button:active,
  .sidebar .sidebar-nav a:focus,
  .sidebar .sidebar-nav button:focus {
    border: 0 !important;
    box-shadow: none !important;
    transform: none !important;
    translate: none !important;
  }

  .sidebar .sidebar-nav a:focus:not(:focus-visible),
  .sidebar .sidebar-nav button:focus:not(:focus-visible) {
    outline: none !important;
  }

  .sidebar .sidebar-nav a:focus-visible,
  .sidebar .sidebar-nav button:focus-visible {
    outline: 2px solid #174e4b;
    outline-offset: 2px;
  }

  .sidebar .inventory-sidebar-group,
  .sidebar .financial-sidebar-group {
    width: 100%;
  }

  .sidebar .inventory-parent-arrow,
  .sidebar .financial-parent-arrow {
    margin-left: auto !important;
    min-width: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff !important;
    font-size: 12px;
    transform: none !important;
  }

  .sidebar .inventory-submenu,
  .sidebar .financial-submenu {
    width: 100%;
    padding: 5px 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .sidebar .inventory-submenu-button,
  .sidebar .financial-submenu-button {
    width: calc(100% - 12px) !important;
    min-height: 40px !important;
    height: 40px !important;
    margin: 0 0 0 12px !important;
    padding: 0 12px 0 30px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 13px !important;
    background: transparent;
    border: 0 !important;
    border-radius: 9px !important;
    color: #ffffff !important;
    font-family: inherit !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    line-height: 20px !important;
    text-align: left !important;
    box-shadow: none !important;
    transform: none !important;
    translate: none !important;
    cursor: pointer;
    transition: background-color .2s ease !important;
  }

  .sidebar .inventory-submenu-button svg,
  .sidebar .financial-submenu-button svg {
    display: block !important;
    width: 15px !important;
    min-width: 15px !important;
    max-width: 15px !important;
    height: 15px !important;
    min-height: 15px !important;
    max-height: 15px !important;
    flex: 0 0 15px !important;
    margin: 0 !important;
    padding: 0 !important;
    color: #ffffff !important;
    transform: none !important;
    transition: none !important;
  }

  .sidebar .inventory-submenu-button span,
  .sidebar .financial-submenu-button span {
    font-weight: 500 !important;
    line-height: 20px !important;
    transform: none !important;
    transition: none !important;
  }

  .sidebar .inventory-submenu-button:hover,
  .sidebar .financial-submenu-button:hover {
    background: var(--sidebar-hover) !important;
    border: 0 !important;
    box-shadow: none !important;
    transform: none !important;
  }

  .sidebar .inventory-submenu-button.active,
  .sidebar .financial-submenu-button.active {
    background: var(--sidebar-active) !important;
    color: #ffffff !important;
    border: 0 !important;
    box-shadow: none !important;
    font-weight: 500 !important;
    transform: none !important;
    translate: none !important;
  }

  .sidebar .inventory-submenu-button.active:hover,
  .sidebar .financial-submenu-button.active:hover {
    background: var(--sidebar-active) !important;
  }

  .sidebar .sidebar-logout {
    width: 100% !important;
    min-height: 46px !important;
    height: 46px !important;
    margin: 24px 0 0 !important;
    padding: 0 15px !important;
    flex-shrink: 0;
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 18px !important;
    border: 0 !important;
    border-radius: 10px !important;
    background: transparent;
    color: #ffffff !important;
    font-family: inherit !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    box-shadow: none !important;
    transform: none !important;
    translate: none !important;
    cursor: pointer;
    transition: background-color .2s ease !important;
  }

  @media (min-width: 769px) {
    .sidebar.sidebar-pos-collapsed {
      width: 72px !important;
      min-width: 72px !important;
      max-width: 72px !important;
      padding: 14px 8px !important;
    }

    .sidebar.sidebar-pos-collapsed .sidebar-logo {
      padding: 8px 0 15px;
      margin-bottom: 15px;
    }

    .sidebar.sidebar-pos-collapsed .sidebar-brand {
      padding: 8px 0;
      gap: 0;
    }

    .sidebar.sidebar-pos-collapsed .sidebar-logo-icon {
      font-size: 26px;
    }

    .sidebar.sidebar-pos-collapsed .sidebar-logo-image {
      width: 40px;
      height: 40px;
    }

    .sidebar.sidebar-pos-collapsed .sidebar-logo-text,
    .sidebar.sidebar-pos-collapsed .sidebar-text,
    .sidebar.sidebar-pos-collapsed .inventory-parent-arrow,
    .sidebar.sidebar-pos-collapsed .financial-parent-arrow {
      display: none !important;
    }

    .sidebar.sidebar-pos-collapsed .sidebar-nav a,
    .sidebar.sidebar-pos-collapsed .inventory-parent-button,
    .sidebar.sidebar-pos-collapsed .financial-parent-button,
    .sidebar.sidebar-pos-collapsed .sidebar-logout {
      width: 100% !important;
      min-width: 0 !important;
      min-height: 46px !important;
      height: 46px !important;
      margin: 0 !important;
      padding: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 0 !important;
    }

    .sidebar.sidebar-pos-collapsed .sidebar-logout {
      margin-top: 24px !important;
    }

    .sidebar.sidebar-pos-collapsed .sidebar-icon {
      width: 19px !important;
      min-width: 19px !important;
      height: 19px !important;
      margin: 0 !important;
    }

    .sidebar.sidebar-pos-collapsed .inventory-submenu,
    .sidebar.sidebar-pos-collapsed .financial-submenu {
      display: none !important;
    }
  }

  .mobile-menu-button {
    display: none;
    position: fixed;
    top: 16px;
    left: 16px;
    z-index: 1001;
    width: 42px !important;
    height: 42px !important;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 10px;
    background: #348b87;
    color: #ffffff;
    cursor: pointer;
  }

  .mobile-close-button {
    display: none;
  }

  .sidebar-overlay {
    position: fixed;
    inset: 0;
    z-index: 1099;
    background: rgba(0,0,0,.45);
  }

  @media (max-width: 768px) {
    .mobile-menu-button {
      display: flex;
    }

    .sidebar,
    .sidebar.sidebar-pos-collapsed {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      bottom: 0 !important;
      z-index: 1100 !important;
      width: min(280px, 85vw) !important;
      min-width: 0 !important;
      max-width: 85vw !important;
      height: 100dvh !important;
      padding: 14px 12px !important;
      transform: translateX(-105%);
      transition: transform .25s ease;
    }

    .sidebar.sidebar-open,
    .sidebar.sidebar-pos-collapsed.sidebar-open {
      transform: translateX(0);
    }

    .sidebar .sidebar-logo {
      padding-right: 25px;
    }

    .sidebar .mobile-close-button {
      display: flex;
      position: absolute;
      top: 8px;
      right: 0;
      width: 28px !important;
      height: 28px !important;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      color: #ffffff;
      cursor: pointer;
    }

    .sidebar.sidebar-pos-collapsed .sidebar-logo-text,
    .sidebar.sidebar-pos-collapsed .sidebar-text,
    .sidebar.sidebar-pos-collapsed .inventory-parent-arrow,
    .sidebar.sidebar-pos-collapsed .financial-parent-arrow {
      display: inline-flex !important;
    }

    .sidebar.sidebar-pos-collapsed .sidebar-nav a,
    .sidebar.sidebar-pos-collapsed .inventory-parent-button,
    .sidebar.sidebar-pos-collapsed .financial-parent-button,
    .sidebar.sidebar-pos-collapsed .sidebar-logout {
      min-height: 46px !important;
      height: 46px !important;
      padding: 0 15px !important;
      justify-content: flex-start !important;
      gap: 18px !important;
    }

    .sidebar.sidebar-pos-collapsed .inventory-submenu,
    .sidebar.sidebar-pos-collapsed .financial-submenu {
      display: flex !important;
    }
  }
`;export default function Sidebar({ clinicName, clinicLogo }) {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);

  const [mobileOpen, setMobileOpen] = useState(false);

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_KEY) === "true"
  );

  const [branding, setBranding] = useState(() => ({
    name: localStorage.getItem("clinicName") || "My Clinic",
    logo: localStorage.getItem("clinicLogo") || "",
  }));

  const [posExpanded, setPosExpanded] = useState(false);

  const isPOSPage = location.pathname === "/pos";
  const isCollapsed = isPOSPage ? !posExpanded : collapsed;

  const isInventoryPage =
    location.pathname.startsWith("/inventory");

  const isFinancialPage =
    location.pathname === "/financial";

  const financialTab = new URLSearchParams(
    location.search
  ).get("tab");

  const [inventoryOpen, setInventoryOpen] =
    useState(isInventoryPage);

  const [financialOpen, setFinancialOpen] =
    useState(isFinancialPage);

  const displayName = clinicName ?? branding.name;
  const displayLogo = clinicLogo ?? branding.logo;

  useEffect(() => {
    if (isInventoryPage) {
      setInventoryOpen(true);
    }
  }, [isInventoryPage]);

  useEffect(() => {
    if (isFinancialPage) {
      setFinancialOpen(true);
    }
  }, [isFinancialPage]);

  useEffect(() => {
    const updateBranding = () => {
      setBranding({
        name: localStorage.getItem("clinicName") || "My Clinic",
        logo: localStorage.getItem("clinicLogo") || "",
      });
    };

    window.addEventListener("storage", updateBranding);

    window.addEventListener(
      "clinic-branding-updated",
      updateBranding
    );

    return () => {
      window.removeEventListener("storage", updateBranding);

      window.removeEventListener(
        "clinic-branding-updated",
        updateBranding
      );
    };
  }, []);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const savedScroll = Number(
      sessionStorage.getItem(SCROLL_KEY) || 0
    );

    const frame = requestAnimationFrame(() => {
      sidebar.scrollTop = savedScroll;
    });

    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.search]);

  const saveScroll = () => {
    if (sidebarRef.current) {
      sessionStorage.setItem(
        SCROLL_KEY,
        String(sidebarRef.current.scrollTop)
      );
    }
  };

  const changeCollapse = (value) => {
    setCollapsed(value);

    localStorage.setItem(
      COLLAPSE_KEY,
      String(value)
    );
  };

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setMobileOpen((current) => !current);
      return;
    }

    if (isPOSPage) {
      setPosExpanded((current) => !current);
      return;
    }

    changeCollapse(!collapsed);
  };

  const handleLogoWheel = (event) => {
    if (isPOSPage || window.innerWidth <= 768) {
      return;
    }

    if (event.deltaY > 0 && !collapsed) {
      changeCollapse(true);
    } else if (event.deltaY < 0 && collapsed) {
      changeCollapse(false);
    }
  };

  const closeMobile = () => {
    saveScroll();
    setMobileOpen(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SCROLL_KEY);
    setMobileOpen(false);
    navigate("/");
  };

  const handleInventoryClick = () => {
    saveScroll();

    if (
      isCollapsed &&
      !isPOSPage &&
      window.innerWidth > 768
    ) {
      changeCollapse(false);
      setInventoryOpen(true);
      return;
    }

    setInventoryOpen((previous) => !previous);
  };

  const handleFinancialClick = () => {
    saveScroll();

    if (
      isCollapsed &&
      !isPOSPage &&
      window.innerWidth > 768
    ) {
      changeCollapse(false);
      setFinancialOpen(true);

      if (!isFinancialPage) {
        navigate("/financial");
      }

      return;
    }

    if (!isFinancialPage || financialTab) {
      navigate("/financial");
      setFinancialOpen(true);
      setMobileOpen(false);
      return;
    }

    setFinancialOpen((previous) => !previous);
  };

  const goToInventory = (path) => {
    saveScroll();
    navigate(path);
    setInventoryOpen(true);
    setMobileOpen(false);
  };

  const goToFinancial = (tab) => {
    saveScroll();
    navigate(`/financial?tab=${tab}`);
    setFinancialOpen(true);
    setMobileOpen(false);
  };

  const renderLink = ({ path, label, icon: Icon }) => {
    const profileActive =
      (path === "/owners" &&
        location.pathname.startsWith("/owners/")) ||
      (path === "/pets" &&
        location.pathname.startsWith("/pets/"));

    return (
      <NavLink
        key={path}
        to={path}
        end
        onClick={closeMobile}
        title={isCollapsed ? label : undefined}
        className={({ isActive }) =>
          `sidebar-link ${
            isActive || profileActive ? "active" : ""
          }`
        }
      >
        <Icon className="sidebar-icon" />

        <span className="sidebar-text">
          {label}
        </span>
      </NavLink>
    );
  };

  return (
    <>
      <style>{sidebarStyles}</style>

      <button
        type="button"
        className="mobile-menu-button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
      >
        <FaBars />
      </button>

      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeMobile}
        />
      )}

      <aside
        ref={sidebarRef}
        onScroll={saveScroll}
        className={[
          "sidebar",
          mobileOpen ? "sidebar-open" : "",
          isCollapsed ? "sidebar-pos-collapsed" : "",
          isPOSPage ? "sidebar-pos-page" : "",
        ].join(" ")}
      >
        <div className="sidebar-content">
          <div className="sidebar-logo">
            <button
              type="button"
              className="sidebar-brand"
              onClick={toggleSidebar}
              onWheel={handleLogoWheel}
              title="Collapse / expand sidebar"
              aria-label="Collapse or expand sidebar"
            >
              {displayLogo ? (
                <img
                  src={displayLogo}
                  alt={`${displayName} logo`}
                  className="sidebar-logo-image"
                />
              ) : (
                <FaPaw className="sidebar-logo-icon" />
              )}

              <span className="sidebar-logo-text">
                {displayName}
              </span>
            </button>

            <button
              type="button"
              className="mobile-close-button"
              onClick={closeMobile}
              aria-label="Close sidebar"
            >
              <FaXmark />
            </button>
          </div>

          <nav className="sidebar-nav">
            {navigationLinks.map(renderLink)}

            <div className="inventory-sidebar-group">
              <button
                type="button"
                className={`inventory-parent-button ${
                  isInventoryPage ? "active" : ""
                }`}
                onClick={handleInventoryClick}
                aria-expanded={inventoryOpen}
                title={
                  isCollapsed ? "Inventory" : undefined
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
                  <button
                    type="button"
                    className={`inventory-submenu-button ${
                      location.pathname === "/inventory" ||
                      location.pathname === "/inventory/products"
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      goToInventory("/inventory")
                    }
                  >
                    <FaBoxOpen />
                    <span>Products</span>
                  </button>

                  <button
                    type="button"
                    className={`inventory-submenu-button ${
                      location.pathname ===
                      "/inventory/categories"
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      goToInventory(
                        "/inventory/categories"
                      )
                    }
                  >
                    <FaTags />
                    <span>Categories</span>
                  </button>
                </div>
              )}
            </div>

            {salesLinks.map(renderLink)}

            <div className="financial-sidebar-group">
              <button
                type="button"
                className={`financial-parent-button ${
                  isFinancialPage ? "active" : ""
                }`}
                onClick={handleFinancialClick}
                aria-expanded={financialOpen}
                title={
                  isCollapsed ? "Financial" : undefined
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
                  <button
                    type="button"
                    className={`financial-submenu-button ${
                      isFinancialPage &&
                      financialTab === "revenue"
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      goToFinancial("revenue")
                    }
                  >
                    <FaArrowTrendUp />
                    <span>Revenue</span>
                  </button>

                  <button
                    type="button"
                    className={`financial-submenu-button ${
                      isFinancialPage &&
                      financialTab === "expenses"
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      goToFinancial("expenses")
                    }
                  >
                    <FaArrowTrendDown />
                    <span>Expenses</span>
                  </button>
                </div>
              )}
            </div>

            {otherLinks.map(renderLink)}
          </nav>
        </div>

        <button
          type="button"
          className="sidebar-logout"
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : undefined}
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