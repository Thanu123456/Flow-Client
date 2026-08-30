import React from "react";
import { Form, Input, Select, Row, Col, Radio, Card, Typography, Spin } from "antd";
import {
    InfoCircleOutlined,
    TagsOutlined,
    AppstoreOutlined,
    GlobalOutlined,
    SafetyCertificateOutlined,
    PictureOutlined
} from "@ant-design/icons";
import ImageUpload from "../common/Upload/ImageUpload";
import { toTitleCase } from "../../utils/helpers/stringHelpers";
import { useLookupsBundle } from "../../hooks/data/useLookupsBundle";
import { useCategoryStore } from "../../store/management/categoryStore";
import { useSubcategoryStore } from "../../store/management/subCategoryStore";
import { useBrandStore } from "../../store/management/brandStore";
import { useUnitStore } from "../../store/management/unitStore";
import { useWarehouseStore } from "../../store/management/warehouseStore";
import { useWarrantyStore } from "../../store/management/warrantyStore";
import type { FormInstance } from "antd";
import type { Product } from "../../types/entities/product.types";

const { Text } = Typography;

interface BasicDetailsFormProps {
    form: FormInstance;
    editProduct?: Product | null;
}

const BasicDetailsForm: React.FC<BasicDetailsFormProps> = ({ form, editProduct }) => {
    // One request pulls every dropdown dataset (categories, subcategories, brands,
    // units, warehouses, warranties) and hydrates the stores below. React Query
    // caches it, so re-opening the form within 5 min hits no network.
    const { isLoading: loading } = useLookupsBundle();

    // Read the hydrated dropdown lists from their stores.
    const allCategories = useCategoryStore((s) => s.allCategories);
    const allSubcategories = useSubcategoryStore((s) => s.allSubcategories);
    const allBrands = useBrandStore((s) => s.allBrands);
    const allUnits = useUnitStore((s) => s.allUnits);
    const allWarehouses = useWarehouseStore((s) => s.allWarehouses);
    const allWarranties = useWarrantyStore((s) => s.allWarranties);

    // The bundle carries every subcategory; scope the dropdown to the chosen category.
    const selectedCategoryId = Form.useWatch("category_id", form);
    const subcategoryOptions = selectedCategoryId
        ? allSubcategories.filter((s) => s.categoryId === selectedCategoryId)
        : [];

    const handleCategoryChange = () => {
        form.setFieldValue("subcategory_id", undefined);
    };


    return (
        <Spin spinning={loading} tip="Loading dropdown data...">
            <Card
                title={
                    <span className="flex items-center gap-2 text-slate-800">
                        <InfoCircleOutlined className="text-blue-500" />
                        Basic Information
                    </span>
                }
                className="shadow-md border-slate-200 rounded-xl overflow-hidden"
                styles={{ header: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' } }}
            >
                <div className="space-y-6">
                    <div>
                        <Text className="text-xs font-normal uppercase text-slate-400 mb-4 block tracking-wider">
                            Essential Details
                        </Text>
                        <Row gutter={[24, 0]}>
                            <Col span={16}>
                                <Form.Item
                                    name="name"
                                    label={<span className="font-normal">Product Name</span>}
                                    rules={[
                                        { required: true, message: "Please enter product name" },
                                        { min: 2, message: "Name must be at least 2 characters" },
                                    ]}
                                >
                                    <Input
                                    placeholder="e.g. Premium Cotton T-Shirt"
                                    className="rounded-lg h-11"
                                    onBlur={(e) => {
                                        const titled = toTitleCase(e.target.value);
                                        if (titled && titled !== e.target.value) {
                                            form.setFieldValue("name", titled);
                                        }
                                    }}
                                />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="product_type"
                                    label={<span className="font-normal">Product Type</span>}
                                    rules={[{ required: true, message: "Please select product type" }]}
                                >
                                    <Radio.Group buttonStyle="solid" className="w-full flex" disabled={!!editProduct}>
                                        <Radio.Button value="single" className="flex-1 text-center h-11 flex items-center justify-center">Single</Radio.Button>
                                        <Radio.Button value="variable" className="flex-1 text-center h-11 flex items-center justify-center">Variable</Radio.Button>
                                    </Radio.Group>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="description"
                            label={<span className="font-normal">Description</span>}
                        >
                            <Input.TextArea
                                rows={4}
                                placeholder="Provide a detailed description of the product..."
                                className="rounded-lg"
                            />
                        </Form.Item>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <Text className="text-xs font-normal uppercase text-slate-400 mb-4 block tracking-wider">
                            Product Image
                        </Text>
                        <Form.Item
                            name="image_url"
                            label={
                                <span className="flex items-center gap-1 font-normal">
                                    <PictureOutlined className="text-slate-400" /> Main Product Image
                                </span>
                            }
                        >
                            <ImageUpload placeholder="Upload or drop high-quality product image" />
                        </Form.Item>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <Text className="text-xs font-normal uppercase text-slate-400 mb-4 block tracking-wider">
                            Categorization & Attributes
                        </Text>
                        <Row gutter={[24, 24]}>
                            <Col span={12}>
                                <Form.Item
                                    name="category_id"
                                    label={
                                        <span className="flex items-center gap-1 font-normal">
                                            <AppstoreOutlined className="text-slate-400" /> Category
                                        </span>
                                    }
                                    rules={[{ required: true, message: "Please select category" }]}
                                >
                                    <Select
                                        placeholder="Select Category"
                                        onChange={handleCategoryChange}
                                        showSearch
                                        optionFilterProp="children"
                                        className="w-full"
                                        size="large"
                                    >
                                        {editProduct?.categoryId && !allCategories.some(c => c.id === editProduct.categoryId) && (
                                            <Select.Option key={editProduct.categoryId} value={editProduct.categoryId}>
                                                {editProduct.categoryName}
                                            </Select.Option>
                                        )}
                                        {allCategories.map((cat) => (
                                            <Select.Option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="subcategory_id"
                                    label={
                                        <span className="flex items-center gap-1 font-normal">
                                            <TagsOutlined className="text-slate-400" /> Sub Category
                                        </span>
                                    }
                                    rules={[{ required: true, message: "Please select sub category" }]}
                                >
                                    <Select
                                        placeholder="Select Sub Category"
                                        showSearch
                                        optionFilterProp="children"
                                        size="large"
                                    >
                                        {editProduct?.subcategoryId && !subcategoryOptions.some(s => s.id === editProduct.subcategoryId) && (
                                            <Select.Option key={editProduct.subcategoryId} value={editProduct.subcategoryId}>
                                                {editProduct.subcategoryName}
                                            </Select.Option>
                                        )}
                                        {subcategoryOptions.map((sub) => (
                                            <Select.Option key={sub.id} value={sub.id}>
                                                {sub.name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    name="brand_id"
                                    label={<span className="font-normal">Brand</span>}
                                >
                                    <Select placeholder="Select Brand" allowClear showSearch optionFilterProp="children" size="large">
                                        {editProduct?.brandId && !allBrands.some(b => b.id === editProduct.brandId) && (
                                            <Select.Option key={editProduct.brandId} value={editProduct.brandId}>
                                                {editProduct.brandName}
                                            </Select.Option>
                                        )}
                                        {allBrands.map((brand) => (
                                            <Select.Option key={brand.id} value={brand.id}>
                                                {brand.name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="unit_id"
                                    label={<span className="font-normal">Unit</span>}
                                    rules={[{ required: true, message: "Please select unit" }]}
                                >
                                    <Select placeholder="Select Unit" showSearch optionFilterProp="children" size="large">
                                        {editProduct?.unitId && !allUnits.some(u => u.id === editProduct.unitId) && (
                                            <Select.Option key={editProduct.unitId} value={editProduct.unitId}>
                                                {editProduct.unitName} ({editProduct.unitShortName})
                                            </Select.Option>
                                        )}
                                        {allUnits.map((unit) => (
                                            <Select.Option key={unit.id} value={unit.id}>
                                                {unit.name} ({unit.shortName})
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    name="warehouse_id"
                                    label={
                                        <span className="flex items-center gap-1 font-normal">
                                            <GlobalOutlined className="text-slate-400" /> Warehouse
                                        </span>
                                    }
                                >
                                    <Select placeholder="Select Warehouse" allowClear showSearch optionFilterProp="children" size="large">
                                        {editProduct?.warehouseId && !allWarehouses.some(w => w.id === editProduct.warehouseId) && (
                                            <Select.Option key={editProduct.warehouseId} value={editProduct.warehouseId}>
                                                {editProduct.warehouseName}
                                            </Select.Option>
                                        )}
                                        {allWarehouses.map((wh) => (
                                            <Select.Option key={wh.id} value={wh.id}>
                                                {wh.name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    name="warranty_id"
                                    label={
                                        <span className="flex items-center gap-1 font-normal">
                                            <SafetyCertificateOutlined className="text-slate-400" /> Warranty
                                        </span>
                                    }
                                >
                                    <Select placeholder="Select Warranty" allowClear showSearch optionFilterProp="children" size="large">
                                        {editProduct?.warrantyId && !allWarranties.some(w => w.id === editProduct.warrantyId) && (
                                            <Select.Option key={editProduct.warrantyId} value={editProduct.warrantyId}>
                                                {editProduct.warrantyName}
                                            </Select.Option>
                                        )}
                                        {allWarranties.map((w) => (
                                            <Select.Option key={w.id} value={w.id}>
                                                {w.name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                </div>
            </Card>
        </Spin >
    );
};

export default BasicDetailsForm;
