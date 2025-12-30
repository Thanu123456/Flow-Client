import React from "react";
import { Table, Tag, Empty } from "antd";

interface StockItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unit: string;
}

interface WarehouseStockListProps {
  warehouseId: string;
  stock: StockItem[];
  loading?: boolean;
}

const WarehouseStockList: React.FC<WarehouseStockListProps> = ({
  warehouseId: _warehouseId,
  stock,
  loading = false,
}) => {
  const columns = [
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number) => (
        <Tag color={quantity > 0 ? "green" : "red"}>
          {quantity}
        </Tag>
      ),
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
    },
  ];

  if (stock.length === 0) {
    return <Empty description="No stock items found" />;
  }

  return (
    <Table
      columns={columns}
      dataSource={stock}
      loading={loading}
      rowKey="productId"
      size="small"
      pagination={{ pageSize: 10 }}
    />
  );
};

export default WarehouseStockList;
