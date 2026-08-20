import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Switch, Typography, Row, Col, message, Select, InputNumber } from 'antd';
import { SaveOutlined, GlobalOutlined, SecurityScanOutlined, MailOutlined } from '@ant-design/icons';
import HeaderWithSearch from '../../components/common/Layout/HeaderWithSearch';
import { superAdminService } from '../../services/superadmin/superAdminService';
import type { SystemSettings as SystemSettingsData } from '../../types/auth/superadmin.types';

const { Title } = Typography;
const { Option } = Select;

const defaultSettings: SystemSettingsData = {
  site_name: 'Flow POS System',
  maintenance_mode: false,
  allow_registration: true,
  email_verification: true,
  session_timeout: 60,
  max_login_attempts: 5,
  smtp_host: '',
  smtp_port: 587,
  smtp_encryption: 'tls',
  smtp_user: '',
  smtp_pass: '',
};

const SystemSettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    (async () => {
      try {
        const settings = await superAdminService.getSystemSettings();
        form.setFieldsValue(settings);
      } catch (error) {
        message.error('Failed to load system settings');
      } finally {
        setFetching(false);
      }
    })();
  }, [form]);

  const onFinish = async (values: SystemSettingsData) => {
    setLoading(true);
    try {
      const updated = await superAdminService.updateSystemSettings(values);
      form.setFieldsValue(updated);
      message.success('System settings updated successfully');
    } catch (error) {
      message.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <HeaderWithSearch />
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>System Settings</Title>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        disabled={fetching}
        initialValues={defaultSettings}
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
                <Input.Password placeholder="Leave blank to keep the current password" />
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
