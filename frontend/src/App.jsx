
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/AdminDashboard";
import Owners from "./pages/Owners";
import Pets from "./pages/Pets";

import Appointments from "./pages/Appointments";

import MedicalRecords from "./pages/MedicalRecords";
import Vaccinations from "./pages/Vaccinations";
import Reminders from "./pages/Reminders";

import Medications from "./pages/Medications";

import Prescriptions from "./pages/Prescriptions";

import Inventory from "./pages/Inventory";

import Billing from "./pages/Billing";

import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

import "./App.css";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/owners" element={<Owners />} />
        
        <Route path="/pets" element={<Pets />} />
        
        <Route path="/appointments" element={<Appointments />} />
       
        <Route path="/medical-records" element={<MedicalRecords />} />
       
        <Route path="/vaccinations" element={<Vaccinations />} />
        
        <Route path="/reminders" element={<Reminders />} />
        
        <Route path="/medications" element={<Medications />} />
        <Route path="/prescriptions" element={<Prescriptions />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        
      </Routes>
    </BrowserRouter>
  );
}
export default App;
