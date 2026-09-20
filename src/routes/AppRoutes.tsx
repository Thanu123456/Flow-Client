import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Spin } from "antd";

// Route Guards — kept as static imports: they're tiny wrappers rendered on
// every navigation (not heavy page bodies), so lazy-loading them would just
// add a chunk round-trip with no bundle-size benefit.
import PublicRoutes from "./PublicRoutes";
import PrivateRoutes from "./PrivateRoutes";
import SuperAdminRoutes from "./SuperAdminRoutes";
import KioskRoutes from "./KioskRoutes";
import PermissionRoute from "./PermissionRoute";
import DashboardRoute from "./DashboardRoute";
import { PERMISSIONS } from "../types/auth/permissions";

// ─────────────────────────────────────────────────────────────────────────
// Every page below is loaded on demand (React.lazy + dynamic import) instead
// of bundled into the main chunk. Before this, all ~70 pages — plus whatever
// heavy libraries individual pages pull in (jspdf, html2canvas, recharts,
// etc.) — shipped in a single ~3.6 MB chunk on first load, regardless of
// which single page someone actually opened. Now each page (and its own
// dependencies) only downloads when its route is visited.
// ─────────────────────────────────────────────────────────────────────────

// Public Pages
const Login = lazy(() => import("../pages/public/Login"));
const Signup = lazy(() => import("../pages/public/Signup"));
const SuperAdminLogin = lazy(() => import("../pages/superadmin/SuperAdminLogin"));
const ForgotPassword = lazy(() => import("../pages/public/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/public/ResetPassword"));
const ChangePassword = lazy(() => import("../pages/public/ChangePassword"));
const EmailVerification = lazy(() => import("../pages/public/EmailVerification"));
const GoogleCallback = lazy(() => import("../pages/public/GoogleCallback"));
const DigitalReceipt = lazy(() => import("../pages/public/DigitalReceipt"));

// Kiosk Pages
const KioskLogin = lazy(() => import("../pages/kiosk/KioskLogin"));
const KioskPOS = lazy(() => import("../pages/kiosk/KioskPOS"));

// Admin Pages
const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const Profile = lazy(() => import("../pages/admin/Profile"));
const AdminSettings = lazy(() => import("../pages/admin/Settings"));

const Brands = lazy(() => import("../pages/management/Brands"));
const Categories = lazy(() => import("../pages/management/Categories"));
const SubCategories = lazy(() => import("../pages/management/SubCategories"));
const Units = lazy(() => import("../pages/management/Units"));
const Warehouses = lazy(() => import("../pages/management/Warehouses"));
const Roles = lazy(() => import("../pages/management/Roles"));
const Users = lazy(() => import("../pages/management/Users"));
const Variations = lazy(() => import("../pages/management/Variations"));
const Customers = lazy(() => import("../pages/management/Customers"));
const Suppliers = lazy(() => import("../pages/management/Suppliers"));
const CreditSupplier = lazy(() => import("../pages/management/CreditSupplier"));
const SupplierPayment = lazy(() => import("../pages/management/SupplierPayment"));
const CreditCustomer = lazy(() => import("../pages/management/CreditCustomer"));
const Warranties = lazy(() => import("../pages/management/Warranties"));
const Products = lazy(() => import("../pages/management/Products"));
const Stock = lazy(() => import("../pages/management/Stock"));
const LowStock = lazy(() => import("../pages/inventory/LowStock"));
const OutOfStock = lazy(() => import("../pages/inventory/OutOfStock"));
const ExpiredProducts = lazy(() => import("../pages/inventory/ExpiredProducts"));
const AddProduct = lazy(() => import("../pages/management/AddProduct"));
const EditProduct = lazy(() => import("../pages/management/EditProduct"));
const StockAdjustment = lazy(() => import("../pages/management/StockAdjustment"));
const AddStockAdjustment = lazy(() => import("../pages/management/AddStockAdjustment"));
const WriteOffExpiredStock = lazy(() => import("../pages/management/WriteOffExpiredStock"));
const AdjustmentReasons = lazy(() => import("../pages/management/AdjustmentReasons"));
const StockReconcile = lazy(() => import("../pages/management/StockReconcile"));
const StockTakes = lazy(() => import("../pages/management/StockTakes"));
const StockTakeDetail = lazy(() => import("../pages/management/StockTakeDetail"));

