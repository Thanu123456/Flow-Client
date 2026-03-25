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
      title: "Product ID",
      dataIndex: "productId",
      key: "productId",
      render: (id: string) => (
        <Tooltip title={id}>
          <div className="flex items-center justify-start">
            <span className="font-mono text-[13px] font-bold text-blue-800 bg-blue-50/80 px-2.5 py-1.5 rounded-lg border border-blue-200/50 shadow-sm">
              {id.slice(0, 12)}...
            </span>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Product Type",
      dataIndex: "productType",
      key: "productType",
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
