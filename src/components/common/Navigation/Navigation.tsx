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
        <Sider collapsible collapsed={collapsed} className="min-h-screen">
          <div className="p-4 text-white text-lg font-bold text-center">
            MyApp
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
            <HomeOutlined className="text-xl text-blue-600" />
            <span className="font-semibold text-lg">Dashboard</span>
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
