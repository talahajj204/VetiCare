
import { BrowserRouter, Routes, Route } from "react-router-dom";

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

// SUPER ADMIN
import SuperAdminDashboard from "./superAdmin/pages/SuperAdminDashboard";
import SuperAdminClinics from "./superAdmin/pages/SuperAdminClinics";
import SuperAdminUsers from "./superAdmin/pages/SuperAdminUsers";
// import SuperAdminPlans from "./superAdmin/pages/SuperAdminPlans";
// import SuperAdminSubscriptions from "./superAdmin/pages/SuperAdminSubscriptions";
import SuperAdminPlans from "./superAdmin/pages/SuperAdminPlans";
import SuperAdminSubscriptions from "./superAdmin/pages/SuperAdminSubscriptions";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================================
            AUTHENTICATION
        ================================= */}

        <Route path="/" element={<Login />} />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* ================================
            SUPER ADMIN
        ================================= */}

        <Route
          path="/super-admin/dashboard"
          element={<SuperAdminDashboard />}
        />

        {/* ================================
            CLINIC ADMIN DASHBOARD
        ================================= */}

        <Route
          path="/dashboard"
          element={<AdminDashboard />}
        />

        {/* ================================
            OWNERS
        ================================= */}

        <Route
          path="/owners"
          element={<Owners />}
        />

        <Route
          path="/owners/:ownerId"
          element={<OwnerProfile />}
        />

        {/* ================================
            PETS
        ================================= */}

        <Route
          path="/pets"
          element={<Pets />}
        />

        <Route
          path="/pets/:petId"
          element={<PetProfile />}
        />

        {/* ================================
            APPOINTMENTS
        ================================= */}

        <Route
          path="/appointments"
          element={<Appointments />}
        />

        {/* ================================
            MEDICAL RECORDS
        ================================= */}

        <Route
          path="/medical-records"
          element={<MedicalRecords />}
        />

        {/* ================================
            VACCINATIONS
        ================================= */}

        <Route
          path="/vaccinations"
          element={<Vaccinations />}
        />

        {/* ================================
            REMINDERS
        ================================= */}

        <Route
          path="/reminders"
          element={<Reminders />}
        />

        {/* ================================
            MEDICATIONS
        ================================= */}

        <Route
          path="/medications"
          element={<Medications />}
        />

        {/* ================================
            PRESCRIPTIONS
        ================================= */}

        <Route
          path="/prescriptions"
          element={<Prescriptions />}
        />

        {/* ================================
            INVENTORY
        ================================= */}

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

        {/* ================================
            BILLING
        ================================= */}

        <Route
          path="/billing"
          element={<Billing />}
        />

        {/* ================================
            FINANCIAL
        ================================= */}

        <Route
          path="/financial"
          element={<Financial />}
        />

        {/* ================================
            REPORTS
        ================================= */}

        <Route
          path="/reports"
          element={<Reports />}
        />

        {/* ================================
            USERS
        ================================= */}

        <Route
          path="/users"
          element={<Users />}
        />

        {/* ================================
            AUDIT LOG
        ================================= */}

        <Route
          path="/audit-log"
          element={<AuditLog />}
        />

        {/* ================================
            SETTINGS
        ================================= */}

        <Route
          path="/settings"
          element={<Settings />}
        />

        {/* ================================
            POS
        ================================= */}

        <Route
          path="/pos"
          element={<POS />}
        />

        {/* ================================
            ADMIN ORDERS
        ================================= */}

        <Route
          path="/admin/orders"
          element={<AdminOrders />}
        />

        {/* ================================
            ADMIN SALES
        ================================= */}

        <Route
          path="/admin/sales"
          element={<Sales />}
        />

        {/* ================================
            STORE HOME
        ================================= */}

        <Route
          path="/store"
          element={
            <>
              <Home />
              <Footer />
            </>
          }
        />

        {/* ================================
            ABOUT US
        ================================= */}

        <Route
          path="/about"
          element={
            <>
              <About />
              <Footer />
            </>
          }
        />

        {/* ================================
            CONTACT US
        ================================= */}

        <Route
          path="/contact"
          element={
            <>
              <Contact />
              <Footer />
            </>
          }
        />

        {/* ================================
            STORE PRODUCTS
        ================================= */}

        <Route
          path="/products"
          element={
            <>
              <Products />
              <Footer />
            </>
          }
        />

        {/* ================================
            PRODUCT DETAILS
        ================================= */}

        <Route
          path="/products/:id"
          element={<ProductDetails />}
        />

        {/* ================================
            CART
        ================================= */}

        <Route
          path="/cart"
          element={
            <>
              <Cart />
              <Footer />
            </>
          }
        />

        {/* ================================
            CUSTOMER ORDERS
        ================================= */}

        <Route
          path="/orders"
          element={<Orders />}
        />
        <Route
  path="/super-admin/clinics"
  element={<SuperAdminClinics />}
/>
<Route
  path="/super-admin/users"
  element={<SuperAdminUsers />}
/>
{/* <Route
  path="/super-admin/plans"
  element={<SuperAdminPlans />}
/>

<Route
  path="/super-admin/subscriptions"
  element={<SuperAdminPlans />}
/> */}
{/* <Route
  path="/super-admin/plans"
  element={<SuperAdminPlans />}
/>

<Route
  path="/super-admin/subscriptions"
  element={<SuperAdminSubscriptions />}
/> */}

<Route
  path="/super-admin/plans"
  element={<SuperAdminPlans />}
/>

<Route
  path="/super-admin/subscriptions"
  element={<SuperAdminSubscriptions />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
