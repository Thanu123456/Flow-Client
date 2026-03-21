import React, { useState, useEffect, useCallback } from "react";
import { Space } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useSaleStore } from "../../store/transactions/saleStore";
import { useDebounce } from "../../hooks/ui/useDebounce";
import { PageLayout } from "../common/PageLayout";
import { CommonButton } from "../common/Button";
import SalesTable from "./SalesTable";

interface SalesPageProps {
  onHeaderCollapseChange?: (collapsed: boolean) => void;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

const SalesPage: React.FC<SalesPageProps> = ({ onHeaderCollapseChange }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { products, loading, getProducts } = useSaleStore();

  const fetchProducts = useCallback(() => {
    getProducts();
  }, [getProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filtered = products.filter((p) =>
    debouncedSearch
      ? p.productName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.productType.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.productId.toLowerCase().includes(debouncedSearch.toLowerCase())
      : true
  );

  return (
    <PageLayout
      title="Sales"
      collapsed={collapsed}
      onCollapsedChange={(newCollapsed) => {
        setCollapsed(newCollapsed);
        onHeaderCollapseChange?.(newCollapsed);
      }}
      searchConfig={{
        placeholder: "Search by name, type or ID...",
        value: searchTerm,
        onChange: setSearchTerm,
      }}
      actions={
        <Space>
          <CommonButton
            icon={<ReloadOutlined style={{ color: "blue" }} />}
            onClick={fetchProducts}
          >
            Refresh
          </CommonButton>
        </Space>
      }
    >
      <SalesTable products={filtered} loading={loading} />
    </PageLayout>
  );
};

export default SalesPage;
