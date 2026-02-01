import React from "react";
import { Form, InputNumber, Row, Col, Select, Typography } from "antd";
import {
    PercentageOutlined,
    DoubleRightOutlined,
    RadiusSettingOutlined
} from "@ant-design/icons";

const { Text } = Typography;

interface DiscountFieldsProps {
    prefix: (string | number)[];
}

const DiscountFields: React.FC<DiscountFieldsProps> = ({ prefix }) => {
    const discountFormatter = (value: any, type: string) => {
        if (!value && value !== 0) return "";
        if (type === 'percentage') return `${value}`;
        const numericValue = parseFloat(value.toString());
        if (isNaN(numericValue)) return "";
        return numericValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const discountParser = (value: any) => {
        if (!value) return "";
        return value.replace(/\$\s?|(,*)/g, "");
    };

    return (
        <div className="discount-section">
            <Text className="text-xs font-normal uppercase text-slate-400 mb-6 block tracking-wider">
                Promotion & Discounts
            </Text>
            <Row gutter={[24, 24]}>
                <Col span={8}>
                    <Form.Item
                        name={[...prefix, "discount_type"]}
                        label={
                            <span className="flex items-center gap-1 font-normal text-slate-700">
                                <RadiusSettingOutlined className="text-slate-400" /> Discount Method
                            </span>
                        }
                    >
                        <Select placeholder="Select Type" allowClear size="large" className="rounded-lg">
                            <Select.Option value="fixed">Fixed Amount (Flat)</Select.Option>
                            <Select.Option value="percentage">Percentage (%)</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item dependencies={[[...prefix, "discount_type"]]} noStyle>
                        {({ getFieldValue }) => {
                            const type = getFieldValue([...prefix, "discount_type"]);
                            return (
                                <Form.Item
                                    name={[...prefix, "discount_value"]}
                                    label={
                                        <span className="flex items-center gap-1 font-normal text-slate-700">
                                            <PercentageOutlined className="text-slate-400" /> Discount Value
                                        </span>
                                    }
                                    rules={[
                                        {
                                            validator: (_, value) => {
                                                if (type === 'percentage' && value > 100) {
                                                    return Promise.reject(new Error("Percentage cannot exceed 100%"));
                                                }
                                                return Promise.resolve();
                                            }
                                        }
                                    ]}
                                    initialValue={0}
                                >
                                    <InputNumber
                                        style={{ width: "100%" }}
                                        min={0}
                                        precision={2}
                                        step={0.01}
                                        formatter={(val) => discountFormatter(val, type)}
                                        parser={discountParser}
                                        disabled={!type}
                                        size="large"
                                        className="rounded-lg h-11 flex items-center"
                                        placeholder={type === 'percentage' ? "e.g. 10.00" : "0.00"}
                                        prefix={type === 'percentage' ? "%" : <span className="text-slate-400 text-xs">Rs :</span>}
                                    />
                                </Form.Item>
                            );
                        }}
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name={[...prefix, "discount_applies_to"]}
                        label={
                            <span className="flex items-center gap-1 font-normal text-slate-700">
                                <DoubleRightOutlined className="text-slate-400" /> Apply To
                            </span>
                        }
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select price tiers"
                            size="large"
                            className="rounded-lg"
                        >
                            <Select.Option value="wholesale">Wholesale Pricing</Select.Option>
                            <Select.Option value="retail">Retail Pricing</Select.Option>
                            <Select.Option value="our_price">Final Selling Price</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
        </div>
    );
};

export default DiscountFields;
