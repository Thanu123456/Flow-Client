import React, { useState } from "react";
import { Button, Card, Space, Breadcrumb, Input } from "antd";
import { PlusOutlined, SearchOutlined, ExportOutlined, ImportOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ProductsTable from "./ProductsTable";
import ImportProducts from "./ImportProducts";

const ProductsPage: React.FC = () => {
    const navigate = useNavigate();
    const [importModalVisible, setImportModalVisible] = useState(false);
    const [searchText, setSearchText] = useState("");

    const handleExport = () => {
        // Implement export logic here if needed
        console.log("Exporting products...");
    };

    return (
        <div style={{ padding: "24px" }}>
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 style={{ fontSize: "24px", margin: 0 }}>Products</h1>
                    <Breadcrumb
                        items={[
                            { title: "Inventory" },
                            { title: "Products" },
                        ]}
                    />
                </div>
                <Space>
                    <Button
                        icon={<ImportOutlined />}
                        onClick={() => setImportModalVisible(true)}
                    >
                        Import
                    </Button>
                    <Button
                        icon={<ExportOutlined />}
                        onClick={handleExport}
                    >
                        Export
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate("/products/add")}
                    >
                        Add Product
                    </Button>
                </Space>
            </div>

            <Card styles={{ body: { padding: 0 } }}>
                <div style={{ padding: "16px", borderBottom: "1px solid #f0f0f0" }}>
                    <Input
                        placeholder="Search products..."
                        prefix={<SearchOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                        style={{ width: 300 }}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
                <ProductsTable />
            </Card>

            <ImportProducts
                visible={importModalVisible}
                onClose={() => setImportModalVisible(false)}
                onSuccess={() => {
                    // Refresh products table logic if needed
                }}
            />
        </div>
    );
};

export default ProductsPage;

