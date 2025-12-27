import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layouts - Placeholder for now, typically MainLayout, KioskLayout
import PublicRoutes from "./PublicRoutes";
import PrivateRoutes from "./PrivateRoutes";
import SuperAdminRoutes from "./SuperAdminRoutes";
import KioskRoutes from "./KioskRoutes";

// Public Pages
import Login from "../pages/public/Login";
import Signup from "../pages/public/Signup";
import SuperAdminLogin from "../pages/public/SuperAdminLogin";
import ForgotPassword from "../pages/public/ForgotPassword";
import ResetPassword from "../pages/public/ResetPassword";

// Kiosk Pages
import KioskLogin from "../pages/kiosk/KioskLogin";
import KioskPOS from "../pages/kiosk/KioskPOS";

// Admin Pages
import Dashboard from "../pages/admin/Dashboard";
import Brands from "../pages/management/Brands";

// Super Admin Pages (Placeholders for now if not existing)
// import SuperAdminDashboard from '../pages/superadmin/Dashboard';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root redirects to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public Routes */}
      <Route element={<PublicRoutes />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/brands" element={<Brands />} />

        {/* Kiosk Login is public but specific */}
        <Route path="/kiosk" element={<Navigate to="/kiosk/login" replace />} />
        <Route path="/kiosk/login" element={<KioskLogin />} />
      </Route>

      {/* Owner/Admin Private Routes */}
      <Route element={<PrivateRoutes />}>
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Add other protected admin routes here */}
      </Route>

      {/* Super Admin Private Routes */}
      <Route path="/superadmin" element={<SuperAdminRoutes />}>
        <Route
          path="dashboard"
          element={<div>Super Admin Dashboard Placeholder</div>}
        />
      </Route>

      {/* Kiosk Private Routes */}
      <Route path="/kiosk" element={<KioskRoutes />}>
        <Route path="dashboard" element={<KioskPOS />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;
