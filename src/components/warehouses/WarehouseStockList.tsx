import React, { useState, useEffect } from "react";
import { Modal, Table, Input, message, Empty } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useWarehouseStore } from "../../store/management/warehouseStore";
import type { WarehouseStock } from "../../types/entities/warehouse.types";
import dayjs from "dayjs";

const { Search } = Input;

interface WarehouseStockListProps {
  visible: boolean;
  warehouseId: string | null;
  warehouseName?: string;
  onCancel: () => void;
}

const WarehouseStockList: React.FC<WarehouseStockListProps> = ({
  visible,
  warehouseId,
  warehouseName,
  onCancel,
}) => {
  const [stockData, setStockData] = useState<WarehouseStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { getWarehouseStock } = useWarehouseStore();

  useEffect(() => {
    if (visible && warehouseId) {
      loadStockData();
    }
  }, [visible, warehouseId]);

  const loadStockData = async () => {
    if (!warehouseId) return;

    setLoading(true);
    try {
      const data = await getWarehouseStock(warehouseId);
      setStockData(data);
    } catch (error: any) {
      message.error("Failed to load warehouse stock");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = stockData.filter(
    (item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      title: "Product Code",
      dataIndex: "productCode",
      key: "productCode",
      width: 120,
      render: (text: string) => (
        <span className="font-semibold text-blue-600">{text}</span>
      ),
    },
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
      ellipsis: true,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: 120,
      align: "right" as const,
      render: (quantity: number) => (
        <span className="font-semibold">{quantity.toLocaleString()}</span>
      ),
    },
    {
      title: "Unit",
      dataIndex: "unitName",
      key: "unitName",
      width: 100,
      align: "center" as const,
    },
    {
      title: "Last Updated",
      dataIndex: "lastUpdated",
      key: "lastUpdated",
      width: 150,
      render: (date: string) => dayjs(date).format("DD MMM YYYY"),
    },
  ];

  return (
    <Modal
      title={`Stock List - ${warehouseName || "Warehouse"}`}
      open={visible}
      onCancel={onCancel}
      width={900}
      footer={null}
    >
      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="Search by product name or code"
          allowClear
          enterButton={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
        scroll={{ y: 400 }}
        locale={{
          emptyText: (
            <Empty
              description="No stock available in this warehouse"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ),
        }}
      />
    </Modal>
  );
};

export default WarehouseStockList;
