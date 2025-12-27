import React, { useState } from 'react';
import { Card, Form, Input, Button, Switch, Typography, Row, Col, message, Select, InputNumber } from 'antd';
import { SaveOutlined, GlobalOutlined, SecurityScanOutlined, MailOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const SystemSettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async () => {
    setLoading(true);
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('System settings updated successfully');
    } catch (error) {
      message.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>System Settings</Title>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          site_name: 'Flow POS System',
          maintenance_mode: false,
          allow_registration: true,
          email_verification: true,
          session_timeout: 60,
          max_login_attempts: 5,
          smtp_host: 'smtp.flowpos.com',
          smtp_port: 587,
        }}
      >
        <Card title={<span><GlobalOutlined /> General Settings</span>} style={{ marginBottom: 24 }}>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="site_name" label="System Name">
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="maintenance_mode" label="Maintenance Mode" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="allow_registration" label="Allow Tenant Registration" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title={<span><SecurityScanOutlined /> Security Settings</span>} style={{ marginBottom: 24 }}>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item name="email_verification" label="Force Email Verification" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="session_timeout" label="Session Timeout (minutes)">
                <InputNumber min={5} max={1440} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="max_login_attempts" label="Max Login Attempts">
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title={<span><MailOutlined /> SMTP Configuration</span>} style={{ marginBottom: 24 }}>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="smtp_host" label="SMTP Host">
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="smtp_port" label="SMTP Port">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="smtp_encryption" label="Encryption">
                <Select defaultValue="tls">
                  <Option value="tls">TLS</Option>
                  <Option value="ssl">SSL</Option>
                  <Option value="none">None</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="smtp_user" label="SMTP Username">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="smtp_pass" label="SMTP Password">
                <Input.Password />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <div style={{ textAlign: 'right' }}>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} size="large">
            Save All Settings
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default SystemSettings;
