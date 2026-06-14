import React from 'react';
import { Modal, Descriptions, Tag, Table, Divider, Button, Space, Typography, Card, Row, Col } from 'antd';
import { RollbackOutlined, FileTextOutlined, ShopOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import type { PurchaseReturn, PurchaseReturnItem } from '../../types/entities/purchaseReturn.types';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

const fmt = (n: number) =>
  `Rs. ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface Props {
  visible: boolean;
  ret: PurchaseReturn | null;
  onClose: () => void;
}

const PurchaseReturnDetailsModal: React.FC<Props> = ({ visible, ret, onClose }) => {
  if (!ret) return null;

  const itemColumns = [
    {
      title: '#',
      key: 'idx',
      width: 50,
      align: 'center' as const,
      render: (_: any, __: PurchaseReturnItem, idx: number) => (
        <Text type="secondary">{idx + 1}</Text>
      ),
    },
    {
      title: 'Product',
      key: 'product',
      render: (_: any, record: PurchaseReturnItem) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.productName}</div>
          {record.variationType && (
            <Tag color="blue-inverse" style={{ fontSize: '10px', marginTop: 2 }}>
              {record.variationType.toUpperCase()}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Return Qty',
      dataIndex: 'returnQty',
      key: 'returnQty',
      align: 'right' as const,
      render: (v: number) => <Text strong>{v}</Text>,
    },
    {
      title: 'Cost Price',
      dataIndex: 'costPrice',
      key: 'costPrice',
      align: 'right' as const,
      render: (v: number) => (
        <Text style={{ fontFamily: 'monospace' }}>
          {v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right' as const,
      render: (v: number) => (
        <Text strong style={{ fontFamily: 'monospace', color: '#f5222d' }}>
          {v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      render: (v?: string) => v ? <Text type="secondary">{v}</Text> : <Text type="secondary" disabled>-</Text>,
    },
  ];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      width={900}
      style={{ top: 20 }}
      title={
        <div style={{
          background: 'linear-gradient(90deg, #fff1f0 0%, #ffffff 100%)',
          padding: '20px 24px',
          margin: '-20px -24px 0 -24px',
          borderBottom: '1px solid #f0f0f0',
          borderRadius: '8px 8px 0 0',
        }}>
          <Row justify="space-between" align="middle" style={{ paddingRight: '40px' }}>
            <Col>
              <Space direction="vertical" size={0}>
                <Space>
                  <RollbackOutlined style={{ fontSize: '20px', color: '#f5222d' }} />
                  <Title level={4} style={{ margin: 0 }}>Purchase Return</Title>
                  <Tag color="red" style={{ borderRadius: '12px', padding: '0 12px' }}>COMPLETED</Tag>
                </Space>
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  Ref # <Text strong style={{ color: '#000' }}>{ret.returnNumber}</Text>
                  {' · '}GRN <Text strong style={{ color: '#1890ff' }}>{ret.originalGrnNumber}</Text>
                </Text>
              </Space>
            </Col>
            <Col style={{ textAlign: 'right' }}>
              <div style={{ color: '#8c8c8c', fontSize: '12px', marginBottom: 2 }}>Total Returned</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#f5222d' }}>
                {fmt(ret.totalReturnAmount)}
              </div>
            </Col>
          </Row>
        </div>
      }
      footer={[
        <Button key="close" type="primary" onClick={onClose}>Close</Button>,
      ]}
    >
      <Space direction="vertical" size={20} style={{ width: '100%' }}>
        <Card size="small" title={<Space><ShopOutlined /> Details</Space>} styles={{ header: { backgroundColor: '#fafafa' } }}>
          <Descriptions size="small" column={{ xs: 1, sm: 2, md: 3 }} bordered>
            <Descriptions.Item label="Return Date">
              <Space><CalendarOutlined style={{ color: '#8c8c8c' }} />{dayjs(ret.returnDate).format('DD MMM YYYY')}</Space>
            </Descriptions.Item>
            <Descriptions.Item label="Supplier">
              <Text strong>{ret.supplierName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Warehouse">{ret.warehouseName}</Descriptions.Item>
            <Descriptions.Item label="Original GRN">
              <Text style={{ fontFamily: 'monospace', color: '#1890ff' }}>{ret.originalGrnNumber}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Processed By">
              <Space><UserOutlined style={{ color: '#8c8c8c' }} />{ret.createdByName}</Space>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <div>
          <div style={{ padding: '0 0 12px 0', borderBottom: '1px solid #f0f0f0', marginBottom: 12 }}>
            <Title level={5} style={{ margin: 0 }}>
              <Space><FileTextOutlined style={{ color: '#f5222d' }} /> Returned Items ({ret.items.length})</Space>
            </Title>
          </div>
          <Table
            columns={itemColumns}
            dataSource={ret.items}
            rowKey="id"
            pagination={false}
            size="small"
            bordered
            scroll={{ x: 700 }}
          />
        </div>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            {ret.notes && (
              <Card size="small" style={{ backgroundColor: '#fffbe6', border: '1px solid #ffe58f' }}>
                <Text strong>Notes: </Text>{ret.notes}
              </Card>
            )}
          </Col>
          <Col xs={24} md={12}>
            <Card size="small" title="Return Summary" styles={{ header: { backgroundColor: '#fff1f0' } }}>
              <Divider style={{ margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <Text strong style={{ fontSize: '16px' }}>Total Return Amount</Text>
                <Text strong style={{ fontSize: '18px', fontFamily: 'monospace', color: '#f5222d' }}>
                  {fmt(ret.totalReturnAmount)}
                </Text>
              </div>
              <div style={{ marginTop: 8, padding: '6px 8px', background: '#fff1f0', borderRadius: 4 }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  This amount has been debited from the supplier's outstanding balance.
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </Space>
    </Modal>
  );
};

export default PurchaseReturnDetailsModal;
