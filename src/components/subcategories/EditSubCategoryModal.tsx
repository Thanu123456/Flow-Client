import React, { useState, useEffect } from "react";
import { Form, Input, Switch, Upload, Select, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type { Subcategory, SubcategoryFormData } from "../../types/entities/subcategory.types";
import { useSubcategoryStore } from "../../store/management/subCategoryStore";
import { categoryService } from "../../services/management/categoryService";
import EditModal from "../common/Modal/EditModal";
import type { FormInstance } from "antd";

const { TextArea } = Input;
const { Dragger } = Upload;

interface EditSubCategoryModalProps {
  visible: boolean;
  subcategory: Subcategory | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditSubCategoryModal: React.FC<EditSubCategoryModalProps> = ({
  visible,
  subcategory,
  onCancel,
  onSuccess,
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const { updateSubcategory, error, clearError } = useSubcategoryStore();

  useEffect(() => {
    if (visible) {
      fetchCategories();
      if (subcategory) {
        setImagePreview(subcategory.imageUrl || null);
        setImageFile(null);
        clearError();
      }
    }
  }, [visible, subcategory, clearError]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

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

  const handleImageChange = (info: any) => {
    const file = info.fileList[0]?.originFileObj;
    if (!file) {
      setImageFile(null);
      setImagePreview(subcategory?.imageUrl || null);
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

  const handleSubmit = async (values: any, _originalData: Subcategory) => {
    const subcategoryData: Partial<SubcategoryFormData> = {
      categoryId: values.categoryId,
      name: values.name,
      status: values.status ? "active" : "inactive",
      description: values.description,
      imageUrl: imageFile ? await fileToBase64(imageFile) : imagePreview ?? undefined,
    };

    await updateSubcategory(_originalData.id, subcategoryData);
  };

  const mapDataToForm = (subcategory: Subcategory) => ({
    categoryId: subcategory.categoryId,
    name: subcategory.name,
    description: subcategory.description,
    status: subcategory.status === "active",
  });

  return (
    <EditModal<Subcategory>
      visible={visible}
      title="Edit SubCategory"
      data={subcategory}
      onCancel={onCancel}
      onSuccess={onSuccess}
      onSubmit={handleSubmit}
      mapDataToForm={mapDataToForm}
      submitButtonText="Update SubCategory"
    >
      {(_form: FormInstance, _data: Subcategory | null) => (
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
            <TextArea rows={4} placeholder="Enter description" maxLength={200} />
          </Form.Item>

          <Form.Item label="Status" name="status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="In-active" />
          </Form.Item>
        </>
      )}
    </EditModal>
  );
};

export default EditSubCategoryModal;
