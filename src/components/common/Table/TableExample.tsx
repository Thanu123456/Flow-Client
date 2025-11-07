import React from "react";
import { DataTable } from "./Table";
import type { ColumnsType } from "antd/es/table";
import { Button, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

interface Product {
  key: string;
  name: string;
  price: number;
  category: string;
  stock: number;
}

export const TableExample: React.FC = () => {
  const [loading, setLoading] = React.useState(false);

  const columns: ColumnsType<Product> = [
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      filters: [
        { text: "Electronics", value: "Electronics" },
        { text: "Groceries", value: "Groceries" },
      ],
      onFilter: (value, record) => record.category === value,
    },
    {
      title: "Price ($)",
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      render: (stock: number) => (
        <span className={stock > 0 ? "text-green-600" : "text-red-600"}>
          {stock > 0 ? "Available" : "Out of stock"}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: () => (
        <Space>
          <Button type="link" icon={<EditOutlined />}>
            Edit
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const data: Product[] = [
    {
      key: "1",
      name: "iPhone 15",
      price: 1200,
      category: "Electronics",
      stock: 12,
    },
    {
      key: "2",
      name: "Rice 10kg",
      price: 18,
      category: "Groceries",
      stock: 50,
    },
    {
      key: "3",
      name: "Bluetooth Speaker",
      price: 80,
      category: "Electronics",
      stock: 0,
    },
    {
      key: "4",
      name: "LED Monitor",
      price: 250,
      category: "Electronics",
      stock: 8,
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold mb-4">DataTable Example</h2>

      <DataTable<Product>
        columns={columns}
        data={data}
        loading={loading}
        pagination={{ pageSize: 5 }}
        rowSelection={{
          onChange: (selectedKeys) =>
            console.log("Selected rows:", selectedKeys),
        }}
      />
    </div>
  );
};
