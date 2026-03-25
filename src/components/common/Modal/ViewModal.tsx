
import { Modal, Typography, Space } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";

const { Title, Text } = Typography;

export interface ViewModalProps<T = any> {
  visible: boolean;
  title?: string;
  data: T | null;
  width?: number;
  onCancel: () => void;
  children: ReactNode | ((data: T | null) => ReactNode);
  icon?: ReactNode;
  subtitle?: ReactNode;
}

const ViewModal = <T,>({
  visible,
  title = "View Details",
  data,
  width = 600,
  onCancel,
  children,
  icon,
  subtitle,
}: ViewModalProps<T>) => {
  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={width}
      title={
        <div style={{
          background: 'linear-gradient(90deg, #f0f5ff 0%, #ffffff 100%)',
          padding: '16px 24px',
          margin: '-20px -24px 0 -24px',
          borderBottom: '1px solid #f0f0f0',
          borderRadius: '8px 8px 0 0',
        }}>
          <Space align="start">
            <div style={{
              background: '#e6f7ff',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1890ff'
            }}>
              {icon || <InfoCircleOutlined style={{ fontSize: '20px' }} />}
            </div>
            <Space direction="vertical" size={0}>
              <Title level={4} style={{ margin: 0 }}>{title}</Title>
              {subtitle && <Text type="secondary" style={{ fontSize: '13px' }}>{subtitle}</Text>}
            </Space>
          </Space>
        </div>
      }
    >
      <div style={{ padding: '16px 0' }}>
        {typeof children === "function" ? children(data) : children}
      </div>
    </Modal>
  );
};

export default ViewModal;
