import React from 'react';
import { Progress, Space, Typography } from 'antd';

const { Text } = Typography;

interface PasswordStrengthMeterProps {
  password?: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password = '' }) => {
  const calculateStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length > 7) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const strength = calculateStrength(password);
  
  const getStatus = () => {
    if (strength < 2) return { percent: 30, color: '#ff4d4f', text: 'Weak' };
    if (strength < 4) return { percent: 60, color: '#faad14', text: 'Medium' };
    return { percent: 100, color: '#52c41a', text: 'Strong' };
  };

  const status = getStatus();

  return (
    <div style={{ marginTop: 8 }}>
      <Progress 
        percent={status.percent} 
        strokeColor={status.color} 
        showInfo={false} 
        size="small" 
      />
      <Space style={{ marginTop: 4 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>Strength:</Text>
        <Text style={{ color: status.color, fontSize: 12, fontWeight: 500 }}>
          {status.text}
        </Text>
      </Space>
    </div>
  );
};

export default PasswordStrengthMeter;
