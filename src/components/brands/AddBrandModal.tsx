import React, { useState, useEffect } from "react";
import { App, Modal, Form, Input, Switch, Upload, Button } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type { BrandFormData } from "../../types/entities/brand.types";
import { brandService } from "../../services/management/brandService";

const { TextArea } = Input;
const { Dragger } = Upload;

interface AddBrandModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const AddBrandModal: React.FC<AddBrandModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      form.resetFields();
      setImageFile(null);
      setImagePreview(null);
    }
  }, [visible, form]);

  // Convert Image file to base64
  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageChange = (info: any) => {
    const { fileList } = info;

    if (fileList.length > 0) {
      const file = fileList[0].originFileObj;

      // Validate file
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        message.error("Only JPG/PNG files are allowed");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        message.error("Image size must be less than 2MB");
        return;
      }

      setImageFile(file);

      // Preview
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const brandData: BrandFormData = {
        name: values.name,
        description: values.description,
        status: values.status ? "active" : "inactive",
        imageUrl: imageFile ? await fileToBase64(imageFile) : undefined,
      };
      await brandService.createBrand(brandData);
      message.success("Brand added successfully");

      console.log("add brand >>>", brandData);
      onSuccess();
      onCancel();
    } catch (err: any) {
      console.error(err);
      message.error(err?.response?.data?.message || "Failed to add Brand");
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
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
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
          valuePropName="fileList"
          getValueFromEvent={(e) => e && e.fileList}
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
              <img
                src={imagePreview}
                alt="Brand"
                style={{
                  width: "100%",
                  maxHeight: "200px",
                  objectFit: "contain",
                }}
              />
            ) : (
              <div>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
                <p className="ant-upload-hint">JPEG, PNG up to 2 MB</p>
              </div>
            )}
          </Dragger>
        </Form.Item>

        <Form.Item
          label="Brand Name"
          name="name"
          rules={[
            { required: true, message: "Please enter Brand Name" },
            {
              min: 1,
              max: 255,
              message: "Brand name must be between 1 and 255 characters",
            },
          ]}
        >
          <Input placeholder="Enter Brand Name" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            {
              max: 500,
              message: "Description must be less than 500 characters",
            },
          ]}
        >
          <TextArea rows={4} placeholder="Enter Brand Description" />
        </Form.Item>

        <Form.Item label="Status" name="status" valuePropName="checked">
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddBrandModal;
