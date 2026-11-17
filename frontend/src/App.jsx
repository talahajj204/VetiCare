import SubscriptionGuard from "./components/SubscriptionGuard";
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";

import {
  canAccessClinicPage,
  getHomePath,
} from "./auth/permissions";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/AdminDashboard";

import Owners from "./pages/Owners";
import OwnerProfile from "./pages/OwnerProfile";
import Pets from "./pages/Pets";
import PetProfile from "./pages/PetProfile";

import Appointments from "./pages/Appointments";
import MedicalRecords from "./pages/MedicalRecords";
import Vaccinations from "./pages/Vaccinations";
import Reminders from "./pages/Reminders";
import Medications from "./pages/Medications";
import Prescriptions from "./pages/Prescriptions";

import Inventory from "./pages/Inventory";
import Categories from "./pages/Categories";
import Billing from "./pages/Billing";
import Financial from "./pages/Financial";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import AuditLog from "./pages/AuditLog";
import Settings from "./pages/Settings";
import POS from "./pages/POS";

import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Footer from "./pages/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import AdminOrders from "./pages/AdminOrders";
import Sales from "./pages/Sales";
import About from "./pages/About";
import Contact from "./pages/Contact";

import SuperAdminDashboard from "./superAdmin/pages/SuperAdminDashboard";
import SuperAdminClinics from "./superAdmin/pages/SuperAdminClinics";
import SuperAdminUsers from "./superAdmin/pages/SuperAdminUsers";
import SuperAdminPlans from "./superAdmin/pages/SuperAdminPlans";
import SuperAdminSubscriptions from "./superAdmin/pages/SuperAdminSubscriptions";

import "./App.css";

function ProtectedRoute({ area }) {
  const location = useLocation();

  const requestKey =
    `${location.pathname}${location.search}`;

  const [retryCount, setRetryCount] = useState(0);

  const [session, setSession] = useState({
    key: "",
    status: "checking",
    user: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    setSession({
      key: requestKey,
      status: "checking",
      user: null,
    });

    async function checkSession() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        if (response.status === 401) {
          if (!controller.signal.aborted) {
            setSession({
              key: requestKey,
              status: "unauthenticated",
              user: null,
            });
          }

          return;
        }

        if (!response.ok) {
          throw new Error("Unable to check session.");
        }

        const user = await response.json();

        if (
          !user ||
          typeof user.id !== "string" ||
          !Array.isArray(user.roles)
        ) {
          throw new Error("Invalid session response.");
        }

        if (!controller.signal.aborted) {
          setSession({
            key: requestKey,
            status: "authenticated",
            user: {
              ...user,
              permissions: Array.isArray(user.permissions)
                ? user.permissions
                : [],
            },
          });
        }
      } catch {
        if (!controller.signal.aborted) {
          setSession({
            key: requestKey,
            status: "error",
            user: null,
          });
        }
      }
    }

    checkSession();

    return () => controller.abort();
  }, [requestKey, retryCount]);

  if (
    session.key !== requestKey ||
    session.status === "checking"
  ) {
    return <p role="status">Checking your session...</p>;
  }

  if (session.status === "unauthenticated") {
    return <Navigate to="/" replace />;
  }

  if (session.status === "error") {
    return (
      <div role="alert">
        <p>
          Unable to connect to the server. Please try again.
        </p>

        <button
          type="button"
          onClick={() => {
            setSession({
              key: requestKey,
              status: "checking",
              user: null,
            });

            setRetryCount((previous) => previous + 1);
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  const user = session.user;
  const isSuperAdmin = user.roles.includes("SuperAdmin");

  const isClinicUser =
    !isSuperAdmin &&
    (
      user.roles.includes("ClinicAdmin") ||
      user.roles.includes("Staff")
    );

  const homePath = getHomePath(user);

  if (area === "super-admin") {
    if (!isSuperAdmin) {
      return <Navigate to={homePath} replace />;
    }
  } else if (area === "clinic") {
    if (isSuperAdmin) {
      return <Navigate to={homePath} replace />;
    }

    if (
      !isClinicUser ||
      !canAccessClinicPage(user, location.pathname)
    ) {
      return <Navigate to={homePath} replace />;
    }
  } else if (area === "no-access") {
    if (homePath !== "/no-access") {
      return <Navigate to={homePath} replace />;
    }
  }

  return (
    <SubscriptionGuard user={user}>
      <Outlet context={{ user }} />
    </SubscriptionGuard>
  );
}

function NoAccess() {
  const { user } = useOutletContext();
  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok && response.status !== 401) {
        throw new Error("Unable to sign out.");
      }

      navigate("/", { replace: true });
    } catch {
      setError("Unable to sign out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: "#f5f7f8",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "32px",
          borderRadius: "16px",
          background: "#ffffff",
          textAlign: "center",
        }}
      >
        <h2>No pages available</h2>

        <p>
          Hello {user.fullName || "there"}. Your account does
          not currently have permission to access any clinic
          pages. Please contact your clinic administrator.
        </p>

        {error && (
          <p role="alert" style={{ color: "#c0392b" }}>
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "Signing out..." : "Sign out"}
        </button>
      </section>
    </main>
  );
}

function StoreUnavailable() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: "#f5f7f8",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "32px",
          borderRadius: "16px",
          background: "#ffffff",
          textAlign: "center",
          color: "#344054",
        }}
      >
        <h2>Open your clinic's store</h2>
        <p>
          Please use the store link provided by your clinic.
        </p>
      </section>
    </main>
  );
}

