import React, { useMemo } from 'react';
import { Menu, Avatar, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  AppstoreOutlined,
  ClusterOutlined,
  InboxOutlined,
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
  SettingOutlined,
  ShopOutlined,
  LogoutOutlined,
  BankOutlined,
  DollarOutlined,
  BarChartOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { usePermissions } from '../../../hooks/auth/usePermissions';
import { PERMISSIONS } from '../../../types/auth/permissions';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

type MenuItem = Required<MenuProps>['items'][number];

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { hasPermission, isOwner } = usePermissions();

  const sidebarWidth = collapsed ? 80 : 260;

  // Get current selected key from path
  const selectedKey = useMemo(() => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path.startsWith('/brands')) return 'brands';
    if (path.startsWith('/categories')) return 'categories';
    if (path.startsWith('/units')) return 'units';
    if (path.startsWith('/products')) return 'products';
    if (path.startsWith('/inventory')) return 'inventory';
    if (path.startsWith('/warehouses')) return 'warehouses';
    if (path.startsWith('/sales')) return 'sales';
    if (path.startsWith('/pos')) return 'pos';
    if (path.startsWith('/purchases')) return 'purchases';
    if (path.startsWith('/suppliers')) return 'suppliers';
    if (path.startsWith('/customers')) return 'customers';
    if (path.startsWith('/users')) return 'users';
    if (path.startsWith('/roles')) return 'roles';
    if (path.startsWith('/reports')) return 'reports';
    if (path.startsWith('/settings')) return 'settings';
    return 'dashboard';
  }, [location.pathname]);

  // Get open keys for submenus
  const openKeys = useMemo(() => {
    const path = location.pathname;
    const keys: string[] = [];
    if (['/brands', '/categories', '/units', '/products', '/inventory', '/warehouses'].some(p => path.startsWith(p))) {
      keys.push('inventory-management');
    }
    if (['/sales', '/pos', '/purchases', '/returns'].some(p => path.startsWith(p))) {
      keys.push('sales-management');
    }
    if (['/customers', '/suppliers'].some(p => path.startsWith(p))) {
      keys.push('contacts');
    }
    if (['/users', '/roles'].some(p => path.startsWith(p))) {
      keys.push('user-management');
    }
    return keys;
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Build menu items based on permissions
  const menuItems: MenuItem[] = useMemo(() => {
    const items: MenuItem[] = [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: <Link to="/dashboard">Dashboard</Link>,
      },
    ];

    // Inventory Management Group
    const inventoryItems: MenuItem[] = [];

    if (isOwner || hasPermission(PERMISSIONS.INVENTORY_VIEW)) {
      inventoryItems.push(
        {
          key: 'products',
          icon: <InboxOutlined />,
          label: <Link to="/products">Products</Link>,
        },
        {
          key: 'inventory',
          icon: <AppstoreOutlined />,
          label: <Link to="/inventory">Stock</Link>,
        }
      );
    }

    if (isOwner || hasPermission(PERMISSIONS.SETTINGS_WAREHOUSES)) {
      inventoryItems.push({
        key: 'warehouses',
        icon: <BankOutlined />,
        label: <Link to="/warehouses">Warehouses</Link>,
      });
    }

    if (isOwner || hasPermission(PERMISSIONS.SETTINGS_CATEGORIES)) {
      inventoryItems.push(
        {
          key: 'categories',
          icon: <ClusterOutlined />,
          label: <Link to="/categories">Categories</Link>,
        },
        {
          key: 'brands',
          icon: <TagsOutlined />,
          label: <Link to="/brands">Brands</Link>,
        },
        {
          key: 'units',
          icon: <AppstoreOutlined />,
          label: <Link to="/units">Units</Link>,
        }
      );
    }

    if (inventoryItems.length > 0) {
      items.push({
        key: 'inventory-management',
        icon: <InboxOutlined />,
        label: 'Inventory',
        children: inventoryItems,
      });
    }

    // Sales Management Group
    const salesItems: MenuItem[] = [];

    if (isOwner || hasPermission(PERMISSIONS.POS_SALES)) {
      salesItems.push({
        key: 'pos',
        icon: <ShoppingCartOutlined />,
        label: <Link to="/pos">POS Terminal</Link>,
      });
    }

    if (isOwner || hasPermission(PERMISSIONS.SALES_VIEW)) {
      salesItems.push({
        key: 'sales',
        icon: <DollarOutlined />,
        label: <Link to="/sales">Sales</Link>,
      });
    }

    if (isOwner || hasPermission(PERMISSIONS.PURCHASES_VIEW)) {
      salesItems.push({
        key: 'purchases',
        icon: <FileTextOutlined />,
        label: <Link to="/purchases">Purchases</Link>,
      });
    }

    if (salesItems.length > 0) {
      items.push({
        key: 'sales-management',
        icon: <ShoppingCartOutlined />,
        label: 'Sales',
        children: salesItems,
      });
    }

    // Contacts Group
    const contactItems: MenuItem[] = [];

    if (isOwner || hasPermission(PERMISSIONS.CUSTOMERS_VIEW)) {
      contactItems.push({
        key: 'customers',
        icon: <TeamOutlined />,
        label: <Link to="/customers">Customers</Link>,
      });
    }

    if (isOwner || hasPermission(PERMISSIONS.SUPPLIERS_VIEW)) {
      contactItems.push({
        key: 'suppliers',
        icon: <ShopOutlined />,
        label: <Link to="/suppliers">Suppliers</Link>,
      });
    }

    if (contactItems.length > 0) {
      items.push({
        key: 'contacts',
        icon: <TeamOutlined />,
        label: 'Contacts',
        children: contactItems,
      });
    }

    // Reports
    if (isOwner || hasPermission(PERMISSIONS.REPORTS_SALES) || hasPermission(PERMISSIONS.REPORTS_INVENTORY)) {
      items.push({
        key: 'reports',
        icon: <BarChartOutlined />,
        label: <Link to="/reports">Reports</Link>,
      });
    }

    // User Management Group
    const userItems: MenuItem[] = [];

    if (isOwner || hasPermission(PERMISSIONS.USERS_VIEW)) {
      userItems.push({
        key: 'users',
        icon: <UserOutlined />,
        label: <Link to="/users">Users</Link>,
      });
    }

    if (isOwner || hasPermission(PERMISSIONS.USERS_ROLES)) {
      userItems.push({
        key: 'roles',
        icon: <SafetyOutlined />,
        label: <Link to="/roles">Roles</Link>,
      });
    }

    if (userItems.length > 0) {
      items.push({
        key: 'user-management',
        icon: <TeamOutlined />,
        label: 'Team',
        children: userItems,
      });
    }

    // Settings
    if (isOwner || hasPermission(PERMISSIONS.SETTINGS_SYSTEM)) {
      items.push({
        key: 'settings',
        icon: <SettingOutlined />,
        label: <Link to="/settings">Settings</Link>,
      });
    }

    return items;
  }, [isOwner, hasPermission]);

  return (
    <aside
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: sidebarWidth,
        background: 'linear-gradient(180deg, #1a1f37 0%, #0d1025 100%)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
        boxShadow: '4px 0 20px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
      }}
    >
      {/* Logo Section */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '0 16px' : '0 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
            }}
          >
            <ShoppingCartOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          {!collapsed && (
            <span
              style={{
                fontWeight: 700,
                fontSize: 20,
                color: '#fff',
                letterSpacing: '-0.5px',
              }}
            >
              FlowPOS
            </span>
          )}
        </div>
        {!collapsed && (
          <Tooltip title="Collapse sidebar">
            <MenuFoldOutlined
              onClick={onToggle}
              style={{
                color: 'rgba(255, 255, 255, 0.65)',
                fontSize: 18,
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
            />
          </Tooltip>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div
          style={{
            padding: '12px 0',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Tooltip title="Expand sidebar" placement="right">
            <MenuUnfoldOutlined
              onClick={onToggle}
              style={{
                color: 'rgba(255, 255, 255, 0.65)',
                fontSize: 18,
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
            />
          </Tooltip>
        </div>
      )}

      {/* User Profile Section */}
      {!collapsed && (
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar
              size={42}
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                fontWeight: 600,
              }}
            >
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 14,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.full_name || 'User'}
              </div>
              <div
                style={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: 12,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {isOwner ? 'Owner' : 'Employee'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '8px 0',
        }}
      >
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={collapsed ? [] : openKeys}
          items={menuItems}
          inlineCollapsed={collapsed}
          style={{
            background: 'transparent',
            border: 'none',
          }}
          theme="dark"
        />
      </div>

      {/* Bottom Section */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: collapsed ? '12px 0' : '12px 16px',
        }}
      >
        {collapsed ? (
          <Tooltip title="Logout" placement="right">
            <div
              onClick={handleLogout}
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '10px 0',
                cursor: 'pointer',
                color: 'rgba(255, 255, 255, 0.65)',
                transition: 'color 0.2s',
              }}
            >
              <LogoutOutlined style={{ fontSize: 18 }} />
            </div>
          </Tooltip>
        ) : (
          <div
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              borderRadius: 8,
              cursor: 'pointer',
              color: 'rgba(255, 255, 255, 0.65)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = '#ff4d4f';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)';
            }}
          >
            <LogoutOutlined style={{ fontSize: 18 }} />
            <span style={{ fontSize: 14 }}>Logout</span>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style>
        {`
          /* Menu Base Styles */
          .ant-menu-dark {
            background: transparent !important;
          }

          .ant-menu-dark .ant-menu-item {
            margin: 4px 12px !important;
            border-radius: 8px !important;
            height: 44px !important;
            line-height: 44px !important;
            color: rgba(255, 255, 255, 0.65) !important;
            transition: all 0.2s ease !important;
          }

          .ant-menu-dark .ant-menu-item:hover {
            background: rgba(255, 255, 255, 0.08) !important;
            color: #fff !important;
          }

          .ant-menu-dark .ant-menu-item-selected {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: #fff !important;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
          }

          .ant-menu-dark .ant-menu-item-selected::after {
            display: none !important;
          }

          /* Submenu Styles */
          .ant-menu-dark .ant-menu-submenu-title {
            margin: 4px 12px !important;
            border-radius: 8px !important;
            height: 44px !important;
            line-height: 44px !important;
            color: rgba(255, 255, 255, 0.65) !important;
          }

          .ant-menu-dark .ant-menu-submenu-title:hover {
            background: rgba(255, 255, 255, 0.08) !important;
            color: #fff !important;
          }

          .ant-menu-dark .ant-menu-submenu-selected > .ant-menu-submenu-title {
            color: #fff !important;
          }

          .ant-menu-dark .ant-menu-sub {
            background: rgba(0, 0, 0, 0.2) !important;
            border-radius: 8px !important;
            margin: 4px 12px !important;
            padding: 4px 0 !important;
          }

          .ant-menu-dark .ant-menu-sub .ant-menu-item {
            margin: 2px 8px !important;
            padding-left: 24px !important;
            height: 40px !important;
            line-height: 40px !important;
          }

          /* Collapsed State */
          .ant-menu-inline-collapsed .ant-menu-item {
            padding: 0 !important;
            text-align: center !important;
          }

          .ant-menu-inline-collapsed .ant-menu-submenu-title {
            padding: 0 !important;
            text-align: center !important;
          }

          /* Icon Styles */
          .ant-menu-dark .ant-menu-item .anticon,
          .ant-menu-dark .ant-menu-submenu-title .anticon {
            font-size: 18px !important;
          }

          /* Scrollbar Styles */
          aside::-webkit-scrollbar {
            width: 6px;
          }

          aside::-webkit-scrollbar-track {
            background: transparent;
          }

          aside::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
          }

          aside::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }

          /* Submenu Arrow */
          .ant-menu-dark .ant-menu-submenu-arrow {
            color: rgba(255, 255, 255, 0.45) !important;
          }

          .ant-menu-dark .ant-menu-submenu:hover > .ant-menu-submenu-title > .ant-menu-submenu-arrow {
            color: #fff !important;
          }
        `}
      </style>
    </aside>
  );
};

export default Sidebar;
