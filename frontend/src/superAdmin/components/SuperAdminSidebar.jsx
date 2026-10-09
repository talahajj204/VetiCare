
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaShieldHalved,
  FaHouse,
  FaUsers,
  FaLayerGroup,
  FaCreditCard,
  FaGear,
  FaRightFromBracket,
  FaBars,
  FaXmark,
} from "react-icons/fa6";

const styles = `
.sa-sidebar, .sa-sidebar * { box-sizing: border-box; }

.sa-sidebar {
  width: 260px;
  flex: 0 0 260px;
  height: 100vh;
  height: 100dvh;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  padding: 24px 14px;
  background: linear-gradient(180deg,#42aaa6,#269b97);
  color: white;
  transition: width .25s, flex-basis .25s;
  z-index: 30;
}

.sa-sidebar.collapsed {
  width: 72px;
  flex-basis: 72px;
  padding-left: 8px;
  padding-right: 8px;
}

.sa-sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 38px;
  min-width: 0;
}

.sa-sidebar-logo {
  width: 46px !important;
  min-width: 46px;
  height: 46px;
  padding: 0 !important;
  border: 0;
  border-radius: 12px;
  background: white !important;
  color: #269b97 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  cursor: pointer;
}

.sa-sidebar-brand-text {
  min-width: 0;
  white-space: nowrap;
}

.sa-sidebar-brand-text h2 {
  margin: 0;
  color: white;
  font-size: 18px;
  line-height: 1.3;
}

.sa-sidebar-brand-text p {
  margin: 5px 0 0;
  color: #e0f7f5;
  font-size: 11px;
}

.sa-sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.sa-sidebar-link {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  min-height: 48px;
  padding: 0 14px;
  border-radius: 11px;
  color: white !important;
  text-decoration: none !important;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.sa-sidebar-link:hover {
  background: rgba(0,0,0,.12);
}

.sa-sidebar-link.active {
  background: rgba(0,76,75,.42);
}

.sa-sidebar-link svg {
  width: 19px;
  height: 19px;
  flex-shrink: 0;
}

.sa-sidebar-bottom {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sa-sidebar-logout {
  width: 100% !important;
  min-height: 48px;
  padding: 0 14px !important;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 0;
  border-radius: 11px;
  background: transparent !important;
  color: white !important;
  text-align: left;
  font-size: 14px;
  cursor: pointer;
}

.sa-sidebar-logout:hover {
  background: rgba(0,0,0,.12) !important;
}

.sa-sidebar-logout svg {
  width: 19px;
  height: 19px;
  flex-shrink: 0;
}

.sa-sidebar.collapsed .sa-sidebar-brand-text,
.sa-sidebar.collapsed .sa-sidebar-label {
  display: none;
}

.sa-sidebar.collapsed .sa-sidebar-brand {
  justify-content: center;
}

.sa-sidebar.collapsed .sa-sidebar-link,
.sa-sidebar.collapsed .sa-sidebar-logout {
  justify-content: center;
  padding: 0 !important;
  gap: 0;
}

.sa-sidebar-mobile-open,
.sa-sidebar-mobile-close,
.sa-sidebar-overlay {
  display: none;
}

@media(max-width:768px) {
  .sa-sidebar,
  .sa-sidebar.collapsed {
    position: fixed;
    left: 0;
    top: 0;
    width: min(280px,85vw);
    height: 100dvh;
    padding: 24px 14px;
    transform: translateX(-105%);
    transition: transform .25s;
    z-index: 2000;
  }

  .sa-sidebar.mobile-open,
  .sa-sidebar.collapsed.mobile-open {
    transform: translateX(0);
  }

  .sa-sidebar.collapsed .sa-sidebar-brand-text,
  .sa-sidebar.collapsed .sa-sidebar-label {
    display: block;
  }

  .sa-sidebar.collapsed .sa-sidebar-brand {
    justify-content: flex-start;
  }

  .sa-sidebar.collapsed .sa-sidebar-link,
  .sa-sidebar.collapsed .sa-sidebar-logout {
    justify-content: flex-start;
    padding: 0 14px !important;
    gap: 16px;
  }

  .sa-sidebar-mobile-open {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 16px;
    left: 16px;
    width: 44px !important;
    height: 44px;
    padding: 0 !important;
    z-index: 1000;
    background: #269b97 !important;
    color: white !important;
    border: 0;
    border-radius: 10px;
  }

  .sa-sidebar-mobile-close {
    display: flex;
    margin-left: auto;
    width: 30px !important;
    height: 30px;
    padding: 0 !important;
    align-items: center;
    justify-content: center;
    border: 0;
    background: transparent !important;
    color: white !important;
  }

  .sa-sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 1999;
    background: rgba(0,0,0,.4);
  }
}
`;

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

export default function SuperAdminSidebar() {
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("saCollapsed") === "true";
    } catch {
      return false;
    }
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setCollapsed((previous) => {
      const next = !previous;

      try {
        localStorage.setItem("saCollapsed", String(next));
      } catch {
        // Sidebar still works without localStorage.
      }

      return next;
    });
  };

  const logout = () => {
    setMobileOpen(false);
    // Connect this to the real authentication logout action.
    navigate("/");
  };

  return (
    <>
      <style>{styles}</style>

      <button
        type="button"
        className="sa-sidebar-mobile-open"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
      >
        <FaBars />
      </button>

      {mobileOpen && (
        <div
          className="sa-sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`sa-sidebar ${
          collapsed ? "collapsed" : ""
        } ${mobileOpen ? "mobile-open" : ""}`}
      >
        <div className="sa-sidebar-brand">
          <button
            type="button"
            className="sa-sidebar-logo"
            onClick={() => {
              if (window.innerWidth <= 768) {
                setMobileOpen(false);
              } else {
                toggleSidebar();
              }
            }}
            title="Toggle sidebar"
            aria-label="Toggle sidebar"
          >
            <FaShieldHalved />
          </button>

          <div className="sa-sidebar-brand-text">
            <h2>Super Admin</h2>
            <p>System Management</p>
          </div>

          <button
            type="button"
            className="sa-sidebar-mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <FaXmark />
          </button>
        </div>

        <nav className="sa-sidebar-nav">
          {menuItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end
              title={collapsed ? label : undefined}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `sa-sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon />
              <span className="sa-sidebar-label">
                {label}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="sa-sidebar-bottom">
          <NavLink
            to="/super-admin/settings"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `sa-sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <FaGear />
            <span className="sa-sidebar-label">
              Settings
            </span>
          </NavLink>

          <button
            type="button"
            className="sa-sidebar-logout"
            onClick={logout}
          >
            <FaRightFromBracket />
            <span className="sa-sidebar-label">
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
