import React, { useState } from "react";
import { Space, Tooltip, Image, Popconfirm, message, Modal, Dropdown, Button, Select, Radio, InputNumber } from "antd";
import type { MenuProps } from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import type { SorterResult, FilterValue } from "antd/es/table/interface";
import {
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    WarningOutlined,
    DownOutlined,
    CheckCircleOutlined,
    StopOutlined,
    TagsOutlined,
    DollarOutlined,
} from "@ant-design/icons";
import { useProductStore } from "../../store/inventory/productStore";
import type { Product } from "../../types/entities/product.types";
import { useNavigate } from "react-router-dom";
import ProductDetailsModal from "./ProductDetailsModal";
import { CommonTable } from "../common/Table";
import { useTableSelection } from "../../hooks/useTableSelection";
import { PLACEHOLDER_IMAGE } from "../../utils/constants/placeholderImage";
import { useLookupsBundle } from "../../hooks/data/useLookupsBundle";
import { useCategoryStore } from "../../store/management/categoryStore";

interface ProductsTableProps {
    products: Product[];
    loading: boolean;
    pagination: { page: number; limit: number; total: number; totalPages: number };
    onPageChange: (page: number, pageSize: number) => void;
    refreshData: () => void;
    sortBy?: string;
    sortDir?: "asc" | "desc";
    onSortChange: (sortBy?: string, sortDir?: "asc" | "desc") => void;
}

// Maps a sortable column's `key` to the backend's whitelisted sort_by value
// (see productSortExpressions in product_service.go) — kept 1:1 so a column
// key IS the backend key, but named explicitly here so that isn't implicit.
const SORTABLE_KEYS = new Set(["name", "cost_price", "retail_price", "current_stock"]);

const antdOrderToDir = (order?: "ascend" | "descend"): "asc" | "desc" | undefined =>
    order === "ascend" ? "asc" : order === "descend" ? "desc" : undefined;

const dirToAntdOrder = (dir?: "asc" | "desc"): "ascend" | "descend" | undefined =>
    dir === "asc" ? "ascend" : dir === "desc" ? "descend" : undefined;

