import React from "react";
import { Form, InputNumber, Row, Col, Typography } from "antd";
import {
    CalculatorOutlined,
    ShopOutlined,
    TagOutlined,
    ThunderboltOutlined
} from "@ant-design/icons";

const { Text } = Typography;

interface PricingFieldsProps {
    prefix: (string | number)[]; // Form path prefix
}

const PricingFields: React.FC<PricingFieldsProps> = ({ prefix }) => {
    // Formatter to ensure 2 decimal places are always displayed, with thousands separator
    const priceFormatter = (value: any) => {
        if (!value && value !== 0) return "";
        const numericValue = parseFloat(value.toString());
        if (isNaN(numericValue)) return "";
        return numericValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // Parser to remove separators before processing the value
    const priceParser = (value: any) => {
        return value!.replace(/\$\s?|(,*)/g, "");
    };

    return (
        <div className="pricing-section">
            <Text className="text-xs font-normal uppercase text-slate-400 mb-6 block tracking-wider">
                Financial Configuration
            </Text>
            <Row gutter={[24, 24]}>
                <Col span={6}>
                    <Form.Item
                        name={[...prefix, "cost_price"]}
                        label={
                            <span className="flex items-center gap-1 font-normal text-slate-700">
                                <CalculatorOutlined className="text-slate-400" /> Cost Price
                            </span>
                        }
                        rules={[
                            { required: true, message: "Required" },
                            {
                                validator: (_, value) =>
                                    value > 0
                                        ? Promise.resolve()
                                        : Promise.reject(new Error("Cost must be > 0"))
                            }
                        ]}
                        initialValue={0}
                    >
                        <InputNumber
                            style={{ width: "100%" }}
                            min={0}
                            precision={2}
                            step={0.01}
                            formatter={priceFormatter}
                            parser={priceParser}
                            prefix={<span className="text-slate-400 text-xs">Rs :</span>}
                            className="rounded-lg h-11 flex items-center"
                            placeholder="0.00"
                        />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item
                        name={[...prefix, "wholesale_price"]}
                        label={
                            <span className="flex items-center gap-1 font-normal text-slate-700">
                                <ShopOutlined className="text-slate-400" /> Wholesale
                            </span>
                        }
                        initialValue={0}
                    >
                        <InputNumber
                            style={{ width: "100%" }}
                            min={0}
                            precision={2}
                            step={0.01}
                            formatter={priceFormatter}
                            parser={priceParser}
                            prefix={<span className="text-slate-400 text-xs">Rs :</span>}
                            className="rounded-lg h-11 flex items-center"
                            placeholder="0.00"
                        />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item
                        name={[...prefix, "retail_price"]}
                        label={
                            <span className="flex items-center gap-1 font-normal text-slate-700">
                                <TagOutlined className="text-slate-400" /> Retail Price
                            </span>
                        }
                        initialValue={0}
                    >
                        <InputNumber
                            style={{ width: "100%" }}
                            min={0}
                            precision={2}
                            step={0.01}
                            formatter={priceFormatter}
                            parser={priceParser}
                            prefix={<span className="text-slate-400 text-xs">Rs :</span>}
                            className="rounded-lg h-11 flex items-center"
                            placeholder="0.00"
                        />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item
                        name={[...prefix, "our_price"]}
                        label={
                            <span className="flex items-center gap-1 font-normal text-slate-700">
                                <ThunderboltOutlined className="text-blue-500" /> Selling Price
                            </span>
                        }
                        initialValue={0}
                    >
                        <InputNumber
                            style={{ width: "100%" }}
                            min={0}
                            precision={2}
                            step={0.01}
                            formatter={priceFormatter}
                            parser={priceParser}
                            prefix={<span className="text-slate-400 text-xs font-normal">Rs :</span>}
                            className="rounded-lg h-11 flex items-center border-blue-200 bg-blue-50/10"
                            placeholder="0.00"
                        />
                    </Form.Item>
                </Col>
            </Row>
        </div>
    );
};

export default PricingFields;
