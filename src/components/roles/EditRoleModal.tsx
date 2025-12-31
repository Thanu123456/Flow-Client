import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Switch, Spin, message, Alert } from 'antd';
import { useRoleStore } from '../../store/management/roleStore';
import PermissionTree from './PermissionTree';
import type { Role, RoleFormData } from '../../types/entities/role.types';

const { TextArea } = Input;

interface EditRoleModalProps {
  visible: boolean;
  role: Role | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditRoleModal: React.FC<EditRoleModalProps> = ({
  visible,
  role,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { updateRole, getPermissionsByModule, permissionModules } = useRoleStore();
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  useEffect(() => {
    if (visible && role) {
      setLoadingPermissions(true);
      getPermissionsByModule().finally(() => setLoadingPermissions(false));

      form.setFieldsValue({
        name: role.name,
        description: role.description || '',
        isActive: role.isActive,
      });
      setSelectedPermissionIds(role.permissions.map(p => p.id));
    }
  }, [visible, role, getPermissionsByModule, form]);

  const handleSubmit = async () => {
    if (!role) return;

    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const roleData: Partial<RoleFormData> = {
        name: values.name,
        description: values.description || undefined,
        isActive: values.isActive,
        permissionIds: selectedPermissionIds,
      };

      await updateRole(role.id, roleData);
      onSuccess();
    } catch (error: any) {
      if (!error.errorFields) {
        message.error(error.response?.data?.message || 'Failed to update role');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedPermissionIds([]);
    onCancel();
  };

  return (
    <Modal
      title="Edit Role"
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="Save"
      cancelText="Cancel"
      confirmLoading={submitting}
      width={700}
    >
      {role?.isSystem && (
        <Alert
          message="System Role"
          description="This is a system role. You can only modify its status, not the name or permissions."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="name"
          label="Role Name"
          rules={[
            { required: true, message: 'Please enter role name' },
            { min: 3, max: 50, message: 'Name must be 3-50 characters' },
          ]}
        >
          <Input
            placeholder="Enter role name"
            maxLength={50}
            disabled={role?.isSystem}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ max: 500, message: 'Description must be less than 500 characters' }]}
        >
          <TextArea
            placeholder="Enter role description (optional)"
            rows={3}
            maxLength={500}
            showCount
            disabled={role?.isSystem}
          />
        </Form.Item>

        <Form.Item
          name="isActive"
          label="Status"
          valuePropName="checked"
        >
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>

        <Form.Item label="Permissions">
          {loadingPermissions ? (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <Spin />
            </div>
          ) : (
            <PermissionTree
              permissionModules={permissionModules}
              selectedPermissionIds={selectedPermissionIds}
              onChange={setSelectedPermissionIds}
              disabled={role?.isSystem}
            />
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditRoleModal;