const ProductsTable: React.FC<ProductsTableProps> = ({
    products,
    loading,
    pagination,
    onPageChange,
    refreshData,
    sortBy,
    sortDir,
    onSortChange,
}) => {
    const navigate = useNavigate();
    const { deleteProduct, updateProduct, getProductById } = useProductStore();
    const { selectedRowKeys, rowSelection, clearSelection } = useTableSelection<Product>();
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Bulk actions: category and price adjustment need their own small modals;
    // activate/deactivate run straight from the dropdown.
    useLookupsBundle(["categories"]);
    const allCategories = useCategoryStore((s) => s.allCategories);
    const [bulkApplying, setBulkApplying] = useState(false);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [bulkCategoryId, setBulkCategoryId] = useState<string | undefined>();
    const [priceModalOpen, setPriceModalOpen] = useState(false);
    const [priceAdjustDirection, setPriceAdjustDirection] = useState<"increase" | "decrease">("increase");
    const [priceAdjustType, setPriceAdjustType] = useState<"percentage" | "fixed">("percentage");
    const [priceAdjustValue, setPriceAdjustValue] = useState<number>(0);

    // Shared runner for every bulk action: no bulk endpoint exists, so each
    // selected id goes through the existing single-product update, in
    // parallel, tolerating partial failure. buildPayload returning null skips
    // that id (e.g. a variable product that a price adjustment doesn't apply
    // to) without counting it as a failure.
    const runBulkUpdate = async (
        ids: string[],
        buildPayload: (id: string) => Record<string, unknown> | null,
        actionLabel: string
    ) => {
        const applicable = ids
            .map((id) => ({ id, payload: buildPayload(id) }))
            .filter((x): x is { id: string; payload: Record<string, unknown> } => x.payload !== null);
        const skipped = ids.length - applicable.length;

        if (applicable.length === 0) {
            message.warning("No selected products are eligible for this action");
            return;
        }

        setBulkApplying(true);
        try {
            const results = await Promise.allSettled(
                applicable.map(({ id, payload }) => updateProduct(id, payload))
            );
            const failed = results.filter((r) => r.status === "rejected").length;
            const success = applicable.length - failed;

            if (success > 0) message.success(`${actionLabel}: ${success} product(s) updated`);
            if (skipped > 0) message.warning(`${skipped} product(s) skipped (not applicable)`);
            if (failed > 0) message.error(`Failed to update ${failed} product(s)`);
            clearSelection();
            refreshData();
        } finally {
            setBulkApplying(false);
        }
    };

    const handleBulkActivate = (active: boolean) => {
        const ids = selectedRowKeys.map((k) => String(k));
        runBulkUpdate(ids, () => ({ is_active: active }), active ? "Activated" : "Deactivated");
    };

    const handleBulkCategoryApply = async () => {
        if (!bulkCategoryId) {
            message.warning("Select a category first");
            return;
        }
        const ids = selectedRowKeys.map((k) => String(k));
        await runBulkUpdate(ids, () => ({ category_id: bulkCategoryId }), "Category updated");
        setCategoryModalOpen(false);
        setBulkCategoryId(undefined);
    };

    const handleBulkPriceApply = async () => {
        if (!priceAdjustValue || priceAdjustValue <= 0) {
            message.warning("Enter an adjustment amount greater than 0");
            return;
        }
        const ids = selectedRowKeys.map((k) => String(k));
        await runBulkUpdate(
            ids,
            (id) => {
                // Only single products carry their own retail_price — a
                // variable product's price lives per-variation, so this can't
                // apply there without opening each variation individually.
                const product = products.find((p) => p.id === id);
                if (!product || product.productType !== "single") return null;

                const current = product.retailPrice || 0;
                let next: number;
                if (priceAdjustType === "percentage") {
                    const factor = priceAdjustDirection === "increase"
                        ? 1 + priceAdjustValue / 100
                        : 1 - priceAdjustValue / 100;
                    next = current * factor;
                } else {
                    next = priceAdjustDirection === "increase"
                        ? current + priceAdjustValue
                        : current - priceAdjustValue;
                }
                return { retail_price: Math.max(0, Math.round(next * 100) / 100) };
            },
            "Retail price adjusted"
        );
        setPriceModalOpen(false);
        setPriceAdjustValue(0);
    };

    const bulkActionsMenu: MenuProps["items"] = [
        { key: "activate", icon: <CheckCircleOutlined />, label: "Activate", onClick: () => handleBulkActivate(true) },
        { key: "deactivate", icon: <StopOutlined />, label: "Deactivate", onClick: () => handleBulkActivate(false) },
        { type: "divider" },
        { key: "category", icon: <TagsOutlined />, label: "Change Category…", onClick: () => setCategoryModalOpen(true) },
        { key: "price", icon: <DollarOutlined />, label: "Adjust Retail Price…", onClick: () => setPriceModalOpen(true) },
    ];

    const deactivateInstead = async (id: string) => {
        try {
            await updateProduct(id, { is_active: false });
            message.success("Product deactivated — hidden from POS and the catalog, stock kept intact");
            refreshData();
        } catch {
            message.error("Failed to deactivate product");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteProduct(id);
            message.success("Product deleted successfully");
            refreshData();
        } catch (error: any) {
            const appError = error?.response?.data?.error;
            // Backend blocks deleting a product that still has stock (PRD_007) —
            // offer the safe alternative instead of just showing a dead-end error.
            if (appError?.code === "PRD_007") {
                Modal.confirm({
                    title: "This product still has stock",
                    icon: <WarningOutlined style={{ color: "#faad14" }} />,
                    content: appError.message,
                    okText: "Deactivate Instead",
                    cancelText: "Cancel",
                    onOk: () => deactivateInstead(id),
                });
                return;
            }
            message.error(appError?.message || "Failed to delete product");
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
                // No bulk-delete endpoint exists yet, so delete each selected product
                // individually and tolerate partial failure (e.g. one product still
                // referenced elsewhere) rather than reporting a fake blanket success.
                const ids = selectedRowKeys.map((k) => String(k));
                const results = await Promise.allSettled(ids.map((id) => deleteProduct(id)));
                const rejected = results.filter(
                    (r): r is PromiseRejectedResult => r.status === "rejected"
                );
                const stockBlockedCount = rejected.filter(
                    (r) => r.reason?.response?.data?.error?.code === "PRD_007"
                ).length;
                const otherFailedCount = rejected.length - stockBlockedCount;
                const successCount = ids.length - rejected.length;

                if (successCount > 0) {
                    message.success(`Deleted ${successCount} product(s)`);
                }
                if (stockBlockedCount > 0) {
                    message.warning(
                        `${stockBlockedCount} product(s) still have stock and were not deleted — deactivate them individually instead`
                    );
                }
                if (otherFailedCount > 0) {
                    message.error(`Failed to delete ${otherFailedCount} product(s)`);
                }
                clearSelection();
                refreshData();
            },
        });
    };

    // AntD's Table onChange fires on pagination clicks too (not just sort), but
    // with the same sorter value each time — calling onSortChange with an
    // unchanged value is a no-op in the parent's state, so this never causes
    // a duplicate fetch alongside onPageChange.
    const handleTableChange = (
        _pagination: TablePaginationConfig,
        _filters: Record<string, FilterValue | null>,
        sorter: SorterResult<Product> | SorterResult<Product>[]
    ) => {
        const s = Array.isArray(sorter) ? sorter[0] : sorter;
        const key = typeof s?.columnKey === "string" ? s.columnKey : undefined;
        if (key && SORTABLE_KEYS.has(key) && s?.order) {
            onSortChange(key, antdOrderToDir(s.order));
        } else {
            onSortChange(undefined, undefined);
        }
    };

    const columns = [
        {
            title: "Product",
            key: "name",
            sorter: true,
            sortOrder: sortBy === "name" ? dirToAntdOrder(sortDir) : null,
            render: (record: Product) => (
                <Space>
                    <Image
                        src={record.imageUrl || PLACEHOLDER_IMAGE}
                        fallback={PLACEHOLDER_IMAGE}
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
            key: "retail_price",
            sorter: true,
            sortOrder: sortBy === "retail_price" ? dirToAntdOrder(sortDir) : null,
            render: (record: Product) => (
                <div>
                    <div>Retail: <span style={{ fontWeight: 600 }}>Rs. {record.retailPrice?.toFixed(2) || "0.00"}</span></div>
                    <div style={{ fontSize: 12, color: "#8c8c8c" }}>Cost: Rs. {record.costPrice?.toFixed(2) || "0.00"}</div>
                </div>
            ),
        },
        {
            title: "Stock",
            key: "current_stock",
            sorter: true,
            sortOrder: sortBy === "current_stock" ? dirToAntdOrder(sortDir) : null,
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
                extraBulkActions={
                    <Dropdown menu={{ items: bulkActionsMenu }} trigger={["click"]}>
                        <Button
                            size="middle"
                            loading={bulkApplying}
                            className="rounded-xl font-bold"
                        >
                            Bulk Actions <DownOutlined />
                        </Button>
                    </Dropdown>
                }
                pagination={{
                    page: pagination.page,
                    limit: pagination.limit,
                    total: pagination.total,
                    totalPages: Math.ceil(pagination.total / (pagination.limit || 10)),
                }}
                onPageChange={onPageChange}
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

            <Modal
                title="Change Category"
                open={categoryModalOpen}
                onCancel={() => setCategoryModalOpen(false)}
                onOk={handleBulkCategoryApply}
                okText="Apply"
                confirmLoading={bulkApplying}
            >
                <p className="text-slate-500 text-sm mb-3">
                    Set the category for {selectedRowKeys.length} selected product(s).
                </p>
                <Select
                    placeholder="Select category"
                    style={{ width: "100%" }}
                    value={bulkCategoryId}
                    onChange={setBulkCategoryId}
                    showSearch
                    optionFilterProp="children"
                >
                    {allCategories.map((c) => (
                        <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                    ))}
                </Select>
            </Modal>

            <Modal
                title="Adjust Retail Price"
                open={priceModalOpen}
                onCancel={() => setPriceModalOpen(false)}
                onOk={handleBulkPriceApply}
                okText="Apply"
                confirmLoading={bulkApplying}
            >
                <p className="text-slate-500 text-sm mb-3">
                    Adjusts retail price for the single-item products in this
                    selection (variable products aren't affected — edit their
                    variations individually). Wholesale and selling price
                    aren't changed.
                </p>
                <Space direction="vertical" style={{ width: "100%" }} size="middle">
                    <Radio.Group
                        value={priceAdjustDirection}
                        onChange={(e) => setPriceAdjustDirection(e.target.value)}
                    >
                        <Radio.Button value="increase">Increase</Radio.Button>
                        <Radio.Button value="decrease">Decrease</Radio.Button>
                    </Radio.Group>
                    <Radio.Group
                        value={priceAdjustType}
                        onChange={(e) => setPriceAdjustType(e.target.value)}
                    >
                        <Radio.Button value="percentage">Percentage (%)</Radio.Button>
                        <Radio.Button value="fixed">Fixed Amount (Rs.)</Radio.Button>
                    </Radio.Group>
                    <InputNumber
                        style={{ width: "100%" }}
                        min={0}
                        value={priceAdjustValue}
                        onChange={(v) => setPriceAdjustValue(Number(v) || 0)}
                        placeholder={priceAdjustType === "percentage" ? "e.g. 10" : "e.g. 50.00"}
                    />
                </Space>
            </Modal>
        </>
    );
};

export default ProductsTable;
