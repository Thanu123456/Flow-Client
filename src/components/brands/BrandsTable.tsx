// src/components/brands/BrandsTable.tsx
import React, { useState } from 'react';
import { Table, Button, Space, Popconfirm, Tag, Image, message } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { Brand } from '../../types/entities/brand.types';
import { useBrandStore } from '../../store/management/brandStore';

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

  const handleDelete = async (id: string) => {
    try {
      setDeleteLoading(id);
      await deleteBrand(id);
      message.success('Brand deleted successfully');
      refreshData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to delete brand');
    } finally {
      setDeleteLoading(null);
    }
  };

  const columns = [
    {
      title: 'Brand',
      dataIndex: 'name',
      key: 'brand',
      render: (text: string, record: Brand) => (
        <Space>
          {record.imageUrl && (
            <Image
              width={40}
              height={40}
              src={record.imageUrl}
              alt={text}
              style={{ objectFit: 'contain' }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8O+L"
            />
          )}
          <Button type="link" onClick={() => onView(record)}>
            {text}
          </Button>
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Product Count',
      dataIndex: 'productCount',
      key: 'productCount',
      render: (count: number) => count || 0,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
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
                ? "This brand has products associated with it and cannot be deleted."
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
      dataSource={brands}
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
        pageSizeOptions: ['10', '25', '50', '100'],
        onChange: onPageChange,
      }}
    />
  );
};

export default BrandsTable;