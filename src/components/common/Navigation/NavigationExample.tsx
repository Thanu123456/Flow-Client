import React from "react";
import { Layout, type MenuProps } from "antd";
import { Navigation } from "./Navigation";
import {
  HomeOutlined,
  ShoppingCartOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Content } = Layout;

export const NavigationExample: React.FC = () => {
  const sidebarItems: MenuProps["items"] = [
    { key: "1", icon: <HomeOutlined />, label: "Dashboard" },
    { key: "2", icon: <ShoppingCartOutlined />, label: "Products" },
    { key: "3", icon: <UserOutlined />, label: "Users" },
    { key: "4", icon: <SettingOutlined />, label: "Settings" },
  ];

  const breadcrumbItems = [
    { title: "Dashboard" },
    { title: "Products" },
    { title: "Electronics" },
  ];

  const tabItems = [
    { key: "1", label: "Sales", children: "Sales content" },
    { key: "2", label: "Purchases", children: "Purchases content" },
    { key: "3", label: "Quotations", children: "Quotations content" },
  ];

  return (
    <Layout className="min-h-screen">
      <Navigation type="sidebar" items={sidebarItems} />
      <Layout>
        <Navigation type="header" />
        <Content className="p-6 bg-gray-100 space-y-6">
          <Navigation type="breadcrumb" breadcrumbItems={breadcrumbItems} />
          <Navigation type="tabs" items={tabItems} />
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <p>Page content area with navigation components</p>
          </div>
          <Navigation
            type="pagination"
            totalItems={100}
            pageSize={10}
            currentPage={1}
            onPageChange={(p) => console.log("Page:", p)}
          />
        </Content>
      </Layout>
    </Layout>
  );
};
