import React from "react";
import { Tag, Badge } from "antd";
import type { SaleProductItem } from "../../types/entities/sale.types";
import { CommonTable } from "../common/Table";
import type { TableColumn } from "../common/Table/Table.types";

interface SalesTableProps {
  products: SaleProductItem[];
  loading: boolean;
}

const productTypeColor: Record<string, string> = {
  single: "blue",
  variable: "purple",
};

const SalesTable: React.FC<SalesTableProps> = ({ products, loading }) => {
  const columns: TableColumn<SaleProductItem>[] = [
    {
      title: "Product ID",
      dataIndex: "productId",
      key: "productId",
      render: (id: string) => (
        <span className="text-gray-600 font-medium">
          {id}
        </span>
      ),
    },
    {
      title: "Product Type",
      dataIndex: "productType",
      key: "productType",
      align: "center" as const,
      render: (type: string) => (
        <Tag color={productTypeColor[type] ?? "default"}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Tag>
      ),
    },
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
      sorter: (a: SaleProductItem, b: SaleProductItem) =>
        a.productName.localeCompare(b.productName),
      render: (name: string) => (
        <span className="font-medium">{name}</span>
      ),
    },
    {
      title: "Available Stock",
      dataIndex: "availableStock",
      key: "availableStock",
      align: "center" as const,
      sorter: (a: SaleProductItem, b: SaleProductItem) =>
        a.availableStock - b.availableStock,
      render: (stock: number) => (
        <Badge
          count={stock}
          showZero
          overflowCount={99999}
          style={{
            backgroundColor: stock > 0 ? "#1890ff" : "#d9d9d9",
            color: "#fff",
            fontSize: "14px",
            height: "28px",
            minWidth: "28px",
            lineHeight: "28px",
            borderRadius: "14px",
            cursor: "default",
            boxShadow: "0 2px 0 rgba(0,0,0,0.045)",
            padding: "0 8px",
          }}
        />
      ),
    },
  ];

  return (
    <CommonTable<SaleProductItem>
      columns={columns}
      dataSource={products}
      rowKey="productId"
      loading={loading}
      pagination={{ total: products.length, page: 1, limit: products.length || 10, totalPages: 1 }}
      onPageChange={() => { }}
    />
  );
};

export default SalesTable;
