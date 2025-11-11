import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  Tag,
  Image,
  message,
  DatePicker,
} from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import type { SortOrder } from "antd/es/table/interface";
import type { Brand } from "../../types/entities/brand.types";
import { useBrandStore } from "../../store/management/brandStore";
import dayjs from "dayjs";

interface BrandsTableProps {
  brands: Brand[];
  loading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (page: number, pageSize: number) => void;
  onEdit: (brand: Brand) => void;
  onView: (brand: Brand) => void;
  refreshData: () => void;
}

const BrandsTable: React.FC<BrandsTableProps> = ({
  brands,
  loading,
  pagination,
  onPageChange,
  onEdit,
  onView,
  refreshData,
}) => {
  const { deleteBrand } = useBrandStore();
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>(brands);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setDeleteLoading(id);
      await deleteBrand(id);
      message.success("Brand deleted successfully");
      refreshData();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to delete Brand");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setSelectedDate(date);
    if (date) {
      const filtered = brands.filter((brand) =>
        dayjs(brand.createdAt).isSame(date, "day")
      );
      setFilteredBrands(filtered);
    } else {
      setFilteredBrands(brands);
    }
  };

  const columns = [
    {
      title: <div className="text-center w-full">Brand</div>,
      dataIndex: "name",
      key: "brand",
      sorter: (a: Brand, b: Brand) => a.name.localeCompare(b.name),
      sortDirections: ["ascend", "descend"] as SortOrder[],
      render: (text: string, record: Brand) => (
        <Space>
          {record.imageUrl && (
            <Image
              width={40}
              height={40}
              src={record.imageUrl}
              alt={text}
              style={{ objectFit: "contain" }}
            />
          )}
          <Button type="link" onClick={() => onView(record)}>
            {text}
          </Button>
        </Space>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      align: "center" as const,
      ellipsis: true,
      render: (description: string) => description?.trim() || "N/A",
    },
    {
      title: "Product Count",
      dataIndex: "productCount",
      key: "productCount",
      align: "center" as const,
      render: (count: number) => count || 0,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center" as const,
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "default"}>
          {status === "active" ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: (
        <div className="flex flex-col gap-2 items-center">
          <div>Created Date</div>
          <DatePicker
            size="small"
            onChange={handleDateChange}
            value={selectedDate}
            allowClear
            placeholder="Select date"
          />
        </div>
      ),
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center" as const,
      render: (date: string) => dayjs(date).format("YYYY/MM/DD"),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center" as const,
      render: (_: React.ReactNode, record: Brand) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => onView(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this brand?"
            description={
              (record.productCount ?? 0) > 0
                ? "This brand has products associated and cannot be deleted."
                : "This action cannot be undone."
            }
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            disabled={(record.productCount ?? 0) > 0}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={deleteLoading === record.id}
              disabled={(record.productCount ?? 0) > 0}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={selectedDate ? filteredBrands : brands}
      rowKey="id"
      loading={loading}
      pagination={{
        current: pagination.page,
        pageSize: pagination.limit,
        total: pagination.total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} items`,
        pageSizeOptions: ["10", "25", "50", "100"],
        onChange: onPageChange,
      }}
    />
  );
};

export default BrandsTable;
