import React from 'react';
import { Button, Row, Col } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

interface VirtualKeypadProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  disabled?: boolean;
}

const VirtualKeypad: React.FC<VirtualKeypadProps> = ({ 
  onKeyPress, 
  onBackspace, 
  onClear,
  disabled 
}) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'];

  const handleClick = (key: string) => {
    if (disabled) return;
    if (key === 'DEL') {
      onBackspace();
    } else if (key === 'C') {
      onClear();
    } else {
      onKeyPress(key);
    }
  };

  return (
    <div style={{ maxWidth: 300, margin: '0 auto' }}>
      <Row gutter={[8, 8]}>
        {keys.map((key) => (
          <Col span={8} key={key}>
            <Button
              size="large"
              block
              style={{ height: 60, fontSize: '1.5rem', fontWeight: 500 }}
              onClick={() => handleClick(key)}
              disabled={disabled}
              type={key === 'DEL' || key === 'C' ? 'default' : 'primary'}
              ghost={!(key === 'DEL' || key === 'C')}
              icon={key === 'DEL' ? <DeleteOutlined /> : null}
              danger={key === 'DEL' || key === 'C'}
            >
              {key === 'DEL' ? '' : key}
            </Button>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default VirtualKeypad;
