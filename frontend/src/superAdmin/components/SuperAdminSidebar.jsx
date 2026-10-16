import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  FaShieldHalved,
  FaHouse,
  FaUsers,
  FaLayerGroup,
  FaCreditCard,
  FaChevronLeft,
  FaChevronRight,
  FaArrowRightFromBracket,
} from "react-icons/fa6";

const menuItems = [
  {
    label: "Dashboard",
    path: "/super-admin/dashboard",
    icon: FaHouse,
  },
  {
    label: "Admin & Users",
    path: "/super-admin/users",
    icon: FaUsers,
  },
  {
    label: "Plans",
    path: "/super-admin/plans",
    icon: FaLayerGroup,
  },
  {
    label: "Subscriptions",
    path: "/super-admin/subscriptions",
    icon: FaCreditCard,
  },
];

const styles = `
  .myclinic-super-sidebar,
  .myclinic-super-sidebar * {
    box-sizing: border-box;
  }

  body:has(.myclinic-super-sidebar) {
    overflow: hidden;
  }

  /* SHARED LAYOUT FOR OTHER PAGES */

  .sp-page:has(> .myclinic-super-sidebar),
  .ss-page:has(> .myclinic-super-sidebar),
  .sau-page:has(> .myclinic-super-sidebar) {
    display: flex !important;
    flex-direction: row !important;

    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;

    height: 100dvh !important;
    min-height: 0 !important;

    padding: 0 !important;
    margin: 0 !important;

    overflow: hidden !important;
  }

  .sp-page:has(> .myclinic-super-sidebar) > .sp-main,
  .ss-page:has(> .myclinic-super-sidebar) > .ss-main,
  .sau-page:has(> .myclinic-super-sidebar) > .sau-main {
    flex: 1 1 0% !important;

    width: 0 !important;
    max-width: none !important;
    min-width: 0 !important;
    min-height: 0 !important;

    height: 100% !important;

    overflow-x: hidden !important;
    overflow-y: auto !important;

    overscroll-behavior: contain;
  }

  /* SIDEBAR */

  .myclinic-super-sidebar {
    display: flex !important;
    flex-direction: column !important;

    position: relative !important;

    flex: 0 0 235px !important;

    width: 235px !important;
    min-width: 235px !important;
    max-width: 235px !important;

    height: 100% !important;
    min-height: 0 !important;

    padding: 0 !important;
    margin: 0 !important;

    overflow-x: hidden !important;
    overflow-y: auto !important;

    background: #4ba9a5 !important;
    color: #ffffff !important;

    font-family: Inter, Arial, sans-serif;

    transition:
      width .2s ease,
      min-width .2s ease,
      max-width .2s ease,
      flex-basis .2s ease;
  }

  .myclinic-super-sidebar.is-collapsed {
    flex: 0 0 68px !important;

    width: 68px !important;
    min-width: 68px !important;
    max-width: 68px !important;
  }

  /* HEADER */

  .myclinic-super-header {
    position: relative;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    flex-shrink: 0;
    gap: 7px;

    min-height: 112px;

    margin: 0 12px;
    padding: 20px 6px 14px;

    border-bottom: 1px solid rgba(255,255,255,.3);
  }

  .myclinic-super-logo {
    display: grid;
    place-items: center;

    width: 33px;
    height: 33px;

    color: #ffffff;
    font-size: 27px;
  }

  .myclinic-super-title {
    margin: 0;

    color: #ffffff;
    font-size: 16px;
    font-weight: 800;
    text-align: center;
    white-space: nowrap;
  }

  /* COLLAPSE BUTTON */

  .myclinic-super-sidebar .myclinic-super-toggle {
    position: absolute !important;

    top: 10px;
    right: 0;

    display: grid !important;
    place-items: center !important;

    width: 26px !important;
    height: 26px !important;

    min-width: 26px !important;
    min-height: 26px !important;

    max-width: 26px !important;
    max-height: 26px !important;

    margin: 0 !important;
    padding: 0 !important;

    border: 1px solid rgba(255,255,255,.45) !important;
    border-radius: 7px !important;

    background: rgba(255,255,255,.12) !important;
    color: #ffffff !important;

    cursor: pointer !important;
    z-index: 2;
    box-shadow: none !important;
  }

  .myclinic-super-sidebar .myclinic-super-toggle:hover {
    background: rgba(255,255,255,.27) !important;
  }

  /* NAVIGATION */

  .myclinic-super-nav {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;

    gap: 4px;

    width: 100%;
    padding: 13px 11px;
  }

  .myclinic-super-sidebar .myclinic-super-link {
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;

    flex-shrink: 0 !important;
    gap: 13px !important;

    width: 100% !important;
    min-width: 0 !important;
    min-height: 47px !important;

    margin: 0 !important;
    padding: 11px 13px !important;

    border: 0 !important;
    border-radius: 10px !important;

    background: transparent !important;
    color: #ffffff !important;

    font-family: inherit !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    line-height: 1.4 !important;

    text-decoration: none !important;
    text-align: left !important;
    white-space: nowrap !important;

    cursor: pointer !important;
    pointer-events: auto !important;

    transition: background .15s ease;
  }

  .myclinic-super-sidebar .myclinic-super-link:hover {
    background: rgba(0,75,76,.22) !important;
  }

  .myclinic-super-sidebar .myclinic-super-link.active {
    background: #216f70 !important;
    color: #ffffff !important;
    font-weight: 700 !important;
  }

  .myclinic-super-icon {
    flex: 0 0 19px;

    width: 19px;
    height: 19px;

    font-size: 17px;
  }

  .myclinic-super-label {
    flex: 1;
    min-width: 0;

    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* LOGOUT ONLY */

  .myclinic-super-bottom {
    margin-top: auto;
    flex-shrink: 0;

    padding: 13px 11px 16px;

    border-top: 1px solid rgba(255,255,255,.25);
  }

  .myclinic-super-sidebar .myclinic-super-logout {
    color: #ffffff !important;
  }

  .myclinic-super-sidebar .myclinic-super-logout:hover {
    background: #216f70 !important;
  }

  /* COLLAPSED */

  .myclinic-super-sidebar.is-collapsed
  .myclinic-super-header {
    min-height: 95px;

    margin: 0 6px;
    padding: 34px 0 12px;
  }

  .myclinic-super-sidebar.is-collapsed
  .myclinic-super-logo {
    width: 30px;
    height: 30px;
    font-size: 25px;
  }

  .myclinic-super-sidebar.is-collapsed
  .myclinic-super-toggle {
    right: 50%;
    transform: translateX(50%);
  }

  .myclinic-super-sidebar.is-collapsed
  .myclinic-super-nav {
    padding: 12px 6px;
  }

  .myclinic-super-sidebar.is-collapsed
  .myclinic-super-link {
    justify-content: center !important;
    gap: 0 !important;
    padding: 11px 0 !important;
  }

  .myclinic-super-sidebar.is-collapsed
  .myclinic-super-bottom {
    padding: 12px 6px;
  }

  /* MOBILE */

  @media (max-width: 600px) {
    .myclinic-super-sidebar {
      flex: 0 0 68px !important;

      width: 68px !important;
      min-width: 68px !important;
      max-width: 68px !important;
    }

    .myclinic-super-sidebar .myclinic-super-title,
    .myclinic-super-sidebar .myclinic-super-label {
      display: none !important;
    }

    .myclinic-super-sidebar .myclinic-super-header {
      min-height: 95px;
      margin: 0 6px;
      padding: 34px 0 12px;
    }

    .myclinic-super-sidebar .myclinic-super-logo {
      width: 30px;
      height: 30px;
      font-size: 25px;
    }

    .myclinic-super-sidebar .myclinic-super-toggle {
      right: 50%;
      transform: translateX(50%);
    }

    .myclinic-super-sidebar .myclinic-super-nav {
      padding: 12px 6px;
    }

    .myclinic-super-sidebar .myclinic-super-link {
      justify-content: center !important;
      gap: 0 !important;
      padding: 11px 0 !important;
    }

    .myclinic-super-sidebar .myclinic-super-bottom {
      padding: 12px 6px;
    }
  }
`;

