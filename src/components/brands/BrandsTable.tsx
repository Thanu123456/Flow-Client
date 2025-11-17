import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Image,
  message,
  DatePicker,
  Tooltip,
  Popover,
  Modal,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { FaRegImages } from "react-icons/fa";
import type { SortOrder } from "antd/es/table/interface";
import { useBrandStore } from "../../store/management/brandStore";
import type { Brand } from "../../types/entities/brand.types";
import dayjs from "dayjs";
import ViewBrandModal from "./ViewBrandModal";

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
  refreshData,
}) => {
  const { deleteBrand } = useBrandStore();
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);

  // Modal states
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);

  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [brandToView, setBrandToView] = useState<Brand | null>(null);

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setSelectedDate(date);
  };

  const showDeleteModal = (brand: Brand) => {
    if ((brand.productCount ?? 0) > 0) {
      message.warning(
        "This brand has products associated and cannot be deleted."
      );
      return;
    }
    setBrandToDelete(brand);
    setDeleteModalVisible(true);
  };

  const handleModalDelete = async () => {
    if (!brandToDelete) return;
    try {
      setDeleteLoading(brandToDelete.id);
      await deleteBrand(brandToDelete.id);
      message.success("Brand deleted successfully");
      refreshData();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to delete Brand");
    } finally {
      setDeleteLoading(null);
      setDeleteModalVisible(false);
      setBrandToDelete(null);
    }
  };

  const showViewModal = (brand: Brand) => {
    setBrandToView(brand);
    setViewModalVisible(true);
  };

  const columns = [
    {
      title: (
        <div className="text-center w-full text-base font-medium">Brand</div>
      ),
      dataIndex: "name",
      key: "brand",
      sorter: (a: Brand, b: Brand) => a.name.localeCompare(b.name),
      sortDirections: ["ascend", "descend"] as SortOrder[],
      render: (text: string, record: Brand) => (
        <Space>
          {record.imageUrl ? (
            <Image
              width={40}
              height={40}
              src={record.imageUrl}
              alt={text}
              style={{ objectFit: "contain" }}
              preview={false}
            />
          ) : (
            <div className="w-10 h-10 flex items-center justify-center rounded-md border-2 border-dashed border-red-400 bg-gray-50">
              <FaRegImages size={20} className="text-gray-400" />
            </div>
          )}
          <Button type="link" onClick={() => showViewModal(record)}>
            {text}
          </Button>
        </Space>
      ),
    },
    {
      title: (
        <div className="text-center w-full text-base font-medium">
          Description
        </div>
      ),
      dataIndex: "description",
      key: "description",
      align: "center" as const,
      ellipsis: true,
      render: (description: string) => description?.trim() || "N/A",
    },
    {
      title: (
        <div className="text-center w-full text-base font-medium">
          Product Count
        </div>
      ),
      dataIndex: "productCount",
      key: "productCount",
      align: "center" as const,
      render: (count: number) => count || 0,
    },
    {
      title: (
        <div className="text-center w-full text-base font-medium">Status</div>
      ),
      dataIndex: "status",
      key: "status",
      align: "center" as const,
      render: (status: string) => (
        <span
          className={`px-3 py-1 rounded-lg text-sm border ${
            status === "active"
              ? "border-green-500 text-green-500 bg-green-50/70"
              : "border-red-500 text-red-500 bg-red-50/70"
          }`}
        >
          {status === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      title: (
        <div className="flex items-center justify-center gap-2">
          <span>
            <div className="text-center w-full text-base font-medium">
              Created Date
            </div>
          </span>
          <Popover
            trigger="click"
            content={
              <DatePicker
                onChange={handleDateChange}
                value={selectedDate}
                allowClear
              />
            }
          >
            <Button type="text" icon={<CalendarOutlined />} size="small" />
          </Popover>
        </div>
      ),
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center" as const,
      render: (date: string) => dayjs(date).format("YYYY/MM/DD"),
    },
    {
      title: (
        <div className="text-center w-full text-base font-medium">Actions</div>
      ),
      key: "actions",
      align: "center" as const,
      render: (_: React.ReactNode, record: Brand) => (
        <Space>
          <div
            className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer"
            onClick={() => showViewModal(record)}
          >
            <Tooltip title="View">
              <EyeOutlined />
            </Tooltip>
          </div>

          <div
            className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer"
            onClick={() => onEdit(record)}
          >
            <Tooltip title="Edit">
              <EditOutlined style={{ color: "#1890ff" }} />
            </Tooltip>
          </div>

          <div
            className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer"
            onClick={() => showDeleteModal(record)}
            style={{ opacity: (record.productCount ?? 0) > 0 ? 0.5 : 1 }}
          >
            <Tooltip title="Delete">
              <DeleteOutlined style={{ color: "red" }} />
            </Tooltip>
          </div>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={brands}
        rowKey="id"
        loading={loading}
        scroll={{
          y: "calc(100vh - 320px)",
          x: 1000,
        }}
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
          position: ["bottomRight"],
        }}
        sticky={{
          offsetHeader: 0,
        }}
      />

      {/* Delete Modal */}
      <Modal
        title={
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "red" }}>
              <ExclamationCircleOutlined />
            </span>
            <span style={{ color: "black" }}>Confirm Delete</span>
          </span>
        }
        open={deleteModalVisible}
        onOk={handleModalDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Yes"
        cancelText="No"
        centered
        confirmLoading={deleteLoading === brandToDelete?.id}
        okButtonProps={{ style: { fontSize: 16, padding: "6px 20px" } }}
        cancelButtonProps={{ style: { fontSize: 16, padding: "6px 20px" } }}
      >
        <Space direction="vertical" align="center" size={16}>
          {brandToDelete?.imageUrl ? (
            <Image
              width={120}
              height={120}
              src={brandToDelete.imageUrl}
              alt={brandToDelete.name}
              style={{ objectFit: "contain", borderRadius: 8 }}
              preview={false}
            />
          ) : (
            <div className="w-24 h-24 flex items-center justify-center rounded-md border-2 border-dashed border-red-400 bg-gray-50">
              <FaRegImages size={28} className="text-gray-400" />
            </div>
          )}
          <p>
            Are you sure you want to delete the brand{" "}
            <strong>{brandToDelete?.name}</strong>?
          </p>
        </Space>
      </Modal>

      {/* View Modal */}
      <ViewBrandModal
        visible={viewModalVisible}
        brand={brandToView}
        onCancel={() => setViewModalVisible(false)}
      />
    </>
  );
};

export default BrandsTable;
