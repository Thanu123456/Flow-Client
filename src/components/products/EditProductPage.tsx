import React, { useState, useEffect } from "react";
import { Form, Button, message, Space, Breadcrumb, Divider, Spin, Tooltip } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeftOutlined,
    SaveOutlined,
    EditOutlined
} from "@ant-design/icons";
import { useProductStore } from "../../store/inventory/productStore";
import { useFormShortcuts } from "../../hooks/ui/useFormShortcuts";
import { useFormSubmittable } from "../../hooks/ui/useFormSubmittable";
import { useLookupsBundle } from "../../hooks/data/useLookupsBundle";
import type { Product } from "../../types/entities/product.types";
import BasicDetailsForm from "./BasicDetailsForm";
import SingleProductForm from "./SingleProductForm";
import VariableProductForm from "./VariableProductForm";

const EditProductPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { getProductById, updateProduct, loading } = useProductStore();
    // One request loads every dropdown dataset and hydrates the management stores
    // that BasicDetailsForm / VariableProductForm read from.
    useLookupsBundle();
    const [fetching, setFetching] = useState(true);
    const [productType, setProductType] = useState<"single" | "variable">("single");
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const { submittable, issues, summary } = useFormSubmittable(form);

    useFormShortcuts(form, () => navigate("/products"));

    useEffect(() => {
        let cancelled = false;

        const fetchProduct = async () => {
            if (!id) return;
            try {
                // Dropdown data is loaded by useLookupsBundle() above; the only
                // critical call here is the product itself.
                const product = await getProductById(id);

                // Abort if the effect was cleaned up (React StrictMode double-invocation)
                if (cancelled) return;

                setEditProduct(product);
                setProductType(product.productType || "single");

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
                    image_url: product.imageUrl,
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
                        current_stock: product.currentStock,
                        image_url: product.imageUrl,
                    };
                } else {
                    // Variable product mapping
                    const variations = product.variations || [];
                    formValues.variable_product = {
                        variation_id: variations[0]?.variationId ? String(variations[0].variationId) : undefined,
                        variations: variations.map((v: any) => ({
                            variation_option_ids: Array.isArray(v.options) ? v.options.map((o: any) => String(o.id)) : [],
                            sku: v.sku,
                            barcode: v.barcode,
                            cost_price: v.costPrice || v.cost_price,
                            wholesale_price: v.wholesalePrice || v.wholesale_price,
                            retail_price: v.retailPrice || v.retail_price,
                            our_price: v.ourPrice || v.our_price,
                            discount_type: v.discountType || v.discount_type,
                            discount_value: v.discountValue || v.discount_value,
                            discount_applies_to: v.discountAppliesTo || v.discount_applies_to,
                            quantity_alert: v.quantityAlert || v.quantity_alert,
                            current_stock: v.currentStock || v.current_stock,
                            image_url: v.imageUrl || v.image_url,
                        }))
                    };
                }

                form.setFieldsValue(formValues);
            } catch (error: any) {
                if (cancelled) return;
                console.error("EditProductPage fetch error:", error);
                const msg = error?.response?.data?.error?.message
                    || error?.response?.data?.message
                    || error?.message
                    || "Failed to fetch product details";
                message.error(msg);
            } finally {
                if (!cancelled) setFetching(false);
            }
        };

        fetchProduct();

        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleValuesChange = (changedValues: any) => {
        if (changedValues.product_type) {
            setProductType(changedValues.product_type);
        }
    };

    const onFinish = async (values: any) => {
        if (!id) return;
        try {
            // Transform form values to match backend API validation
            const payload = { ...values };

            // Sanitize optional UUID fields (convert empty strings to null)
            const cleanOptionalUuid = (val: any) => (val === "" ? null : val);
            payload.category_id = cleanOptionalUuid(payload.category_id);
            payload.subcategory_id = cleanOptionalUuid(payload.subcategory_id);
            payload.brand_id = cleanOptionalUuid(payload.brand_id);
            payload.unit_id = cleanOptionalUuid(payload.unit_id);
            payload.warehouse_id = cleanOptionalUuid(payload.warehouse_id);
            payload.warranty_id = cleanOptionalUuid(payload.warranty_id);

            if (payload.variable_product) {
                payload.variable_product.variation_id = cleanOptionalUuid(payload.variable_product.variation_id);
            }

            // Clean up image_url if empty string
            if (payload.image_url === "") payload.image_url = undefined;

            if (productType === "single" && values.single_product) {
                // Flatten single_product fields to root level for UpdateProductRequest
                const sp = { ...values.single_product };

                // Clean up single product fields
                if (sp.image_url === "") sp.image_url = undefined;

                // Sanitize discount_type (fix for oneof validation error)
                if (!sp.discount_type) sp.discount_type = undefined;

                // Ensure our_price is set, fallback to retail_price if needed
                if ((!sp.our_price || sp.our_price === 0) && sp.retail_price) {
                    sp.our_price = sp.retail_price;
                }

                Object.assign(payload, sp);
                delete payload.single_product;
            } else if (productType === "variable" && payload.variable_product?.variations) {
                // Sanitize variations if they are being sent
                payload.variable_product.variations.forEach((v: any) => {
                    if (v.image_url === "") v.image_url = undefined;

                    // Sanitize discount_type
                    if (!v.discount_type) v.discount_type = undefined;

                    // Ensure our_price is set
                    if ((!v.our_price || v.our_price === 0) && v.retail_price) {
                        v.our_price = v.retail_price;
                    }
                });
            }

            // Note: Variable product variations update is not yet supported by the UpdateProduct endpoint directly
            // except for fields on the main product.

            console.log("Submitting update payload:", payload);

            await updateProduct(id, payload);
            message.success("Product updated successfully");
            navigate("/products");
        } catch (error: any) {
            console.error("Update product failed:", error);
            const errorMsg = error.response?.data?.message || "Failed to update product. Check console for details.";
            // If there are detailed validation errors
            if (error.response?.data?.error) {
                if (typeof error.response.data.error === 'string') {
                    message.error(error.response.data.error);
                } else if (error.response.data.error.details) {
                    message.error(`${error.response.data.error.message}: ${error.response.data.error.details}`);
                } else {
                    message.error(JSON.stringify(error.response.data.error));
                }
            } else {
                message.error(errorMsg);
            }
        }
    };

    if (fetching) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large">
                    <div style={{ marginTop: 16 }}>Loading product details...</div>
                </Spin>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-12">
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 shadow-sm mb-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <Breadcrumb
                            className="mb-2"
                            items={[
                                { title: 'Home', onClick: () => navigate("/"), className: "cursor-pointer" },
                                { title: 'Products', onClick: () => navigate("/products"), className: "cursor-pointer" },
                                { title: 'Edit Product' },
                            ]}
                        />
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
                        <Tooltip title={summary} placement="bottomRight">
                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                onClick={() => form.submit()}
                                loading={loading}
                                disabled={!submittable}
                                className="bg-blue-600 hover:bg-blue-700 h-10 px-6 font-normal flex items-center"
                            >
                                Update Product{!submittable && issues.length ? ` (${issues.length})` : ""}
                            </Button>
                        </Tooltip>
                    </Space>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                <Form
                    form={form}
                    layout="vertical"
                    autoComplete="off"
                    onFinish={onFinish}
                    onValuesChange={handleValuesChange}
                    size="large"
                >
                    <BasicDetailsForm form={form} editProduct={editProduct} />

                    <div className="mt-8">
                        <Divider orientation="left" className="text-slate-400 font-normal uppercase tracking-wider text-xs">
                            Product Type Specific Details
                        </Divider>
                    </div>

                    {productType === "single" ? (
                        <SingleProductForm editProductId={editProduct?.id} />
                    ) : (
                        <VariableProductForm editProduct={editProduct} />
                    )}

                    <div className="mt-8 flex justify-end">
                        <Space size="large">
                            <Button
                                onClick={() => navigate("/products")}
                                className="h-12 px-8 text-slate-500"
                            >
                                Cancel
                            </Button>
                            <Tooltip title={summary} placement="topRight">
                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    onClick={() => form.submit()}
                                    loading={loading}
                                    disabled={!submittable}
                                    className="bg-blue-600 hover:bg-blue-700 h-12 px-10 font-normal text-lg shadow-lg hover:shadow-blue-200"
                                >
                                    Save Changes{!submittable && issues.length ? ` (${issues.length})` : ""}
                                </Button>
                            </Tooltip>
                        </Space>
                    </div>
                </Form>
            </div>
        </div>
    );
};


export default EditProductPage;
