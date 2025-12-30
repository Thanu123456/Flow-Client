import React from 'react';
import { Progress, Space, Typography, List } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

interface Requirement {
  label: string;
  met: boolean;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password = '',
  showRequirements = true,
}) => {
  const requirements: Requirement[] = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const metCount = requirements.filter((r) => r.met).length;
  const strength = (metCount / requirements.length) * 100;

  const getStatus = () => {
    if (metCount <= 2) return { color: '#ff4d4f', text: 'Weak', status: 'exception' as const };
    if (metCount <= 4) return { color: '#faad14', text: 'Medium', status: 'normal' as const };
    return { color: '#52c41a', text: 'Strong', status: 'success' as const };
  };

  const status = getStatus();

  if (!password) {
    return null;
  }

  return (
    <div style={{ marginTop: 8 }}>
      <Progress
        percent={strength}
        strokeColor={status.color}
        showInfo={false}
        size="small"
        status={status.status}
      />
      <Space style={{ marginTop: 4, marginBottom: showRequirements ? 8 : 0 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Strength:
        </Text>
        <Text style={{ color: status.color, fontSize: 12, fontWeight: 500 }}>
          {status.text}
        </Text>
      </Space>

      {showRequirements && (
        <List
          size="small"
          dataSource={requirements}
          renderItem={(req) => (
            <List.Item style={{ padding: '4px 0', border: 'none' }}>
              <Space>
                {req.met ? (
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                ) : (
                  <CloseCircleOutlined style={{ color: '#d9d9d9' }} />
                )}
                <Text
                  type={req.met ? undefined : 'secondary'}
                  style={{ fontSize: 12 }}
                >
                  {req.label}
                </Text>
              </Space>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
