import React from "react";
import { Modal, Form, Input, InputNumber, message } from "antd";
import type { Product } from "../../types/entities/product.types";
import { useProductStore } from "../../store/inventory/productStore";

interface EditProductModalProps {
    visible: boolean;
    product: Product | null;
    onClose: () => void;
    onSuccess: () => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ visible, product, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const { updateProduct } = useProductStore();

    React.useEffect(() => {
        if (visible && product) {
            form.setFieldsValue({
                name: product.name,
                retail_price: product.retailPrice,
                quantity_alert: product.quantityAlert,
            });
        }
    }, [visible, product, form]);

    const handleSubmit = async () => {
        if (!product) return;
        try {
            const values = await form.validateFields();
            await updateProduct(product.id, values);
            message.success("Product updated successfully");
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Modal
            title="Quick Edit Product"
            open={visible}
            onCancel={onClose}
            onOk={handleSubmit}
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="retail_price" label="Retail Price">
                    <InputNumber style={{ width: "100%" }} prefix="Rs." />
                </Form.Item>
                <Form.Item name="quantity_alert" label="Low Stock Alert">
                    <InputNumber style={{ width: "100%" }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditProductModal;
