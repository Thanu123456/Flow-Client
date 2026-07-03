import React, { useState } from "react";
import { Modal, Upload, Button, message, Steps, Table, Typography, Space, Statistic, Row, Col, Alert } from "antd";
import { InboxOutlined, CheckCircleOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { productService } from "../../services/inventory/productService";
import type { BulkImportResult } from "../../types/entities/product.types";

const { Dragger } = Upload;
const { Text } = Typography;

interface ImportProductsProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const ImportProducts: React.FC<ImportProductsProps> = ({ visible, onClose, onSuccess }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<BulkImportResult | null>(null);

    const reset = () => {
        setCurrentStep(0);
        setFileList([]);
        setResult(null);
    };

    const handleImport = async () => {
        const file = fileList[0]?.originFileObj;
        if (!file) return;

        setImporting(true);
        try {
            const importResult = await productService.importProducts(file);
            setResult(importResult);
            setCurrentStep(1);
            if (importResult.successCount > 0) {
                message.success(`${importResult.successCount} product(s) imported successfully`);
                onSuccess();
            }
            if (importResult.failedCount > 0) {
                message.warning(`${importResult.failedCount} row(s) could not be imported`);
            }
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Failed to import products");
        } finally {
            setImporting(false);
        }
    };

    const steps = [
        {
            title: "Upload",
            content: (
                <div className="py-8">
                    <Dragger
                        fileList={fileList}
                        accept=".xlsx"
                        beforeUpload={() => false}
                        onChange={({ fileList }) => setFileList(fileList.slice(-1))}
                        maxCount={1}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        <p className="ant-upload-hint">Only .xlsx files generated from the import template are supported.</p>
                    </Dragger>
                </div>
            ),
        },
        {
            title: "Result",
            content: result && (
                <div className="py-4">
                    <div className="text-center mb-6">
                        <CheckCircleOutlined style={{ fontSize: 48, color: "#52c41a" }} />
                        <h3 className="mt-2 text-xl">Import Complete</h3>
                    </div>
                    <Row gutter={16} className="mb-4">
                        <Col span={8}>
                            <Statistic title="Total Rows" value={result.totalRows} />
                        </Col>
                        <Col span={8}>
                            <Statistic title="Imported" value={result.successCount} valueStyle={{ color: "#3f8600" }} />
                        </Col>
                        <Col span={8}>
                            <Statistic title="Failed" value={result.failedCount} valueStyle={{ color: result.failedCount > 0 ? "#cf1322" : undefined }} />
                        </Col>
                    </Row>
                    {result.failedCount > 0 && (
                        <>
                            <Alert
                                type="warning"
                                showIcon
                                message="Some rows could not be imported"
                                className="mb-3"
                            />
                            <Table
                                size="small"
                                dataSource={result.errors}
                                rowKey="row"
                                columns={[
                                    { title: "Row", dataIndex: "row", width: 80 },
                                    { title: "Reason", dataIndex: "reason" },
                                ]}
                                pagination={false}
                            />
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <Modal
            title="Import Products"
            open={visible}
            onCancel={() => {
                onClose();
                reset();
            }}
            width={700}
            footer={
                <Space>
                    {currentStep === 0 && (
                        <Button
                            type="primary"
                            disabled={fileList.length === 0}
                            loading={importing}
                            onClick={handleImport}
                        >
                            Import
                        </Button>
                    )}
                    {currentStep === 1 && (
                        <Button
                            type="primary"
                            onClick={() => {
                                onClose();
                                reset();
                            }}
                        >
                            Done
                        </Button>
                    )}
                </Space>
            }
        >
            <Steps current={currentStep} items={steps.map(s => ({ title: s.title }))} size="small" className="mb-8" />
            <div>{steps[currentStep].content}</div>
            {currentStep === 0 && (
                <Text type="secondary">
                    Need a template? Use "Download Excel Template" from the Upload menu first.
                </Text>
            )}
        </Modal>
    );
};

export default ImportProducts;
