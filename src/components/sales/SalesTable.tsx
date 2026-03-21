import React from "react";
import { Tag, Tooltip } from "antd";
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
      title: <div className="text-center w-full">Product ID</div>,
      dataIndex: "productId",
      key: "productId",
      align: "center" as const,
      render: (id: string) => (
        <Tooltip title={id}>
          <span className="font-mono text-xs text-gray-500">
            {id.slice(0, 8)}...
          </span>
        </Tooltip>
      ),
    },
    {
      title: <div className="text-center w-full">Product Type</div>,
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
      title: <div className="text-center w-full">Product Name</div>,
      dataIndex: "productName",
      key: "productName",
      sorter: (a: SaleProductItem, b: SaleProductItem) =>
        a.productName.localeCompare(b.productName),
      render: (name: string) => (
        <span className="font-medium">{name}</span>
      ),
    },
    {
      title: <div className="text-center w-full">Available Stock</div>,
      dataIndex: "availableStock",
      key: "availableStock",
      align: "center" as const,
      sorter: (a: SaleProductItem, b: SaleProductItem) =>
        a.availableStock - b.availableStock,
      render: (stock: number) => (
        <span
          className={`px-3 py-1 rounded-lg text-sm border ${
            stock > 0
              ? "border-green-500 text-green-600 bg-green-50/70"
              : "border-red-400 text-red-500 bg-red-50/70"
          }`}
        >
          {stock}
        </span>
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
      onPageChange={() => {}}
    />
  );
};

export default SalesTable;
