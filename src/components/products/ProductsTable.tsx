import React, { useEffect, useState } from "react";
import { Table, Tag, Space, Button, Tooltip, Image, Popconfirm, message } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useProductStore } from "../../store/inventory/productStore";
import type { Product } from "../../types/entities/product.types";
import { useNavigate } from "react-router-dom";
import ProductDetailsModal from "./ProductDetailsModal";

const ProductsTable: React.FC = () => {
    const navigate = useNavigate();
    const { products, loading, pagination, getProducts, deleteProduct, getProductById } = useProductStore();
    const [pageSize, setPageSize] = useState(10);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    useEffect(() => {
        getProducts({ page: 1, limit: pageSize });
    }, [getProducts, pageSize]);

    const handleTableChange = (pagination: any) => {
        getProducts({
            page: pagination.current,
            limit: pagination.pageSize,
        });
        setPageSize(pagination.pageSize);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteProduct(id);
            message.success("Product deleted successfully");
            getProducts({ page: pagination.page, limit: pageSize });
        } catch (error) {
            message.error("Failed to delete product");
        }
    };

    const columns = [
        {
            title: "Product",
            key: "product",
            render: (record: Product) => (
                <Space>
                    <Image
                        src={record.imageUrl || "https://via.placeholder.com/40"}
                        alt={record.name}
                        width={40}
                        height={40}
                        style={{ borderRadius: 4, objectFit: "cover" }}
                    />
                    <div>
                        <div style={{ fontWeight: 600 }}>{record.name}</div>
                        <div style={{ fontSize: 12, color: "#8c8c8c" }}>SKU: {record.sku}</div>
                        {record.barcode && <div style={{ fontSize: 12, color: "#8c8c8c" }}>Barcode: {record.barcode}</div>}
                    </div>
                </Space>
            ),
        },
        {
            title: "Category",
            dataIndex: "categoryName",
            key: "categoryName",
        },
        {
            title: "Type",
            dataIndex: "productType",
            key: "productType",
            render: (type: string) => (
                <Tag color={type === "variable" ? "purple" : "blue"}>
                    {type.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: "Prices",
            key: "prices",
            render: (record: Product) => (
                <div>
                    <div>Retail: <span style={{ fontWeight: 600 }}>Rs. {record.retailPrice?.toFixed(2) || "0.00"}</span></div>
                    <div style={{ fontSize: 12, color: "#8c8c8c" }}>Cost: Rs. {record.costPrice?.toFixed(2) || "0.00"}</div>
                </div>
            ),
        },
        {
            title: "Stock",
            key: "stock",
            render: (record: Product) => (
                <div>
                    <div style={{
                        fontWeight: 600,
                        color: (record.currentStock || 0) <= (record.quantityAlert || 0) ? "#cf1322" : "inherit"
                    }}>
                        {record.currentStock || 0} {record.unitShortName}
                    </div>
                    {record.productType === "variable" && (
                        <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                            {record.variationCount || 0} variations
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Tag color={status === "active" ? "green" : "red"}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (record: Product) => (
                <Space size="middle">
                    <Tooltip title="View Details">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={async () => {
                                try {
                                    const fullProduct = await getProductById(record.id);
                                    setSelectedProduct(fullProduct);
                                    setViewModalVisible(true);
                                } catch (error) {
                                    message.error("Failed to fetch product details");
                                }
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/products/edit/${record.id}`)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete Product"
                        description="Are you sure you want to delete this product?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title="Delete">
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Table
                columns={columns}
                dataSource={products}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: pagination.page,
                    pageSize: pagination.limit,
                    total: pagination.total,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`,
                }}
                onChange={handleTableChange}
            />
            <ProductDetailsModal
                visible={viewModalVisible}
                product={selectedProduct}
                onClose={() => {
                    setViewModalVisible(false);
                    setSelectedProduct(null);
                }}
            />
        </>
    );
};

export default ProductsTable;
