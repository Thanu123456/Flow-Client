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
            await createProduct(values);
            message.success("Product created successfully");
            navigate("/products");
        } catch (error: any) {
            console.error(error);
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
