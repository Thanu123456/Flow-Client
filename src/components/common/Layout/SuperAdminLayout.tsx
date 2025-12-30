import React, { useState, useMemo } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Avatar, Tooltip, theme } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  ClockCircleOutlined,
  ShopOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';

const { Content } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const SuperAdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { token: themeToken } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const sidebarWidth = collapsed ? 80 : 260;

  // Get current selected key from path
  const selectedKey = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/superadmin/dashboard')) return 'dashboard';
    if (path.includes('/superadmin/registrations')) return 'registrations';
    if (path.includes('/superadmin/tenants')) return 'tenants';
    if (path.includes('/superadmin/logs')) return 'logs';
    if (path.includes('/superadmin/settings')) return 'settings';
    return 'dashboard';
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/superadmin/login');
  };

  const menuItems: MenuItem[] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/superadmin/dashboard">Dashboard</Link>,
    },
    {
      key: 'registrations',
      icon: <ClockCircleOutlined />,
      label: <Link to="/superadmin/registrations">Pending Registrations</Link>,
    },
    {
      key: 'tenants',
      icon: <ShopOutlined />,
      label: <Link to="/superadmin/tenants">Tenant Management</Link>,
    },
    {
      key: 'logs',
      icon: <FileTextOutlined />,
      label: <Link to="/superadmin/logs">System Logs</Link>,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <Link to="/superadmin/settings">System Settings</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
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
                background: 'linear-gradient(135deg, #f5222d 0%, #722ed1 100%)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(245, 34, 45, 0.4)',
              }}
            >
              <SafetyCertificateOutlined style={{ color: '#fff', fontSize: 20 }} />
            </div>
            {!collapsed && (
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 18,
                  color: '#fff',
                  letterSpacing: '-0.5px',
                }}
              >
                Super Admin
              </span>
            )}
          </div>
          {!collapsed && (
            <Tooltip title="Collapse sidebar">
              <MenuFoldOutlined
                onClick={() => setCollapsed(true)}
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
                onClick={() => setCollapsed(false)}
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
                  background: 'linear-gradient(135deg, #f5222d 0%, #722ed1 100%)',
                  fontWeight: 600,
                }}
              >
                {user?.full_name?.charAt(0).toUpperCase() || 'S'}
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
                  {user?.full_name || 'Super Admin'}
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
                  Super Administrator
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
            items={menuItems}
            inlineCollapsed={collapsed}
            style={{
              background: 'transparent',
              border: 'none',
            }}
            theme="dark"
          />
        </div>

        {/* Bottom Section - Logout */}
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
            /* SuperAdmin Menu Styles */
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
              background: linear-gradient(135deg, #f5222d 0%, #722ed1 100%) !important;
              color: #fff !important;
              box-shadow: 0 4px 12px rgba(245, 34, 45, 0.4) !important;
            }

            .ant-menu-dark .ant-menu-item-selected::after {
              display: none !important;
            }

            /* Collapsed State */
            .ant-menu-inline-collapsed .ant-menu-item {
              padding: 0 !important;
              text-align: center !important;
            }

            /* Icon Styles */
            .ant-menu-dark .ant-menu-item .anticon {
              font-size: 18px !important;
            }
          `}
        </style>
      </aside>

      {/* Main Content */}
      <Layout
        style={{
          marginLeft: sidebarWidth,
          transition: 'margin-left 0.3s cubic-bezier(0.2, 0, 0, 1)',
          minHeight: '100vh',
        }}
      >
        <Content
          style={{
            background: themeToken.colorBgLayout,
            minHeight: '100vh',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default SuperAdminLayout;
