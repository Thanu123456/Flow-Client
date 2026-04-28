import React from 'react';
import {
  Drawer, Tag, Table, Descriptions, Divider, Typography, Spin, Space, Badge,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { SaleReturn, SaleReturnItem } from '../../types/entities/saleReturn.types';

const { Text, Title } = Typography;

const PAYMENT_COLORS: Record<string, string> = {
  cash: 'green',
  card: 'blue',
  cod: 'orange',
  credit: 'purple',
  hold: 'default',
};

interface SaleReturnDrawerProps {
  open: boolean;
  record: SaleReturn | null;
  loading?: boolean;
  onClose: () => void;
}

const itemColumns: ColumnsType<SaleReturnItem> = [
  {
    title: 'Product',
    dataIndex: 'productName',
    key: 'productName',
    ellipsis: true,
  },
  {
    title: 'Qty',
    dataIndex: 'quantity',
    key: 'quantity',
    width: 70,
    align: 'right',
    render: (v: number) => (v % 1 === 0 ? v : v.toFixed(3)),
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
    width: 100,
    align: 'right',
    render: (v: number) => `LKR ${v.toFixed(2)}`,
  },
  {
    title: 'Total',
    key: 'total',
    width: 110,
    align: 'right',
    render: (_: any, r: SaleReturnItem) => (
      <Text strong style={{ color: '#f5222d' }}>
        LKR {(r.quantity * r.price).toFixed(2)}
      </Text>
    ),
  },
];

const SaleReturnDrawer: React.FC<SaleReturnDrawerProps> = ({
  open,
  record,
  loading = false,
  onClose,
}) => {
  return (
    <Drawer
      title={
        record ? (
          <Space>
            <Badge color="red" />
            <span style={{ color: '#f5222d', fontWeight: 600 }}>
              {record.invoiceNumber}
            </span>
            <Tag color="red" style={{ marginLeft: 4 }}>REFUNDED</Tag>
          </Space>
        ) : (
          'Refund Details'
        )
      }
      open={open}
      onClose={onClose}
      width={520}
      destroyOnClose
    >
      <Spin spinning={loading}>
        {record ? (
          <>
            {/* ── Summary ── */}
            <Descriptions
              size="small"
              column={2}
              bordered
              style={{ marginBottom: 20 }}
            >
              <Descriptions.Item label="Ref #" span={2}>
                <Text strong style={{ color: '#f5222d', fontSize: 15 }}>
                  {record.invoiceNumber}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                {dayjs(record.createdAt).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color="red">REFUNDED</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Customer" span={2}>
                {record.customerName || (
                  <Text type="secondary">Walk-in</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method" span={2}>
                <Tag color={PAYMENT_COLORS[record.paymentMethod?.toLowerCase()] ?? 'default'}>
                  {record.paymentMethod?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {/* ── Items ── */}
            <Title level={5} style={{ marginBottom: 8 }}>
              Returned Items
            </Title>
            <Table
              columns={itemColumns}
              dataSource={record.items}
              rowKey="id"
              pagination={false}
              size="small"
              style={{ marginBottom: 20 }}
              locale={{ emptyText: 'No items recorded' }}
            />

            {/* ── Financials ── */}
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ lineHeight: '2.2em' }}>
              {record.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Discount</Text>
                  <Text>LKR {record.discountAmount.toFixed(2)}</Text>
                </div>
              )}
              {record.deliveryCharge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Delivery</Text>
                  <Text>LKR {record.deliveryCharge.toFixed(2)}</Text>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 16,
                  marginTop: 4,
                }}
              >
                <Text strong>Total Refunded</Text>
                <Text strong style={{ color: '#f5222d' }}>
                  LKR {record.totalAmount.toFixed(2)}
                </Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Paid Back</Text>
                <Text>LKR {record.paidAmount.toFixed(2)}</Text>
              </div>
            </div>
          </>
        ) : null}
      </Spin>
    </Drawer>
  );
};

export default SaleReturnDrawer;
