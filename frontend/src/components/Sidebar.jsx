import {
  NavLink,
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
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
  FaStore,
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

import { canAccessClinicPage } from "../auth/permissions";

const SCROLL_KEY = "vetClinicSidebarScroll";
const COLLAPSE_KEY = "vetClinicSidebarCollapsed";

const overviewLinks = [
  { path: "/dashboard", label: "Dashboard", icon: FaHouse },
  { path: "/reports", label: "Reports", icon: FaChartColumn },
];

const clinicalLinks = [
  { path: "/owners", label: "Owners", icon: FaUsers },
  { path: "/pets", label: "Pets", icon: FaPaw },
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
  {
    path: "/medications",
    label: "Medications",
    icon: FaPills,
  },
  {
    path: "/prescriptions",
    label: "Prescriptions",
    icon: FaPrescriptionBottleMedical,
  },
];

const dailyLinks = [
  {
    path: "/appointments",
    label: "Appointments",
    icon: FaCalendarDays,
  },
  {
    path: "/reminders",
    label: "Reminders",
    icon: FaBell,
  },
];

const salesLinks = [
  { path: "/pos", label: "POS", icon: FaCashRegister },
  {
    path: "/admin/orders",
    label: "Orders",
    icon: FaClipboardList,
  },
  {
    path: "/admin/sales",
    label: "Sales",
    icon: FaChartLine,
  },
];

const financeLinks = [
  {
    path: "/billing",
    label: "Billing",
    icon: FaFileInvoiceDollar,
  },
];

const administrationLinks = [
  { path: "/users", label: "Users", icon: FaUserCog },
  {
    path: "/audit-log",
    label: "Audit Log",
    icon: FaClipboard,
  },
  { path: "/settings", label: "Settings", icon: FaGear },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = useOutletContext();
  const user = session?.user;
  const storeClinicId = Number(user?.clinicId);
  const storeUrl =
    Number.isSafeInteger(storeClinicId) && storeClinicId > 0
      ? `/store/${storeClinicId}`
      : null;

  const scrollRef = useRef(null);
  const logoutInProgress = useRef(false);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_KEY) === "true"
  );

  const [branding, setBranding] = useState({
    name: "",
    logo: "",
  });

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

  const canOpen = (path) =>
    canAccessClinicPage(user, path);

  const showProducts = canOpen("/inventory");
  const showCategories = canOpen("/inventory/categories");
  const showInventory = showProducts || showCategories;
  const showFinancial = canOpen("/financial");

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
    const controller = new AbortController();
    let requestVersion = 0;

    setBranding({ name: "", logo: "" });

    const updateBranding = async () => {
      const version = ++requestVersion;
      const clinicId = Number(user?.clinicId);

      const url =
        Number.isInteger(clinicId) && clinicId > 0
          ? `/api/store/${clinicId}/settings`
          : "/api/store-settings";

      try {
        const response = await fetch(url, {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load clinic branding.");
        }

        const settings = await response.json();

        if (
          controller.signal.aborted ||
          version !== requestVersion
        ) {
          return;
        }

        setBranding({
          name:
            typeof settings?.storeName === "string"
              ? settings.storeName
              : "",
          logo:
            typeof settings?.storeBanner === "string"
              ? settings.storeBanner
              : "",
        });
      } catch {
        if (
          !controller.signal.aborted &&
          version === requestVersion
        ) {
          setBranding({ name: "", logo: "" });
        }
      }
    };

    const events = [
      "storeSettingsUpdated",
      "clinic-branding-updated",
      "focus",
    ];

    events.forEach((event) =>
      window.addEventListener(event, updateBranding)
    );

    updateBranding();

    return () => {
      controller.abort();

      events.forEach((event) =>
        window.removeEventListener(event, updateBranding)
      );
    };
  }, [user?.id, user?.clinicId]);

  useEffect(() => {
    const savedScroll = Number(
      sessionStorage.getItem(SCROLL_KEY) || 0
    );

    const frame = requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = savedScroll;
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.search]);

  const saveScroll = () => {
    if (scrollRef.current) {
      sessionStorage.setItem(
        SCROLL_KEY,
        String(scrollRef.current.scrollTop)
      );
    }
  };

  const changeCollapse = (value) => {
    setCollapsed(value);
    localStorage.setItem(COLLAPSE_KEY, String(value));
  };

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setMobileOpen((current) => !current);
    } else if (isPOSPage) {
      setPosExpanded((current) => !current);
    } else {
      changeCollapse(!collapsed);
    }
  };

  const handleLogoWheel = (event) => {
    if (isPOSPage || window.innerWidth <= 768) return;

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

  const handleLogout = async () => {
    if (logoutInProgress.current) return;

    logoutInProgress.current = true;
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok && response.status !== 401) {
        throw new Error("Logout failed.");
      }

      sessionStorage.removeItem(SCROLL_KEY);
      setMobileOpen(false);
      navigate("/", { replace: true });
    } catch {
      window.alert(
        "Unable to sign out. Please check your connection and try again."
      );
    } finally {
      logoutInProgress.current = false;
      setIsLoggingOut(false);
    }
  };

  const expandDesktopSidebar = () => {
    if (!isCollapsed || window.innerWidth <= 768) {
      return false;
    }

    if (isPOSPage) {
      setPosExpanded(true);
    } else {
      changeCollapse(false);
    }

    return true;
  };

  const handleInventoryClick = () => {
    if (!showInventory) return;

    saveScroll();

    if (expandDesktopSidebar()) {
      setInventoryOpen(true);
      return;
    }

    setInventoryOpen((previous) => !previous);
  };

  const handleFinancialClick = () => {
    if (!showFinancial) return;

    saveScroll();

    if (expandDesktopSidebar()) {
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
    if (!canOpen(path)) return;

    saveScroll();
    navigate(path);
    setInventoryOpen(true);
    setMobileOpen(false);
  };

  const goToFinancial = (tab) => {
    if (!showFinancial) return;

    saveScroll();
    navigate(`/financial?tab=${tab}`);
    setFinancialOpen(true);
    setMobileOpen(false);
  };

  const renderLink = ({ path, label, icon: Icon }) => {
    if (!canOpen(path)) return null;

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
        <span className="sidebar-text">{label}</span>
      </NavLink>
    );
  };

  const renderSection = (
    title,
    links,
    extra = null,
    hasExtra = false
  ) => {
    const visibleLinks = links.filter(({ path }) =>
      canOpen(path)
    );

    if (!visibleLinks.length && !hasExtra) return null;

    return (
      <section
        className="sidebar-section"
        aria-label={title}
      >
        <h2 className="sidebar-section-title">
          {title}
        </h2>

        <div className="sidebar-section-links">
          {visibleLinks.map(renderLink)}
          {extra}
        </div>
      </section>
    );
  };

  const inventoryMenu = showInventory ? (
    <div className="inventory-sidebar-group">
      <button
        type="button"
        className={`inventory-parent-button ${
          isInventoryPage ? "active" : ""
        }`}
        onClick={handleInventoryClick}
        aria-expanded={inventoryOpen}
        aria-controls="clinic-inventory-submenu"
        title={isCollapsed ? "Inventory" : undefined}
      >
        <FaBoxesStacked className="sidebar-icon" />
        <span className="sidebar-text">Inventory</span>

        <span className="inventory-parent-arrow">
          {inventoryOpen ? (
            <FaChevronDown />
          ) : (
            <FaChevronRight />
          )}
        </span>
      </button>

      {inventoryOpen && (
        <div
          className="inventory-submenu"
          id="clinic-inventory-submenu"
        >
          {showProducts && (
            <button
              type="button"
              className={`inventory-submenu-button ${
                location.pathname === "/inventory" ||
                location.pathname === "/inventory/products"
                  ? "active"
                  : ""
              }`}
              onClick={() => goToInventory("/inventory")}
            >
              <FaBoxOpen />
              <span>Products</span>
            </button>
          )}

          {showCategories && (
            <button
              type="button"
              className={`inventory-submenu-button ${
                location.pathname === "/inventory/categories"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                goToInventory("/inventory/categories")
              }
            >
              <FaTags />
              <span>Categories</span>
            </button>
          )}
        </div>
      )}
    </div>
  ) : null;

  const financialMenu = showFinancial ? (
    <div className="financial-sidebar-group">
      <button
        type="button"
        className={`financial-parent-button ${
          isFinancialPage ? "active" : ""
        }`}
        onClick={handleFinancialClick}
        aria-expanded={financialOpen}
        aria-controls="clinic-financial-submenu"
        title={isCollapsed ? "Financial" : undefined}
      >
        <FaChartLine className="sidebar-icon" />
        <span className="sidebar-text">Financial</span>

        <span className="financial-parent-arrow">
          {financialOpen ? (
            <FaChevronDown />
          ) : (
            <FaChevronRight />
          )}
        </span>
      </button>

      {financialOpen && (
        <div
          className="financial-submenu"
          id="clinic-financial-submenu"
        >
          <button
            type="button"
            className={`financial-submenu-button ${
              isFinancialPage && financialTab === "revenue"
                ? "active"
                : ""
            }`}
            onClick={() => goToFinancial("revenue")}
          >
            <FaArrowTrendUp />
            <span>Revenue</span>
          </button>

          <button
            type="button"
            className={`financial-submenu-button ${
              isFinancialPage && financialTab === "expenses"
                ? "active"
                : ""
            }`}
            onClick={() => goToFinancial("expenses")}
          >
            <FaArrowTrendDown />
            <span>Expenses</span>
          </button>
        </div>
      )}
    </div>
  ) : null;

  return (
    <>
      <style>{sidebarStyles}</style>

      <button
        type="button"
        className="mobile-menu-button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
        aria-expanded={mobileOpen}
        aria-controls="clinic-sidebar"
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
        id="clinic-sidebar"
        className={[
          "sidebar",
          mobileOpen ? "sidebar-open" : "",
          isCollapsed ? "sidebar-pos-collapsed" : "",
          isPOSPage ? "sidebar-pos-page" : "",
        ].join(" ")}
      >
        <div className="sidebar-logo">
          <button
            type="button"
            className="sidebar-brand"
            onClick={toggleSidebar}
            onWheel={handleLogoWheel}
            title="Collapse / expand sidebar"
            aria-label="Collapse or expand sidebar"
          >
            {branding.logo ? (
              <img
                src={branding.logo}
                alt={`${branding.name || "Clinic"} logo`}
                className="sidebar-logo-image"
              />
            ) : (
              <FaPaw className="sidebar-logo-icon" />
            )}

            {branding.name && (
              <span className="sidebar-logo-text">
                {branding.name}
              </span>
            )}
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

        <div
          ref={scrollRef}
          className="sidebar-content"
          onScroll={saveScroll}
        >
          <nav
            className="sidebar-nav"
            aria-label="Clinic navigation"
          >
            {renderSection("Overview", overviewLinks)}
            {renderSection("Clinical", clinicalLinks)}
            {renderSection("Daily Operations", dailyLinks)}

            {renderSection(
              "Sales & Stock",
              salesLinks,
              inventoryMenu,
              showInventory
            )}

            {renderSection(
              "Finance",
              financeLinks,
              financialMenu,
              showFinancial
            )}

            {renderSection(
              "Administration",
              administrationLinks
            )}
          </nav>
        </div>

        <div className="sidebar-footer">
          {storeUrl && (
            <a
              className="sidebar-logout sidebar-store-link"
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobile}
              title="View Store (opens in a new tab)"
              aria-label="View Store (opens in a new tab)"
            >
              <FaStore className="sidebar-icon" />
              <span className="sidebar-text">View Store</span>
            </a>
          )}

          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-busy={isLoggingOut}
            title={isCollapsed ? "Sign out" : undefined}
          >
            <FaRightFromBracket className="sidebar-icon" />

            <span className="sidebar-text">
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}const sidebarStyles = `
:root {
  --vet-sidebar-open-width: 240px;
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

.sidebar {
  --sidebar-bg: #49aaa6;
  --sidebar-hover: #348b87;
  --sidebar-active: #246d69;
  width: var(--vet-sidebar-open-width);
  min-width: var(--vet-sidebar-open-width);
  height: 100vh;
  height: 100dvh;
  padding: 14px 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background: var(--sidebar-bg);
  color: #ffffff !important;
  overflow: hidden;
  transition:
    width .25s ease,
    min-width .25s ease,
    flex-basis .25s ease;
}

.sidebar * {
  box-sizing: border-box;
}

.sidebar .sidebar-logo {
  position: relative;
  width: 100%;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0 14px;
  margin-bottom: 10px;
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

.sidebar .sidebar-content {
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,.4) transparent;
}

.sidebar .sidebar-content::-webkit-scrollbar {
  width: 4px;
}

.sidebar .sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,.4);
  border-radius: 20px;
}

.sidebar .sidebar-nav {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 17px;
  width: 100%;
  padding: 4px 0 12px;
}

.sidebar .sidebar-section {
  width: 100%;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
}

.sidebar .sidebar-section-title {
  margin: 0 0 7px !important;
  padding: 0 12px !important;
  color: rgba(255,255,255,.72) !important;
  font-family: inherit !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  line-height: 18px !important;
  letter-spacing: .5px;
  text-transform: uppercase;
  white-space: nowrap;
}

.sidebar .sidebar-section-links {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.sidebar .sidebar-nav a,
.sidebar .inventory-parent-button,
.sidebar .financial-parent-button,
.sidebar .sidebar-logout {
  width: 100% !important;
  min-height: 44px !important;
  height: 44px !important;
  margin: 0 !important;
  padding: 0 12px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  gap: 13px !important;
  border: 0 !important;
  border-radius: 10px !important;
  background: transparent;
  color: #ffffff !important;
  text-decoration: none !important;
  font-family: inherit !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  line-height: 20px !important;
  text-align: left !important;
  box-shadow: none !important;
  transform: none !important;
  translate: none !important;
  cursor: pointer;
  transition: background-color .2s ease !important;
}

.sidebar .sidebar-icon {
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

.sidebar .sidebar-text {
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
.sidebar .sidebar-nav button:hover,
.sidebar .sidebar-logout:hover {
  background: var(--sidebar-hover) !important;
  color: #ffffff !important;
  border: 0 !important;
  box-shadow: none !important;
  transform: none !important;
}

.sidebar .sidebar-nav a.active,
.sidebar .sidebar-nav button.active,
.sidebar .sidebar-nav a.active:hover,
.sidebar .sidebar-nav button.active:hover {
  background: var(--sidebar-active) !important;
  color: #ffffff !important;
  border: 0 !important;
  box-shadow: none !important;
  transform: none !important;
  translate: none !important;
}

.sidebar .sidebar-nav a:focus:not(:focus-visible),
.sidebar .sidebar-nav button:focus:not(:focus-visible) {
  outline: none !important;
}

.sidebar button:focus-visible,
.sidebar a:focus-visible {
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
  width: calc(100% - 10px) !important;
  min-height: 38px !important;
  height: 38px !important;
  margin: 0 0 0 10px !important;
  padding: 0 10px 0 25px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  gap: 12px !important;
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
  height: 15px !important;
  flex: 0 0 15px !important;
  margin: 0 !important;
  padding: 0 !important;
  color: #ffffff !important;
  transform: none !important;
}

.sidebar .sidebar-footer {
  width: 100%;
  flex: 0 0 auto;
  padding-top: 10px;
  margin-top: 8px;
  border-top: 1px solid rgba(255,255,255,.22);
  background: var(--sidebar-bg);
}

.sidebar .sidebar-logout:disabled {
  opacity: .65;
  cursor: wait;
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
  border: 0;
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

@media (min-width: 769px) {
  .sidebar.sidebar-pos-collapsed {
    width: var(--vet-sidebar-closed-width) !important;
    min-width: var(--vet-sidebar-closed-width) !important;
    max-width: var(--vet-sidebar-closed-width) !important;
    padding: 14px 8px !important;
  }

  .sidebar.sidebar-pos-collapsed .sidebar-logo {
    padding: 8px 0 14px;
    margin-bottom: 8px;
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
  .sidebar.sidebar-pos-collapsed .sidebar-section-title,
  .sidebar.sidebar-pos-collapsed .inventory-parent-arrow,
  .sidebar.sidebar-pos-collapsed .financial-parent-arrow {
    display: none !important;
  }

  .sidebar.sidebar-pos-collapsed .sidebar-nav {
    gap: 10px;
  }

  .sidebar.sidebar-pos-collapsed
    .sidebar-section + .sidebar-section {
    padding-top: 10px;
    border-top: 1px solid rgba(255,255,255,.18);
  }

  .sidebar.sidebar-pos-collapsed .sidebar-nav a,
  .sidebar.sidebar-pos-collapsed .inventory-parent-button,
  .sidebar.sidebar-pos-collapsed .financial-parent-button,
  .sidebar.sidebar-pos-collapsed .sidebar-logout {
    width: 100% !important;
    min-width: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    justify-content: center !important;
    gap: 0 !important;
  }

  .sidebar.sidebar-pos-collapsed .inventory-submenu,
  .sidebar.sidebar-pos-collapsed .financial-submenu {
    display: none !important;
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
    width: min(240px, 85vw) !important;
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
    border: 0;
    background: transparent;
    color: #ffffff;
    cursor: pointer;
  }
}
`;