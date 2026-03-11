import React, { useState, useEffect, useCallback } from "react";
import { Space, message } from "antd";
import { PlusOutlined, ImportOutlined, ReloadOutlined, FilePdfOutlined, FileExcelOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ProductsTable from "./ProductsTable";
import ImportProducts from "./ImportProducts";
import { PageLayout } from "../common/PageLayout";
import { CommonButton } from "../common/Button";
import { useProductStore } from "../../store/inventory/productStore";
import { useDebounce } from "../../hooks/ui/useDebounce";
import type { ProductType, ProductStatus } from "../../types/entities/product.types";

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

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<ProductType | undefined>(undefined);
    const [statusFilter, setStatusFilter] = useState<ProductStatus | undefined>(undefined);

    const debouncedSearch = useDebounce(searchTerm, 300);
    const { products, loading, pagination, getProducts } = useProductStore();

    const fetchProducts = useCallback(async (page = 1, limit = 10) => {
        await getProducts({
            page,
            limit,
            search: debouncedSearch || undefined,
            productType: typeFilter,
            status: statusFilter,
        });
    }, [getProducts, debouncedSearch, typeFilter, statusFilter]);

    useEffect(() => {
        fetchProducts(1, pagination.limit || 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, typeFilter, statusFilter, fetchProducts]);

    const handlePageChange = (page: number, pageSize: number) => {
        fetchProducts(page, pageSize);
    };

    const handleRefresh = () => {
        setSearchTerm("");
        setTypeFilter(undefined);
        setStatusFilter(undefined);
        fetchProducts(1, pagination.limit);
    };

    const handleExportPDF = () => {
        message.info("Export to PDF coming soon");
    };

    const handleExportExcel = () => {
        message.info("Export to Excel coming soon");
    };

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
                        <CommonButton
                            icon={<ImportOutlined />}
                            onClick={() => setImportModalVisible(true)}
                        >
                            Import
                        </CommonButton>
                        <CommonButton
                            icon={<FilePdfOutlined style={{ color: "#FF0000" }} />}
                            onClick={handleExportPDF}
                            tooltip="Download PDF"
                        >
                            PDF
                        </CommonButton>
                        <CommonButton
                            icon={<FileExcelOutlined style={{ color: "#107C41" }} />}
                            onClick={handleExportExcel}
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

