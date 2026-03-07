import React from 'react';
import { Modal, Descriptions, Avatar, Space, Typography, Divider, Badge } from 'antd';
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

  const getTypeStyle = (type: CustomerType): string => {
    const styleMap: Record<CustomerType, string> = {
      walk_in: 'border-slate-400 text-slate-500 bg-slate-50/70',
      regular: 'border-blue-500 text-blue-500 bg-blue-50/70',
      wholesale: 'border-purple-500 text-purple-500 bg-purple-50/70',
      vip: 'border-amber-500 text-amber-600 bg-amber-50/70',
    };
    return styleMap[type] || 'border-slate-400 text-slate-500 bg-slate-50/70';
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
          <span className={`px-3 py-1 rounded-lg text-sm border ${getTypeStyle(customer.customerType)}`}>
            {getTypeLabel(customer.customerType)}
          </span>
          <span
            className={`px-3 py-1 rounded-lg text-sm border ${customer.isActive
              ? "border-green-500 text-green-500 bg-green-50/70"
              : "border-red-500 text-red-500 bg-red-50/70"
              }`}
          >
            {customer.isActive ? 'Active' : 'Inactive'}
          </span>
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
          <Badge
            count={customer.purchaseCount || 0}
            showZero
            style={{ backgroundColor: (customer.purchaseCount || 0) > 0 ? '#1890ff' : '#d9d9d9' }}
          />
        </Descriptions.Item>
        <Descriptions.Item label="Last Purchase">
          {customer.lastPurchaseDate
            ? dayjs(customer.lastPurchaseDate).format('YYYY-MM-DD HH:mm')
            : 'Never'}
        </Descriptions.Item>
        <Descriptions.Item label="Loyalty Points">
          <Badge
            count={customer.loyaltyPoints || 0}
            showZero
            overflowCount={99999}
            style={{ backgroundColor: (customer.loyaltyPoints || 0) > 0 ? '#1890ff' : '#d9d9d9' }}
          />
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
