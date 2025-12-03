// src/components/Brands/AddBrandModal.tsx (Refactored)
import React, { useState } from "react";
import { Form, Input, Switch, Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type { BrandFormData } from "../../types/entities/brand.types";
import { brandService } from "../../services/management/brandService";
import AddModal from "../common/Modal/AddModal.tsx";
import type { FormInstance } from "antd";

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
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

  const handleSubmit = async (values: any) => {
    const brandData: BrandFormData = {
      name: values.name,
      description: values.description,
      status: values.status ? "active" : "inactive",
      imageUrl: imageFile ? await fileToBase64(imageFile) : undefined,
    };

    await brandService.createBrand(brandData);

    // Reset image state
    setImageFile(null);
    setImagePreview(null);
  };

  const handleCancel = () => {
    setImageFile(null);
    setImagePreview(null);
    onCancel();
  };

  return (
    <AddModal
      visible={visible}
      title="Add Brand"
      onCancel={handleCancel}
      onSuccess={onSuccess}
      onSubmit={handleSubmit}
      initialValues={{ status: true }}
      submitButtonText="Add Brand"
    >
      {(form: FormInstance) => (
        <>
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
            <Switch />
          </Form.Item>
        </>
      )}
    </AddModal>
  );
};

export default AddBrandModal;
