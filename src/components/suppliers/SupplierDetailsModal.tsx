import { Modal, Descriptions, Avatar, Typography, Badge, Space, Row, Col, Tag } from 'antd';
import { ShopOutlined, PhoneOutlined, HomeOutlined, InfoCircleOutlined, WalletOutlined, HistoryOutlined } from '@ant-design/icons';
import type { Supplier, PaymentTerms } from '../../types/entities/supplier.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface SupplierDetailsModalProps {
  visible: boolean;
  supplier: Supplier | null;
  onClose: () => void;
}

const SupplierDetailsModal: React.FC<SupplierDetailsModalProps> = ({
  visible,
  supplier,
  onClose,
}) => {
  if (!supplier) return null;

  const getPaymentTermsLabel = (terms: PaymentTerms): string => {
    const labelMap: Record<PaymentTerms, string> = {
      cod: 'COD (Cash on Delivery)',
      net_7: 'Net 7 Days',
      net_15: 'Net 15 Days',
      net_30: 'Net 30 Days',
      net_60: 'Net 60 Days',
      net_90: 'Net 90 Days',
    };
    return labelMap[terms] || terms;
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      style={{ top: 20 }}
      title={
        <div style={{
          background: 'linear-gradient(90deg, #f0f5ff 0%, #ffffff 100%)',
          padding: '16px 24px',
          margin: '-20px -24px 0 -24px',
          borderBottom: '1px solid #f0f0f0',
          borderRadius: '8px 8px 0 0',
        }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <div style={{
                  background: '#e6f7ff',
                  padding: '8px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1890ff'
                }}>
                  <ShopOutlined style={{ fontSize: '20px' }} />
                </div>
                <Space direction="vertical" size={0}>
                  <Title level={4} style={{ margin: 0 }}>Supplier Details</Title>
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    {supplier.displayName} {supplier.companyName && `| ${supplier.companyName}`}
                  </Text>
                </Space>
              </Space>
            </Col>
            <Col>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: `1px solid ${supplier.isActive ? '#52c41a' : '#f5222d'}`,
                  color: supplier.isActive ? '#52c41a' : '#f5222d',
                  background: supplier.isActive ? '#f6ffed' : '#fff1f0',
                }}
              >
                {supplier.isActive ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </Col>
          </Row>
        </div>
      }
    >
      <div style={{ padding: '16px 0' }}>
        <Row gutter={24}>
          <Col span={6} style={{ textAlign: 'center' }}>
            <Avatar
              size={120}
              src={supplier.imageUrl}
              icon={<ShopOutlined />}
              style={{ border: '4px solid #f0f5ff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            />
            <div style={{ marginTop: 16 }}>
              <Text strong style={{ fontSize: '16px', display: 'block' }}>{supplier.displayName}</Text>
              <Text type="secondary">{supplier.companyName || 'No Company'}</Text>
            </div>
          </Col>
          <Col span={18}>
            <Space direction="vertical" size={24} style={{ width: '100%' }}>
              <section>
                <Title level={5}><Space><PhoneOutlined /> Contact Information</Space></Title>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="Full Name">{supplier.fullName}</Descriptions.Item>
                  <Descriptions.Item label="Phone"><Text copyable>{supplier.phone}</Text></Descriptions.Item>
                  <Descriptions.Item label="Email">{supplier.email ? <Text copyable>{supplier.email}</Text> : '-'}</Descriptions.Item>
                  <Descriptions.Item label="Tax Number">{supplier.taxNumber || '-'}</Descriptions.Item>
                  <Descriptions.Item label="City">{supplier.city || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Address" span={2}><HomeOutlined /> {supplier.address || '-'}</Descriptions.Item>
                </Descriptions>
              </section>

              <section>
                <Title level={5}><Space><HistoryOutlined /> Purchase & Payment</Space></Title>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="Total Purchases">
                    <Text strong style={{ color: '#1890ff' }}>Rs. {parseFloat(supplier.totalPurchases || '0').toLocaleString()}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Purchase Count">
                    <Badge
                      count={supplier.purchaseCount || 0}
                      showZero
                      style={{ backgroundColor: (supplier.purchaseCount || 0) > 0 ? '#1890ff' : '#d9d9d9' }}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="Last Purchase">
                    {supplier.lastPurchaseDate
                      ? dayjs(supplier.lastPurchaseDate).format('DD MMM YYYY HH:mm')
                      : 'Never'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Payment Terms">
                    <Tag color="processing">{getPaymentTermsLabel(supplier.paymentTerms)}</Tag>
                  </Descriptions.Item>
                </Descriptions>
              </section>

              <section>
                <Title level={5}><Space><WalletOutlined /> Financial Summary</Space></Title>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="Credit Limit">
                    Rs. {parseFloat(supplier.creditLimit || '0').toLocaleString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="Outstanding">
                    <Text type={parseFloat(supplier.outstandingBalance || '0') > 0 ? 'danger' : 'success'} strong>
                      Rs. {parseFloat(supplier.outstandingBalance || '0').toLocaleString()}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </section>

              {supplier.notes && (
                <section>
                  <Title level={5}><Space><InfoCircleOutlined /> Notes</Space></Title>
                  <div style={{ padding: '12px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '4px' }}>
                    {supplier.notes}
                  </div>
                </section>
              )}
            </Space>
          </Col>
        </Row>
      </div>
    </Modal>
  );
};

export default SupplierDetailsModal;
