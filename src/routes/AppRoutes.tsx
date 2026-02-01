import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Route Guards
import PublicRoutes from "./PublicRoutes";
import PrivateRoutes from "./PrivateRoutes";
import SuperAdminRoutes from "./SuperAdminRoutes";
import KioskRoutes from "./KioskRoutes";
import PermissionRoute from "./PermissionRoute";

// Public Pages
import Login from "../pages/public/Login";
import Signup from "../pages/public/Signup";
import SuperAdminLogin from "../pages/superadmin/SuperAdminLogin";
import ForgotPassword from "../pages/public/ForgotPassword";
import ResetPassword from "../pages/public/ResetPassword";
import ChangePassword from "../pages/public/ChangePassword";
import EmailVerification from "../pages/public/EmailVerification";

// Kiosk Pages
import KioskLogin from "../pages/kiosk/KioskLogin";
import KioskPOS from "../pages/kiosk/KioskPOS";

// Admin Pages
import Dashboard from "../pages/admin/Dashboard";
import {
  Brands,
  Categories,
  SubCategories,
  Units,
  Warehouses,
  Roles,
  Users,
  Variations,
  Customers,
  Suppliers,
  Products,
  AddProduct,
} from "../pages/management";

// Super Admin Pages
import SuperAdminDashboard from "../pages/superadmin/SuperAdminDashboard";
import PendingRegistrations from "../pages/superadmin/PendingRegistrations";
import TenantManagement from "../pages/superadmin/TenantManagement";
import SystemLogs from "../pages/superadmin/SystemLogs";
import SystemSettings from "../pages/superadmin/SystemSettings";

import { PERMISSIONS } from "../types/auth/permissions";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root redirects to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public Routes - for unauthenticated users */}
      <Route element={<PublicRoutes />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<EmailVerification />} />
      </Route>

      {/* Kiosk Login - public, separate from PublicRoutes to avoid redirect loop */}
      <Route path="/kiosk/login" element={<KioskLogin />} />

      {/* Owner/Admin Private Routes */}
      <Route element={<PrivateRoutes />}>
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Product Management Routes */}
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.INVENTORY_VIEW} />
          }
        >
          <Route path="/products" element={<Products />} />
          <Route path="/inventory" element={<Navigate to="/products" replace />} />
        </Route>
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.INVENTORY_ADD} />
          }
        >
          <Route path="/products/add" element={<AddProduct />} />
        </Route>

        <Route path="/brands" element={<Brands />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/subcategories" element={<SubCategories />} />
        <Route path="/units" element={<Units />} />
        <Route path="/warehouses" element={<Warehouses />} />
        <Route path="/variations" element={<Variations />} />

        {/* Management Routes with Permission Guards */}
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.USERS_ROLES} />
          }
        >
          <Route path="/roles" element={<Roles />} />
        </Route>
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.USERS_VIEW} />
          }
        >
          <Route path="/users" element={<Users />} />
        </Route>

        {/* Customer Management Routes */}
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.CUSTOMERS_VIEW} />
          }
        >
          <Route path="/customers" element={<Customers />} />
        </Route>

        {/* Supplier Management Routes */}
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.SUPPLIERS_VIEW} />
          }
        >
          <Route path="/suppliers" element={<Suppliers />} />
        </Route>
      </Route>

      {/* Super Admin Private Routes */}
      <Route path="/superadmin" element={<SuperAdminRoutes />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="change-password" element={<ChangePassword />} />
        <Route path="registrations" element={<PendingRegistrations />} />
        <Route path="tenants" element={<TenantManagement />} />
        <Route path="logs" element={<SystemLogs />} />
        <Route path="settings" element={<SystemSettings />} />
      </Route>

      {/* Kiosk Private Routes */}
      <Route path="/kiosk" element={<KioskRoutes />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<KioskPOS />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;
