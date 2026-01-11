import { Menu } from "antd";
import {
  AppstoreOutlined,
  ShoppingOutlined,
  TagsOutlined,
  ClusterOutlined,
  UserOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

interface DummySidebarProps {
  open: boolean;
  onClose: () => void;
}

const DummySidebar: React.FC<DummySidebarProps> = ({
  open,
  onClose: _onClose,
}) => {
  const sidebarWidth = open ? 280 : 70;

  const menuItems = [
    {
      key: "brands",
      icon: <TagsOutlined />,
      label: <Link to="/brands">Brands</Link>,
    },
    {
      key: "units",
      icon: <AppstoreOutlined />,
      label: <Link to="/units">Units</Link>,
    },
    {
      key: "categories",
      icon: <ClusterOutlined />,
      label: <Link to="/categories">Categories</Link>,
    },
    {
      key: "subCategories",
      icon: <ShoppingOutlined />,
      label: "Sub Categories",
    },
    {
      key: "variations",
      icon: <ShoppingOutlined />,
      label: "Variations",
    },
    { key: "users", icon: <UserOutlined />, label: "Users" },
    { key: "settings", icon: <SettingOutlined />, label: "Settings" },
  ];

  return (
    <aside
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        height: "100vh",
        width: `${sidebarWidth}px`,
        backgroundColor: "#006ae6",
        borderRight: "2px solid #e5e7eb",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s ease",
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "2px solid rgba(255,255,255,0.2)",
          padding: "0 16px",
        }}
      >
        {open ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "white",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShoppingCartOutlined
                style={{ color: "#006ae6", fontSize: "20px" }}
              />
            </div>
            <span
              style={{ fontWeight: "bold", fontSize: "20px", color: "white" }}
            >
              FlowPOS
            </span>
          </div>
        ) : (
          <div
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "white",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShoppingCartOutlined
              style={{ color: "#006ae6", fontSize: "20px" }}
            />
          </div>
        )}
      </div>

      {/* Menu */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        <Menu
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          items={menuItems}
          inlineCollapsed={!open}
          style={{
            borderRight: "none",
            backgroundColor: "transparent",
            color: "white",
          }}
          theme="dark"
          className="sidebar-menu"
        />
      </div>

      {/* Bottom Section — now empty */}
      <div
        style={{
          borderTop: "2px solid rgba(255,255,255,0.2)",
          padding: "16px",
        }}
      >
        {/* Removed Dark Mode & Logout */}
      </div>

      {/* Custom Hover Styling */}
      <style>
        {`
          .sidebar-menu .ant-menu-item {
            color: white !important;
          }
          .sidebar-menu .ant-menu-item:hover {
            background: white !important;
            color: #006ae6 !important;
          }
          .sidebar-menu .ant-menu-item-selected {
            background: white !important;
            color: #006ae6 !important;
          }
        `}
      </style>
    </aside>
  );
};

export default DummySidebar;
