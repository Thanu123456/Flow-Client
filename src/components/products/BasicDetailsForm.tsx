import React, { useEffect } from "react";
import { Form, Input, Select, Row, Col, Radio, Card, Typography } from "antd";
import {
    InfoCircleOutlined,
    TagsOutlined,
    AppstoreOutlined,
    GlobalOutlined,
    SafetyCertificateOutlined
} from "@ant-design/icons";
import { useCategoryStore } from "../../store/management/categoryStore";
import { useSubcategoryStore } from "../../store/management/subCategoryStore";
import { useBrandStore } from "../../store/management/brandStore";
import { useUnitStore } from "../../store/management/unitStore";
import { useWarehouseStore } from "../../store/management/warehouseStore";
import { useWarrantyStore } from "../../store/management/warrantyStore";
import type { FormInstance } from "antd";

const { Text } = Typography;

interface BasicDetailsFormProps {
    form: FormInstance;
}

const BasicDetailsForm: React.FC<BasicDetailsFormProps> = ({ form }) => {
    const { categories, getCategories } = useCategoryStore();
    const { subcategories, getSubcategoriesByCategory } = useSubcategoryStore();
    const { brands, getBrands } = useBrandStore();
    const { units, getUnits } = useUnitStore();
    const { warehouses, getWarehouses } = useWarehouseStore();
    const { warranties, getAllWarranties } = useWarrantyStore();

    console.log("BasicDetailsForm - Units data:", units);

    useEffect(() => {
        getCategories({ page: 1, limit: 100 });
        getBrands({ page: 1, limit: 100 });
        getUnits({ page: 1, limit: 100 });
        getWarehouses({ page: 1, limit: 100 });
        getAllWarranties();
    }, [getCategories, getBrands, getUnits, getWarehouses, getAllWarranties]);

    const handleCategoryChange = (categoryId: string) => {
        form.setFieldsValue({ subcategory_id: undefined });
        if (categoryId) {
            getSubcategoriesByCategory(categoryId);
        }
    };

    return (
        <Card
            title={
                <span className="flex items-center gap-2 text-slate-800">
                    <InfoCircleOutlined className="text-blue-500" />
                    Basic Information
                </span>
            }
            className="shadow-md border-slate-200 rounded-xl overflow-hidden"
            headStyle={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}
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
                                <Input placeholder="e.g. Premium Cotton T-Shirt" className="rounded-lg h-11" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="product_type"
                                label={<span className="font-normal">Product Type</span>}
                                rules={[{ required: true, message: "Please select product type" }]}
                                initialValue="single"
                            >
                                <Radio.Group buttonStyle="solid" className="w-full flex">
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
                                    {categories.map((cat) => (
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
                                    {subcategories.map((sub) => (
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
                                    {brands.map((brand) => (
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
                                    {units.map((unit) => (
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
                                    {warehouses.map((wh) => (
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
                                    {warranties.map((w) => (
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
    );
};

export default BasicDetailsForm;
