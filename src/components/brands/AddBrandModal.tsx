// src/components/brands/AddBrandModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Switch, Upload, Button, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { BrandFormData } from '../../types/entities/brand.types';
import { useBrandStore } from '../../store/management/brandStore';

const { TextArea } = Input;
const { Dragger } = Upload;


interface AddBrandModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const AddBrandModal: React.FC<AddBrandModalProps> = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { createBrand, error, clearError } = useBrandStore();

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setImageFile(null);
      setImagePreview(null);
      clearError();
    }
  }, [visible, form, clearError]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleImageChange = (info: any) => {
    const { fileList } = info;
    
    if (fileList.length > 0) {
      const file = fileList[0].originFileObj;
      
      // Check file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        message.error('Image size must be less than 2MB');
        return;
      }
      
      // Check file type
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('Only JPG and PNG files are allowed');
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const brandData: BrandFormData = {
        name: values.name,
        status: values.status ? 'active' : 'inactive',
        description: values.description,
        imageUrl: imagePreview ?? undefined,
      };
      
      await createBrand(brandData);
      message.success('Brand created successfully');
      onSuccess();
      onCancel();
    } catch (error) {
      console.error('Error creating brand:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add Brand"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          Add Brand
        </Button>,
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: true,
        }}
      >
        <Form.Item
          label="Brand Image"
          name="image"
        >
          <Dragger
            name="image"
            multiple={false}
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleImageChange}
            accept=".jpg,.jpeg,.png"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Brand" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }} />
            ) : (
              <div>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">JPEG, PNG up to 2 MB</p>
              </div>
            )}
          </Dragger>
        </Form.Item>
        
        <Form.Item
          label="Brand Name"
          name="name"
          rules={[
            { required: true, message: 'Please enter brand name' },
            { min: 1, max: 255, message: 'Brand name must be between 1 and 255 characters' },
          ]}
        >
          <Input placeholder="Enter brand name" />
        </Form.Item>
        
        <Form.Item
          label="Description"
          name="description"
          rules={[
            { max: 500, message: 'Description must be less than 500 characters' },
          ]}
        >
          <TextArea rows={4} placeholder="Enter brand description" />
        </Form.Item>
        
        <Form.Item
          label="Status"
          name="status"
          valuePropName="checked"
        >
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddBrandModal;