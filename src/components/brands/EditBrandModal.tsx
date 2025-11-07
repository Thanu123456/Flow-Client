// src/components/brands/EditBrandModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Switch, Upload, Button, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { Brand, BrandFormData } from '../../types/entities/brand.types';
import { useBrandStore } from '../../store/management/brandStore';

const { TextArea } = Input;
const { Dragger } = Upload;

interface EditBrandModalProps {
  visible: boolean;
  brand: Brand | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditBrandModal: React.FC<EditBrandModalProps> = ({ visible, brand, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { updateBrand, error, clearError } = useBrandStore();

  useEffect(() => {
    if (visible && brand) {
      form.setFieldsValue({
        name: brand.name,
        description: brand.description,
        status: brand.status === 'active',
      });
      setImagePreview(brand.imageUrl || null);
      setImageFile(null);
      clearError();
    }
  }, [visible, brand, form, clearError]);

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
    }
  };

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

  const handleSubmit = async () => {
    if (!brand) return;
    
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const brandData: Partial<BrandFormData> = {
        name: values.name,
        status: values.status ? 'active' : 'inactive',
        description: values.description,
      };
      
      if (imageFile) {
        // convert file to a base64 data URL string before assigning
        brandData.imageUrl = await fileToBase64(imageFile);
      }
      
      await updateBrand(brand.id, brandData);
      message.success('Brand updated successfully');
      onSuccess();
      onCancel();
    } catch (error) {
      console.error('Error updating brand:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Edit Brand"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          Update Brand
        </Button>,
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
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

export default EditBrandModal;