import React from 'react';
import { Modal, Button, Tag, Table, Divider, Typography, Spin, Badge } from 'antd';
import {
  UserOutlined, CalendarOutlined, CreditCardOutlined,
  FileTextOutlined, MessageOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { SaleReturn, SaleReturnItem } from '../../types/entities/saleReturn.types';

const { Text } = Typography;

const PAYMENT_COLORS: Record<string, string> = {
  cash: 'green', card: 'blue', cod: 'orange', credit: 'purple', hold: 'default',
};

const REASON_LABELS: Record<string, string> = {
  damaged_product:       'Damaged Product',
  wrong_item:            'Wrong Item',
  customer_changed_mind: 'Customer Changed Mind',
  defective:             'Defective Product',
  other:                 'Other',
};

interface RefundDetailsModalProps {
  open: boolean;
  record: SaleReturn | null;
  loading?: boolean;
  onClose: () => void;
}

const RefundDetailsModal: React.FC<RefundDetailsModalProps> = ({
  open, record, loading = false, onClose,
}) => {
  const itemColumns: ColumnsType<SaleReturnItem> = [
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
      ellipsis: true,
      render: (v: string) => <Text strong>{v || '—'}</Text>,
    },
    {
      title: 'Variation',
      dataIndex: 'variationType',
      key: 'variationType',
      width: 110,
      render: (v?: string) => v ? <Tag>{v}</Tag> : <Text type="secondary">—</Text>,
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      render: (v?: string) => v || 'Pcs',
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 70,
      align: 'right',
      render: (v: number) => <Text strong>{v % 1 === 0 ? v : v.toFixed(3)}</Text>,
    },
    {
      title: 'Unit Price',
      dataIndex: 'price',
      key: 'price',
      width: 110,
      align: 'right',
      render: (v: number) => `LKR ${v.toFixed(2)}`,
    },
    {
      title: 'Total',
      key: 'total',
      width: 120,
      align: 'right',
      render: (_: any, r: SaleReturnItem) => (
        <Text strong style={{ color: '#f5222d' }}>
          LKR {(r.quantity * r.price).toFixed(2)}
        </Text>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={<Button onClick={onClose}>Close</Button>}
      width={780}
      centered
      title={null}
      styles={{ body: { padding: 0 } }}
    >
      <Spin spinning={loading}>
        {/* ── Header bar ── */}
        <div style={{
          background: 'linear-gradient(135deg, #7b0000 0%, #c0392b 100%)',
          padding: '18px 24px',
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
              Refund Reference
            </div>
            <div style={{ color: '#fff', fontSize: 20, fontWeight: 800, letterSpacing: 0.5 }}>
              {record?.invoiceNumber ?? '—'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Badge color="#ff7875" />
            <Tag color="red" style={{ fontSize: 12, fontWeight: 700, padding: '2px 10px', border: 'none', background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
              REFUNDED
            </Tag>
          </div>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {record && (
            <>
              {/* ── Summary grid ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[
                  {
                    icon: <UserOutlined style={{ color: '#1677ff' }} />,
                    label: 'Customer',
                    value: record.customerName || 'Walk-in',
                  },
                  {
                    icon: <CalendarOutlined style={{ color: '#52c41a' }} />,
                    label: 'Date',
                    value: dayjs(record.createdAt).format('YYYY-MM-DD HH:mm'),
                  },
                  {
                    icon: <CreditCardOutlined style={{ color: '#fa8c16' }} />,
                    label: 'Payment Method',
                    value: (
                      <Tag color={PAYMENT_COLORS[record.paymentMethod?.toLowerCase()] ?? 'default'}>
                        {record.paymentMethod?.toUpperCase()}
                      </Tag>
                    ),
                  },
                ].map(({ icon, label, value }) => (
                  <div key={label} style={{
                    background: '#fafafa', border: '1px solid #f0f0f0',
                    borderRadius: 8, padding: '10px 14px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      {icon}
                      <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {label}
                      </Text>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* ── Reason & Note ── */}
              {(record.reason || record.note) && (
                <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                  {record.reason && (
                    <div style={{
                      flex: 1, background: '#fff7e6', border: '1px solid #ffd591',
                      borderRadius: 8, padding: '10px 14px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <FileTextOutlined style={{ color: '#fa8c16' }} />
                        <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Reason
                        </Text>
                      </div>
                      <Text strong style={{ fontSize: 13 }}>
                        {REASON_LABELS[record.reason] ?? record.reason}
                      </Text>
                    </div>
                  )}
                  {record.note && (
                    <div style={{
                      flex: 2, background: '#f6ffed', border: '1px solid #b7eb8f',
                      borderRadius: 8, padding: '10px 14px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <MessageOutlined style={{ color: '#52c41a' }} />
                        <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Note
                        </Text>
                      </div>
                      <Text style={{ fontSize: 13 }}>{record.note}</Text>
                    </div>
                  )}
                </div>
              )}

              {/* ── Items table ── */}
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
                  Returned Items
                </Text>
                <Table
                  columns={itemColumns}
                  dataSource={record.items}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  scroll={{ x: 600 }}
                  locale={{ emptyText: 'No items recorded' }}
                  style={{ borderRadius: 6, overflow: 'hidden', border: '1px solid #f0f0f0' }}
                />
              </div>

              {/* ── Financial summary ── */}
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ minWidth: 260 }}>
                  {record.discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                      <Text type="secondary">Discount</Text>
                      <Text style={{ color: '#f5222d' }}>− LKR {record.discountAmount.toFixed(2)}</Text>
                    </div>
                  )}
                  {record.deliveryCharge > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                      <Text type="secondary">Delivery Charge</Text>
                      <Text>LKR {record.deliveryCharge.toFixed(2)}</Text>
                    </div>
                  )}
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <Text strong style={{ fontSize: 15 }}>Total Refunded</Text>
                    <Text strong style={{ fontSize: 15, color: '#f5222d' }}>
                      LKR {record.totalAmount.toFixed(2)}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <Text type="secondary">Paid Back</Text>
                    <Text>LKR {record.paidAmount.toFixed(2)}</Text>
                  </div>
                </div>
              </div>
            </>
          )}

          {!record && !loading && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>
              No data available
            </div>
          )}
        </div>
      </Spin>
    </Modal>
  );
};

export default RefundDetailsModal;
