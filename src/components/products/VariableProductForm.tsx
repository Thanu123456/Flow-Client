import React, { useEffect, useState } from "react";
import { Form, Select, Card, Row, Col, Alert, Typography, Divider } from "antd";
import {
    ClusterOutlined,
    SolutionOutlined,
    InfoCircleOutlined,
    WarningOutlined
} from "@ant-design/icons";
import { useVariationStore } from "../../store/management/variationStore";
import VariationFields from "./VariationFields";

const { Text } = Typography;

const VariableProductForm: React.FC = () => {
    const { variations, getVariations } = useVariationStore();
    const [selectedVariationId, setSelectedVariationId] = useState<string | null>(null);
    const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);

    const form = Form.useFormInstance();

    useEffect(() => {
        getVariations({ page: 1, limit: 100 });
    }, []);

    const handleVariationChange = (id: string) => {
        setSelectedVariationId(id);
        setSelectedOptionIds([]);
        form.setFieldsValue({
            variable_product: {
                variations: []
            }
        });
    };

    const selectedVariationInfo = variations.find(v => v.id === selectedVariationId);

    const handleOptionsChange = (optionIds: string[]) => {
        setSelectedOptionIds(optionIds);

        const currentVariations = form.getFieldValue(["variable_product", "variations"]) || [];
        const newVariations = currentVariations.filter((v: any) =>
            v && v.variation_option_ids && optionIds.includes(v.variation_option_ids[0])
        );

        optionIds.forEach(optId => {
            const exists = newVariations.find((v: any) => v.variation_option_ids && v.variation_option_ids[0] === optId);
            if (!exists) {
                newVariations.push({
                    variation_option_ids: [optId],
                    cost_price: 0,
                    quantity_alert: 5
                });
            }
        });

        form.setFieldsValue({
            variable_product: {
                variations: newVariations
            }
        });
    };

    return (
        <Card
            title={
                <span className="flex items-center gap-2 text-slate-800">
                    <ClusterOutlined className="text-purple-500" />
                    Variable Product Configuration
                </span>
            }
            className="shadow-md border-slate-200 rounded-xl overflow-hidden mt-6"
            headStyle={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}
        >
            <div className="space-y-6">
                <div>
                    <Text className="text-xs font-normal uppercase text-slate-400 mb-4 block tracking-wider">
                        Step 1: Define Variation Structure
                    </Text>
                    <Row gutter={[24, 0]}>
                        <Col span={12}>
                            <Form.Item
                                name={["variable_product", "variation_id"]}
                                label={<span className="font-normal text-slate-700">Variation Attribute</span>}
                                rules={[{ required: true, message: "Select variation type" }]}
                            >
                                <Select
                                    placeholder="e.g. Size, Color, Material"
                                    onChange={handleVariationChange}
                                    size="large"
                                    className="rounded-lg"
                                >
                                    {variations.map((v) => (
                                        <Select.Option key={v.id} value={v.id}>
                                            {v.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={<span className="font-normal text-slate-700">Specific Options</span>}>
                                <Select
                                    mode="multiple"
                                    placeholder="e.g. Small, Medium, Large"
                                    disabled={!selectedVariationId}
                                    value={selectedOptionIds}
                                    onChange={handleOptionsChange}
                                    optionFilterProp="children"
                                    size="large"
                                    className="rounded-lg"
                                >
                                    {selectedVariationInfo?.values.map(opt => (
                                        <Select.Option key={opt.id} value={opt.id}>{opt.value}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                {!selectedVariationId && (
                    <Alert
                        message="Select an attribute (like Color or Size) to start defining variations."
                        type="info"
                        showIcon
                        icon={<InfoCircleOutlined />}
                        className="rounded-lg border-blue-100 bg-blue-50 text-blue-800"
                    />
                )}

                {selectedVariationId && selectedOptionIds.length === 0 && (
                    <Alert
                        message="Now select at least one option to generate the individual variation forms."
                        type="warning"
                        showIcon
                        icon={<WarningOutlined />}
                        className="rounded-lg border-amber-100 bg-amber-50 text-amber-800"
                    />
                )}

                {selectedOptionIds.length > 0 && (
                    <div className="pt-6 border-t border-slate-100">
                        <Divider orientation="left">
                            <span className="flex items-center gap-2 text-slate-500 text-xs font-normal uppercase tracking-widest">
                                <SolutionOutlined /> Individual Variation Details
                            </span>
                        </Divider>

                        <Form.List name={["variable_product", "variations"]}>
                            {(fields, { remove }) => (
                                <div className="space-y-6 mt-6">
                                    {fields.map(({ key, name }) => {
                                        const itemData = form.getFieldValue(["variable_product", "variations", name]);
                                        const optId = itemData?.variation_option_ids?.[0];
                                        const optLabel = selectedVariationInfo?.values.find(v => v.id === optId)?.value;

                                        return (
                                            <VariationFields
                                                key={key}
                                                name={name}
                                                remove={() => {
                                                    remove(name);
                                                    if (optId) {
                                                        setSelectedOptionIds(prev => prev.filter(id => id !== optId));
                                                    }
                                                }}
                                                optionLabel={optLabel ? `${selectedVariationInfo?.name}: ${optLabel}` : undefined}
                                            />
                                        )
                                    })}
                                </div>
                            )}
                        </Form.List>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default VariableProductForm;
