import React from "react";
import { Form, Input, InputNumber, Card, Button, Collapse, Space, Row, Col, Typography, Divider, message } from "antd";
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
import { generateBarcode } from "../../utils/helpers/barcode";
import { productService } from "../../services/inventory/productService";

const { Panel } = Collapse;
const { Text: AntText } = Typography;

interface VariationFieldsProps {
    name: number;
    remove: (index: number) => void;
    optionLabel?: string;
}

const VariationFields: React.FC<VariationFieldsProps> = ({ name, remove, optionLabel }) => {
    const form = Form.useFormInstance();
    const [messageApi, contextHolder] = message.useMessage();
    const prefix: (string | number)[] = [name]; // Fix: items must be relative to the index within Form.List
    const fullPrefix = ["variable_product", "variations", name]; // Absolute path for hooks and setFields

    React.useEffect(() => {
        console.log(`VariationFields mount [#${name}]:`, {
            fullPrefix,
            formValue: form.getFieldValue(fullPrefix),
            allValues: form.getFieldsValue()
        });

        const autoGenerate = async () => {
            const currentSku = form.getFieldValue([...fullPrefix, "sku"]);
            const currentBarcode = form.getFieldValue([...fullPrefix, "barcode"]);

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
                console.log(`Auto-generating identifying fields for variation #${name}:`, updates);
                const fieldsToSet = [];
                if (updates.sku) fieldsToSet.push({ name: [...fullPrefix, "sku"], value: updates.sku });
                if (updates.barcode) fieldsToSet.push({ name: [...fullPrefix, "barcode"], value: updates.barcode });

                if (fieldsToSet.length > 0) {
                    form.setFields(fieldsToSet);
                }
            }
        };

        autoGenerate();
    }, [form, name]);

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
            styles={{ header: { borderBottom: '1px solid #f1f5f9', background: '#fcfcfd' } }}
        >
            {contextHolder}
            <Space direction="vertical" style={{ width: "100%" }} size="middle" className="p-2">
                {/* Hidden field to store option IDs. Using just Form.Item to preserve the array type from setFieldsValue */}
                <Form.Item name={[...prefix, "variation_option_ids"]} hidden />

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <AntText className="text-[10px] font-normal uppercase text-slate-400 mb-4 block tracking-widest">
                        Inventory Identifiers
                    </AntText>
                    <Row gutter={[24, 16]}>
                        <Col span={8}>
                            <Form.Item
                                name={[...prefix, "sku"]}
                                label={<span className="text-xs font-normal text-slate-600">SKU</span>}
                            >
                                <Input
                                    placeholder="Generate unique SKU"
                                    className="rounded-lg h-10 px-3 border-slate-200"
                                    addonAfter={
                                        <Button
                                            type="text"
                                            size="small"
                                            onClick={async () => {
                                                try {
                                                    const skuVal = await productService.generateSKU();
                                                    console.log(`Manually generated SKU for variation #${name}:`, skuVal);
                                                    form.setFields([
                                                        {
                                                            name: [...fullPrefix, "sku"],
                                                            value: skuVal,
                                                            errors: []
                                                        }
                                                    ]);
                                                    messageApi.success("SKU generated");
                                                } catch (error) {
                                                    messageApi.error("Failed to generate SKU");
                                                }
                                            }}
                                            className="text-xs text-purple-500 hover:text-purple-600 font-medium"
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
                                    <span className="text-xs font-normal text-slate-600 flex items-center gap-1">
                                        <BarcodeOutlined className="text-slate-400" /> Barcode
                                    </span>
                                }
                            >
                                <Input
                                    placeholder="Leave blank to auto-generate (999...)"
                                    className="rounded-lg h-10 px-3 border-slate-200"
                                    addonAfter={
                                        <Button
                                            type="text"
                                            size="small"
                                            onClick={() => {
                                                const newBarcodeValue = generateBarcode();
                                                console.log(`Manually generated Barcode for variation #${name}:`, newBarcodeValue);
                                                form.setFields([
                                                    {
                                                        name: [...fullPrefix, "barcode"],
                                                        value: newBarcodeValue,
                                                        errors: []
                                                    }
                                                ]);
                                                messageApi.success("Barcode generated");
                                            }}
                                            className="text-xs text-purple-500 hover:text-purple-600 font-medium"
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
                                    <span className="text-xs font-normal text-slate-600 flex items-center gap-1">
                                        <AlertOutlined className="text-amber-500" /> Alert Qty
                                    </span>
                                }
                                initialValue={5}
                            >
                                <InputNumber min={0} style={{ width: "100%" }} className="rounded-lg h-10 border-slate-200" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name={[...prefix, "current_stock"]}
                                label={<span className="text-xs font-normal text-slate-600">Current Stock</span>}
                                initialValue={0}
                            >
                                <InputNumber
                                    disabled
                                    style={{ width: "100%" }}
                                    className="rounded-lg h-10 border-slate-200 bg-slate-50"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                <div className="py-4">
                    <AntText className="text-[10px] font-normal uppercase text-slate-400 mb-4 block tracking-widest">
                        Variation Image
                    </AntText>
                    <Form.Item name={[...prefix, "image_url"]}>
                        <ImageUpload placeholder="Drop variation-specific image here" />
                    </Form.Item>
                </div>

                <Collapse
                    ghost
                    className="pricing-collapse bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm"
                    expandIconPosition="right"
                    defaultActiveKey={["1"]}
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
                            <PricingFields prefix={prefix} absolutePrefix={fullPrefix} />
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
