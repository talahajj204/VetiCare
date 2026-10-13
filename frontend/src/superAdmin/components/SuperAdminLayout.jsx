// import { useState } from "react";
// import { Outlet } from "react-router-dom";

// import SuperAdminSidebar from "./SuperAdminSidebar";
// import "./superAdmin.css";

// export default function SuperAdminLayout() {
//   const [collapsed, setCollapsed] = useState(() => {
//     try {
//       return localStorage.getItem("saCollapsed") === "true";
//     } catch {
//       return false;
//     }
//   });

//   const [mobileOpen, setMobileOpen] = useState(false);

//   function toggleSidebar() {
//     if (window.matchMedia("(max-width: 768px)").matches) {
//       setMobileOpen((previous) => !previous);
//       return;
//     }

//     setCollapsed((previous) => {
//       const next = !previous;

//       try {
//         localStorage.setItem("saCollapsed", String(next));
//       } catch {
//         // Sidebar still works without storage.
//       }

//       return next;
//     });
//   }

//   return (
//     <div
//       className={`sa-shell ${
//         collapsed ? "sa-shell-collapsed" : ""
//       }`}
//     >
//       <SuperAdminSidebar
//         collapsed={collapsed}
//         onToggle={toggleSidebar}
//         mobileOpen={mobileOpen}
//         onMobileClose={() => setMobileOpen(false)}
//       />

//       <main className="sa-main">
//         <Outlet />
//       </main>
//     </div>
//   );
// }