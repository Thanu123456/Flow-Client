import React from "react";
import { Form, Input, InputNumber, Row, Col, Card, Typography, Button, message } from "antd";
import {
    BarcodeOutlined,
    NodeIndexOutlined,
    AlertOutlined
} from "@ant-design/icons";
import PricingFields from "./PricingFields";
import DiscountFields from "./DiscountFields";


import { productService } from "../../services/inventory/productService";
import { generateBarcode } from "../../utils/helpers/barcode";

const { Text: AntText } = Typography;

const SingleProductForm: React.FC = () => {
    const prefix = ["single_product"];
    const form = Form.useFormInstance();
    const [messageApi, contextHolder] = message.useMessage();

    React.useEffect(() => {
        const autoGenerate = async () => {
            const currentSku = form.getFieldValue([...prefix, "sku"]);
            const currentBarcode = form.getFieldValue([...prefix, "barcode"]);

            let updates: any = {};
            let needsUpdate = false;

            if (!currentSku) {
                try {
                    const sku = await productService.generateSKU();
                    updates.sku = sku;
                    needsUpdate = true;
                } catch (error) {
                    console.error("Failed to auto-generate SKU:", error);
                }
            }

            if (!currentBarcode) {
                updates.barcode = generateBarcode();
                needsUpdate = true;
            }

            if (needsUpdate) {
                console.log("Auto-generating identifying fields for single product:", updates);
                const fieldsToUpdate = [];
                if (updates.sku) fieldsToUpdate.push({ name: [...prefix, "sku"], value: updates.sku });
                if (updates.barcode) fieldsToUpdate.push({ name: [...prefix, "barcode"], value: updates.barcode });

                if (fieldsToUpdate.length > 0) {
                    form.setFields(fieldsToUpdate);
                }
            }
        };

        autoGenerate();
    }, [form]);

    return (
        <Card
            title={
                <span className="flex items-center gap-2 text-slate-800">
                    <NodeIndexOutlined className="text-indigo-500" />
                    Single Product Details
                </span>
            }
            className="shadow-md border-slate-200 rounded-xl overflow-hidden mt-6"
            styles={{ header: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' } }}
        >
            {contextHolder}
            <div className="space-y-8">
                <div>
                    <AntText className="text-xs font-normal uppercase text-slate-400 mb-4 block tracking-wider">
                        Inventory Identifiers
                    </AntText>
                    <Row gutter={[24, 0]}>
                        <Col span={8}>
                            <Form.Item
                                name={[...prefix, "sku"]}
                                label={<span className="font-normal">SKU</span>}
                            >
                                <Input
                                    placeholder="Generate unique 3 or 5 digit SKU"
                                    className="rounded-lg h-11"
                                    addonAfter={
                                        <Button
                                            type="text"
                                            size="small"
                                            onClick={async () => {
                                                try {
                                                    const skuValue = await productService.generateSKU();
                                                    console.log("Manually generated SKU for single product:", skuValue);
                                                    form.setFields([
                                                        {
                                                            name: [...prefix, "sku"],
                                                            value: skuValue,
                                                            errors: []
                                                        }
                                                    ]);
                                                    messageApi.success("SKU generated");
                                                } catch (error) {
                                                    messageApi.error("Failed to generate SKU");
                                                }
                                            }}
                                            className="text-xs text-indigo-500 hover:text-indigo-600 font-medium"
                                        >
                                            Generate
                                        </Button>
                                    }
                                />
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
                                <Input
                                    placeholder="Leave blank to auto-generate (999...)"
                                    className="rounded-lg h-11"
                                    addonAfter={
                                        <Button
                                            type="text"
                                            size="small"
                                            onClick={() => {
                                                const newBarcodeValue = generateBarcode();
                                                console.log("Manually generated Barcode for single product:", newBarcodeValue);
                                                form.setFields([
                                                    {
                                                        name: [...prefix, "barcode"],
                                                        value: newBarcodeValue,
                                                        errors: []
                                                    }
                                                ]);
                                                messageApi.success("Barcode generated");
                                            }}
                                            className="text-xs text-indigo-500 hover:text-indigo-600 font-medium"
                                        >
                                            Generate
                                        </Button>
                                    }
                                />
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
                        <Col span={8}>
                            <Form.Item
                                name={[...prefix, "current_stock"]}
                                label={<span className="font-normal">Current Stock</span>}
                                initialValue={0}
                            >
                                <InputNumber
                                    disabled
                                    style={{ width: "100%" }}
                                    className="rounded-lg h-11 border-slate-200 bg-slate-50 flex items-center"
                                />
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
