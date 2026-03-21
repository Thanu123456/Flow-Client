import React, { useState, useEffect, useCallback } from "react";
import { Space, Tag, Image } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { PageLayout } from "../common/PageLayout";
import { CommonButton } from "../common/Button";
import { CommonTable } from "../common/Table";
import { useProductStore } from "../../store/inventory/productStore";
import { useDebounce } from "../../hooks/ui/useDebounce";
import type { Product, ProductType } from "../../types/entities/product.types";

type StockFilter = "all" | "in_stock" | "low_stock" | "out_of_stock";

const stockStatusTag = (product: Product) => {
    const qty = product.currentStock ?? 0;
    const alert = product.quantityAlert ?? 0;
    if (qty === 0) return <Tag color="red">Out of Stock</Tag>;
    if (qty <= alert) return <Tag color="orange">Low Stock</Tag>;
    return <Tag color="green">In Stock</Tag>;
};

const StockPage: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<ProductType | undefined>(undefined);
    const [stockFilter, setStockFilter] = useState<StockFilter>("all");

    const debouncedSearch = useDebounce(searchTerm, 300);
    const { products, loading, pagination, getProducts } = useProductStore();

    const fetchProducts = useCallback(async (page = 1, limit = 50) => {
        await getProducts({
            page,
            limit,
            search: debouncedSearch || undefined,
            productType: typeFilter,
        });
    }, [getProducts, debouncedSearch, typeFilter]);

    useEffect(() => {
        fetchProducts(1, pagination.limit || 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, typeFilter, fetchProducts]);

    const handlePageChange = (page: number, pageSize: number) => {
        fetchProducts(page, pageSize);
    };

    const handleRefresh = () => {
        setSearchTerm("");
        setTypeFilter(undefined);
        setStockFilter("all");
        fetchProducts(1, pagination.limit || 50);
    };

    const filteredProducts = products.filter((p) => {
        if (stockFilter === "out_of_stock") return (p.currentStock ?? 0) === 0;
        if (stockFilter === "low_stock") {
            const qty = p.currentStock ?? 0;
            const alert = p.quantityAlert ?? 0;
            return qty > 0 && qty <= alert;
        }
        if (stockFilter === "in_stock") {
            const qty = p.currentStock ?? 0;
            const alert = p.quantityAlert ?? 0;
            return qty > alert;
        }
        return true;
    });

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
                        {record.sku && <div style={{ fontSize: 12, color: "#8c8c8c" }}>SKU: {record.sku}</div>}
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
            title: "Warehouse",
            dataIndex: "warehouseName",
            key: "warehouseName",
            render: (val: string) => val || <span style={{ color: "#bfbfbf" }}>—</span>,
        },
        {
            title: "Current Stock",
            key: "currentStock",
            render: (record: Product) => (
                <span style={{
                    fontWeight: 600,
                    color: (record.currentStock ?? 0) === 0
                        ? "#cf1322"
                        : (record.currentStock ?? 0) <= (record.quantityAlert ?? 0)
                            ? "#d46b08"
                            : "inherit",
                }}>
                    {record.currentStock ?? 0} {record.unitShortName}
                </span>
            ),
        },
        {
            title: "Alert Level",
            key: "quantityAlert",
            render: (record: Product) => (
                <span style={{ color: "#8c8c8c" }}>
                    {record.quantityAlert ?? 0} {record.unitShortName}
                </span>
            ),
        },
        {
            title: "Stock Status",
            key: "stockStatus",
            render: (record: Product) => stockStatusTag(record),
        },
        {
            title: "Type",
            dataIndex: "productType",
            key: "productType",
            render: (type: string) => (
                <span className={`px-3 py-1 rounded-lg text-sm border ${
                    type === "variable"
                        ? "border-purple-500 text-purple-500 bg-purple-50/70"
                        : "border-blue-500 text-blue-500 bg-blue-50/70"
                }`}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                </span>
            ),
        },
    ];

    return (
        <PageLayout
            title="Inventory Stock"
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
            searchConfig={{
                placeholder: "Search products...",
                value: searchTerm,
                onChange: setSearchTerm,
            }}
            filterConfig={[
                {
                    placeholder: "Filter By Type",
                    value: typeFilter,
                    onChange: setTypeFilter,
                    options: [
                        { label: "Single", value: "single" },
                        { label: "Variable", value: "variable" },
                    ],
                },
                {
                    placeholder: "Filter By Stock",
                    value: stockFilter === "all" ? undefined : stockFilter,
                    onChange: (val: StockFilter | undefined) => setStockFilter(val ?? "all"),
                    options: [
                        { label: "In Stock", value: "in_stock" },
                        { label: "Low Stock", value: "low_stock" },
                        { label: "Out of Stock", value: "out_of_stock" },
                    ],
                },
            ]}
            actions={
                <Space>
                    <CommonButton
                        icon={<ReloadOutlined style={{ color: "blue" }} />}
                        onClick={handleRefresh}
                    >
                        Refresh
                    </CommonButton>
                </Space>
            }
        >
            <CommonTable<Product>
                columns={columns as any}
                dataSource={filteredProducts}
                rowKey="id"
                loading={loading}
                pagination={{
                    page: pagination.page,
                    limit: pagination.limit,
                    total: filteredProducts.length,
                    totalPages: Math.ceil(filteredProducts.length / (pagination.limit || 50)),
                }}
                onPageChange={handlePageChange}
            />
        </PageLayout>
    );
};

export default StockPage;
