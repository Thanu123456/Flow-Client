import React, { useState } from "react";
import { Form, Button, message, Space, Breadcrumb, Divider } from "antd";
import { useNavigate } from "react-router-dom";
import {
    PlusOutlined,
    ArrowLeftOutlined,
    ShoppingOutlined,
    SaveOutlined
} from "@ant-design/icons";
import { useProductStore } from "../../store/inventory/productStore";
import BasicDetailsForm from "./BasicDetailsForm";
import SingleProductForm from "./SingleProductForm";
import VariableProductForm from "./VariableProductForm";
import type { CreateProductRequest } from "../../types/entities/product.types";

const AddProductPage: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { createProduct, loading } = useProductStore();
    const [productType, setProductType] = useState<"single" | "variable">("single");

    const handleValuesChange = (changedValues: any) => {
        if (changedValues.product_type) {
            setProductType(changedValues.product_type);
        }
    };

    const onFinish = async (values: CreateProductRequest) => {
        try {
            console.log("Submitting values:", JSON.stringify(values, null, 2));

            // Sanitize values to prevent 400 Bad Request on empty strings for UUIDs
            const sanitizedValues = { ...values };

            // Helper to clean specific optional fields
            const cleanOptionalUuid = (val: any) => (val === "" ? null : val);

            sanitizedValues.category_id = cleanOptionalUuid(sanitizedValues.category_id);
            sanitizedValues.subcategory_id = cleanOptionalUuid(sanitizedValues.subcategory_id);
            sanitizedValues.brand_id = cleanOptionalUuid(sanitizedValues.brand_id);
            sanitizedValues.unit_id = cleanOptionalUuid(sanitizedValues.unit_id);
            sanitizedValues.warehouse_id = cleanOptionalUuid(sanitizedValues.warehouse_id);
            sanitizedValues.warranty_id = cleanOptionalUuid(sanitizedValues.warranty_id);

            if (sanitizedValues.variable_product) {
                sanitizedValues.variable_product.variation_id = cleanOptionalUuid(sanitizedValues.variable_product.variation_id);
            }



            if (sanitizedValues.image_url === "") sanitizedValues.image_url = undefined;

            if (sanitizedValues.single_product) {
                // simple cleanup
                if (sanitizedValues.single_product.image_url === "") sanitizedValues.single_product.image_url = undefined;

                // Default our_price (Selling Price) to retail_price if not set (0 or undefined)
                const sp = sanitizedValues.single_product;
                if (!sp.our_price || sp.our_price === 0) {
                    sp.our_price = sp.retail_price;
                }
            }
            if (sanitizedValues.variable_product?.variations) {
                sanitizedValues.variable_product.variations.forEach((v: any) => {
                    if (v.image_url === "") v.image_url = undefined;
                    // Default our_price (Selling Price) to retail_price if not set
                    if (!v.our_price || v.our_price === 0) {
                        v.our_price = v.retail_price;
                    }
                });
            }

            console.log("Sanitized values:", JSON.stringify(sanitizedValues, null, 2));

            await createProduct(sanitizedValues);
            message.success("Product created successfully");
            navigate("/products");
        } catch (error: any) {
            console.error("Create product failed:", error);
            const errorMsg = error.response?.data?.message || "Failed to create product. Check console for details.";
            // If there are detailed validation errors
            if (error.response?.data?.error) {
                if (typeof error.response.data.error === 'string') {
                    message.error(error.response.data.error);
                } else {
                    message.error(`${error.response.data.error.message}: ${error.response.data.error.details}`);
                }
            } else {
                message.error(errorMsg);
            }
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-12">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 shadow-sm mb-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <Breadcrumb className="mb-2">
                            <Breadcrumb.Item onClick={() => navigate("/")} className="cursor-pointer">Home</Breadcrumb.Item>
                            <Breadcrumb.Item onClick={() => navigate("/products")} className="cursor-pointer">Products</Breadcrumb.Item>
                            <Breadcrumb.Item>Add New Product</Breadcrumb.Item>
                        </Breadcrumb>
                        <h1 className="text-2xl font-normal text-slate-800 flex items-center gap-2 m-0">
                            <ShoppingOutlined className="text-blue-600" />
                            Add New Product
                        </h1>
                    </div>
                    <Space size="middle">
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate("/products")}
                            className="hover:border-blue-500 hover:text-blue-500 transition-all flex items-center"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={() => form.submit()}
                            loading={loading}
                            className="bg-blue-600 hover:bg-blue-700 h-10 px-6 font-normal flex items-center"
                        >
                            Create Product
                        </Button>
                    </Space>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    onValuesChange={handleValuesChange}
                    initialValues={{ product_type: "single", quantity_alert: 10 }}
                    size="large"
                >
                    <BasicDetailsForm form={form} />

                    <div className="mt-8">
                        <Divider orientation="left" className="text-slate-400 font-normal uppercase tracking-wider text-xs">
                            Product Type Specific Details
                        </Divider>
                    </div>

                    {productType === "single" ? (
                        <SingleProductForm />
                    ) : (
                        <VariableProductForm />
                    )}

                    <div className="mt-8 flex justify-end">
                        <Space size="large">
                            <Button
                                onClick={() => navigate("/products")}
                                className="h-12 px-8 text-slate-500"
                            >
                                Back to List
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => form.submit()}
                                loading={loading}
                                className="bg-blue-600 hover:bg-blue-700 h-12 px-10 font-normal text-lg shadow-lg hover:shadow-blue-200"
                            >
                                Save Product
                            </Button>
                        </Space>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default AddProductPage;
