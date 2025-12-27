import React from 'react';
import { Button, Row, Col, theme } from 'antd';
import { DeleteOutlined, CloseOutlined } from '@ant-design/icons';

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
  const { token } = theme.useToken();
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
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '0 20px' }}>
      <Row gutter={[16, 16]}>
        {keys.map((key) => {
          const isAction = key === 'DEL' || key === 'C';
          return (
            <Col span={8} key={key}>
              <Button
                size="large"
                block
                style={{ 
                  height: 80, 
                  fontSize: '2rem', 
                  fontWeight: 600,
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                  background: isAction ? '#fff' : token.colorPrimary,
                  color: isAction ? (key === 'C' ? '#fa8c16' : '#ff4d4f') : '#fff',
                  border: isAction ? `2px solid ${key === 'C' ? '#ffd591' : '#ffccc7'}` : 'none',
                  transition: 'transform 0.1s, box-shadow 0.1s',
                }}
                className="kiosk-keypad-btn"
                onClick={() => handleClick(key)}
                disabled={disabled}
                icon={key === 'DEL' ? <DeleteOutlined style={{ fontSize: '1.8rem' }} /> : 
                     key === 'C' ? <CloseOutlined style={{ fontSize: '1.8rem' }} /> : null}
              >
                {isAction ? '' : key}
              </Button>
            </Col>
          );
        })}
      </Row>
      <style>{`
        .kiosk-keypad-btn:active {
          transform: scale(0.95);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};

export default VirtualKeypad;
