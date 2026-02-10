import React from "react";
import { Modal, Descriptions, Tag, Image, Divider, Table } from "antd";
import type { Product } from "../../types/entities/product.types";
import dayjs from "dayjs";

interface ProductDetailsModalProps {
    visible: boolean;
    product: Product | null;
    onClose: () => void;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ visible, product, onClose }) => {
    if (!product) return null;

    const variationColumns = [
        {
            title: "Variation",
            key: "units",
            render: (record: any) => record.options.map((o: any) => o.value).join(", "),
        },
        {
            title: "SKU",
            dataIndex: "sku",
            key: "sku",
        },
        {
            title: "Barcode",
            dataIndex: "barcode",
            key: "barcode",
        },
        {
            title: "Retail Price",
            dataIndex: "retailPrice",
            key: "retailPrice",
            render: (price: number) => `Rs. ${price?.toFixed(2) || "0.00"}`,
        },
        {
            title: "Stock",
            dataIndex: "currentStock",
            key: "currentStock",
            render: (stock: number) => `${stock || 0} ${product.unitShortName || ""}`
        }
    ];

    return (
        <Modal
            title="Product Details"
            open={visible}
            onCancel={onClose}
            footer={null}
            width={800}
        >
            <div className="flex gap-6 mb-6">
                <Image
                    src={product.imageUrl || "https://via.placeholder.com/200"}
                    width={200}
                    height={200}
                    style={{ objectFit: "cover", borderRadius: 8 }}
                />
                <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                    <Tag color={product.status === "active" ? "green" : "red"}>
                        {product.status.toUpperCase()}
                    </Tag>
                    <Tag color="blue">{product.productType.toUpperCase()}</Tag>
                    <p className="mt-4 text-slate-600">{product.description || "No description provided."}</p>
                </div>
            </div>

            <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label="Category">{product.categoryName}</Descriptions.Item>
                <Descriptions.Item label="Sub Category">{product.subcategoryName}</Descriptions.Item>
                <Descriptions.Item label="Brand">{product.brandName || "-"}</Descriptions.Item>
                <Descriptions.Item label="Unit">{product.unitName} ({product.unitShortName})</Descriptions.Item>
                <Descriptions.Item label="Warehouse">{product.warehouseName || "-"}</Descriptions.Item>
                <Descriptions.Item label="Warranty">{product.warrantyName || "-"}</Descriptions.Item>
                <Descriptions.Item label="Created At">
                    {dayjs(product.createdAt).format("DD MMM YYYY, HH:mm")}
                </Descriptions.Item>
                <Descriptions.Item label="Updated At">
                    {dayjs(product.updatedAt).format("DD MMM YYYY, HH:mm")}
                </Descriptions.Item>
            </Descriptions>

            {product.productType === "single" ? (
                <>
                    <Divider orientation="left">Pricing & Stock</Divider>
                    <Descriptions bordered size="small" column={2}>
                        <Descriptions.Item label="Sku">{product.sku}</Descriptions.Item>
                        <Descriptions.Item label="Barcode">{product.barcode || "-"}</Descriptions.Item>
                        <Descriptions.Item label="Cost Price">Rs. {product.costPrice?.toFixed(2)}</Descriptions.Item>
                        <Descriptions.Item label="Retail Price">Rs. {product.retailPrice?.toFixed(2)}</Descriptions.Item>
                        <Descriptions.Item label="Wholesale Price">Rs. {product.wholesalePrice?.toFixed(2)}</Descriptions.Item>
                        <Descriptions.Item label="Our Price">Rs. {product.ourPrice?.toFixed(2)}</Descriptions.Item>
                        <Descriptions.Item label="Current Stock">{product.currentStock} {product.unitShortName}</Descriptions.Item>
                        <Descriptions.Item label="Alert Quantity">{product.quantityAlert}</Descriptions.Item>
                    </Descriptions>
                </>
            ) : (
                <>
                    <Divider orientation="left">Variations</Divider>
                    <Table
                        dataSource={product.variations}
                        columns={variationColumns}
                        rowKey="id"
                        pagination={false}
                        size="small"
                    />
                </>
            )}
        </Modal>
    );
};

export default ProductDetailsModal;
