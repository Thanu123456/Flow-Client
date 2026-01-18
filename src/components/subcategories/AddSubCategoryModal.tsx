import React, { useState, useEffect } from "react";
import { Form, Input, Switch, Upload, Select } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type { SubcategoryFormData } from "../../types/entities/subcategory.types";
import { subcategoryService } from "../../services/management/subCategoryService";
import { categoryService } from "../../services/management/categoryService";
import AddModal from "../common/Modal/AddModal";
import type { FormInstance } from "antd";

const { TextArea } = Input;
const { Dragger } = Upload;

interface AddSubCategoryModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  defaultCategoryId?: string;
}

const AddSubCategoryModal: React.FC<AddSubCategoryModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  defaultCategoryId,
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchCategories();
    }
  }, [visible]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await categoryService.getCategories({ page: 1, limit: 100, status: "active" });
      setCategories(response.data.map((c) => ({ id: c.id, name: c.name })));
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setLoadingCategories(false);
    }
  };

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
      if (!["image/jpeg", "image/png"].includes(file.type)) return;
      if (file.size > 2 * 1024 * 1024) return;
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (values: any) => {
    const subcategoryData: SubcategoryFormData = {
      categoryId: values.categoryId,
      name: values.name,
      description: values.description,
      status: values.status ? "active" : "inactive",
      imageUrl: imageFile ? await fileToBase64(imageFile) : undefined,
    };

    await subcategoryService.createSubcategory(subcategoryData);
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
      title="Add SubCategory"
      onCancel={handleCancel}
      onSuccess={onSuccess}
      onSubmit={handleSubmit}
      initialValues={{ status: true, categoryId: defaultCategoryId }}
      submitButtonText="Add SubCategory"
    >
      {(_form: FormInstance) => (
        <>
          <Form.Item
            label="Category"
            name="categoryId"
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select
              placeholder="Select Category"
              loading={loadingCategories}
              showSearch
              optionFilterProp="children"
            >
              {categories.map((cat: { id: string; name: string }) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="SubCategory Image"
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
                  alt="SubCategory"
                  style={{ width: "100%", maxHeight: "200px", objectFit: "contain" }}
                />
              ) : (
                <div>
                  <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                  <p className="ant-upload-text">Click or drag file to upload</p>
                  <p className="ant-upload-hint">JPEG, PNG up to 2 MB</p>
                </div>
              )}
            </Dragger>
          </Form.Item>

          <Form.Item
            label="SubCategory Name"
            name="name"
            rules={[
              { required: true, message: "Please enter SubCategory Name" },
              { min: 1, max: 50, message: "Name must be between 1 and 50 characters" },
            ]}
          >
            <Input placeholder="Enter SubCategory Name" maxLength={50} />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ max: 200, message: "Description must be less than 200 characters" }]}
          >
            <TextArea rows={4} placeholder="Enter Description" maxLength={200} />
          </Form.Item>

          <Form.Item label="Status" name="status" valuePropName="checked">
            <Switch />
          </Form.Item>
        </>
      )}
    </AddModal>
  );
};

export default AddSubCategoryModal;
