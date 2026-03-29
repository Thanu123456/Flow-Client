import React, { useMemo, useState, useRef, useCallback } from "react";
import { Tooltip, Avatar, Modal } from "antd";
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

/* ─────────────────────────────────────────────────────────
   Collapsed flyout panel – appears on hover next to collapsed icon
───────────────────────────────────────────────────────── */
interface FlyoutProps {
  item: NavItem;
  anchorRef: React.RefObject<HTMLDivElement>;
  selectedKey: string;
  onClose: () => void;
}

const FlyoutMenu: React.FC<FlyoutProps> = ({ item, anchorRef, selectedKey, onClose }) => {
  const [top, setTop] = React.useState(0);

  React.useLayoutEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setTop(rect.top);
    }
  }, [anchorRef]);

  return (
    <div
      style={{
        position: "fixed",
        left: 72,
        top,
        zIndex: 2000,
        background: "#fff",
        borderRadius: 12,
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
        minWidth: 200,
        overflow: "hidden",
        animation: "flyoutIn 0.18s cubic-bezier(0.4,0,0.2,1)",
      }}
      onMouseLeave={onClose}
    >
      {/* Header */}
      <div
        style={{
          padding: "10px 14px 8px",
          borderBottom: "1px solid #f3f4f6",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ color: "#6366f1", fontSize: 15 }}>{item.icon}</span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#6b7280",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {item.label}
        </span>
      </div>

      {/* Children */}
      <div style={{ padding: "6px 6px" }}>
        {item.children?.map((child) => {
          const isActive = selectedKey === child.key;
          return (
            <Link
              key={child.key}
              to={child.path!}
              style={{ textDecoration: "none", display: "block" }}
              onClick={onClose}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: isActive
                    ? "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)"
                    : "transparent",
                  color: isActive ? "#fff" : "#374151",
                  transition: "background 0.15s ease",
                  marginBottom: 1,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = "rgba(99,102,241,0.08)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    color: isActive ? "#fff" : "#6366f1",
                    flexShrink: 0,
                  }}
                >
                  {child.icon}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "#fff" : "#374151",
                    whiteSpace: "nowrap",
                  }}
                >
                  {child.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Collapsed icon button – shows flyout on hover for groups,
   tooltip + link for leaf items
───────────────────────────────────────────────────────── */
interface CollapsedItemProps {
  item: NavItem;
  selectedKey: string;
  activeFlyout: string | null;
  setActiveFlyout: (key: string | null) => void;
}

const CollapsedItem: React.FC<CollapsedItemProps> = ({
  item,
  selectedKey,
  activeFlyout,
  setActiveFlyout,
}) => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const isGroup = !!(item.children && item.children.length > 0);
  const isLeafActive = selectedKey === item.key;
  const hasActiveChild = item.children?.some((c) => c.key === selectedKey) ?? false;
  const isActive = isLeafActive || hasActiveChild;
  const isFlyoutOpen = activeFlyout === item.key;

  const iconEl = (
    <div
      ref={anchorRef}
      onMouseEnter={() => {
        if (isGroup) setActiveFlyout(item.key);
      }}
      onMouseLeave={() => {
        if (isGroup && !isFlyoutOpen) setActiveFlyout(null);
      }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: 10,
        margin: "2px auto",
        cursor: "pointer",
        background: isActive
          ? isGroup
            ? "rgba(99,102,241,0.12)"
            : "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)"
          : "transparent",
        transition: "all 0.18s ease",
        position: "relative",
      }}
    >
      <span
        style={{
          fontSize: 17,
          color: isActive ? (isGroup ? "#6366f1" : "#fff") : "#6b7280",
          display: "flex",
          alignItems: "center",
        }}
      >
        {item.icon}
      </span>
      {/* Active dot for group */}
      {hasActiveChild && (
        <span
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#6366f1",
          }}
        />
      )}
    </div>
  );

  if (isGroup) {
    return (
      <div style={{ position: "relative" }}>
        {iconEl}
        {isFlyoutOpen && (
          <FlyoutMenu
            item={item}
            anchorRef={anchorRef as React.RefObject<HTMLDivElement>}
            selectedKey={selectedKey}
            onClose={() => setActiveFlyout(null)}
          />
        )}
      </div>
    );
  }

  // Leaf item – wrap with tooltip + link
  return (
    <Tooltip title={item.label} placement="right">
      <Link to={item.path!} style={{ display: "block", textDecoration: "none" }}>
        {iconEl}
      </Link>
    </Tooltip>
  );
};

