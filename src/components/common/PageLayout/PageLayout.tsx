// src/components/Common/PageLayout/PageLayout.tsx
import { useState } from "react";
import { Card, Row, Col, Input, Select, Space } from "antd";
import { CommonButton } from "../Button";
import type { PageLayoutProps } from "./PageLayout.types";

const { Search } = Input;
const { Option } = Select;

function PageLayout({
  title,
  children,
  actions,
  searchConfig,
  filterConfig,
  collapsed: externalCollapsed,
  onCollapsedChange,
  showCollapseButton = true,
}: PageLayoutProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = externalCollapsed ?? internalCollapsed;
  const setCollapsed = onCollapsedChange ?? setInternalCollapsed;

  const toggleCollapse = () => setCollapsed(!collapsed);

  return (
    <div className="page-layout">
      <Card
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{title}</span>
          </div>
        }
        extra={
          <Space>
            {actions}
            {showCollapseButton && (
              <CommonButton
                icon={collapsed ? <span>▼</span> : <span>▲</span>}
                onClick={toggleCollapse}
              >
                {collapsed ? "Expand" : "Collapse"}
              </CommonButton>
            )}
          </Space>
        }
      >
        {!collapsed && (searchConfig || filterConfig) && (
          <Row gutter={[16, 16]} justify="end" style={{ marginBottom: 16 }}>
            {searchConfig && (
              <Col xs={24} sm={12} md={8}>
                <Search
                  placeholder={searchConfig.placeholder || "Search..."}
                  allowClear
                  enterButton
                  value={searchConfig.value}
                  onChange={(e) => searchConfig.onChange(e.target.value)}
                />
              </Col>
            )}

            {filterConfig?.map((filter, index) => (
              <Col key={index} xs={24} sm={12} md={4}>
                <Select
                  placeholder={filter.placeholder}
                  allowClear
                  style={{ width: "100%" }}
                  value={filter.value}
                  onChange={filter.onChange}
                >
                  {filter.options.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Col>
            ))}
          </Row>
        )}
        {children}
      </Card>
    </div>
  );
}

export default PageLayout;
