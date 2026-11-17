// frontend/src/auth/permissions.js

const clinicPages = [
  { path: "/dashboard", permission: "Dashboard.View" },
  { path: "/owners", permission: "Owners.View" },
  { path: "/pets", permission: "Pets.View" },
  { path: "/appointments", permission: "Appointments.View" },
  { path: "/medical-records", permission: "MedicalRecords.View" },
  { path: "/vaccinations", permission: "Vaccinations.View" },
  { path: "/reminders", permission: "Reminders.View" },
  { path: "/medications", permission: "Medications.View" },
  { path: "/prescriptions", permission: "Prescriptions.View" },
  { path: "/inventory", permission: "Inventory.View" },
  { path: "/inventory/products", permission: "Inventory.View" },
  { path: "/inventory/categories", permission: "Categories.View" },
  { path: "/pos", permission: "POS.Access" },
  { path: "/admin/orders", permission: "Orders.View" },
  { path: "/admin/sales", permission: "Sales.View" },
  { path: "/billing", permission: "Billing.View" },
  { path: "/financial", permission: "Financial.View" },
  { path: "/reports", permission: "Reports.View" },
  { path: "/audit-log", permission: "AuditLog.View" },
  { path: "/users", adminOnly: true },
  { path: "/settings", adminOnly: true },
];

export function hasPermission(user, permission) {
  const roles = Array.isArray(user?.roles) ? user.roles : [];

  if (roles.includes("SuperAdmin")) return false;

  if (roles.includes("ClinicAdmin")) return true;

  return (
    roles.includes("Staff") &&
    Array.isArray(user?.permissions) &&
    user.permissions.includes(permission)
  );
}

export function canAccessClinicPage(user, pathname) {
  const roles = Array.isArray(user?.roles) ? user.roles : [];

  if (roles.includes("SuperAdmin")) return false;

  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  const page = clinicPages.find(
    (item) => item.path === normalizedPath
  ) ?? (
    /^\/owners\/[^/]+$/.test(normalizedPath)
      ? clinicPages.find((item) => item.path === "/owners")
      : /^\/pets\/[^/]+$/.test(normalizedPath)
        ? clinicPages.find((item) => item.path === "/pets")
        : null
  );

  if (!page) return false;

  if (page.adminOnly) {
    return roles.includes("ClinicAdmin");
  }

  return hasPermission(user, page.permission);
}

export function getHomePath(user) {
  const roles = Array.isArray(user?.roles) ? user.roles : [];

  if (roles.includes("SuperAdmin")) {
    return "/super-admin/dashboard";
  }

  if (roles.includes("ClinicAdmin")) {
    return "/dashboard";
  }

  return (
    clinicPages.find((page) =>
      canAccessClinicPage(user, page.path)
    )?.path ?? "/no-access"
  );
}