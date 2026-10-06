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

import "./App.css";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =====================================
            LOGIN
        ===================================== */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />


        {/* =====================================
            DASHBOARD
        ===================================== */}

        <Route
          path="/dashboard"
          element={<AdminDashboard />}
        />


        {/* =====================================
            OWNERS
        ===================================== */}

        <Route
          path="/owners"
          element={<Owners />}
        />

        <Route
          path="/owners/:ownerId"
          element={<OwnerProfile />}
        />


        {/* =====================================
            PETS
        ===================================== */}

        <Route
          path="/pets"
          element={<Pets />}
        />

        <Route
          path="/pets/:petId"
          element={<PetProfile />}
        />


        {/* =====================================
            APPOINTMENTS
        ===================================== */}

        <Route
          path="/appointments"
          element={<Appointments />}
        />


        {/* =====================================
            MEDICAL RECORDS
        ===================================== */}

        <Route
          path="/medical-records"
          element={<MedicalRecords />}
        />


        {/* =====================================
            VACCINATIONS
        ===================================== */}

        <Route
          path="/vaccinations"
          element={<Vaccinations />}
        />


        {/* =====================================
            REMINDERS
        ===================================== */}

        <Route
          path="/reminders"
          element={<Reminders />}
        />


        {/* =====================================
            MEDICATIONS
        ===================================== */}

        <Route
          path="/medications"
          element={<Medications />}
        />


        {/* =====================================
            PRESCRIPTIONS
        ===================================== */}

        <Route
          path="/prescriptions"
          element={<Prescriptions />}
        />


        {/* =====================================
            INVENTORY
        ===================================== */}

        <Route
          path="/inventory"
          element={<Inventory />}
        />


        {/* =====================================
            BILLING
        ===================================== */}

        <Route
          path="/billing"
          element={<Billing />}
        />


        {/* =====================================
            FINANCIAL
        ===================================== */}

        <Route
          path="/financial"
          element={<Financial />}
        />


        {/* =====================================
            REPORTS
        ===================================== */}

        <Route
          path="/reports"
          element={<Reports />}
        />


        {/* =====================================
            USERS
        ===================================== */}

        <Route
          path="/users"
          element={<Users />}
        />


        {/* =====================================
            AUDIT LOG
        ===================================== */}

        <Route
          path="/audit-log"
          element={<AuditLog />}
        />


        {/* =====================================
            SETTINGS
        ===================================== */}

        <Route
          path="/settings"
          element={<Settings />}
        />


        {/* =====================================
            POS
        ===================================== */}

        <Route
          path="/pos"
          element={<POS />}
        />


        {/* =====================================
            STORE HOME
        ===================================== */}

        <Route
          path="/store"
          element={
            <>
              <Home />
              <Footer />
            </>
          }
        />


        {/* =====================================
            ALL PRODUCTS
        ===================================== */}

        <Route
          path="/products"
          element={
            <>
              <Products />
              <Footer />
            </>
          }
        />


        {/* =====================================
            CART
        ===================================== */}

        <Route
          path="/cart"
          element={
            <>
              <Cart />
              <Footer />
            </>
          }
        />


        {/* =====================================
            ORDERS
        ===================================== */}

        <Route
          path="/orders"
          element={<Orders />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;