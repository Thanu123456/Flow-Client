import React from "react";
import {
  Layout,
  Menu,
  Breadcrumb as AntBreadcrumb,
  Pagination as AntPagination,
  Tabs as AntTabs,
} from "antd";
import {
  HomeOutlined,
  SettingOutlined,
  UserOutlined,
  NotificationOutlined,
} from "@ant-design/icons";
import type { NavigationProps } from "./Navigation.types";

const { Header, Sider, Content } = Layout;

export const Navigation: React.FC<NavigationProps> = ({
  type = "sidebar",
  collapsed,
  onCollapse, // Add this
  items,
  breadcrumbItems,
  activeKey,
  onTabChange,
  onPageChange,
  totalItems,
  pageSize = 10,
  currentPage = 1,
}) => {
  switch (type) {
    case "sidebar":
      return (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={onCollapse} // Add this line
          width={240}
          className="min-h-screen"
        >
          <div className="p-4 text-white text-lg font-bold text-center flex items-center justify-center gap-2">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="animate-pulse"
            >
              {/* Cash Register Base */}
              <rect x="4" y="20" width="24" height="8" rx="1" fill="#60A5FA" />

              {/* Display Screen */}
              <rect x="6" y="12" width="20" height="6" rx="1" fill="#93C5FD" />
              <rect
                x="8"
                y="14"
                width="16"
                height="2"
                rx="0.5"
                fill="#1E40AF"
                className="animate-pulse"
              />

              <rect
                x="4"
                y="28"
                width="24"
                height="2"
                rx="0.5"
                fill="#3B82F6"
              />

              <circle cx="10" cy="24" r="1.5" fill="#1E40AF" />
              <circle cx="16" cy="24" r="1.5" fill="#1E40AF" />
              <circle cx="22" cy="24" r="1.5" fill="#1E40AF" />

              {/* Receipt Paper */}
              <path
                d="M14 4 L14 12 L18 12 L18 4"
                stroke="#F3F4F6"
                strokeWidth="2"
                fill="none"
                className="animate-bounce"
                style={{ animationDuration: "2s" }}
              />
            </svg>
            {!collapsed && <span>MyApp</span>}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            items={items}
            defaultSelectedKeys={[activeKey || "1"]}
          />
        </Sider>
      );

    case "header":
      return (
        <Header className="bg-white shadow-sm px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HomeOutlined className="text-xl" style={{ color: "white" }} />
            <span className="font-semibold text-lg text-white">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationOutlined className="text-lg" />
            <UserOutlined className="text-lg" />
          </div>
        </Header>
      );

    case "breadcrumb":
      return (
        <AntBreadcrumb
          className="p-3 bg-gray-50 rounded-md"
          items={breadcrumbItems}
        />
      );

    case "tabs":
      return (
        <AntTabs
          defaultActiveKey={activeKey || "1"}
          onChange={onTabChange}
          items={items}
        />
      );

    case "pagination":
      return (
        <div className="flex justify-center py-4">
          <AntPagination
            total={totalItems}
            pageSize={pageSize}
            current={currentPage}
            onChange={onPageChange}
          />
        </div>
      );

    default:
      return null;
  }
};

export default Navigation;
