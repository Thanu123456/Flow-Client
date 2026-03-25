import React from "react";
import { Modal, Descriptions, Image, Table, Typography, Space, Row, Col, Tag } from "antd";
import { ShoppingOutlined, PicCenterOutlined, HistoryOutlined, TagsOutlined } from "@ant-design/icons";
import type { Product } from "../../types/entities/product.types";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface ProductDetailsModalProps {
    visible: boolean;
    product: Product | null;
    onClose: () => void;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ visible, product, onClose }) => {
    if (!product) return null;

    const variationColumns = [
        {
            title: "Variation",
            key: "units",
            render: (record: any) => record.options.map((o: any) => o.value).join(", "),
        },
        {
            title: "SKU",
            dataIndex: "sku",
            key: "sku",
            render: (sku: string) => <Text strong>{sku}</Text>
        },
        {
            title: "Barcode",
            dataIndex: "barcode",
            key: "barcode",
        },
        {
            title: "Retail Price",
            dataIndex: "retailPrice",
            key: "retailPrice",
            align: 'right' as const,
            render: (price: number) => <Text type="success" strong>Rs. {price?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>,
        },
        {
            title: "Stock",
            dataIndex: "currentStock",
            key: "currentStock",
            align: 'right' as const,
            render: (stock: number) => <Tag color={stock > (product.quantityAlert || 0) ? 'blue' : 'warning'}>{stock || 0} {product.unitShortName || ""}</Tag>
        }
    ];

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            width={900}
            style={{ top: 20 }}
            title={
                <div style={{
                    background: 'linear-gradient(90deg, #f0f5ff 0%, #ffffff 100%)',
                    padding: '16px 24px',
                    margin: '-20px -24px 0 -24px',
                    borderBottom: '1px solid #f0f0f0',
                    borderRadius: '8px 8px 0 0',
                }}>
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Space>
                                <div style={{
                                    background: '#e6f7ff',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#1890ff'
                                }}>
                                    <ShoppingOutlined style={{ fontSize: '20px' }} />
                                </div>
                                <Space direction="vertical" size={0}>
                                    <Title level={4} style={{ margin: 0 }}>Product Details</Title>
                                    <Text type="secondary" style={{ fontSize: '13px' }}>
                                        {product.name} | SKU: {product.sku || 'N/A'}
                                    </Text>
                                </Space>
                            </Space>
                        </Col>
                        <Col>
                            <Space>
                                <Tag color={product.status === 'active' ? 'success' : 'error'} style={{ borderRadius: '12px' }}>
                                    {product.status.toUpperCase()}
                                </Tag>
                                <Tag color="purple" style={{ borderRadius: '12px' }}>
                                    {product.productType.toUpperCase()}
                                </Tag>
                            </Space>
                        </Col>
                    </Row>
                </div>
            }
        >
            <div style={{ padding: '16px 0' }}>
                <Row gutter={24}>
                    <Col span={6}>
                        <Image
                            src={product.imageUrl || "https://via.placeholder.com/200"}
                            width="100%"
                            style={{ objectFit: "cover", borderRadius: 12, border: '1px solid #f0f0f0' }}
                        />
                        <div style={{ marginTop: 16 }}>
                            <Title level={5}>Description</Title>
                            <Text type="secondary">{product.description || "No description provided."}</Text>
                        </div>
                    </Col>
                    <Col span={18}>
                        <Space direction="vertical" size={24} style={{ width: '100%' }}>
                            <section>
                                <Title level={5}><Space><TagsOutlined /> Classification</Space></Title>
                                <Descriptions bordered size="small" column={2}>
                                    <Descriptions.Item label="Category">{product.categoryName}</Descriptions.Item>
                                    <Descriptions.Item label="Sub Category">{product.subcategoryName}</Descriptions.Item>
                                    <Descriptions.Item label="Brand">{product.brandName || "-"}</Descriptions.Item>
                                    <Descriptions.Item label="Unit">{product.unitName} ({product.unitShortName})</Descriptions.Item>
                                    <Descriptions.Item label="Warehouse">{product.warehouseName || "-"}</Descriptions.Item>
                                    <Descriptions.Item label="Warranty">{product.warrantyName || "-"}</Descriptions.Item>
                                </Descriptions>
                            </section>

                            {product.productType === "single" ? (
                                <section>
                                    <Title level={5}><Space><PicCenterOutlined /> Pricing & Stock</Space></Title>
                                    <Descriptions bordered size="small" column={2}>
                                        <Descriptions.Item label="Sku">{product.sku}</Descriptions.Item>
                                        <Descriptions.Item label="Barcode">{product.barcode || "-"}</Descriptions.Item>
                                        <Descriptions.Item label="Cost Price" labelStyle={{ fontWeight: 600 }}>
                                            Rs. {product.costPrice?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Retail Price" labelStyle={{ fontWeight: 600 }}>
                                            <Text type="success" strong>Rs. {product.retailPrice?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Wholesale" span={2}>Rs. {product.wholesalePrice?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Descriptions.Item>
                                        <Descriptions.Item label="Stock">
                                            <Tag color={product.currentStock > (product.quantityAlert || 0) ? 'green' : 'red'}>
                                                {product.currentStock} {product.unitShortName}
                                            </Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Alert Qty">{product.quantityAlert}</Descriptions.Item>
                                    </Descriptions>
                                </section>
                            ) : (
                                <section>
                                    <Title level={5}><Space><PicCenterOutlined /> Variations</Space></Title>
                                    <Table
                                        dataSource={product.variations}
                                        columns={variationColumns}
                                        rowKey="id"
                                        pagination={false}
                                        size="small"
                                        bordered
                                    />
                                </section>
                            )}

                            <section>
                                <Title level={5}><Space><HistoryOutlined /> System Info</Space></Title>
                                <Descriptions bordered size="small" column={2}>
                                    <Descriptions.Item label="Created At">
                                        {dayjs(product.createdAt).format("DD MMM YYYY, HH:mm")}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Updated At">
                                        {dayjs(product.updatedAt).format("DD MMM YYYY, HH:mm")}
                                    </Descriptions.Item>
                                </Descriptions>
                            </section>
                        </Space>
                    </Col>
                </Row>
            </div>
        </Modal>
    );
};

export default ProductDetailsModal;
