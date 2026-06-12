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
  Popover,
} from "antd";
import type { MenuProps } from "antd";
import { useNavigate } from "react-router-dom";
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
  RightOutlined,
  UserAddOutlined,
  ShopOutlined,
  SolutionOutlined,
  SafetyOutlined,
  FolderOpenOutlined,
  PartitionOutlined,
  TagsOutlined,
  HomeOutlined,
  PlusSquareOutlined,
} from "@ant-design/icons";

// Quick Action Modals
import AddCustomerModal from "../../customers/AddCustomerModal";
import AddSupplierModal from "../../suppliers/AddSupplierModal";
import AddUserModal from "../../users/AddUserModal";
import AddRoleModal from "../../roles/AddRoleModal";
import AddWarrantyModal from "../../warranties/AddWarrantyModal";
import AddCategoryModal from "../../categories/AddCategoryModal";
import AddSubCategoryModal from "../../subcategories/AddSubCategoryModal";
import AddBrandModal from "../../brands/AddBrandModal";
import AddWarehouseModal from "../../warehouses/AddWarehouseModal";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface SearchResult {
  id: string;
  title: string;
  type: string;
  url: string;
}

interface HeaderProps {
  onMenuClick?: () => void;
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
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Quick Action States
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleSuccess = (type: string) => {
    setActiveModal(null);
    
    // If the user is currently on the management page of this entity, refresh the page.
    const pathMap: Record<string, string> = {
      customer: "/customers",
      supplier: "/suppliers",
      user: "/users",
      role: "/roles",
      warranty: "/warranties",
      category: "/categories",
      subcategory: "/subcategories",
      brand: "/brands",
      warehouse: "/warehouses",
    };

    if (window.location.pathname === pathMap[type]) {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const quickActionGroups = [
    {
      title: "Inventory & Catalog",
      items: [
        {
          label: "Add a new product",
          icon: <PlusSquareOutlined />,
          color: "#1890ff",
          bgColor: "#e6f7ff",
          onClick: () => {
            setPopoverOpen(false);
            navigate("/products/add");
          },
        },
        {
          label: "Add a new brand",
          icon: <TagsOutlined />,
          color: "#722ed1",
          bgColor: "#f9f0ff",
          onClick: () => {
            setPopoverOpen(false);
            setActiveModal("brand");
          },
        },
        {
          label: "Add a new category",
          icon: <FolderOpenOutlined />,
          color: "#fa8c16",
          bgColor: "#fff7e6",
          onClick: () => {
            setPopoverOpen(false);
            setActiveModal("category");
          },
        },
        {
          label: "Add a new sub category",
          icon: <PartitionOutlined />,
          color: "#faad14",
          bgColor: "#fffbe6",
          onClick: () => {
            setPopoverOpen(false);
            setActiveModal("subcategory");
          },
        },
      ],
    },
    {
      title: "People & Access",
      items: [
        {
          label: "Add a new customer",
          icon: <UserAddOutlined />,
          color: "#52c41a",
          bgColor: "#f6ffed",
          onClick: () => {
            setPopoverOpen(false);
            setActiveModal("customer");
          },
        },
        {
          label: "Add a new supplier",
          icon: <ShopOutlined />,
          color: "#13c2c2",
          bgColor: "#e6fffb",
          onClick: () => {
            setPopoverOpen(false);
            setActiveModal("supplier");
          },
        },
        {
          label: "Add a new user",
          icon: <UserOutlined />,
          color: "#2f54eb",
          bgColor: "#f0f5ff",
          onClick: () => {
            setPopoverOpen(false);
            setActiveModal("user");
          },
        },
        {
          label: "Add a new role",
          icon: <SolutionOutlined />,
          color: "#f5222d",
          bgColor: "#fff1f0",
          onClick: () => {
            setPopoverOpen(false);
            setActiveModal("role");
          },
        },
      ],
    },
    {
      title: "Facilities & Support",
      items: [
        {
          label: "Add a new warehouse",
          icon: <HomeOutlined />,
          color: "#eb2f96",
          bgColor: "#fff0f6",
          onClick: () => {
            setPopoverOpen(false);
            setActiveModal("warehouse");
          },
        },
        {
          label: "Add a new warrenty",
          icon: <SafetyOutlined />,
          color: "#00b96b",
          bgColor: "#e6f8f1",
          onClick: () => {
            setPopoverOpen(false);
            setActiveModal("warranty");
          },
        },
      ],
    },
  ];

  const quickActionsContent = (
    <div className="w-[840px] p-2">
      <div className="px-3 pb-3 border-b border-gray-100 mb-3">
        <h4 className="font-semibold text-gray-800 text-sm m-0">Quick Actions</h4>
        <p className="text-xs text-gray-400 m-0 mt-0.5">Create resources on the fly</p>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {quickActionGroups.map((group, gIdx) => (
          <div
            key={group.title}
            className={`pr-2 ${
              gIdx < quickActionGroups.length - 1 ? "border-r border-gray-100 pr-6" : ""
            }`}
          >
            <div className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              {group.title}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => (
                <div
                  key={item.label}
                  onClick={item.onClick}
                  className="group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-lg transition-transform duration-200 group-hover:scale-105"
                      style={{
                        color: item.color,
                        backgroundColor: item.bgColor,
                      }}
                    >
                      {item.icon}
                    </div>
                    <span className="text-xs font-medium text-gray-700 group-hover:text-black transition-colors duration-200">
                      {item.label}
                    </span>
                  </div>
                  <RightOutlined className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transform translate-x-[-4px] group-hover:translate-x-0 transition-all duration-200" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const [unreadMessages] = useState(1);
  const [unreadNotifications] = useState(3);

  const user = {
    name: "John Doe",
    email: "john@example.com",
    avatar: null,
    role: "Admin",
  };

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
    if (onMenuClick) {
      onMenuClick();
    }
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile-info",
      label: (
        <div className="px-3 py-2">
          <div className="font-semibold text-gray-800">{user.name}</div>
          <div className="text-xs text-gray-500">{user.email}</div>
          <div className="text-xs text-gray-400 mt-1">{user.role}</div>
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
    { key: "logout", icon: <LogoutOutlined />, label: "Logout", danger: true },
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
        {/* Left: Menu */}
        <div className="flex items-center flex-1">
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={handleMenuToggle}
            className="text-gray-700 hover:text-black hover:bg-gray-100 w-10 h-10 rounded-lg"
          />
        </div>

        {/* Center: Search */}
        <div className="flex items-center justify-center flex-[2] px-4">
          <div className="max-w-2xl w-full">
            <Input
              placeholder="Search anything..."
              prefix={<SearchOutlined className="text-gray-400" />}
              suffix={
                <kbd className="flex items-center justify-center px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded">
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
        <div className="flex items-center justify-end flex-1">
          <Space size={12} align="center">
            <Popover
              content={quickActionsContent}
              trigger="click"
              open={popoverOpen}
              onOpenChange={setPopoverOpen}
              placement="bottomRight"
              overlayClassName="quick-actions-popover"
              styles={{ body: { padding: 4 } }}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="font-medium h-10 px-5 rounded-lg"
              >
                Add New
              </Button>
            </Popover>

            <Button
              icon={<ShoppingCartOutlined />}
              className="font-medium h-10 px-5 rounded-lg"
              onClick={() => navigate('/pos')}
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

            <Badge count={unreadMessages}>
              <Button
                type="text"
                icon={<MailOutlined className="text-lg" />}
                className="text-gray-700 hover:text-black hover:bg-gray-100 w-10 h-10 rounded-lg"
              />
            </Badge>

            <Badge count={unreadNotifications}>
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
              menu={{ items: userMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <div className="cursor-pointer">
                <Avatar
                  size={40}
                  src={user.avatar}
                  icon={!user.avatar && <UserOutlined />}
                  className="bg-gradient-to-br from-orange-400 to-orange-600 ring-4 ring-white shadow-md hover:ring-gray-200 transition-all"
                />
              </div>
            </Dropdown>
          </Space>
        </div>
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

      {/* Quick Action Modals */}
      <AddCustomerModal
        visible={activeModal === "customer"}
        onCancel={() => setActiveModal(null)}
        onSuccess={() => handleSuccess("customer")}
      />
      <AddSupplierModal
        visible={activeModal === "supplier"}
        onCancel={() => setActiveModal(null)}
        onSuccess={() => handleSuccess("supplier")}
      />
      <AddUserModal
        visible={activeModal === "user"}
        onCancel={() => setActiveModal(null)}
        onSuccess={() => handleSuccess("user")}
      />
      <AddRoleModal
        visible={activeModal === "role"}
        onCancel={() => setActiveModal(null)}
        onSuccess={() => handleSuccess("role")}
      />
      <AddWarrantyModal
        visible={activeModal === "warranty"}
        onCancel={() => setActiveModal(null)}
        onSuccess={() => handleSuccess("warranty")}
      />
      <AddCategoryModal
        visible={activeModal === "category"}
        onCancel={() => setActiveModal(null)}
        onSuccess={() => handleSuccess("category")}
      />
      <AddSubCategoryModal
        visible={activeModal === "subcategory"}
        onCancel={() => setActiveModal(null)}
        onSuccess={() => handleSuccess("subcategory")}
      />
      <AddBrandModal
        visible={activeModal === "brand"}
        onCancel={() => setActiveModal(null)}
        onSuccess={() => handleSuccess("brand")}
      />
      <AddWarehouseModal
        visible={activeModal === "warehouse"}
        onCancel={() => setActiveModal(null)}
        onSuccess={() => handleSuccess("warehouse")}
      />
    </>
  );
};

export default HeaderWithSearch;
