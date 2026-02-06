import React, { useState, useEffect } from "react";
import { Form, Button, message, Space, Breadcrumb, Divider, Spin } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeftOutlined,
    SaveOutlined,
    EditOutlined
} from "@ant-design/icons";
import { useProductStore } from "../../store/inventory/productStore";
import BasicDetailsForm from "./BasicDetailsForm";
import SingleProductForm from "./SingleProductForm";
import VariableProductForm from "./VariableProductForm";

const EditProductPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { getProductById, updateProduct, loading } = useProductStore();
    const [fetching, setFetching] = useState(true);
    const [productType, setProductType] = useState<"single" | "variable">("single");

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                const product = await getProductById(id);
                setProductType(product.productType);

                // Transform product data to form values
                const formValues: any = {
                    name: product.name,
                    description: product.description,
                    product_type: product.productType,
                    category_id: product.categoryId,
                    subcategory_id: product.subcategoryId,
                    brand_id: product.brandId,
                    unit_id: product.unitId,
                    warehouse_id: product.warehouseId,
                    warranty_id: product.warrantyId,
                };

                if (product.productType === "single") {
                    formValues.single_product = {
                        sku: product.sku,
                        barcode: product.barcode,
                        cost_price: product.costPrice,
                        wholesale_price: product.wholesalePrice,
                        retail_price: product.retailPrice,
                        our_price: product.ourPrice,
                        discount_type: product.discountType,
                        discount_value: product.discountValue,
                        discount_applies_to: product.discountAppliesTo,
                        quantity_alert: product.quantityAlert,
                        image_url: product.imageUrl,
                    };
                } else {
                    // Variable product mapping
                    formValues.variable_product = {
                        variation_id: product.variations?.[0]?.variationId,
                        variations: product.variations?.map(v => ({
                            variation_option_ids: v.options.map(o => o.id),
                            sku: v.sku,
                            barcode: v.barcode,
                            cost_price: v.costPrice,
                            wholesale_price: v.wholesalePrice,
                            retail_price: v.retailPrice,
                            our_price: v.ourPrice,
                            discount_type: v.discountType,
                            discount_value: v.discountValue,
                            discount_applies_to: v.discountAppliesTo,
                            quantity_alert: v.quantityAlert,
                            image_url: v.imageUrl,
                        }))
                    };
                }

                form.setFieldsValue(formValues);
            } catch (error) {
                message.error("Failed to fetch product details");
                navigate("/products");
            } finally {
                setFetching(false);
            }
        };

        fetchProduct();
    }, [id, getProductById, form, navigate]);

    const handleValuesChange = (changedValues: any) => {
        if (changedValues.product_type) {
            setProductType(changedValues.product_type);
        }
    };

    const onFinish = async (values: any) => {
        if (!id) return;
        try {
            await updateProduct(id, values);
            message.success("Product updated successfully");
            navigate("/products");
        } catch (error: any) {
            console.error(error);
        }
    };

    if (fetching) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" tip="Loading product details..." />
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-12">
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 shadow-sm mb-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <Breadcrumb className="mb-2">
                            <Breadcrumb.Item onClick={() => navigate("/")} className="cursor-pointer">Home</Breadcrumb.Item>
                            <Breadcrumb.Item onClick={() => navigate("/products")} className="cursor-pointer">Products</Breadcrumb.Item>
                            <Breadcrumb.Item>Edit Product</Breadcrumb.Item>
                        </Breadcrumb>
                        <h1 className="text-2xl font-normal text-slate-800 flex items-center gap-2 m-0">
                            <EditOutlined className="text-blue-600" />
                            Edit Product: {form.getFieldValue("name")}
                        </h1>
                    </div>
                    <Space size="middle">
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate("/products")}
                            className="hover:border-blue-500 hover:text-blue-500 transition-all flex items-center"
                        >
                            Back
                        </Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={() => form.submit()}
                            loading={loading}
                            className="bg-blue-600 hover:bg-blue-700 h-10 px-6 font-normal flex items-center"
                        >
                            Update Product
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
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                onClick={() => form.submit()}
                                loading={loading}
                                className="bg-blue-600 hover:bg-blue-700 h-12 px-10 font-normal text-lg shadow-lg hover:shadow-blue-200"
                            >
                                Save Changes
                            </Button>
                        </Space>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default EditProductPage;
