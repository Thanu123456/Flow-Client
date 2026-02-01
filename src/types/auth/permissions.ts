export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard.view',
  DASHBOARD_REPORTS: 'dashboard.reports',

  // POS Operations
  POS_SALES: 'pos.sales',
  POS_RETURNS: 'pos.returns',
  POS_DISCOUNTS: 'pos.discounts',
  POS_VOID: 'pos.void',

  // Inventory
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_ADD: 'inventory.add',
  INVENTORY_EDIT: 'inventory.edit',
  INVENTORY_DELETE: 'inventory.delete',
  INVENTORY_ADJUST: 'inventory.adjust',

  // Sales
  SALES_VIEW: 'sales.view',
  SALES_REPORTS: 'sales.reports',
  SALES_REFUNDS: 'sales.refunds',

  // Purchases
  PURCHASES_VIEW: 'purchases.view',
  PURCHASES_CREATE: 'purchases.create',
  PURCHASES_APPROVE: 'purchases.approve',
  PURCHASES_RETURNS: 'purchases.returns',

  // Customers
  CUSTOMERS_VIEW: 'customers.view',
  CUSTOMERS_ADD: 'customers.add',
  CUSTOMERS_EDIT: 'customers.edit',
  CUSTOMERS_DELETE: 'customers.delete',

  // Suppliers
  SUPPLIERS_VIEW: 'suppliers.view',
  SUPPLIERS_ADD: 'suppliers.add',
  SUPPLIERS_EDIT: 'suppliers.edit',
  SUPPLIERS_DELETE: 'suppliers.delete',

  // Warranties
  WARRANTIES_VIEW: 'warranties.view',
  WARRANTIES_ADD: 'warranties.add',
  WARRANTIES_EDIT: 'warranties.edit',
  WARRANTIES_DELETE: 'warranties.delete',

  // Reports
  REPORTS_SALES: 'reports.sales',
  REPORTS_INVENTORY: 'reports.inventory',
  REPORTS_FINANCIAL: 'reports.financial',
  REPORTS_EXPORT: 'reports.export',

  // Settings
  SETTINGS_CATEGORIES: 'settings.categories',
  SETTINGS_WAREHOUSES: 'settings.warehouses',
  SETTINGS_SYSTEM: 'settings.system',
  SETTINGS_PAYMENTS: 'settings.payments',

  // Users
  USERS_VIEW: 'users.view',
  USERS_ADD: 'users.add',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  USERS_ROLES: 'users.roles',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