export default function SuperAdminSidebar({
  collapsed: controlledCollapsed,
  onToggle,
  onLogout,
}) {
  const navigate = useNavigate();

  const [internalCollapsed, setInternalCollapsed] = useState(
    () => localStorage.getItem("sa_sidebar_collapsed") === "true"
  );

  const collapsed =
    typeof controlledCollapsed === "boolean"
      ? controlledCollapsed
      : internalCollapsed;

  const toggleSidebar = () => {
    const next = !collapsed;

    localStorage.setItem(
      "sa_sidebar_collapsed",
      String(next)
    );

    if (typeof onToggle === "function") {
      onToggle(next);
    } else {
      setInternalCollapsed(next);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sa_sidebar_collapsed");

    if (typeof onLogout === "function") {
      onLogout();
      return;
    }

    navigate("/", { replace: true });
  };

  return (
    <>
      <style>{styles}</style>

      <aside
        className={`myclinic-super-sidebar ${
          collapsed ? "is-collapsed" : ""
        }`}
        aria-label="Super Admin Navigation"
      >
        {/* HEADER */}
        <div className="myclinic-super-header">
          <button
            type="button"
            className="myclinic-super-toggle"
            onClick={toggleSidebar}
            aria-label={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            title={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
          >
            {collapsed ? (
              <FaChevronRight />
            ) : (
              <FaChevronLeft />
            )}
          </button>

          <div className="myclinic-super-logo">
            <FaShieldHalved />
          </div>

          {!collapsed && (
            <h2 className="myclinic-super-title">
              Super Admin
            </h2>
          )}
        </div>

        {/* NAVIGATION */}
        <nav className="myclinic-super-nav">
          {menuItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              title={label}
              className={({ isActive }) =>
                `myclinic-super-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              <Icon className="myclinic-super-icon" />

              {!collapsed && (
                <span className="myclinic-super-label">
                  {label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* LOGOUT */}
        <div className="myclinic-super-bottom">
          <button
            type="button"
            className="myclinic-super-link myclinic-super-logout"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
          >
            <FaArrowRightFromBracket
              className="myclinic-super-icon"
            />

            {!collapsed && (
              <span className="myclinic-super-label">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}