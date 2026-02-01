import React from "react";
import { Form, Input, InputNumber, Card, Button, Collapse, Space, Row, Col, Typography, Divider } from "antd";
import {
    DeleteOutlined,
    BarcodeOutlined,
    AlertOutlined,
    DollarOutlined,
    TagsOutlined
} from "@ant-design/icons";
import PricingFields from "./PricingFields";
import DiscountFields from "./DiscountFields";
import ImageUpload from "../common/Upload/ImageUpload";

const { Panel } = Collapse;
const { Text } = Typography;

interface VariationFieldsProps {
    name: number;
    remove: (index: number) => void;
    optionLabel?: string;
}

const VariationFields: React.FC<VariationFieldsProps> = ({ name, remove, optionLabel }) => {
    const prefix = ["variable_product", "variations", name];

    return (
        <Card
            size="small"
            title={
                <span className="flex items-center gap-2 text-slate-700 font-normal py-1">
                    <TagsOutlined className="text-purple-400" />
                    {optionLabel || `Variation #${name + 1}`}
                </span>
            }
            extra={
                <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => remove(name)}
                    className="hover:bg-red-50 rounded-full"
                >
                    Remove
                </Button>
            }
            className="shadow-sm border-slate-100 rounded-lg overflow-hidden border-l-4 border-l-purple-400"
            headStyle={{ borderBottom: '1px solid #f1f5f9', background: '#fcfcfd' }}
        >
            <Space direction="vertical" style={{ width: "100%" }} size="middle" className="p-2">
                {/* Hidden field to store option IDs */}
                <Form.Item name={[...prefix, "variation_option_ids"]} hidden>
                    <Input />
                </Form.Item>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <Text className="text-[10px] font-normal uppercase text-slate-400 mb-4 block tracking-widest">
                        Inventory Identifiers
                    </Text>
                    <Row gutter={[24, 16]}>
                        <Col span={8}>
                            <Form.Item
                                name={[...prefix, "sku"]}
                                label={<span className="text-xs font-normal text-slate-600">SKU</span>}
                            >
                                <Input placeholder="Optional SKU" className="rounded-lg h-10 px-3 border-slate-200" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name={[...prefix, "barcode"]}
                                label={
                                    <span className="text-xs font-normal text-slate-600 flex items-center gap-1">
                                        <BarcodeOutlined className="text-slate-400" /> Barcode
                                    </span>
                                }
                            >
                                <Input placeholder="Scan/Enter Barcode" className="rounded-lg h-10 px-3 border-slate-200" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name={[...prefix, "quantity_alert"]}
                                label={
                                    <span className="text-xs font-normal text-slate-600 flex items-center gap-1">
                                        <AlertOutlined className="text-amber-500" /> Alert Qty
                                    </span>
                                }
                                initialValue={5}
                            >
                                <InputNumber min={0} style={{ width: "100%" }} className="rounded-lg h-10 border-slate-200" />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                <div className="py-4">
                    <Text className="text-[10px] font-normal uppercase text-slate-400 mb-4 block tracking-widest">
                        Variation Image
                    </Text>
                    <Form.Item name={[...prefix, "image_url"]}>
                        <ImageUpload placeholder="Drop variation-specific image here" />
                    </Form.Item>
                </div>

                <Collapse
                    ghost
                    className="pricing-collapse bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm"
                    expandIconPosition="right"
                >
                    <Panel
                        header={
                            <span className="flex items-center gap-2 text-slate-600 font-normal py-1">
                                <DollarOutlined className="text-emerald-500 text-lg" />
                                Pricing & Special Offers
                            </span>
                        }
                        key="1"
                    >
                        <div className="p-4 space-y-8 bg-slate-50/30">
                            <PricingFields prefix={prefix} />
                            <Divider dashed className="my-0 border-slate-200" />
                            <DiscountFields prefix={prefix} />
                        </div>
                    </Panel>
                </Collapse>
            </Space>
        </Card>
    );
};

export default VariationFields;
