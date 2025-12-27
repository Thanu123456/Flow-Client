import React from 'react';
import { Modal, Descriptions, Tag, Divider } from 'antd';
import type { Registration } from '../../../types/auth/superadmin.types';
import dayjs from 'dayjs';

interface Props {
  visible: boolean;
  registration: Registration | null;
  onClose: () => void;
}

const RegistrationDetailsModal: React.FC<Props> = ({ visible, registration, onClose }) => {
  if (!registration) return null;

  return (
    <Modal
      title="Registration Details"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Descriptions title="Business Information" bordered column={2}>
        <Descriptions.Item label="Shop Name" span={2}>{registration.shop_name}</Descriptions.Item>
        <Descriptions.Item label="Business Type">{registration.business_type}</Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color="orange">{registration.status.toUpperCase()}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Registration No.">{registration.details?.business_registration_number || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Tax/VAT No.">{registration.details?.tax_vat_number || 'N/A'}</Descriptions.Item>
      </Descriptions>

      <Divider />

      <Descriptions title="Owner Information" bordered column={2}>
        <Descriptions.Item label="Full Name">{registration.owner_name}</Descriptions.Item>
        <Descriptions.Item label="Email">{registration.email}</Descriptions.Item>
        <Descriptions.Item label="Phone">{registration.phone}</Descriptions.Item>
        <Descriptions.Item label="Applied At">{dayjs(registration.created_at).format('MMMM D, YYYY HH:mm')}</Descriptions.Item>
      </Descriptions>

      <Divider />

      <Descriptions title="Address Information" bordered column={1}>
        <Descriptions.Item label="Address">
          {registration.details?.address_line1}
          {registration.details?.address_line2 && <><br />{registration.details.address_line2}</>}
        </Descriptions.Item>
        <Descriptions.Item label="Location">
          {registration.details?.city}, {registration.details?.postal_code || ''}
        </Descriptions.Item>
        <Descriptions.Item label="Country">{registration.details?.country}</Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default RegistrationDetailsModal;