// Transaction Pages
const Purchases = lazy(() => import("../pages/transactions/Purchases"));
const AddPurchase = lazy(() => import("../pages/transactions/AddPurchase"));
const PurchaseOrders = lazy(() => import("../pages/transactions/PurchaseOrders"));
const AddPurchaseOrder = lazy(() => import("../pages/transactions/AddPurchaseOrder"));
const PurchaseReturns = lazy(() => import("../pages/transactions/PurchaseReturns"));
const AddPurchaseReturn = lazy(() => import("../pages/transactions/AddPurchaseReturn"));
const Sales = lazy(() => import("../pages/transactions/Sales"));
const SalesReturns = lazy(() => import("../pages/transactions/SalesReturns"));
const Expenses = lazy(() => import("../pages/transactions/Expenses"));
const ExpenseCategories = lazy(() => import("../pages/transactions/ExpenseCategories"));
const Cheques = lazy(() => import("../pages/transactions/Cheques"));
const ChequeReturns = lazy(() => import("../pages/transactions/ChequeReturns"));
const Reports = lazy(() => import("../pages/reports/Reports"));
const SalesReports = lazy(() => import("../pages/reports/SalesReports"));
const PurchaseReports = lazy(() => import("../pages/reports/PurchaseReports"));
const FinancialReports = lazy(() => import("../pages/reports/FinancialReports"));
const InventoryReports = lazy(() => import("../pages/reports/InventoryReports"));
const LogHistoryReports = lazy(() => import("../pages/reports/LogHistoryReports"));
const TopSellingReports = lazy(() => import("../pages/reports/TopSellingReports"));
const ProcessRefund = lazy(() => import("../pages/transactions/ProcessRefund"));
const HoldBills = lazy(() => import("../pages/transactions/HoldBills"));

const POS = lazy(() => import("../pages/pos/POS"));
const CustomerDisplay = lazy(() => import("../pages/pos/CustomerDisplay"));

// Super Admin Pages
const SuperAdminDashboard = lazy(() => import("../pages/superadmin/SuperAdminDashboard"));
const PendingRegistrations = lazy(() => import("../pages/superadmin/PendingRegistrations"));
const TenantManagement = lazy(() => import("../pages/superadmin/TenantManagement"));
const SystemLogs = lazy(() => import("../pages/superadmin/SystemLogs"));
const SystemSettings = lazy(() => import("../pages/superadmin/SystemSettings"));

