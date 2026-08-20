import React, { useState, useEffect, useCallback } from "react";
import { Space, Tag, message, Select } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { PageLayout } from "../common/PageLayout";
import { CommonButton } from "../common/Button";
import { CommonTable } from "../common/Table";
import { expiredProductsService } from "../../services/inventory/expiredProductsService";
import type { BatchExportItem } from "../../types/entities/report.types";

const PAGE_SIZE = 50;

const WINDOW_OPTIONS = [
    { label: "Already Expired", value: 0 },
    { label: "Next 7 Days", value: 7 },
    { label: "Next 30 Days", value: 30 },
    { label: "Next 90 Days", value: 90 },
];

const expiryTag = (expiryDate?: string) => {
    if (!expiryDate) return <Tag>—</Tag>;
    const days = dayjs(expiryDate).startOf("day").diff(dayjs().startOf("day"), "day");
    if (days < 0) return <Tag color="red">Expired {Math.abs(days)}d ago</Tag>;
    if (days === 0) return <Tag color="red">Expires Today</Tag>;
    if (days <= 7) return <Tag color="orange">Expires in {days}d</Tag>;
    return <Tag color="gold">Expires in {days}d</Tag>;
};

const ExpiredProductsPage: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [withinDays, setWithinDays] = useState<number>(30);
    const [items, setItems] = useState<BatchExportItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const data = await expiredProductsService.getExpiring({ days: withinDays });
            setItems(data);
        } catch {
            message.error("Failed to load expiring products");
        } finally {
            setLoading(false);
        }
    }, [withinDays]);

    useEffect(() => { setPage(1); fetchItems(); }, [fetchItems]);

    const columns = [
        {
            title: "Product",
            key: "product",
            render: (record: BatchExportItem) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{record.item_name}</div>
                    <div style={{ fontSize: 12, color: "#8c8c8c" }}>Batch: {record.batch_id}</div>
                </div>
            ),
        },
        { title: "Category", dataIndex: "category", key: "category" },
        {
            title: "On Hand",
            key: "on_hand_qty",
            render: (record: BatchExportItem) => record.on_hand_qty,
        },
        {
            title: "Received",
            key: "received_date",
            render: (record: BatchExportItem) => record.received_date ? dayjs(record.received_date).format("YYYY-MM-DD") : "—",
        },
        {
            title: "Expiry Date",
            key: "expiry_date",
            render: (record: BatchExportItem) => record.expiry_date ? dayjs(record.expiry_date).format("YYYY-MM-DD") : "—",
        },
        {
            title: "Status",
            key: "expiry_status",
            render: (record: BatchExportItem) => expiryTag(record.expiry_date),
        },
    ];

    return (
        <PageLayout
            title="Expired & Expiring Products"
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
            actions={
                <Space>
                    <Select
                        value={withinDays}
                        onChange={setWithinDays}
                        options={WINDOW_OPTIONS}
                        style={{ width: 180 }}
                    />
                    <CommonButton icon={<ReloadOutlined style={{ color: "blue" }} />} onClick={fetchItems}>
                        Refresh
                    </CommonButton>
                </Space>
            }
        >
            <CommonTable<BatchExportItem>
                columns={columns as any}
                dataSource={items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
                rowKey={(record) => `${record.batch_id}-${record.item_name}`}
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

export default ExpiredProductsPage;
