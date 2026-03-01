import React, { useMemo, useState } from "react";
import { Tooltip, Avatar } from "antd";
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
  SafetyCertificateOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { usePermissions } from "../../../hooks/auth/usePermissions";
import { PERMISSIONS } from "../../../types/auth/permissions";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: NavItem[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { hasPermission, isOwner } = usePermissions();
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const sidebarWidth = collapsed ? 72 : 264;

  // Determine selected item from path
  const selectedKey = useMemo(() => {
    const path = location.pathname;
    if (path === "/dashboard") return "dashboard";
    if (path.startsWith("/brands")) return "brands";
    if (path.startsWith("/categories")) return "categories";
    if (path.startsWith("/subcategories")) return "subcategories";
    if (path.startsWith("/units")) return "units";
    if (path.startsWith("/products")) return "products";
    if (path.startsWith("/inventory")) return "inventory";
    if (path.startsWith("/warehouses")) return "warehouses";
    if (path.startsWith("/variations")) return "variations";
    if (path.startsWith("/warranties")) return "warranties";
    if (path.startsWith("/sales")) return "sales";
    if (path.startsWith("/pos")) return "pos";
    if (path.startsWith("/purchases")) return "purchases";
    if (path.startsWith("/suppliers")) return "suppliers";
    if (path.startsWith("/customers")) return "customers";
    if (path.startsWith("/users")) return "users";
    if (path.startsWith("/roles")) return "roles";
    if (path.startsWith("/reports")) return "reports";
    if (path.startsWith("/settings")) return "settings";
    return "dashboard";
  }, [location.pathname]);

  // Auto-expand relevant groups
  useMemo(() => {
    const path = location.pathname;
    const newExpanded = new Set<string>();
    if (
      [
        "/brands", "/categories", "/subcategories",
        "/units", "/products", "/inventory",
        "/warehouses", "/variations", "/warranties",
      ].some((p) => path.startsWith(p))
    ) newExpanded.add("inventory");
    if (
      ["/sales", "/pos", "/purchases"].some((p) => path.startsWith(p))
    ) newExpanded.add("transactions");
    if (
      ["/customers", "/suppliers"].some((p) => path.startsWith(p))
    ) newExpanded.add("contacts");
    if (
      ["/users", "/roles"].some((p) => path.startsWith(p))
    ) newExpanded.add("team");
    setExpandedKeys(newExpanded);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleGroup = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Build navigation groups based on permissions
  const navGroups = useMemo((): NavGroup[] => {
    const groups: NavGroup[] = [];

    // ─── Inventory ───
    const inventoryChildren: NavItem[] = [];
    if (isOwner || hasPermission(PERMISSIONS.INVENTORY_VIEW)) {
      inventoryChildren.push(
        { key: "products", label: "Products", icon: <InboxOutlined />, path: "/products" },
        { key: "inventory-stock", label: "Stock", icon: <AppstoreOutlined />, path: "/inventory" },
        { key: "variations", label: "Variations", icon: <AppstoreOutlined />, path: "/variations" }
      );
    }
    if (isOwner || hasPermission(PERMISSIONS.SETTINGS_WAREHOUSES)) {
      inventoryChildren.push(
        { key: "warehouses", label: "Warehouses", icon: <BankOutlined />, path: "/warehouses" }
      );
    }
    if (isOwner || hasPermission(PERMISSIONS.SETTINGS_CATEGORIES)) {
      inventoryChildren.push(
        { key: "categories", label: "Categories", icon: <ClusterOutlined />, path: "/categories" },
        { key: "subcategories", label: "Sub Categories", icon: <ClusterOutlined />, path: "/subcategories" },
        { key: "brands", label: "Brands", icon: <TagsOutlined />, path: "/brands" },
        { key: "units", label: "Units", icon: <AppstoreOutlined />, path: "/units" }
      );
    }
    if (isOwner || hasPermission(PERMISSIONS.WARRANTIES_VIEW)) {
      inventoryChildren.push(
        { key: "warranties", label: "Warranties", icon: <SafetyCertificateOutlined />, path: "/warranties" }
      );
    }

    if (inventoryChildren.length > 0) {
      groups.push({
        title: "Store",
        items: [
          { key: "inventory", label: "Inventory", icon: <InboxOutlined />, children: inventoryChildren },
        ],
      });
    }

    // ─── Transactions ───
    const transactionItems: NavItem[] = [];
    if (isOwner || hasPermission(PERMISSIONS.POS_SALES)) {
      transactionItems.push(
        { key: "pos", label: "POS Terminal", icon: <ShoppingCartOutlined />, path: "/pos" }
      );
    }
    if (isOwner || hasPermission(PERMISSIONS.SALES_VIEW)) {
      transactionItems.push(
        { key: "sales", label: "Sales", icon: <DollarOutlined />, path: "/sales" }
      );
    }
    if (isOwner || hasPermission(PERMISSIONS.PURCHASES_VIEW)) {
      transactionItems.push(
        { key: "purchases", label: "Purchases", icon: <FileTextOutlined />, path: "/purchases" }
      );
    }
    if (transactionItems.length > 0) {
      groups.push({
        title: "Transactions",
        items: [
          { key: "transactions", label: "Sales & Purchases", icon: <DollarOutlined />, children: transactionItems },
        ],
      });
    }

    // ─── Contacts ───
    const contactItems: NavItem[] = [];
    if (isOwner || hasPermission(PERMISSIONS.CUSTOMERS_VIEW)) {
      contactItems.push(
        { key: "customers", label: "Customers", icon: <TeamOutlined />, path: "/customers" }
      );
    }
    if (isOwner || hasPermission(PERMISSIONS.SUPPLIERS_VIEW)) {
      contactItems.push(
        { key: "suppliers", label: "Suppliers", icon: <ShopOutlined />, path: "/suppliers" }
      );
    }
    if (contactItems.length > 0) {
      groups.push({
        title: "People",
        items: [
          { key: "contacts", label: "Contacts", icon: <TeamOutlined />, children: contactItems },
        ],
      });
    }

    // ─── Analytics ───
    const analyticsItems: NavItem[] = [];
    if (
      isOwner ||
      hasPermission(PERMISSIONS.REPORTS_SALES) ||
      hasPermission(PERMISSIONS.REPORTS_INVENTORY)
    ) {
      analyticsItems.push(
        { key: "reports", label: "Reports", icon: <BarChartOutlined />, path: "/reports" }
      );
    }
    if (analyticsItems.length > 0) {
      groups.push({ title: "Analytics", items: analyticsItems });
    }

    // ─── Administration ───
    const adminItems: NavItem[] = [];
    const teamChildren: NavItem[] = [];
    if (isOwner || hasPermission(PERMISSIONS.USERS_VIEW)) {
      teamChildren.push(
        { key: "users", label: "Users", icon: <UserOutlined />, path: "/users" }
      );
    }
    if (isOwner || hasPermission(PERMISSIONS.USERS_ROLES)) {
      teamChildren.push(
        { key: "roles", label: "Roles", icon: <SafetyOutlined />, path: "/roles" }
      );
    }
    if (teamChildren.length > 0) {
      adminItems.push(
        { key: "team", label: "Team", icon: <TeamOutlined />, children: teamChildren }
      );
    }
    if (isOwner || hasPermission(PERMISSIONS.SETTINGS_SYSTEM)) {
      adminItems.push(
        { key: "settings", label: "Settings", icon: <SettingOutlined />, path: "/settings" }
      );
    }
    if (adminItems.length > 0) {
      groups.push({ title: "Administration", items: adminItems });
    }

    return groups;
  }, [isOwner, hasPermission]);

  // Render a single nav item (leaf node)
  const renderLeafItem = (item: NavItem, depth = 0) => {
    const isSelected = selectedKey === item.key;
    const paddingLeft = collapsed ? 0 : depth === 0 ? 12 : 12;

    const content = (
      <Link
        to={item.path!}
        style={{ textDecoration: "none", display: "block" }}
      >
        <div
          className={`sidebar-item ${isSelected ? "sidebar-item--active" : ""}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: collapsed ? "10px 0" : `10px 12px 10px ${paddingLeft + 12}px`,
            margin: collapsed ? "2px 8px" : depth === 0 ? "2px 8px" : "1px 8px 1px 20px",
            borderRadius: 10,
            cursor: "pointer",
            justifyContent: collapsed ? "center" : "flex-start",
            background: isSelected
              ? "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)"
              : "transparent",
            color: isSelected ? "#fff" : "#374151",
            transition: "all 0.18s ease",
            position: "relative",
          }}
        >
          <span
            style={{
              fontSize: depth === 0 ? 17 : 15,
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              color: isSelected ? "#fff" : depth === 0 ? "#6366f1" : "#6b7280",
            }}
          >
            {item.icon}
          </span>
          {!collapsed && (
            <span
              style={{
                fontSize: depth === 0 ? 13.5 : 13,
                fontWeight: isSelected ? 600 : 500,
                color: isSelected ? "#fff" : depth === 0 ? "#1f2937" : "#4b5563",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                letterSpacing: "0.01em",
              }}
            >
              {item.label}
            </span>
          )}
          {isSelected && !collapsed && (
            <span
              style={{
                position: "absolute",
                right: 10,
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.7)",
              }}
            />
          )}
        </div>
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.key} title={item.label} placement="right">
          {content}
        </Tooltip>
      );
    }
    return <div key={item.key}>{content}</div>;
  };

  // Render a group item (with children)
  const renderGroupItem = (item: NavItem) => {
    const isExpanded = expandedKeys.has(item.key);
    const hasActiveChild = item.children?.some((c) => c.key === selectedKey);

    if (collapsed) {
      return (
        <div key={item.key} style={{ margin: "2px 8px" }}>
          <Tooltip title={item.label} placement="right">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 0",
                borderRadius: 10,
                cursor: "pointer",
                margin: "2px 0",
                background: hasActiveChild
                  ? "rgba(99, 102, 241, 0.12)"
                  : "transparent",
                color: hasActiveChild ? "#6366f1" : "#374151",
                transition: "all 0.18s ease",
              }}
            >
              <span style={{ fontSize: 17, color: hasActiveChild ? "#6366f1" : "#6b7280" }}>
                {item.icon}
              </span>
            </div>
          </Tooltip>
        </div>
      );
    }

    return (
      <div key={item.key}>
        <div
          onClick={() => toggleGroup(item.key)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            margin: "2px 8px",
            borderRadius: 10,
            cursor: "pointer",
            background: hasActiveChild
              ? "rgba(99, 102, 241, 0.08)"
              : "transparent",
            color: "#1f2937",
            transition: "all 0.18s ease",
            userSelect: "none",
          }}
          onMouseEnter={(e) => {
            if (!hasActiveChild) {
              e.currentTarget.style.background = "rgba(99, 102, 241, 0.06)";
            }
          }}
          onMouseLeave={(e) => {
            if (!hasActiveChild) {
              e.currentTarget.style.background = "transparent";
            }
          }}
        >
          <span
            style={{
              fontSize: 17,
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              color: hasActiveChild ? "#6366f1" : "#6b7280",
            }}
          >
            {item.icon}
          </span>
          <span
            style={{
              fontSize: 13.5,
              fontWeight: 600,
              color: hasActiveChild ? "#4f46e5" : "#1f2937",
              flex: 1,
              letterSpacing: "0.01em",
            }}
          >
            {item.label}
          </span>
          <span
            style={{
              fontSize: 10,
              color: "#9ca3af",
              transition: "transform 0.22s ease",
              transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <RightOutlined />
          </span>
        </div>

        {/* Children */}
        <div
          style={{
            maxHeight: isExpanded ? `${(item.children?.length ?? 0) * 44}px` : "0",
            overflow: "hidden",
            transition: "max-height 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div
            style={{
              margin: "2px 8px 4px 8px",
              borderLeft: "2px solid #e5e7eb",
              marginLeft: 26,
              paddingLeft: 0,
            }}
          >
            {item.children?.map((child) => renderLeafItem(child, 1))}
          </div>
        </div>
      </div>
    );
  };

  const renderNavItem = (item: NavItem) => {
    if (item.children && item.children.length > 0) {
      return renderGroupItem(item);
    }
    return renderLeafItem(item);
  };

  const userInitial = (user as any)?.full_name?.charAt(0).toUpperCase() || "U";
  const userName = (user as any)?.full_name || "User";
  const userRole = isOwner ? "Owner" : "Employee";

  return (
    <>
      <aside
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          height: "100vh",
          width: sidebarWidth,
          background: "#ffffff",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "1px 0 0 0 #e5e7eb, 4px 0 24px rgba(0,0,0,0.04)",
          overflow: "hidden",
          borderRight: "1px solid #f0f0f0",
        }}
      >
        {/* ── Logo & Toggle ── */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            padding: collapsed ? "0 0" : "0 16px 0 16px",
            borderBottom: "1px solid #f3f4f6",
            flexShrink: 0,
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                background: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
              }}
            >
              <ShoppingCartOutlined style={{ color: "#fff", fontSize: 18 }} />
            </div>
            {!collapsed && (
              <div
                style={{
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 17,
                    color: "#1e1b4b",
                    letterSpacing: "-0.5px",
                    lineHeight: 1.1,
                  }}
                >
                  FlowPOS
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#6366f1",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  Management
                </div>
              </div>
            )}
          </div>

          {/* Toggle Button */}
          {!collapsed && (
            <Tooltip title="Collapse sidebar">
              <button
                onClick={onToggle}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#9ca3af",
                  transition: "all 0.15s ease",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f3f4f6";
                  e.currentTarget.style.color = "#4f46e5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#9ca3af";
                }}
              >
                <MenuFoldOutlined style={{ fontSize: 16 }} />
              </button>
            </Tooltip>
          )}
        </div>

        {/* ── Expand toggle when collapsed ── */}
        {collapsed && (
          <Tooltip title="Expand sidebar" placement="right">
            <button
              onClick={onToggle}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                margin: "10px auto 2px",
                width: 40,
                height: 36,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9ca3af",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f3f4f6";
                e.currentTarget.style.color = "#4f46e5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#9ca3af";
              }}
            >
              <MenuUnfoldOutlined style={{ fontSize: 16 }} />
            </button>
          </Tooltip>
        )}

        {/* ── User Profile ── */}
        {!collapsed && (
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #f3f4f6",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 10,
                background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
                border: "1px solid #e0d9ff",
              }}
            >
              <Avatar
                size={34}
                style={{
                  background: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)",
                  fontWeight: 700,
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {userInitial}
              </Avatar>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: "#1e1b4b",
                    fontWeight: 700,
                    fontSize: 13,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: 1.3,
                  }}
                >
                  {userName}
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    marginTop: 2,
                    padding: "1px 7px",
                    borderRadius: 20,
                    background: isOwner ? "#4f46e5" : "#6b7280",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                  }}
                >
                  {userRole}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Collapsed avatar ── */}
        {collapsed && (
          <Tooltip title={`${userName} · ${userRole}`} placement="right">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "8px 0",
                flexShrink: 0,
              }}
            >
              <Avatar
                size={36}
                style={{
                  background: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "default",
                }}
              >
                {userInitial}
              </Avatar>
            </div>
          </Tooltip>
        )}

        {/* ── Dashboard shortcut ── */}
        <div style={{ padding: "8px 8px 0", flexShrink: 0 }}>
          {collapsed ? (
            <Tooltip title="Dashboard" placement="right">
              <Link to="/dashboard" style={{ display: "block", textDecoration: "none" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px 0",
                    borderRadius: 10,
                    margin: "0 8px",
                    background: selectedKey === "dashboard"
                      ? "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)"
                      : "transparent",
                    color: selectedKey === "dashboard" ? "#fff" : "#6b7280",
                    transition: "all 0.18s ease",
                    cursor: "pointer",
                  }}
                >
                  <DashboardOutlined style={{ fontSize: 17 }} />
                </div>
              </Link>
            </Tooltip>
          ) : (
            <Link to="/dashboard" style={{ display: "block", textDecoration: "none" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  margin: "0 0",
                  borderRadius: 10,
                  cursor: "pointer",
                  background: selectedKey === "dashboard"
                    ? "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)"
                    : "transparent",
                  color: selectedKey === "dashboard" ? "#fff" : "#1f2937",
                  transition: "all 0.18s ease",
                }}
              >
                <span
                  style={{
                    fontSize: 17,
                    color: selectedKey === "dashboard" ? "#fff" : "#6366f1",
                    flexShrink: 0,
                  }}
                >
                  <DashboardOutlined />
                </span>
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: selectedKey === "dashboard" ? 600 : 500,
                    color: selectedKey === "dashboard" ? "#fff" : "#1f2937",
                    letterSpacing: "0.01em",
                  }}
                >
                  Dashboard
                </span>
                {selectedKey === "dashboard" && (
                  <span
                    style={{
                      marginLeft: "auto",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.7)",
                    }}
                  />
                )}
              </div>
            </Link>
          )}
        </div>

        {/* ── Nav Groups ── */}
        <div
          className="sidebar-scroll"
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "6px 0 8px",
          }}
        >
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {/* Section label */}
              {!collapsed && (
                <div
                  style={{
                    padding: "12px 20px 4px",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#9ca3af",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {group.title}
                </div>
              )}
              {collapsed && gi > 0 && (
                <div
                  style={{
                    height: 1,
                    background: "#f3f4f6",
                    margin: "6px 16px",
                  }}
                />
              )}
              {group.items.map(renderNavItem)}
            </div>
          ))}
        </div>

        {/* ── Bottom: Logout ── */}
        <div
          style={{
            borderTop: "1px solid #f3f4f6",
            padding: collapsed ? "10px 0" : "10px 8px",
            flexShrink: 0,
          }}
        >
          {collapsed ? (
            <Tooltip title="Sign Out" placement="right">
              <div
                onClick={handleLogout}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "10px 0",
                  margin: "0 8px",
                  borderRadius: 10,
                  cursor: "pointer",
                  color: "#ef4444",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fef2f2";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <LogoutOutlined style={{ fontSize: 17 }} />
              </div>
            </Tooltip>
          ) : (
            <div
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                cursor: "pointer",
                color: "#6b7280",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fef2f2";
                e.currentTarget.style.color = "#ef4444";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#6b7280";
              }}
            >
              <LogoutOutlined style={{ fontSize: 16, color: "inherit" }} />
              <span style={{ fontSize: 13.5, fontWeight: 500, color: "inherit" }}>
                Sign Out
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* Global sidebar styles */}
      <style>{`
        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(99, 102, 241, 0.15) transparent;
        }
        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.12);
          border-radius: 20px;
        }
        .sidebar-scroll:hover::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.25);
        }
        .sidebar-item:hover {
          background: rgba(99, 102, 241, 0.07) !important;
        }
        .sidebar-item--active:hover {
          background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%) !important;
        }
      `}</style>
    </>
  );
};

export default Sidebar;
