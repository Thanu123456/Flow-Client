import React, { useState, useEffect, useCallback } from "react";
import { Space, Tag, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { PageLayout } from "../common/PageLayout";
import { CommonButton } from "../common/Button";
import { CommonTable } from "../common/Table";
import { useCategoryStore } from "../../store/management/categoryStore";
import { useDebounce } from "../../hooks/ui/useDebounce";
import { stockService } from "../../services/inventory/stockService";
import type { StockListItem } from "../../types/entities/report.types";

const PAGE_SIZE = 50;

const OutOfStockPage: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
    const [items, setItems] = useState<StockListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const debouncedSearch = useDebounce(searchTerm, 300);
    const { allCategories, getAllCategories } = useCategoryStore();

    useEffect(() => { getAllCategories(); }, [getAllCategories]);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const data = await stockService.getOutOfStock({
                search: debouncedSearch || undefined,
                category_id: categoryId,
            });
            setItems(data);
        } catch {
            message.error("Failed to load out-of-stock products");
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, categoryId]);

    useEffect(() => { setPage(1); fetchItems(); }, [fetchItems]);

    const handleRefresh = () => {
        setSearchTerm("");
        setCategoryId(undefined);
    };

    const columns = [
        {
            title: "Product",
            key: "product",
            render: (record: StockListItem) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{record.product_name}</div>
                    {record.variation_type && <div style={{ fontSize: 12, color: "#8c8c8c" }}>{record.variation_type}</div>}
                    {record.sku && <div style={{ fontSize: 12, color: "#8c8c8c" }}>SKU: {record.sku}</div>}
                </div>
            ),
        },
        { title: "Category", dataIndex: "category", key: "category" },
        { title: "Brand", dataIndex: "brand", key: "brand" },
        {
            title: "Current Stock",
            key: "stock",
            render: (record: StockListItem) => (
                <span style={{ fontWeight: 600, color: "#cf1322" }}>
                    {record.stock} {record.unit}
                </span>
            ),
        },
        {
            title: "Status",
            key: "status",
            render: () => <Tag color="red">Out of Stock</Tag>,
        },
    ];

    return (
        <PageLayout
            title="Out of Stock Products"
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
            searchConfig={{
                placeholder: "Search products...",
                value: searchTerm,
                onChange: setSearchTerm,
            }}
            filterConfig={[
                {
                    placeholder: "Filter By Category",
                    value: categoryId,
                    onChange: setCategoryId,
                    options: allCategories.map((c) => ({ label: c.name, value: c.id })),
                },
            ]}
            actions={
                <Space>
                    <CommonButton icon={<ReloadOutlined style={{ color: "blue" }} />} onClick={handleRefresh}>
                        Refresh
                    </CommonButton>
                </Space>
            }
        >
            <CommonTable<StockListItem>
                columns={columns as any}
                dataSource={items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
                rowKey={(record) => `${record.product_id}-${record.variation_type ?? ""}`}
                loading={loading}
                pagination={{
                    page,
                    limit: PAGE_SIZE,
                    total: items.length,
                    totalPages: Math.max(1, Math.ceil(items.length / PAGE_SIZE)),
                }}
                onPageChange={(p) => setPage(p)}
            />
        </PageLayout>
    );
};

export default OutOfStockPage;
