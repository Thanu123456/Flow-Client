import React from 'react';
import { Modal, Descriptions, Tag, Avatar, Space, Typography, Divider } from 'antd';
import { ShopOutlined } from '@ant-design/icons';
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
      title="Supplier Details"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Avatar
          size={80}
          src={supplier.imageUrl}
          icon={<ShopOutlined />}
        />
        <Title level={4} style={{ marginTop: 12, marginBottom: 4 }}>
          {supplier.displayName}
        </Title>
        {supplier.companyName && (
          <Text type="secondary">{supplier.companyName}</Text>
        )}
        <div style={{ marginTop: 8 }}>
          <Tag color={supplier.isActive ? 'green' : 'red'}>
            {supplier.isActive ? 'Active' : 'Inactive'}
          </Tag>
        </div>
      </div>

      <Divider orientation="left">Contact Information</Divider>
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="Full Name">{supplier.fullName}</Descriptions.Item>
        <Descriptions.Item label="Phone">{supplier.phone}</Descriptions.Item>
        <Descriptions.Item label="Email">{supplier.email || '-'}</Descriptions.Item>
        <Descriptions.Item label="Tax Number">{supplier.taxNumber || '-'}</Descriptions.Item>
        <Descriptions.Item label="City">{supplier.city || '-'}</Descriptions.Item>
        <Descriptions.Item label="Address">{supplier.address || '-'}</Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">Purchase History</Divider>
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="Total Purchases">
          Rs. {parseFloat(supplier.totalPurchases || '0').toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="Purchase Count">
          {supplier.purchaseCount || 0}
        </Descriptions.Item>
        <Descriptions.Item label="Last Purchase">
          {supplier.lastPurchaseDate
            ? dayjs(supplier.lastPurchaseDate).format('YYYY-MM-DD HH:mm')
            : 'Never'}
        </Descriptions.Item>
        <Descriptions.Item label="Payment Terms">
          <Tag color="blue">{getPaymentTermsLabel(supplier.paymentTerms)}</Tag>
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">Financial Information</Divider>
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="Credit Limit">
          Rs. {parseFloat(supplier.creditLimit || '0').toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="Outstanding Balance">
          <Text type={parseFloat(supplier.outstandingBalance || '0') > 0 ? 'danger' : undefined}>
            Rs. {parseFloat(supplier.outstandingBalance || '0').toLocaleString()}
          </Text>
        </Descriptions.Item>
      </Descriptions>

      {supplier.notes && (
        <>
          <Divider orientation="left">Notes</Divider>
          <Text>{supplier.notes}</Text>
        </>
      )}

      <Divider orientation="left">System Information</Divider>
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="Created">
          {dayjs(supplier.createdAt).format('YYYY-MM-DD HH:mm')}
        </Descriptions.Item>
        <Descriptions.Item label="Last Updated">
          {dayjs(supplier.updatedAt).format('YYYY-MM-DD HH:mm')}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default SupplierDetailsModal;
