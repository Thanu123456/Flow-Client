import React from 'react';
import { Modal, Descriptions, Tag, Avatar, Space, Typography, Divider } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { Customer, CustomerType } from '../../types/entities/customer.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface CustomerProfileModalProps {
  visible: boolean;
  customer: Customer | null;
  onClose: () => void;
}

const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  visible,
  customer,
  onClose,
}) => {
  if (!customer) return null;

  const getTypeColor = (type: CustomerType): string => {
    const colorMap: Record<CustomerType, string> = {
      walk_in: 'default',
      regular: 'blue',
      wholesale: 'purple',
      vip: 'gold',
    };
    return colorMap[type] || 'default';
  };

  const getTypeLabel = (type: CustomerType): string => {
    const labelMap: Record<CustomerType, string> = {
      walk_in: 'Walk-in',
      regular: 'Regular',
      wholesale: 'Wholesale',
      vip: 'VIP',
    };
    return labelMap[type] || type;
  };

  return (
    <Modal
      title="Customer Profile"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Avatar
          size={80}
          src={customer.imageUrl}
          icon={<UserOutlined />}
        />
        <Title level={4} style={{ marginTop: 12, marginBottom: 4 }}>
          {customer.fullName}
        </Title>
        <Space>
          <Tag color={getTypeColor(customer.customerType)}>
            {getTypeLabel(customer.customerType)}
          </Tag>
          <Tag color={customer.isActive ? 'green' : 'red'}>
            {customer.isActive ? 'Active' : 'Inactive'}
          </Tag>
        </Space>
      </div>

      <Divider orientation="left">Contact Information</Divider>
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="Phone">{customer.phone}</Descriptions.Item>
        <Descriptions.Item label="Email">{customer.email || '-'}</Descriptions.Item>
        <Descriptions.Item label="City">{customer.city || '-'}</Descriptions.Item>
        <Descriptions.Item label="Address">{customer.address || '-'}</Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">Purchase History</Divider>
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="Total Purchases">
          Rs. {parseFloat(customer.totalPurchases || '0').toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="Purchase Count">
          {customer.purchaseCount || 0}
        </Descriptions.Item>
        <Descriptions.Item label="Last Purchase">
          {customer.lastPurchaseDate
            ? dayjs(customer.lastPurchaseDate).format('YYYY-MM-DD HH:mm')
            : 'Never'}
        </Descriptions.Item>
        <Descriptions.Item label="Loyalty Points">
          {customer.loyaltyPoints?.toLocaleString() || 0}
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">Financial Information</Divider>
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="Credit Limit">
          Rs. {parseFloat(customer.creditLimit || '0').toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="Outstanding Balance">
          <Text type={parseFloat(customer.outstandingBalance || '0') > 0 ? 'danger' : undefined}>
            Rs. {parseFloat(customer.outstandingBalance || '0').toLocaleString()}
          </Text>
        </Descriptions.Item>
      </Descriptions>

      {customer.notes && (
        <>
          <Divider orientation="left">Notes</Divider>
          <Text>{customer.notes}</Text>
        </>
      )}

      <Divider orientation="left">System Information</Divider>
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="Created">
          {dayjs(customer.createdAt).format('YYYY-MM-DD HH:mm')}
        </Descriptions.Item>
        <Descriptions.Item label="Last Updated">
          {dayjs(customer.updatedAt).format('YYYY-MM-DD HH:mm')}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default CustomerProfileModal;
