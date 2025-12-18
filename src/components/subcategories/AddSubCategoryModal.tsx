import React, { useState, useEffect } from "react";
import { Form, Input, Switch, Upload, Select, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type { SubCategoryFormData } from "../../types/entities/subCategory.types";
import { subCategoryService } from "../../services/management/subCategoryService";
import { useSubCategoryStore } from "../../store/management/subCategoryStore";
import { useCategoryStore } from "../../store/management/categoryStore";
import { AddModal } from "../common/Modal";
import type { FormInstance } from "antd";

const { Dragger } = Upload;
const { Option } = Select;

interface AddSubCategoryModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  preSelectedCategoryId?: string;
}

const AddSubCategoryModal: React.FC<AddSubCategoryModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  preSelectedCategoryId,
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categoryCode, setCategoryCode] = useState<string>("");
  const { getCategoryCode } = useSubCategoryStore();
  const { categories, getCategories } = useCategoryStore();

  useEffect(() => {
    if (visible) {
      // Load categories for dropdown
      getCategories({ page: 1, limit: 1000, status: "active" });

      // Reset state
      setImageFile(null);
      setImagePreview(null);
      setCategoryCode("");
    }
  }, [visible, getCategories]);

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

      if (!["image/jpeg", "image/png"].includes(file.type)) {
        message.error("Only JPG/PNG files are allowed");
        return;
      }
      if (file.size > 1024 * 1024) {
        message.error("Image size must be less than 1MB");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleCategoryChange = async (
    categoryId: string,
    form: FormInstance
  ) => {
    try {
      const code = await getCategoryCode(categoryId);
      setCategoryCode(code);
      form.setFieldsValue({ categoryCode: code });
    } catch (error) {
      console.error("Failed to get category code:", error);
    }
  };

  const handleSubmit = async (values: any) => {
    const subCategoryData: SubCategoryFormData = {
      name: values.name,
      categoryId: values.categoryId,
      status: values.status ? "active" : "inactive",
      imageUrl: imageFile ? await fileToBase64(imageFile) : undefined,
    };

    await subCategoryService.createSubCategory(subCategoryData);
  };

  const handleCancel = () => {
    setImageFile(null);
    setImagePreview(null);
    setCategoryCode("");
    onCancel();
  };

  return (
    <AddModal
      visible={visible}
      title="Add Sub-Category"
      onCancel={handleCancel}
      onSuccess={onSuccess}
      onSubmit={handleSubmit}
      initialValues={{
        status: true,
        categoryId: preSelectedCategoryId,
      }}
      submitButtonText="Add Sub-Category"
      width={600}
    >
      {(form: FormInstance) => {
        useEffect(() => {
          if (preSelectedCategoryId && visible) {
            handleCategoryChange(preSelectedCategoryId, form);
          }
        }, [preSelectedCategoryId, visible]);

        return (
          <>
            <Form.Item
              label="Sub-Category Image"
              name="image"
              valuePropName="fileList"
              getValueFromEvent={(e) => e && e.fileList}
              tooltip="Optional, JPG/PNG, max 2 MB"
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
                    alt="Sub-Category"
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
                      Click or Drag File to Upload
                    </p>
                    <p className="ant-upload-hint">JPG, PNG up to 2 MB</p>
                  </div>
                )}
              </Dragger>
            </Form.Item>

            <Form.Item
              label="Sub-Category Name"
              name="name"
              rules={[
                { required: true, message: "Please Enter Sub-Category Name" },
                {
                  min: 1,
                  max: 10,
                  message: "Name Must be Between 1 and 10 characters",
                },
              ]}
            >
              <Input placeholder="e.g., Samsung" />
            </Form.Item>

            <Form.Item
              label="Category Name"
              name="categoryId"
              rules={[{ required: true, message: "Please Select a Category" }]}
            >
              <Select
                placeholder="Select Category"
                showSearch
                optionFilterProp="children"
                onChange={(value) => handleCategoryChange(value, form)}
              >
                {categories.map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Category Code" name="categoryCode">
              <Input
                placeholder="Auto-Filled"
                value={categoryCode}
                disabled
                style={{ backgroundColor: "#f5f5f5" }}
              />
            </Form.Item>

            <Form.Item label="Status" name="status" valuePropName="checked">
              <Switch />
            </Form.Item>
          </>
        );
      }}
    </AddModal>
  );
};

export default AddSubCategoryModal;