/* ─────────────────────────────────────────────────────────
   Main Sidebar component
───────────────────────────────────────────────────────── */
const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { hasPermission, isOwner } = usePermissions();
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [activeFlyout, setActiveFlyout] = useState<string | null>(null);

  const sidebarWidth = collapsed ? 72 : 264;

  /* ── selected key ── */
  const selectedKey = useMemo(() => {
    const p = location.pathname;
    if (p === "/dashboard") return "dashboard";
    if (p.startsWith("/brands")) return "brands";
    if (p.startsWith("/categories")) return "categories";
    if (p.startsWith("/subcategories")) return "subcategories";
    if (p.startsWith("/units")) return "units";
    if (p.startsWith("/products")) return "products";
    if (p.startsWith("/inventory")) return "inventory-stock";
    if (p.startsWith("/warehouses")) return "warehouses";
    if (p.startsWith("/variations")) return "variations";
    if (p.startsWith("/warranties")) return "warranties";
    if (p.startsWith("/sales")) return "sales";
    if (p.startsWith("/pos")) return "pos";
    if (p.startsWith("/purchases")) return "purchases";
    if (p.startsWith("/suppliers")) return "suppliers";
    if (p.startsWith("/customers")) return "customers";
    if (p.startsWith("/users")) return "users";
    if (p.startsWith("/roles")) return "roles";
    if (p.startsWith("/reports")) return "reports";
    if (p.startsWith("/settings")) return "settings";
    return "dashboard";
  }, [location.pathname]);

  /* ── auto-expand relevant groups on expanded sidebar ── */
  useMemo(() => {
    const p = location.pathname;
    const next = new Set<string>();
    if (["/brands", "/categories", "/subcategories", "/units", "/products", "/inventory", "/warehouses", "/variations", "/warranties"].some((s) => p.startsWith(s))) next.add("inventory");
    if (["/sales", "/pos", "/purchases"].some((s) => p.startsWith(s))) next.add("transactions");
    if (["/customers", "/suppliers"].some((s) => p.startsWith(s))) next.add("contacts");
    if (["/users", "/roles"].some((s) => p.startsWith(s))) next.add("team");
    setExpandedKeys(next);
  }, [location.pathname]);

  const toggleGroup = useCallback((key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  const handleLogout = () => {
    Modal.confirm({
      title: "Confirm Logout",
      content: "Are you sure you want to log out of the system?",
      okText: "Logout",
      okType: "danger",
      cancelText: "Stay",
      onOk: async () => {
        await logout();
        navigate("/login");
      },
      centered: true,
    });
  };

  /* ── build nav groups ── */
  const navGroups = useMemo((): NavGroup[] => {
    const groups: NavGroup[] = [];

    // Inventory
    const invChildren: NavItem[] = [];
    if (isOwner || hasPermission(PERMISSIONS.INVENTORY_VIEW)) {
      invChildren.push(
        { key: "products", label: "Products", icon: <InboxOutlined />, path: "/products" },
        { key: "inventory-stock", label: "Stock", icon: <AppstoreOutlined />, path: "/inventory" },
        { key: "variations", label: "Variations", icon: <AppstoreOutlined />, path: "/variations" }
      );
    }
    if (isOwner || hasPermission(PERMISSIONS.SETTINGS_WAREHOUSES)) {
      invChildren.push({ key: "warehouses", label: "Warehouses", icon: <BankOutlined />, path: "/warehouses" });
    }
    if (isOwner || hasPermission(PERMISSIONS.SETTINGS_CATEGORIES)) {
      invChildren.push(
        { key: "categories", label: "Categories", icon: <ClusterOutlined />, path: "/categories" },
        { key: "subcategories", label: "Sub Categories", icon: <ClusterOutlined />, path: "/subcategories" },
        { key: "brands", label: "Brands", icon: <TagsOutlined />, path: "/brands" },
        { key: "units", label: "Units", icon: <AppstoreOutlined />, path: "/units" }
      );
    }
    if (isOwner || hasPermission(PERMISSIONS.WARRANTIES_VIEW)) {
      invChildren.push({ key: "warranties", label: "Warranties", icon: <SafetyCertificateOutlined />, path: "/warranties" });
    }
    if (invChildren.length > 0) {
      groups.push({
        title: "Store",
        items: [{ key: "inventory", label: "Inventory", icon: <InboxOutlined />, children: invChildren }],
      });
    }

    // Transactions
    const txItems: NavItem[] = [];
    if (isOwner || hasPermission(PERMISSIONS.POS_SALES))
      txItems.push({ key: "pos", label: "POS Terminal", icon: <ShoppingCartOutlined />, path: "/pos" });
    if (isOwner || hasPermission(PERMISSIONS.SALES_VIEW))
      txItems.push({ key: "sales", label: "Sales", icon: <DollarOutlined />, path: "/sales" });
    if (isOwner || hasPermission(PERMISSIONS.PURCHASES_VIEW))
      txItems.push({ key: "purchases", label: "GRN", icon: <FileTextOutlined />, path: "/purchases" });
    if (txItems.length > 0) {
      groups.push({
        title: "Transactions",
        items: [{ key: "transactions", label: "Sales & Orders", icon: <DollarOutlined />, children: txItems }],
      });
    }

    // Contacts
    const contactItems: NavItem[] = [];
    if (isOwner || hasPermission(PERMISSIONS.CUSTOMERS_VIEW))
      contactItems.push({ key: "customers", label: "Customers", icon: <TeamOutlined />, path: "/customers" });
    if (isOwner || hasPermission(PERMISSIONS.SUPPLIERS_VIEW))
      contactItems.push({ key: "suppliers", label: "Suppliers", icon: <ShopOutlined />, path: "/suppliers" });
    if (contactItems.length > 0) {
      groups.push({
        title: "People",
        items: [{ key: "contacts", label: "Contacts", icon: <TeamOutlined />, children: contactItems }],
      });
    }

    // Analytics
    if (isOwner || hasPermission(PERMISSIONS.REPORTS_SALES) || hasPermission(PERMISSIONS.REPORTS_INVENTORY)) {
      groups.push({
        title: "Analytics",
        items: [{ key: "reports", label: "Reports", icon: <BarChartOutlined />, path: "/reports" }],
      });
    }

    // Administration
    const adminItems: NavItem[] = [];
    const teamChildren: NavItem[] = [];
    if (isOwner || hasPermission(PERMISSIONS.USERS_VIEW))
      teamChildren.push({ key: "users", label: "Users", icon: <UserOutlined />, path: "/users" });
    if (isOwner || hasPermission(PERMISSIONS.USERS_ROLES))
      teamChildren.push({ key: "roles", label: "Roles", icon: <SafetyOutlined />, path: "/roles" });
    if (teamChildren.length > 0)
      adminItems.push({ key: "team", label: "Team", icon: <TeamOutlined />, children: teamChildren });
    if (isOwner || hasPermission(PERMISSIONS.SETTINGS_SYSTEM))
      adminItems.push({ key: "settings", label: "Settings", icon: <SettingOutlined />, path: "/settings" });
    if (adminItems.length > 0) {
      groups.push({ title: "Administration", items: adminItems });
    }

    return groups;
  }, [isOwner, hasPermission]);

  /* ── expanded: render leaf item ── */
  const renderLeafItem = (item: NavItem, depth = 0) => {
    const isSelected = selectedKey === item.key;
    return (
      <div key={item.key}>
        <Link to={item.path!} style={{ textDecoration: "none", display: "block" }}>
          <div
            className={`sidebar-item${isSelected ? " sidebar-item--active" : ""}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              margin: depth === 0 ? "2px 8px" : "1px 8px 1px 20px",
              borderRadius: 10,
              cursor: "pointer",
              background: isSelected
                ? "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)"
                : "transparent",
              color: isSelected ? "#fff" : "#374151",
              transition: "all 0.18s ease",
              position: "relative",
            }}
          >
            <span style={{ fontSize: depth === 0 ? 17 : 14, color: isSelected ? "#fff" : "#6366f1", flexShrink: 0 }}>
              {item.icon}
            </span>
            <span style={{ fontSize: depth === 0 ? 13.5 : 13, fontWeight: isSelected ? 600 : 500, color: isSelected ? "#fff" : depth === 0 ? "#1f2937" : "#4b5563", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "0.01em" }}>
              {item.label}
            </span>
            {isSelected && (
              <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.7)", flexShrink: 0 }} />
            )}
          </div>
        </Link>
      </div>
    );
  };

  /* ── expanded: render group item ── */
  const renderGroupItem = (item: NavItem) => {
    const isExpanded = expandedKeys.has(item.key);
    const hasActiveChild = item.children?.some((c) => c.key === selectedKey) ?? false;

    return (
      <div key={item.key}>
        <div
          onClick={() => toggleGroup(item.key)}
          onMouseEnter={(e) => { if (!hasActiveChild) e.currentTarget.style.background = "rgba(99,102,241,0.06)"; }}
          onMouseLeave={(e) => { if (!hasActiveChild) e.currentTarget.style.background = "transparent"; }}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 12px", margin: "2px 8px", borderRadius: 10,
            cursor: "pointer",
            background: hasActiveChild ? "rgba(99,102,241,0.08)" : "transparent",
            transition: "all 0.18s ease", userSelect: "none",
          }}
        >
          <span style={{ fontSize: 17, color: hasActiveChild ? "#6366f1" : "#6b7280", flexShrink: 0 }}>
            {item.icon}
          </span>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: hasActiveChild ? "#4f46e5" : "#1f2937", flex: 1, letterSpacing: "0.01em" }}>
            {item.label}
          </span>
          <span style={{ fontSize: 10, color: "#9ca3af", transition: "transform 0.22s ease", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", display: "flex", alignItems: "center" }}>
            <RightOutlined />
          </span>
        </div>

        {/* Animated children */}
        <div style={{ maxHeight: isExpanded ? `${(item.children?.length ?? 0) * 42}px` : "0", overflow: "hidden", transition: "max-height 0.28s cubic-bezier(0.4,0,0.2,1)" }}>
          <div style={{ margin: "2px 8px 4px 8px", borderLeft: "2px solid #e5e7eb", marginLeft: 26 }}>
            {item.children?.map((child) => renderLeafItem(child, 1))}
          </div>
        </div>
      </div>
    );
  };

  const renderExpandedNavItem = (item: NavItem) =>
    item.children?.length ? renderGroupItem(item) : renderLeafItem(item);

  const userInitial = (user as any)?.full_name?.charAt(0).toUpperCase() || "U";
  const userName = (user as any)?.full_name || "User";
  const userRole = isOwner ? "Owner" : "Employee";

  return (
    <>
      <aside
        style={{
          position: "fixed", left: 0, top: 0, height: "100vh",
          width: sidebarWidth, background: "#ffffff", zIndex: 1000,
          display: "flex", flexDirection: "column",
          transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "1px 0 0 0 #e5e7eb, 4px 0 24px rgba(0,0,0,0.04)",
          overflow: "visible",
          borderRight: "1px solid #f0f0f0",
        }}
      >
        {/* Inner clipping wrapper */}
        <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", position: "relative" }}>

          {/* ── Logo & Toggle ── */}
          <div style={{ height: 64, display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", padding: collapsed ? "0" : "0 14px 0 16px", borderBottom: "1px solid #f3f4f6", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
              <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(79,70,229,0.3)" }}>
                <ShoppingCartOutlined style={{ color: "#fff", fontSize: 18 }} />
              </div>
              {!collapsed && (
                <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
                  <div style={{ fontWeight: 800, fontSize: 17, color: "#1e1b4b", letterSpacing: "-0.5px", lineHeight: 1.1 }}>FlowPOS</div>
                  <div style={{ fontSize: 10, color: "#6366f1", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Management</div>
                </div>
              )}
            </div>
            {!collapsed && (
              <Tooltip title="Collapse sidebar">
                <button onClick={onToggle} className="sidebar-icon-btn" style={{ border: "none", background: "transparent", cursor: "pointer", width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", flexShrink: 0 }}>
                  <MenuFoldOutlined style={{ fontSize: 16 }} />
                </button>
              </Tooltip>
            )}
          </div>

          {/* ── Expand toggle (collapsed) ── */}
          {collapsed && (
            <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 2px", flexShrink: 0 }}>
              <Tooltip title="Expand sidebar" placement="right">
                <button onClick={onToggle} className="sidebar-icon-btn" style={{ border: "none", background: "transparent", cursor: "pointer", width: 40, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
                  <MenuUnfoldOutlined style={{ fontSize: 16 }} />
                </button>
              </Tooltip>
            </div>
          )}

          {/* ── User Profile (expanded) ── */}
          {!collapsed && (
            <div style={{ padding: "10px 12px", borderBottom: "1px solid #f3f4f6", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)", border: "1px solid #e0d9ff" }}>
                <Avatar size={34} style={{ background: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{userInitial}</Avatar>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#1e1b4b", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.3 }}>{userName}</div>
                  <div style={{ display: "inline-flex", alignItems: "center", marginTop: 2, padding: "1px 7px", borderRadius: 20, background: isOwner ? "#4f46e5" : "#6b7280", color: "#fff", fontSize: 10, fontWeight: 600, letterSpacing: "0.04em" }}>{userRole}</div>
                </div>
              </div>
            </div>
          )}

          {/* ── Collapsed avatar ── */}
          {collapsed && (
            <Tooltip title={`${userName} · ${userRole}`} placement="right">
              <div style={{ display: "flex", justifyContent: "center", padding: "6px 0", flexShrink: 0 }}>
                <Avatar size={36} style={{ background: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)", fontWeight: 700, fontSize: 14 }}>{userInitial}</Avatar>
              </div>
            </Tooltip>
          )}

          {/* ── Dashboard shortcut ── */}
          <div style={{ padding: "8px 8px 0", flexShrink: 0 }}>
            {collapsed ? (
              <Tooltip title="Dashboard" placement="right">
                <Link to="/dashboard" style={{ display: "block", textDecoration: "none" }}>
                  <div className="sidebar-icon-btn" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 10, margin: "2px auto", cursor: "pointer", background: selectedKey === "dashboard" ? "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)" : "transparent", transition: "all 0.18s ease" }}>
                    <DashboardOutlined style={{ fontSize: 17, color: selectedKey === "dashboard" ? "#fff" : "#6b7280" }} />
                  </div>
                </Link>
              </Tooltip>
            ) : (
              <Link to="/dashboard" style={{ display: "block", textDecoration: "none" }}>
                <div className={`sidebar-item${selectedKey === "dashboard" ? " sidebar-item--active" : ""}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", margin: "0", borderRadius: 10, cursor: "pointer", background: selectedKey === "dashboard" ? "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)" : "transparent", transition: "all 0.18s ease" }}>
                  <DashboardOutlined style={{ fontSize: 17, color: selectedKey === "dashboard" ? "#fff" : "#6366f1" }} />
                  <span style={{ fontSize: 13.5, fontWeight: selectedKey === "dashboard" ? 600 : 500, color: selectedKey === "dashboard" ? "#fff" : "#1f2937", letterSpacing: "0.01em" }}>Dashboard</span>
                  {selectedKey === "dashboard" && <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.7)" }} />}
                </div>
              </Link>
            )}
          </div>

          {/* ── Navigation ── */}
          <div className="sidebar-scroll" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "6px 0 8px" }}>
            {navGroups.map((group, gi) => (
              <div key={gi}>
                {/* Section label */}
                {!collapsed ? (
                  <div style={{ padding: "12px 20px 4px", fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {group.title}
                  </div>
                ) : (
                  gi > 0 && <div style={{ height: 1, background: "#f3f4f6", margin: "6px 16px" }} />
                )}

                {/* Items */}
                {collapsed
                  ? group.items.map((item) => (
                    <div key={item.key} style={{ padding: "0 16px" }}>
                      <CollapsedItem
                        item={item}
                        selectedKey={selectedKey}
                        activeFlyout={activeFlyout}
                        setActiveFlyout={setActiveFlyout}
                      />
                    </div>
                  ))
                  : group.items.map(renderExpandedNavItem)}
              </div>
            ))}
          </div>

          {/* ── Logout ── */}
          <div style={{ borderTop: "1px solid #f3f4f6", padding: collapsed ? "8px 0" : "8px 8px", flexShrink: 0 }}>
            {collapsed ? (
              <Tooltip title="Sign Out" placement="right">
                <div onClick={handleLogout} className="sidebar-logout-btn" style={{ display: "flex", justifyContent: "center", padding: "10px 0", margin: "0 16px", borderRadius: 10, cursor: "pointer", color: "#ef4444", transition: "all 0.15s ease" }}>
                  <LogoutOutlined style={{ fontSize: 17 }} />
                </div>
              </Tooltip>
            ) : (
              <div onClick={handleLogout} className="sidebar-logout-btn-wide" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, cursor: "pointer", color: "#6b7280", transition: "all 0.15s ease" }}>
                <LogoutOutlined style={{ fontSize: 16 }} />
                <span style={{ fontSize: 13.5, fontWeight: 500 }}>Sign Out</span>
              </div>
            )}
          </div>

        </div>{/* end inner clip wrapper */}
      </aside>

      {/* Global styles */}
      <style>{`
        @keyframes flyoutIn {
          from { opacity: 0; transform: translateX(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0)   scale(1); }
        }

        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(99,102,241,0.15) transparent;
        }
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.12); border-radius: 20px; }
        .sidebar-scroll:hover::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.25); }

        .sidebar-item:hover {
          background: rgba(99,102,241,0.07) !important;
        }
        .sidebar-item--active:hover {
          background: linear-gradient(135deg, #4338ca 0%, #4f46e5 100%) !important;
        }

        .sidebar-icon-btn:hover {
          background: #f3f4f6 !important;
          color: #4f46e5 !important;
        }

        .sidebar-logout-btn:hover {
          background: #fef2f2 !important;
        }
        .sidebar-logout-btn-wide:hover {
          background: #fef2f2 !important;
          color: #ef4444 !important;
        }
      `}</style>
    </>
  );
};

export default Sidebar;
