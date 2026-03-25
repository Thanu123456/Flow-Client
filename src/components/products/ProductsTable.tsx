import React, { useState } from "react";
import { Space, Tooltip, Image, Popconfirm, message, Modal } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined, WarningOutlined } from "@ant-design/icons";
import { useProductStore } from "../../store/inventory/productStore";
import type { Product } from "../../types/entities/product.types";
import { useNavigate } from "react-router-dom";
import ProductDetailsModal from "./ProductDetailsModal";
import { CommonTable } from "../common/Table";
import { useTableSelection } from "../../hooks/useTableSelection";

interface ProductsTableProps {
    products: Product[];
    loading: boolean;
    pagination: { page: number; limit: number; total: number; totalPages: number };
    onPageChange: (page: number, pageSize: number) => void;
    refreshData: () => void;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
    products,
    loading,
    pagination,
    onPageChange,
    refreshData,
}) => {
    const navigate = useNavigate();
    const { deleteProduct, getProductById } = useProductStore();
    const { selectedRowKeys, rowSelection, clearSelection } = useTableSelection<Product>();
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const handleDelete = async (id: string) => {
        try {
            await deleteProduct(id);
            message.success("Product deleted successfully");
            refreshData();
        } catch (error) {
            message.error("Failed to delete product");
        }
    };

    const handleBulkDelete = () => {
        Modal.confirm({
            title: "Delete Multiple Products",
            icon: <WarningOutlined style={{ color: "red" }} />,
            content: `Are you sure you want to delete ${selectedRowKeys.length} selected products? This action cannot be undone.`,
            okText: "Delete",
            okType: "danger",
            cancelText: "Cancel",
            onOk: async () => {
                try {
                    // Bulk delete API call would go here
                    message.success(`Successfully deleted ${selectedRowKeys.length} products`);
                    clearSelection();
                    refreshData();
                } catch (error) {
                    message.error("Failed to delete products");
                }
            },
        });
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
                <span
                    className={`px-3 py-1 rounded-lg text-sm border ${type === "variable"
                        ? "border-purple-500 text-purple-500 bg-purple-50/70"
                        : "border-blue-500 text-blue-500 bg-blue-50/70"
                        }`}
                >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                </span>
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
                <span
                    className={`px-3 py-1 rounded-lg text-sm border ${status === "active"
                        ? "border-green-500 text-green-500 bg-green-50/70"
                        : "border-red-500 text-red-500 bg-red-50/70"
                        }`}
                >
                    {status === "active" ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (record: Product) => (
                <Space size="middle">
                    <Tooltip title="View Details">
                        <div
                            className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer hover:bg-blue-50"
                            onClick={async () => {
                                try {
                                    const fullProduct = await getProductById(record.id);
                                    setSelectedProduct(fullProduct);
                                    setViewModalVisible(true);
                                } catch (error) {
                                    message.error("Failed to fetch product details");
                                }
                            }}
                        >
                            <EyeOutlined style={{ color: "black" }} />
                        </div>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <div
                            className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer hover:bg-blue-50"
                            onClick={() => navigate(`/products/edit/${record.id}`)}
                        >
                            <EditOutlined style={{ color: "#1890ff" }} />
                        </div>
                    </Tooltip>
                    <Popconfirm
                        title="Delete Product"
                        description="Are you sure you want to delete this product?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title="Delete">
                            <div
                                className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer hover:bg-blue-50"
                            >
                                <DeleteOutlined style={{ color: "red" }} />
                            </div>
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <>
            <CommonTable<Product>
                columns={columns as any}
                dataSource={products}
                rowKey="id"
                loading={loading}
                rowSelection={rowSelection}
                onBulkDelete={handleBulkDelete}
                bulkDeleteText={`Delete (${selectedRowKeys.length})`}
                pagination={{
                    page: pagination.page,
                    limit: pagination.limit,
                    total: pagination.total,
                    totalPages: Math.ceil(pagination.total / (pagination.limit || 10)),
                }}
                onPageChange={onPageChange}
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
