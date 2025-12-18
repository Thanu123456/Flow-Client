import React, { useState, useEffect } from "react";
import { Form, Input, Switch, Upload, Select, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type {
  SubCategory,
  SubCategoryFormData,
} from "../../types/entities/subCategory.types";
import { useSubCategoryStore } from "../../store/management/subCategoryStore";
import { useCategoryStore } from "../../store/management/categoryStore";
import { EditModal } from "../Common/Modal";
import type { FormInstance } from "antd";

const { Dragger } = Upload;
const { Option } = Select;

interface EditSubCategoryModalProps {
  visible: boolean;
  subCategory: SubCategory | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditSubCategoryModal: React.FC<EditSubCategoryModalProps> = ({
  visible,
  subCategory,
  onCancel,
  onSuccess,
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categoryCode, setCategoryCode] = useState<string>("");
  const { updateSubCategory, getCategoryCode, error, clearError } =
    useSubCategoryStore();
  const { categories, getCategories } = useCategoryStore();

  useEffect(() => {
    if (visible) {
      getCategories({ page: 1, limit: 1000, status: "active" });

      if (subCategory) {
        setImagePreview(subCategory.imageUrl || null);
        setCategoryCode(subCategory.categoryCode || "");
        setImageFile(null);
        clearError();
      }
    }
  }, [visible, subCategory, getCategories, clearError]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageChange = (info: any) => {
    const file = info.fileList[0]?.originFileObj;
    if (!file) {
      setImageFile(null);
      setImagePreview(subCategory?.imageUrl || null);
      return;
    }
    if (file.size > 1024 * 1024) {
      message.error("Image size must be less than 1MB");
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

  const handleSubmit = async (values: any, originalData: SubCategory) => {
    const subCategoryData: Partial<SubCategoryFormData> = {
      name: values.name,
      categoryId: values.categoryId,
      status: values.status ? "active" : "inactive",
      imageUrl: imageFile
        ? await fileToBase64(imageFile)
        : imagePreview ?? undefined,
    };

    await updateSubCategory(originalData.id, subCategoryData);
  };

  const mapDataToForm = (subCategory: SubCategory) => ({
    name: subCategory.name,
    categoryId: subCategory.categoryId,
    categoryCode: subCategory.categoryCode,
    status: subCategory.status === "active",
  });

  return (
    <EditModal<SubCategory>
      visible={visible}
      title="Edit Sub-Category"
      data={subCategory}
      onCancel={onCancel}
      onSuccess={onSuccess}
      onSubmit={handleSubmit}
      mapDataToForm={mapDataToForm}
      submitButtonText="Update Sub-Category"
      width={600}
    >
      {(form: FormInstance, data: SubCategory | null) => (
        <>
          <Form.Item
            label="Sub-Category Image"
            name="image"
            tooltip="Optional, JPG/PNG, max 1MB"
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
                    Click or drag file to upload
                  </p>
                  <p className="ant-upload-hint">JPG, PNG up to 1 MB</p>
                </div>
              )}
            </Dragger>
          </Form.Item>

          <Form.Item
            label="Sub-Category Name"
            name="name"
            rules={[
              { required: true, message: "Please enter Sub-Category Name" },
              {
                min: 3,
                max: 100,
                message: "Name must be between 3 and 100 characters",
              },
            ]}
          >
            <Input placeholder="e.g., Smartphones" />
          </Form.Item>

          <Form.Item
            label="Category Name"
            name="categoryId"
            rules={[{ required: true, message: "Please select a Category" }]}
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
              placeholder="Auto-filled"
              value={categoryCode}
              disabled
              style={{ backgroundColor: "#f5f5f5" }}
            />
          </Form.Item>

          <Form.Item label="Status" name="status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </>
      )}
    </EditModal>
  );
};

export default EditSubCategoryModal;
