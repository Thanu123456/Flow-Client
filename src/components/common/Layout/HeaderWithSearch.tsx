import { useState, useEffect } from "react";
import {
  Layout,
  Input,
  Button,
  Badge,
  Avatar,
  Dropdown,
  Space,
  Modal,
  List,
  Typography,
} from "antd";
import type { MenuProps } from "antd";
import {
  MenuOutlined,
  SearchOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  MailOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  KeyOutlined,
  DashboardOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface SearchResult {
  id: string;
  title: string;
  type: string;
  url: string;
}

interface HeaderProps {
  onMenuClick: () => void;
  collapsed?: boolean;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

const HeaderWithSearch: React.FC<HeaderProps> = ({
  onMenuClick,
  collapsed = false,
  sidebarOpen = true,
  setSidebarOpen,
}) => {
  const { user, logout, isKiosk, endShift } = useAuth();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const [unreadMessages] = useState(1);
  const [unreadNotifications] = useState(3);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchModalVisible(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.length > 0) {
      const results: SearchResult[] = [
        {
          id: "1",
          title: "Product: " + value,
          type: "Product",
          url: "/products/1",
        },
        {
          id: "2",
          title: "Customer: " + value,
          type: "Customer",
          url: "/customers/1",
        },
        { id: "3", title: "Sale: " + value, type: "Sale", url: "/sales/1" },
      ];
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMenuToggle = () => {
    if (setSidebarOpen) {
      setSidebarOpen(!sidebarOpen);
    }
    onMenuClick();
  };

  const handleMenuClick: MenuProps["onClick"] = async ({ key }) => {
    if (key === "logout") {
      if (isKiosk) {
        await endShift();
      } else {
        await logout();
      }
    } else if (key === "dashboard") {
      navigate(isKiosk ? "/kiosk/dashboard" : "/dashboard");
    } else if (key === "profile") {
      navigate("/profile");
    } else if (key === "settings") {
      navigate("/settings");
    } else if (key === "change-password") {
      navigate(isKiosk ? "/kiosk/change-password" : "/change-password");
    }
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile-info",
      label: (
        <div className="px-3 py-2">
          <div className="font-semibold text-gray-800">
            {'full_name' in (user || {}) ? (user as any).full_name : (user as any)?.name || 'User'}
          </div>
          <div className="text-xs text-gray-500">{(user as any)?.email || ''}</div>
          <div className="text-xs text-gray-400 mt-1">{(user as any)?.role || (user as any)?.user_type || 'Staff'}</div>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "profile", icon: <UserOutlined />, label: "My Profile" },
    { key: "settings", icon: <SettingOutlined />, label: "Settings" },
    { key: "change-password", icon: <KeyOutlined />, label: "Change Password" },
    { type: "divider" },
    { key: "logout", icon: <LogoutOutlined />, label: isKiosk ? "End Shift" : "Logout", danger: true },
  ];

  return (
    <>
      <AntHeader
        className="bg-white px-6 flex items-center justify-between sticky top-0 z-50 border-b border-gray-200 transition-all duration-300"
        style={{
          boxShadow: "none",
          backgroundColor: "#FFFFFF",
          height: collapsed ? "0px" : "64px",
          overflow: "hidden",
          opacity: collapsed ? 0 : 1,
        }}
      >
        {/* Left: Menu + Search */}
        <div className="flex items-center gap-4 flex-1">
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={handleMenuToggle}
            className="text-gray-700 hover:text-black hover:bg-gray-100 w-10 h-10 rounded-lg"
          />

          <div className="max-w-md w-full">
            <Input
              placeholder="Search anything..."
              prefix={<SearchOutlined className="text-gray-400" />}
              suffix={
                <kbd className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded">
                  Cmd K
                </kbd>
              }
              className="rounded-lg hover:border-gray-400 cursor-pointer"
              size="large"
              readOnly
              onClick={() => setSearchModalVisible(true)}
            />
          </div>
        </div>

        {/* Right: Actions */}
        <Space size={12}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="font-medium h-10 px-5 rounded-lg"
          >
            Add New
          </Button>

          <Button
            icon={<ShoppingCartOutlined />}
            className="font-medium h-10 px-5 rounded-lg"
          >
            POS
          </Button>

          <Button
            type="text"
            icon={
              isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />
            }
            onClick={toggleFullscreen}
            className="text-gray-700 hover:text-black hover:bg-gray-100 w-10 h-10 rounded-lg"
          />

          <Badge count={unreadMessages} offset={[-5, 5]}>
            <Button
              type="text"
              icon={<MailOutlined className="text-lg" />}
              className="text-gray-700 hover:text-black hover:bg-gray-100 w-10 h-10 rounded-lg"
            />
          </Badge>

          <Badge count={unreadNotifications} offset={[-5, 5]}>
            <Button
              type="text"
              icon={<BellOutlined className="text-lg" />}
              className="text-gray-700 hover:text-black hover:bg-gray-100 w-10 h-10 rounded-lg"
            />
          </Badge>

          <Button
            type="text"
            icon={<SettingOutlined className="text-lg" />}
            className="text-gray-700 hover:text-black hover:bg-gray-100 w-10 h-10 rounded-lg"
          />

          <Dropdown
            menu={{ items: userMenuItems, onClick: handleMenuClick }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <div className="cursor-pointer">
              <Avatar
                size={40}
                src={(user as any)?.avatar}
                icon={!(user as any)?.avatar && <UserOutlined />}
                className="bg-gradient-to-br from-orange-400 to-orange-600 ring-4 ring-white shadow-md hover:ring-gray-200 transition-all"
              />
            </div>
          </Dropdown>
        </Space>
      </AntHeader>

      {/* Search Modal */}
      <Modal
        open={searchModalVisible}
        onCancel={() => {
          setSearchModalVisible(false);
          setSearchQuery("");
          setSearchResults([]);
        }}
        footer={null}
        closeIcon={<CloseOutlined className="text-gray-500" />}
        width={640}
        className="search-modal"
        styles={{ body: { padding: 0 } }}
      >
        <div className="p-5 border-b border-gray-200">
          <Input
            placeholder="Search products, customers, sales, orders..."
            prefix={<SearchOutlined className="text-gray-400" />}
            size="large"
            autoFocus
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="rounded-lg text-base"
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {searchResults.length > 0 ? (
            <List
              dataSource={searchResults}
              renderItem={(item) => (
                <List.Item
                  className="cursor-pointer hover:bg-gray-50 px-5 py-3 border-b border-gray-100"
                  onClick={() => {
                    setSearchModalVisible(false);
                    setSearchQuery("");
                  }}
                >
                  <List.Item.Meta
                    title={<Text strong>{item.title}</Text>}
                    description={
                      <Text type="secondary" className="text-xs">
                        {item.type}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          ) : searchQuery ? (
            <div className="p-10 text-center text-gray-400">
              <p className="text-lg">
                No results found for "<strong>{searchQuery}</strong>"
              </p>
            </div>
          ) : (
            <div className="p-10 text-center text-gray-400">
              <p>Type to search...</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default HeaderWithSearch;
