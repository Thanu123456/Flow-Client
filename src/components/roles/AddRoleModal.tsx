import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Switch, Spin, App } from 'antd';
import { useRoleStore } from '../../store/management/roleStore';
import PermissionTree from './PermissionTree';
import type { RoleFormData } from '../../types/entities/role.types';

const { TextArea } = Input;

interface AddRoleModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const AddRoleModal: React.FC<AddRoleModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { createRole, getPermissionsByModule, permissionModules } = useRoleStore();
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  useEffect(() => {
    if (visible) {
      setLoadingPermissions(true);
      getPermissionsByModule().finally(() => setLoadingPermissions(false));
      form.resetFields();
      setSelectedPermissionIds([]);
    }
  }, [visible, getPermissionsByModule, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const roleData: RoleFormData = {
        name: values.name,
        description: values.description || undefined,
        isActive: values.isActive ?? true,
        permissionIds: selectedPermissionIds,
      };

      await createRole(roleData);
      onSuccess();
    } catch (error: any) {
      if (!error.errorFields) {
        message.error(error.response?.data?.message || 'Failed to create role');
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
      title="Add New Role"
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="Save"
      cancelText="Cancel"
      confirmLoading={submitting}
      width={700}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ isActive: true }}
      >
        <Form.Item
          name="name"
          label="Role Name"
          rules={[
            { required: true, message: 'Please enter role name' },
            { min: 3, max: 50, message: 'Name must be 3-50 characters' },
          ]}
        >
          <Input placeholder="Enter role name" maxLength={50} />
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
            />
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddRoleModal;
