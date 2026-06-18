import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  Divider,
  Row,
  Col,
  Typography,
  App,
  Alert,
  Upload,
  Avatar,
} from 'antd';
import { UserOutlined, CameraOutlined } from '@ant-design/icons';
import type { UploadChangeParam, UploadFile } from 'antd/es/upload';
import { useUserStore } from '../../store/management/userStore';
import { useRoleStore } from '../../store/management/roleStore';
import { useWarehouseStore } from '../../store/management/warehouseStore';
import type { User, UserFormData } from '../../types/entities/user.types';

const { Text } = Typography;
const { Option } = Select;

interface EditUserModalProps {
  visible: boolean;
  user: User | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  visible,
  user,
  onCancel,
  onSuccess,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm<UserFormData>();
  const [submitting, setSubmitting] = useState(false);
  const [kioskEnabled, setKioskEnabled] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  const { updateUser } = useUserStore();
  const { allRoles, getAllRoles } = useRoleStore();
  const { warehouses, getWarehouses } = useWarehouseStore();

  const isOwner = user?.userType === 'owner';

  useEffect(() => {
    if (visible) {
      getAllRoles();
      getWarehouses({ page: 1, limit: 100 });
    }
  }, [visible, getAllRoles, getWarehouses]);

  useEffect(() => {
    if (visible && user) {
      setKioskEnabled(user.kioskEnabled);
      setAvatarUrl(user.profileImageUrl || undefined);
      form.setFieldsValue({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || '',
        profileImageUrl: user.profileImageUrl,
        roleId: user.roleId || '',
        warehouseId: user.warehouseId,
        kioskEnabled: user.kioskEnabled,
        userId: user.userId,
        maxDiscountPercent: user.maxDiscountPercent,
        status: (user.status === 'active') as any,
      });
    }
  }, [visible, user, form]);

  const handleAvatarChange = (info: UploadChangeParam<UploadFile>) => {
    const file = info.file.originFileObj as File;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setAvatarUrl(dataUrl);
      form.setFieldValue('profileImageUrl', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const userValues = {
        ...values,
        status: values.status ? 'active' : 'inactive',
      } as Partial<UserFormData>;

      await updateUser(user.id, userValues);
      message.success('User updated successfully');
      onSuccess();
    } catch (error: any) {
      if (error.errorFields) return;
      message.error(error.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKioskChange = (checked: boolean) => {
    setKioskEnabled(checked);
    form.setFieldValue('kioskEnabled', checked);
  };

  return (
    <Modal
      title="Edit User"
      open={visible}
      onCancel={onCancel}
      onOk={isOwner ? onCancel : handleSubmit}
      okText={isOwner ? 'Close' : 'Save'}
      cancelButtonProps={isOwner ? { style: { display: 'none' } } : undefined}
      confirmLoading={submitting}
      width={700}
      destroyOnHidden
    >
      {isOwner && (
        <Alert
          message="Owner Account"
          description="Owner account details are managed by the system and cannot be edited here."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form form={form} layout="vertical">
        <Divider orientation="left">Personal Information</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[
                { required: true, message: 'Please enter full name' },
                { min: 2, message: 'Name must be at least 2 characters' },
              ]}
            >
              <Input placeholder="Enter full name" disabled={isOwner} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input placeholder="Enter email address" disabled={isOwner} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[{ required: true, message: 'Please enter phone number' }]}
            >
              <Input placeholder="Enter phone number" disabled={isOwner} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="profileImageUrl" label="Profile Image">
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleAvatarChange}
                disabled={isOwner}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    cursor: isOwner ? 'not-allowed' : 'pointer',
                    opacity: isOwner ? 0.6 : 1,
                  }}
                >
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <Avatar
                      size={64}
                      src={avatarUrl}
                      icon={!avatarUrl && <UserOutlined />}
                      style={{ background: '#f0f0f0' }}
                    />
                    {!isOwner && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          background: '#1890ff',
                          borderRadius: '50%',
                          width: 20,
                          height: 20,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CameraOutlined style={{ color: '#fff', fontSize: 10 }} />
                      </div>
                    )}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {avatarUrl ? 'Click to change photo' : 'Click to upload photo'}
                  </Text>
                </div>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Role & Access</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="roleId"
              label="Role"
              rules={[{ required: !isOwner, message: 'Please select a role' }]}
            >
              <Select
                placeholder={isOwner ? 'Owner (full access)' : 'Select role'}
                allowClear={isOwner}
                disabled={isOwner}
              >
                {allRoles
                  .filter((role) => role.isActive)
                  .map((role) => (
                    <Option key={role.id} value={role.id}>
                      {role.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="warehouseId" label="Default Warehouse">
              <Select placeholder="Select warehouse (optional)" allowClear disabled={isOwner}>
                {warehouses
                  .filter((w) => w.status === 'active')
                  .map((warehouse) => (
                    <Option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="status" label="Status" valuePropName="checked">
              <Switch disabled={isOwner} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="maxDiscountPercent" label="Max Discount %">
              <InputNumber
                min={0}
                max={100}
                placeholder="0-100"
                style={{ width: '100%' }}
                disabled={isOwner}
              />
            </Form.Item>
          </Col>
        </Row>

        {!isOwner && (
          <>
            <Divider orientation="left">Kiosk Access</Divider>
            <Form.Item name="kioskEnabled" valuePropName="checked">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Switch checked={kioskEnabled} onChange={handleKioskChange} />
                <Text>Enable Kiosk Login (User ID + PIN)</Text>
              </div>
            </Form.Item>

            {kioskEnabled && (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="userId"
                    label="User ID (for Kiosk)"
                    rules={[
                      { required: kioskEnabled, message: 'Please enter user ID for kiosk' },
                      { pattern: /^[A-Za-z0-9]+$/, message: 'User ID must be alphanumeric' },
                    ]}
                  >
                    <Input placeholder="e.g., EMP001" />
                  </Form.Item>
                </Col>
              </Row>
            )}

            <Text type="secondary">
              Note: To change password or PIN, use the dedicated reset options from the user
              actions menu.
            </Text>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default EditUserModal;
