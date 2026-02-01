import React from "react";
import { Button, Card, Space, Breadcrumb, Input } from "antd";
import { PlusOutlined, SearchOutlined, ExportOutlined, ImportOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ProductsTable from "./ProductsTable";

const ProductsPage: React.FC = () => {
    const navigate = useNavigate();

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
                    <Button icon={<ImportOutlined />}>Import</Button>
                    <Button icon={<ExportOutlined />}>Export</Button>
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
                    />
                </div>
                <ProductsTable />
            </Card>
        </div>
    );
};

export default ProductsPage;