// Shared full-page fallback while a route's chunk downloads — mirrors the
// inline spinner each route guard (PrivateRoutes, KioskRoutes, etc.) already
// shows while resolving auth, so a lazy chunk load looks the same as that.
const RouteFallback: React.FC = () => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
    <Spin size="large" />
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<RouteFallback />}>
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
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
      </Route>

      {/* Kiosk Login - public, separate from PublicRoutes to avoid redirect loop */}
      <Route path="/kiosk/login" element={<KioskLogin />} />

      {/* Digital receipt - public, reached via the QR code on a printed receipt */}
      <Route path="/receipt/:tenantId/:saleId" element={<DigitalReceipt />} />

      {/* Customer-facing display - opened as a second window onto the
          customer-facing monitor of a dual-screen till; no auth of its own,
          purely reactive to BroadcastChannel messages from the cashier's POS tab */}
      <Route path="/pos/customer-display" element={<CustomerDisplay />} />

      {/* Owner/Admin Private Routes */}
      <Route element={<PrivateRoutes />}>
        <Route path="/change-password" element={<ChangePassword />} />
        <Route element={<DashboardRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="/profile" element={<Profile />} />

        {/* Product Management Routes */}
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.INVENTORY_VIEW} />
          }
        >
          <Route path="/products" element={<Products />} />
          <Route path="/inventory" element={<Stock />} />
          <Route path="/inventory/low-stock" element={<LowStock />} />
          <Route path="/inventory/out-of-stock" element={<OutOfStock />} />
          <Route path="/inventory/expired" element={<ExpiredProducts />} />
        </Route>
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.INVENTORY_ADD} />
          }
        >
          <Route path="/products/add" element={<AddProduct />} />
        </Route>
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.INVENTORY_EDIT} />
          }
        >
          <Route path="/products/edit/:id" element={<EditProduct />} />
        </Route>

        <Route path="/brands" element={<Brands />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/subcategories" element={<SubCategories />} />
        <Route path="/units" element={<Units />} />
        <Route path="/warehouses" element={<Warehouses />} />
        <Route path="/variations" element={<Variations />} />

        {/* Stock Adjustment Routes */}
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.INVENTORY_ADJUST} />
          }
        >
          <Route path="/adjustments" element={<StockAdjustment />} />
          <Route path="/adjustments/add" element={<AddStockAdjustment />} />
          <Route path="/adjustments/write-off-expired" element={<WriteOffExpiredStock />} />
          <Route path="/adjustments/reasons" element={<AdjustmentReasons />} />
          <Route path="/adjustments/reconcile" element={<StockReconcile />} />
        </Route>

        {/* Stock Take Routes */}
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.INVENTORY_STOCKTAKE} />
          }
        >
          <Route path="/stock-takes" element={<StockTakes />} />
          <Route path="/stock-takes/:id" element={<StockTakeDetail />} />
        </Route>

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
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.SUPPLIERS_CREDIT} />
          }
        >
          <Route path="/credit-supplier" element={<CreditSupplier />} />
          <Route path="/credit-supplier/payment" element={<SupplierPayment />} />
        </Route>
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.CUSTOMERS_CREDIT} />
          }
        >
          <Route path="/credit-customer" element={<CreditCustomer />} />
        </Route>

        {/* Warranty Management Routes */}
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.WARRANTIES_VIEW} />
          }
        >
          <Route path="/warranties" element={<Warranties />} />
        </Route>

        {/* Purchase / GRN Routes */}
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.PURCHASES_VIEW} />
          }
        >
          <Route path="/purchases" element={<Purchases />} />
        </Route>
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.PURCHASES_CREATE} />
          }
        >
          <Route path="/purchases/add" element={<AddPurchase />} />
          <Route path="/purchases/:id/edit" element={<AddPurchase />} />
        </Route>

        {/* Purchase Order Routes */}
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.PURCHASES_VIEW} />
          }
        >
          <Route path="/purchase-orders" element={<PurchaseOrders />} />
        </Route>
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.PURCHASES_CREATE} />
          }
        >
          <Route path="/purchase-orders/add" element={<AddPurchaseOrder />} />
          <Route path="/purchase-orders/:id/edit" element={<AddPurchaseOrder />} />
        </Route>

        {/* Purchase Returns Routes */}
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.PURCHASES_RETURNS} />
          }
        >
          <Route path="/purchase-returns" element={<PurchaseReturns />} />
          <Route path="/purchase-returns/new/:grnId" element={<AddPurchaseReturn />} />
        </Route>

        {/* Expenses Routes */}
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.EXPENSES_VIEW} />
          }
        >
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/expense-categories" element={<ExpenseCategories />} />
        </Route>

        {/* Cheque Register Routes */}
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.CHEQUES_VIEW} />
          }
        >
          <Route path="/cheques" element={<Cheques />} />
          <Route path="/cheque-returns" element={<ChequeReturns />} />
        </Route>

        <Route path="/pos" element={<POS />} />

        {/* Hold Bills Route */}
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.POS_SALES} />
          }
        >
          <Route path="/holds" element={<HoldBills />} />
        </Route>

        {/* Sales Routes */}
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.SALES_VIEW} />
          }
        >
          <Route path="/sales" element={<Sales />} />
        </Route>

        {/* Sale Returns / Refund Routes */}
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.SALES_REFUNDS} />
          }
        >
          <Route path="/sales-returns" element={<SalesReturns />} />
          <Route path="/sales-returns/new" element={<ProcessRefund />} />
          <Route path="/sales-returns/new/:saleId" element={<ProcessRefund />} />
        </Route>

        {/* Reports Routes */}
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.REPORTS_SALES} />
          }
        >
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/sales" element={<SalesReports />} />
          <Route path="/reports/top-selling" element={<TopSellingReports />} />
        </Route>
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.REPORTS_PURCHASES} />
          }
        >
          <Route path="/reports/purchases" element={<PurchaseReports />} />
        </Route>
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.REPORTS_INVENTORY} />
          }
        >
          <Route path="/reports/inventory" element={<InventoryReports />} />
        </Route>
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.REPORTS_FINANCIAL} />
          }
        >
          <Route path="/reports/financial" element={<FinancialReports />} />
        </Route>
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.REPORTS_LOG_HISTORY} />
          }
        >
          <Route path="/reports/log-history" element={<LogHistoryReports />} />
        </Route>

        {/* Settings */}
        <Route
          element={
            <PermissionRoute requiredPermission={PERMISSIONS.SETTINGS_SYSTEM} />
          }
        >
          <Route path="/settings" element={<AdminSettings />} />
          <Route path="/settings/:section" element={<AdminSettings />} />
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
    </Suspense>
  );
};

export default AppRoutes;
