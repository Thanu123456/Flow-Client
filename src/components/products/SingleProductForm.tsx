import React from "react";
import { Form, Input, InputNumber, Row, Col, Card, Typography } from "antd";
import {
    BarcodeOutlined,
    NodeIndexOutlined,
    AlertOutlined
} from "@ant-design/icons";
import PricingFields from "./PricingFields";
import DiscountFields from "./DiscountFields";


const { Text } = Typography;

const SingleProductForm: React.FC = () => {
    const prefix = ["single_product"];

    return (
        <Card
            title={
                <span className="flex items-center gap-2 text-slate-800">
                    <NodeIndexOutlined className="text-indigo-500" />
                    Single Product Details
                </span>
            }
            className="shadow-md border-slate-200 rounded-xl overflow-hidden mt-6"
            headStyle={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}
        >
            <div className="space-y-8">
                <div>
                    <Text className="text-xs font-normal uppercase text-slate-400 mb-4 block tracking-wider">
                        Inventory Identifiers
                    </Text>
                    <Row gutter={[24, 0]}>
                        <Col span={8}>
                            <Form.Item
                                name={[...prefix, "sku"]}
                                label={<span className="font-normal">SKU</span>}
                            >
                                <Input placeholder="Leave blank to auto-generate" className="rounded-lg h-11" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name={[...prefix, "barcode"]}
                                label={
                                    <span className="flex items-center gap-1 font-normal">
                                        <BarcodeOutlined className="text-slate-400" /> Barcode
                                    </span>
                                }
                            >
                                <Input placeholder="Scan or enter barcode" className="rounded-lg h-11" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name={[...prefix, "quantity_alert"]}
                                label={
                                    <span className="flex items-center gap-1 font-normal">
                                        <AlertOutlined className="text-amber-500" /> Low Stock Alert
                                    </span>
                                }
                                initialValue={10}
                            >
                                <InputNumber style={{ width: "100%" }} min={0} className="rounded-lg h-11 flex items-center" />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                <div className="pt-6 border-t border-slate-100">
                    <PricingFields prefix={prefix} />
                </div>

                <div className="pt-6 border-t border-slate-100">
                    <DiscountFields prefix={prefix} />
                </div>


            </div>
        </Card>
    );
};

export default SingleProductForm;
