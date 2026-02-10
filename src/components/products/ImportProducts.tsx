import React, { useState } from "react";
import { Modal, Upload, Button, message, Steps, Table, Typography, Space } from "antd";
import { InboxOutlined, FileExcelOutlined, CheckCircleOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";

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

    const handleUpload = () => {
        setImporting(true);
        // Simulate API call
        setTimeout(() => {
            setImporting(false);
            setCurrentStep(2);
            message.success("Products imported successfully");
            onSuccess();
        }, 2000);
    };

    const steps = [
        {
            title: "Upload",
            content: (
                <div className="py-8">
                    <Dragger
                        fileList={fileList}
                        beforeUpload={() => false}
                        onChange={({ fileList }) => setFileList(fileList)}
                        maxCount={1}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        <p className="ant-upload-hint">Support for .csv, .xls, .xlsx files.</p>
                    </Dragger>
                    <div className="mt-4 text-center">
                        <Button type="link" icon={<FileExcelOutlined />}>
                            Download Sample Template
                        </Button>
                    </div>
                </div>
            ),
        },
        {
            title: "Preview",
            content: (
                <div className="py-4">
                    <Text type="secondary">Review the data before importing...</Text>
                    <Table
                        size="small"
                        dataSource={[]} // Mock data would go here
                        columns={[
                            { title: "Name", dataIndex: "name" },
                            { title: "SKU", dataIndex: "sku" },
                            { title: "Price", dataIndex: "price" },
                        ]}
                        pagination={false}
                        className="mt-4"
                    />
                </div>
            ),
        },
        {
            title: "Finish",
            content: (
                <div className="py-12 text-center">
                    <CheckCircleOutlined style={{ fontSize: 64, color: "#52c41a" }} />
                    <h3 className="mt-4 text-xl">Import Complete!</h3>
                    <p className="text-slate-500">15 products have been successfully added to your inventory.</p>
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
                setCurrentStep(0);
                setFileList([]);
            }}
            width={700}
            footer={
                <Space>
                    {currentStep === 0 && (
                        <Button disabled={fileList.length === 0} type="primary" onClick={() => setCurrentStep(1)}>
                            Next
                        </Button>
                    )}
                    {currentStep === 1 && (
                        <>
                            <Button onClick={() => setCurrentStep(0)}>Back</Button>
                            <Button type="primary" loading={importing} onClick={handleUpload}>
                                Confirm Import
                            </Button>
                        </>
                    )}
                    {currentStep === 2 && (
                        <Button type="primary" onClick={onClose}>
                            Done
                        </Button>
                    )}
                </Space>
            }
        >
            <Steps current={currentStep} items={steps.map(s => ({ title: s.title }))} size="small" className="mb-8" />
            <div>{steps[currentStep].content}</div>
        </Modal>
    );
};

export default ImportProducts;
