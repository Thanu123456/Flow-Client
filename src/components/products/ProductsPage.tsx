import React, { useState, useEffect, useCallback } from "react";
import { Space, message, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { PlusOutlined, ImportOutlined, ReloadOutlined, FilePdfOutlined, FileExcelOutlined, DownOutlined, DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import ProductsTable from "./ProductsTable";
import ImportProducts from "./ImportProducts";
import { PageLayout } from "../common/PageLayout";
import { CommonButton } from "../common/Button";
import { useProductStore } from "../../store/inventory/productStore";
import { useDebounce } from "../../hooks/ui/useDebounce";
import { productService } from "../../services/inventory/productService";
import type { ProductType, ProductStatus } from "../../types/entities/product.types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ProductsPageProps {
    onHeaderCollapseChange?: (collapsed: boolean) => void;
    sidebarOpen?: boolean;
    setSidebarOpen?: (open: boolean) => void;
}

const ProductsPage: React.FC<ProductsPageProps> = ({
    onHeaderCollapseChange,
    sidebarOpen: _sidebarOpen = false,
    setSidebarOpen: _setSidebarOpen,
}) => {
    const navigate = useNavigate();
    const [importModalVisible, setImportModalVisible] = useState(false);

    // Layout states
    const [collapsed, setCollapsed] = useState(false);

    const handleCollapsedChange = (newCollapsed: boolean) => {
        setCollapsed(newCollapsed);
        onHeaderCollapseChange?.(newCollapsed);
    };

    // Filter/sort state, seeded from the URL on first render so a reload or
    // the browser back/forward buttons land back on the same view instead of
    // resetting to an empty list. Kept in sync back to the URL below.
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(() => searchParams.get("search") || "");
    const [typeFilter, setTypeFilter] = useState<ProductType | undefined>(
        () => (searchParams.get("type") as ProductType) || undefined
    );
    const [statusFilter, setStatusFilter] = useState<ProductStatus | undefined>(
        () => (searchParams.get("status") as ProductStatus) || undefined
    );
    const [sortBy, setSortBy] = useState<string | undefined>(() => searchParams.get("sort_by") || undefined);
    const [sortDir, setSortDir] = useState<"asc" | "desc" | undefined>(
        () => (searchParams.get("sort_dir") as "asc" | "desc") || undefined
    );

    // The URL's ?page= is only honored for the very first fetch (so a
    // reloaded/bookmarked/back-navigated URL lands on the same page); any
    // later change to search/type/status/sort resets to page 1 as before.
    const initialPageRef = React.useRef(parseInt(searchParams.get("page") || "1", 10) || 1);
    const isFirstFetchRef = React.useRef(true);

    const debouncedSearch = useDebounce(searchTerm, 300);
    const { products, loading, pagination, getProducts } = useProductStore();

    const fetchProducts = useCallback(async (page = 1, limit = 50) => {
        await getProducts({
            page,
            limit,
            search: debouncedSearch || undefined,
            productType: typeFilter,
            status: statusFilter,
            sortBy,
            sortDir,
        });
    }, [getProducts, debouncedSearch, typeFilter, statusFilter, sortBy, sortDir]);

    useEffect(() => {
        const page = isFirstFetchRef.current ? initialPageRef.current : 1;
        isFirstFetchRef.current = false;
        fetchProducts(page, pagination.limit || 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, typeFilter, statusFilter, sortBy, sortDir, fetchProducts]);

    // Mirror the current filters/sort/page into the URL (replace, not push,
    // so every keystroke/page click doesn't pile up in browser history).
    useEffect(() => {
        const next = new URLSearchParams();
        if (debouncedSearch) next.set("search", debouncedSearch);
        if (typeFilter) next.set("type", typeFilter);
        if (statusFilter) next.set("status", statusFilter);
        if (sortBy) next.set("sort_by", sortBy);
        if (sortDir) next.set("sort_dir", sortDir);
        if (pagination.page > 1) next.set("page", String(pagination.page));
        setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, typeFilter, statusFilter, sortBy, sortDir, pagination.page]);

    const handlePageChange = (page: number, pageSize: number) => {
        fetchProducts(page, pageSize);
    };

    const handleSortChange = (nextSortBy?: string, nextSortDir?: "asc" | "desc") => {
        setSortBy(nextSortBy);
        setSortDir(nextSortDir);
    };

    const [refreshing, setRefreshing] = useState(false);
    const handleRefresh = async () => {
        setSearchTerm("");
        setTypeFilter(undefined);
        setStatusFilter(undefined);
        setSortBy(undefined);
        setSortDir(undefined);
        setRefreshing(true);
        try {
            // Fetch with explicitly cleared filters — fetchProducts would
            // still close over the previous search/filter values here.
            await getProducts({ page: 1, limit: pagination.limit || 50 });
        } catch {
            // error state handled in store
        } finally {
            setRefreshing(false);
        }
    };

    const [exportingPdf, setExportingPdf] = useState(false);
    const [exportingExcel, setExportingExcel] = useState(false);

    // Both exports use the filters currently applied to the table (search/type/
    // status/sort), not just the loaded page, so the file matches what the
    // user is actually looking at.
    const currentFilters = {
        search: debouncedSearch || undefined,
        productType: typeFilter,
        status: statusFilter,
        sortBy,
        sortDir,
    };

    const handleExportPDF = async () => {
        setExportingPdf(true);
        try {
            const products = await productService.getAllForExport(currentFilters);
            if (products.length === 0) {
                message.warning("No products match the current filters");
                return;
            }
            const doc = new jsPDF({ orientation: "landscape" });
            doc.setFontSize(14);
            doc.text("Products", 14, 14);
            doc.setFontSize(9);
            doc.text(`Generated ${new Date().toLocaleString()} — ${products.length} product(s)`, 14, 20);

            autoTable(doc, {
                startY: 26,
                head: [["Name", "SKU", "Category", "Type", "Retail Price", "Cost Price", "Stock", "Status"]],
                body: products.map((p) => [
                    p.name,
                    p.sku || "-",
                    p.categoryName || "-",
                    p.productType === "variable" ? `Variable (${p.variationCount || 0})` : "Single",
                    `Rs. ${(p.retailPrice ?? 0).toFixed(2)}`,
                    `Rs. ${(p.costPrice ?? 0).toFixed(2)}`,
                    `${p.currentStock ?? 0} ${p.unitShortName || ""}`.trim(),
                    p.status === "active" ? "Active" : "Inactive",
                ]),
                styles: { fontSize: 8 },
                headStyles: { fillColor: [24, 144, 255] },
            });

            doc.save(`products_export_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Failed to export PDF");
        } finally {
            setExportingPdf(false);
        }
    };

    const handleExportExcel = async () => {
        setExportingExcel(true);
        try {
            const blob = await productService.exportExcel(currentFilters);
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `products_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Failed to export Excel");
        } finally {
            setExportingExcel(false);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const blob = await productService.downloadTemplate();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "product_import_template.xlsx";
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Failed to download template");
        }
    };

    const uploadMenuItems: MenuProps["items"] = [
        {
            key: "download-template",
            icon: <DownloadOutlined />,
            label: "Download Excel Template",
            onClick: handleDownloadTemplate,
        },
        {
            key: "upload-file",
            icon: <UploadOutlined />,
            label: "Upload Excel File",
            onClick: () => setImportModalVisible(true),
        },
    ];

    return (
        <>
            <PageLayout
                title="Manage Products"
                collapsed={collapsed}
                onCollapsedChange={handleCollapsedChange}
                searchConfig={{
                    placeholder: "Search Products...",
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
                        placeholder: "Filter By Status",
                        value: statusFilter,
                        onChange: setStatusFilter,
                        options: [
                            { label: "Active", value: "active" },
                            { label: "Inactive", value: "inactive" },
                        ],
                    },
                ]}
                actions={
                    <Space>
                        <Dropdown menu={{ items: uploadMenuItems }} trigger={["click"]}>
                            <CommonButton icon={<ImportOutlined />}>
                                Upload <DownOutlined />
                            </CommonButton>
                        </Dropdown>
                        <CommonButton
                            icon={<FilePdfOutlined style={{ color: "#FF0000" }} />}
                            onClick={handleExportPDF}
                            loading={exportingPdf}
                            tooltip="Download PDF"
                        >
                            PDF
                        </CommonButton>
                        <CommonButton
                            icon={<FileExcelOutlined style={{ color: "#107C41" }} />}
                            onClick={handleExportExcel}
                            loading={exportingExcel}
                            tooltip="Download Excel"
                        >
                            Excel
                        </CommonButton>
                        <CommonButton
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate("/products/add")}
                        >
                            Add Product
                        </CommonButton>
                        <CommonButton
                            icon={<ReloadOutlined style={{ color: "blue" }} />}
                            onClick={handleRefresh}
                            loading={refreshing}
                        >
                            Refresh
                        </CommonButton>
                    </Space>
                }
            >
                <ProductsTable
                    products={products}
                    loading={loading}
                    pagination={{
                        page: pagination.page,
                        limit: pagination.limit,
                        total: pagination.total,
                        totalPages: pagination.totalPages
                    }}
                    onPageChange={handlePageChange}
                    sortBy={sortBy}
                    sortDir={sortDir}
                    onSortChange={handleSortChange}
                    refreshData={() => fetchProducts(pagination.page, pagination.limit)}
                />
            </PageLayout>

            <ImportProducts
                visible={importModalVisible}
                onClose={() => setImportModalVisible(false)}
                onSuccess={() => {
                    fetchProducts(pagination.page, pagination.limit);
                }}
            />
        </>
    );
};

export default ProductsPage;

