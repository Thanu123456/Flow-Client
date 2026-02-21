import React, { useState, useEffect } from "react";
import { Space, message } from "antd";
import { PlusOutlined, ReloadOutlined, FilePdfOutlined, FileExcelOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ProductsTable from "./ProductsTable";
import ImportProducts from "./ImportProducts";
import { PageLayout } from "../common/PageLayout";
import { CommonButton } from "../common/Button";
import { useDebounce } from "../../hooks/ui/useDebounce";
import { useProductStore } from "../../store/inventory/productStore";
import { productService } from "../../services/inventory/productService";
import type { ProductPaginationParams } from "../../types/entities/product.types";

const ProductsPage: React.FC = () => {
    const navigate = useNavigate();
    const [importModalVisible, setImportModalVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [collapsed, setCollapsed] = useState(false);
    const [paginationParams, setPaginationParams] = useState<ProductPaginationParams>({
        page: 1,
        limit: 10,
        search: "",
    });

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const { getProducts } = useProductStore();

    useEffect(() => {
        const params = {
            ...paginationParams,
            search: debouncedSearchTerm,
        };
        setPaginationParams(params);
        getProducts(params);
    }, [debouncedSearchTerm, getProducts]);

    const handleRefresh = () => getProducts(paginationParams);

    const handleExportPDF = async () => {
        try {
            const blob = await productService.exportToPDF(paginationParams);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "Products.pdf");
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            message.success("PDF exported successfully");
        } catch {
            message.error("Failed to export PDF");
        }
    };

    const handleExportExcel = async () => {
        try {
            const blob = await productService.exportToExcel(paginationParams);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "Products.xlsx");
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            message.success("Excel exported successfully");
        } catch {
            message.error("Failed to export Excel");
        }
    };

    return (
        <>
            <PageLayout
                title="Manage Products"
                collapsed={collapsed}
                onCollapsedChange={setCollapsed}
                searchConfig={{
                    placeholder: "Search products...",
                    value: searchTerm,
                    onChange: setSearchTerm,
                }}
                actions={
                    <Space>
                        <CommonButton
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate("/products/add")}
                        >
                            Add Product
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
                            icon={<ReloadOutlined style={{ color: "blue" }} />}
                            onClick={handleRefresh}
                        >
                            Refresh
                        </CommonButton>
                    </Space>
                }
            >
                <ProductsTable />
            </PageLayout>

            <ImportProducts
                visible={importModalVisible}
                onClose={() => setImportModalVisible(false)}
                onSuccess={handleRefresh}
            />
        </>
    );
};

export default ProductsPage;

