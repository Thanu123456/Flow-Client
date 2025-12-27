import React, { useState } from 'react';
import { Modal, Input, Typography, message } from 'antd';

const { Text } = Typography;
const { TextArea } = Input;

interface Props {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
  loading: boolean;
}

const RejectModal: React.FC<Props> = ({ visible, onCancel, onConfirm, loading }) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (reason.length < 10) {
      message.error('Please provide a reason (at least 10 characters)');
      return;
    }
    onConfirm(reason);
    setReason('');
  };

  return (
    <Modal
      title="Reject Registration"
      open={visible}
      onCancel={onCancel}
      onOk={handleConfirm}
      confirmLoading={loading}
      okText="Reject"
      okButtonProps={{ danger: true }}
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          Please provide a reason for rejecting this registration. This reason will be sent to the owner.
        </Text>
      </div>
      <TextArea
        rows={4}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason for rejection (min 10 characters)"
      />
    </Modal>
  );
};

export default RejectModal;
