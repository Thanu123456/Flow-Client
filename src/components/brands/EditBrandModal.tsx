// src/components/Brands/EditBrandModal.tsx (Refactored)
import React, { useState, useEffect } from "react";
import { Form, Input, Switch, Upload, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type { Brand, BrandFormData } from "../../types/entities/brand.types";
import { useBrandStore } from "../../store/management/brandStore";
import EditModal from "../common/Modal/EditModal.tsx";
import type { FormInstance } from "antd";

const { TextArea } = Input;
const { Dragger } = Upload;

interface EditBrandModalProps {
  visible: boolean;
  brand: Brand | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditBrandModal: React.FC<EditBrandModalProps> = ({
  visible,
  brand,
  onCancel,
  onSuccess,
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { updateBrand, error, clearError } = useBrandStore();

  useEffect(() => {
    if (visible && brand) {
      setImagePreview(brand.imageUrl || null);
      setImageFile(null);
      clearError();
    }
  }, [visible, brand, clearError]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const handleImageChange = (info: any) => {
    const file = info.fileList[0]?.originFileObj;
    if (!file) {
      setImageFile(null);
      setImagePreview(brand?.imageUrl || null);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      message.error("Image size must be less than 2MB");
      return;
    }
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      message.error("Only JPG and PNG files are allowed");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (values: any, originalData: Brand) => {
    const brandData: Partial<BrandFormData> = {
      name: values.name,
      status: values.status ? "active" : "inactive",
      description: values.description,
      imageUrl: imageFile
        ? await fileToBase64(imageFile)
        : imagePreview ?? undefined,
    };

    await updateBrand(originalData.id, brandData);
  };

  const mapDataToForm = (brand: Brand) => ({
    name: brand.name,
    description: brand.description,
    status: brand.status === "active",
  });

  return (
    <EditModal<Brand>
      visible={visible}
      title="Edit Brand"
      data={brand}
      onCancel={onCancel}
      onSuccess={onSuccess}
      onSubmit={handleSubmit}
      mapDataToForm={mapDataToForm}
      submitButtonText="Update Brand"
    >
      {(form: FormInstance, data: Brand | null) => (
        <>
          <Form.Item label="Brand Image" name="image">
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
                    Click or drag file to upload
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
                message: "Brand Name must be between 1 and 255 characters",
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
            <TextArea rows={4} placeholder="Enter brand description" />
          </Form.Item>

          <Form.Item label="Status" name="status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </>
      )}
    </EditModal>
  );
};

export default EditBrandModal;
