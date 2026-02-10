import React, { useState, useEffect } from "react";
import { Form, InputNumber, Row, Col, Typography, Button, Tooltip } from "antd";
import {
    CalculatorOutlined,
    ShopOutlined,
    TagOutlined,
    ThunderboltOutlined,
    UnlockOutlined
} from "@ant-design/icons";

const { Text } = Typography;

interface PricingFieldsProps {
    prefix: (string | number)[]; // Form path prefix (relative for items)
    absolutePrefix?: (string | number)[]; // Absolute path for hooks
}

const PricingFields: React.FC<PricingFieldsProps> = ({ prefix, absolutePrefix }) => {
    const form = Form.useFormInstance();
    // Use absolute prefix for hooks if provided, otherwise fallback to prefix
    const watchPrefix = absolutePrefix || prefix;

    // Watch prices to auto-sync
    const retailPrice = Form.useWatch([...watchPrefix, "retail_price"], form);
    const ourPrice = Form.useWatch([...watchPrefix, "our_price"], form);

    // State to track if manual override is enabled
    const [isManualSellingPrice, setIsManualSellingPrice] = useState(false);

    // Track if we have performed the initial check
    const isInitializedRef = React.useRef(false);

    // Auto-detect manual mode from loaded data ONCE
    useEffect(() => {
        // Wait until we have valid data (or at least one of them is set)
        // If it's a new form, both are undefined/0, so we stay in auto mode.
        if (isInitializedRef.current) return;

        if (ourPrice !== undefined && retailPrice !== undefined) {
            // Data is loaded. Check divergence.
            // If they differ and ourPrice is set (not just default 0), it's manual.
            if (ourPrice > 0 && ourPrice !== retailPrice) {
                setIsManualSellingPrice(true);
            }
            isInitializedRef.current = true;
        } else if (retailPrice !== undefined && ourPrice === undefined) {
            // Case where we only have retail price loaded? Unlikely but possible in partial load.
            // Be safer to wait or assume auto.
        }

    }, [ourPrice, retailPrice]);

    // Sync selling price with retail price when not in manual mode
    useEffect(() => {
        const retailPath = [...watchPrefix, "retail_price"];
        const isRetailTouched = form.isFieldTouched(retailPath);

        // If manual mode is active, do nothing
        if (isManualSellingPrice) return;

        // If retail price is undefined, do nothing
        if (retailPrice === undefined) return;

        // Determine if we should sync
        const shouldSync =
            // 1. User is actively editing retail price
            isRetailTouched ||
            // 2. We are in a "new" state (ourPrice is empty/zero) and haven't diverged yet
            (!ourPrice || ourPrice === 0);

        if (shouldSync) {
            // Only update if value is different to avoid loops
            if (ourPrice !== retailPrice) {
                form.setFieldValue([...watchPrefix, "our_price"], retailPrice);
            }
        }
    }, [retailPrice, isManualSellingPrice, form, watchPrefix, ourPrice]);

    // Handle toggle of manual mode
    const toggleManualMode = () => {
        if (isManualSellingPrice) {
            // Switching from Manual -> Auto
            // Reset our_price to match retail_price immediately
            const currentRetail = form.getFieldValue([...watchPrefix, "retail_price"]);
            form.setFieldValue([...watchPrefix, "our_price"], currentRetail);
            setIsManualSellingPrice(false);
        } else {
            // Switching from Auto -> Manual
            // Just enable specific editing
            setIsManualSellingPrice(true);
        }
    };

    // Formatter to ensure 2 decimal places are always displayed, with thousands separator
    const priceFormatter = (value: any) => {
        if (value === null || value === undefined || value === "") return "";
        const stringValue = value.toString();
        // Remove everything except numbers and decimal point for parsing
        const numericValue = parseFloat(stringValue.replace(/[^\d.-]/g, ''));
        if (isNaN(numericValue)) return "";
        return numericValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // Parser to remove all non-numeric characters before processing the value
    const priceParser = (value: any) => {
        if (!value) return 0;
        const parsed = value.replace(/[^\d.]/g, "");
        return parsed === "" ? 0 : parsed;
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
                            prefix={<span className="text-slate-400 text-xs">Rs.</span>}
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
                            prefix={<span className="text-slate-400 text-xs">Rs.</span>}
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
                        rules={[
                            { required: true, message: "Required" },
                            {
                                validator: (_, value) =>
                                    value > 0
                                        ? Promise.resolve()
                                        : Promise.reject(new Error("Price must be > 0"))
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
                            prefix={<span className="text-slate-400 text-xs">Rs.</span>}
                            className="rounded-lg h-11 flex items-center"
                            placeholder="0.00"
                        />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item
                        name={[...prefix, "our_price"]}
                        label={
                            <div className="flex items-center justify-between w-full">
                                <span className="flex items-center gap-1 font-normal text-slate-700">
                                    <ThunderboltOutlined className={isManualSellingPrice ? "text-blue-500" : "text-slate-400"} /> Selling Price
                                </span>
                                {isManualSellingPrice ? (
                                    <Tooltip title="Reset to match Retail Price">
                                        <Button
                                            type="text"
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleManualMode();
                                            }}
                                            className="flex items-center gap-1 text-[10px] text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded px-1 h-5 shadow-sm ml-2"
                                        >
                                            <UnlockOutlined className="text-[9px]" /> Sync
                                        </Button>
                                    </Tooltip>
                                ) : (
                                    <Tooltip title="Manually set a different selling price">
                                        <Button
                                            type="text"
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleManualMode();
                                            }}
                                            className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded px-1 h-5 shadow-sm ml-2"
                                        >
                                            <span className="flex items-center justify-center w-2.5 h-2.5 bg-blue-500 rounded-full text-white text-[9px] pb-[1px]">+</span>
                                            Manual
                                        </Button>
                                    </Tooltip>
                                )}
                            </div>
                        }
                        initialValue={0}
                    >
                        <InputNumber
                            style={{ width: "100%" }}
                            min={0}
                            precision={2}
                            step={0.01}
                            readOnly={!isManualSellingPrice}
                            formatter={priceFormatter}
                            parser={priceParser}
                            prefix={<span className="text-slate-400 text-xs font-normal">Rs.</span>}
                            className={`rounded-lg h-11 flex items-center ${!isManualSellingPrice ? 'bg-slate-50 opacity-75 border-slate-200' : 'bg-blue-50/10 border-blue-200 shadow-sm shadow-blue-50'}`}
                            placeholder="0.00"
                        />
                    </Form.Item>
                </Col>
            </Row>
        </div>
    );
};

export default PricingFields;
