import React from 'react';
import { Table, Button, Tooltip, Avatar, Tag, InputNumber, Popconfirm } from 'antd';
import { DeleteOutlined, BarcodeOutlined } from '@ant-design/icons';
import type { GRNItemLocal } from '../../types/entities/purchase.types';
import dayjs from 'dayjs';

interface Props {
  items: GRNItemLocal[];
  onQuantityChange: (localId: string, qty: number) => void;
  onRemove: (localId: string) => void;
  readOnly?: boolean;
}

const fmt = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PurchaseItemsTable: React.FC<Props> = ({
  items,
  onQuantityChange,
  onRemove,
  readOnly = false,
}) => {
  const activeItems = items.filter((i) => !i.isDeleted);

  const columns = [
    {
      title: '',
      key: 'image',
      width: 48,
      render: (_: any, record: GRNItemLocal) => (
        <Avatar
          src={record.productImage}
          shape="square"
          size={36}
          style={{ backgroundColor: '#f0f0f0', color: '#aaa' }}
        >
          {record.productName.charAt(0)}
        </Avatar>
      ),
    },
    {
      title: 'Product',
      key: 'product',
      render: (_: any, record: GRNItemLocal) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.productName}</div>
          {record.productSKU && (
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.productSKU}</div>
          )}
          {record.variationType && <Tag style={{ marginTop: 2 }}>{record.variationType}</Tag>}
        </div>
      ),
    },
    {
      title: 'Unit',
      key: 'unit',
      width: 80,
      render: (_: any, record: GRNItemLocal) =>
        record.unitShortName || record.unitName || '-',
    },
    {
      title: 'Stock',
      key: 'stock',
      width: 80,
      align: 'right' as const,
      render: (_: any, record: GRNItemLocal) => (
        <span style={{ color: record.currentStock <= 0 ? '#ff4d4f' : '#52c41a', fontWeight: 500 }}>
          {record.currentStock}
          {record.unitShortName ? ` ${record.unitShortName}` : ''}
        </span>
      ),
    },
    {
      title: 'Quantity',
      key: 'quantity',
      width: 120,
      render: (_: any, record: GRNItemLocal) =>
        readOnly ? (
          <span>{record.quantity}</span>
        ) : (
          <InputNumber
            min={0.0001}
            value={record.quantity}
            precision={4}
            style={{ width: 90 }}
            onChange={(val) => {
              if (val && val > 0) onQuantityChange(record.localId, val);
            }}
          />
        ),
    },
    {
      title: 'S/N',
      key: 'serial',
      width: 60,
      render: (_: any, record: GRNItemLocal) =>
        record.hasSerialNumbers ? (
          <Tooltip title={record.serialNumbers.length > 0 ? record.serialNumbers.join(', ') : 'No serials entered'}>
            <BarcodeOutlined
              style={{ color: record.serialNumbers.length > 0 ? '#52c41a' : '#faad14', fontSize: '16px' }}
            />
          </Tooltip>
        ) : (
          <span style={{ color: '#d9d9d9' }}>-</span>
        ),
    },
    {
      title: 'Expiry',
      key: 'expiry',
      width: 110,
      render: (_: any, record: GRNItemLocal) => {
        if (!record.expiryDate) return <span style={{ color: '#d9d9d9' }}>N/A</span>;
        const diff = dayjs(record.expiryDate).diff(dayjs(), 'month');
        const color = diff < 6 ? '#ff4d4f' : diff < 12 ? '#faad14' : '#52c41a';
        return (
          <span style={{ color }}>
            {dayjs(record.expiryDate).format('DD MMM YYYY')}
          </span>
        );
      },
    },
    {
      title: 'Cost',
      key: 'cost',
      align: 'right' as const,
      width: 100,
      render: (_: any, record: GRNItemLocal) => (
        <span style={{ fontFamily: 'monospace' }}>{fmt(record.costPrice)}</span>
      ),
    },
    {
      title: 'Net Price',
      key: 'netPrice',
      align: 'right' as const,
      width: 120,
      render: (_: any, record: GRNItemLocal) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{fmt(record.netPrice)}</span>
      ),
    },
    ...(readOnly
      ? []
      : [
          {
            title: '',
            key: 'action',
            width: 48,
            render: (_: any, record: GRNItemLocal) => (
              <Popconfirm
                title="Remove Item"
                description={
                  record.hasSerialNumbers && record.serialNumbers.length > 0
                    ? 'This item has serial numbers recorded. Remove anyway?'
                    : 'Remove this item from the GRN?'
                }
                onConfirm={() => onRemove(record.localId)}
                okText="Remove"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
                />
              </Popconfirm>
            ),
          },
        ]),
  ];

  const totalNet = activeItems.reduce((sum, item) => sum + item.netPrice, 0);

  return (
    <div>
      <Table
        columns={columns}
        dataSource={activeItems}
        rowKey="localId"
        pagination={false}
        size="small"
        footer={() => (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '32px', padding: '4px 8px' }}>
            <span>
              <strong>{activeItems.length}</strong> item(s)
            </span>
            <span>
              Total:{' '}
              <strong style={{ fontFamily: 'monospace' }}>Rs. {fmt(totalNet)}</strong>
            </span>
          </div>
        )}
        locale={{ emptyText: 'No items added yet. Search and add products above.' }}
      />
    </div>
  );
};

export default PurchaseItemsTable;