function StoreRoute() {
  const { clinicId } = useParams();

  const id = Number(clinicId);

  if (
    !/^[1-9]\d*$/.test(clinicId || "") ||
    !Number.isSafeInteger(id)
  ) {
    return <StoreUnavailable />;
  }

  return (
    <Outlet
      key={clinicId}
      context={{
        clinicId: id,
        storeBasePath: `/store/${clinicId}`,
      }}
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}

        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* Super Admin */}

        <Route
          element={<ProtectedRoute area="super-admin" />}
        >
          <Route
            path="/super-admin/dashboard"
            element={<SuperAdminDashboard />}
          />

          <Route
            path="/super-admin/clinics"
            element={<SuperAdminClinics />}
          />

          <Route
            path="/super-admin/users"
            element={<SuperAdminUsers />}
          />

          <Route
            path="/super-admin/plans"
            element={<SuperAdminPlans />}
          />

          <Route
            path="/super-admin/subscriptions"
            element={<SuperAdminSubscriptions />}
          />
        </Route>

        {/* Clinic pages */}

        <Route element={<ProtectedRoute area="clinic" />}>
          <Route
            path="/dashboard"
            element={<AdminDashboard />}
          />

          <Route path="/owners" element={<Owners />} />

          <Route
            path="/owners/:ownerId"
            element={<OwnerProfile />}
          />

          <Route path="/pets" element={<Pets />} />

          <Route
            path="/pets/:petId"
            element={<PetProfile />}
          />

          <Route
            path="/appointments"
            element={<Appointments />}
          />

          <Route
            path="/medical-records"
            element={<MedicalRecords />}
          />

          <Route
            path="/vaccinations"
            element={<Vaccinations />}
          />

          <Route
            path="/reminders"
            element={<Reminders />}
          />

          <Route
            path="/medications"
            element={<Medications />}
          />

          <Route
            path="/prescriptions"
            element={<Prescriptions />}
          />

          <Route
            path="/inventory"
            element={<Inventory />}
          />

          <Route
            path="/inventory/products"
            element={<Inventory />}
          />

          <Route
            path="/inventory/categories"
            element={<Categories />}
          />

          <Route path="/billing" element={<Billing />} />

          <Route
            path="/financial"
            element={<Financial />}
          />

          <Route path="/reports" element={<Reports />} />
          <Route path="/users" element={<Users />} />

          <Route
            path="/audit-log"
            element={<AuditLog />}
          />

          <Route path="/settings" element={<Settings />} />
          <Route path="/pos" element={<POS />} />

          <Route
            path="/admin/orders"
            element={<AdminOrders />}
          />

          <Route
            path="/admin/sales"
            element={<Sales />}
          />
        </Route>

        {/* Accounts without page permissions */}

        <Route
          element={<ProtectedRoute area="no-access" />}
        >
          <Route
            path="/no-access"
            element={<NoAccess />}
          />
        </Route>

        {/* Public store for each clinic */}

        <Route
          path="/store/:clinicId"
          element={<StoreRoute />}
        >
          <Route
            index
            element={
              <>
                <Home />
                <Footer />
              </>
            }
          />

          <Route
            path="about"
            element={
              <>
                <About />
                <Footer />
              </>
            }
          />

          <Route
            path="contact"
            element={
              <>
                <Contact />
                <Footer />
              </>
            }
          />

          <Route
            path="products"
            element={
              <>
                <Products />
                <Footer />
              </>
            }
          />

          <Route
            path="products/:id"
            element={<ProductDetails />}
          />

          <Route
            path="cart"
            element={
              <>
                <Cart />
                <Footer />
              </>
            }
          />

          <Route path="orders" element={<Orders />} />
        </Route>

        <Route
          path="/store"
          element={<StoreUnavailable />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;