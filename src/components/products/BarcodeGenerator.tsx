import React, { useState } from "react";
import { Modal, Input, Button, Row, Col, Card, Typography, Select } from "antd";
import { BarcodeOutlined, PrinterOutlined, DownloadOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

interface BarcodeGeneratorProps {
    visible: boolean;
    onClose: () => void;
}

const BarcodeGenerator: React.FC<BarcodeGeneratorProps> = ({ visible, onClose }) => {
    const [sku, setSku] = useState("");
    const [format, setFormat] = useState("CODE128");

    return (
        <Modal
            title={
                <span className="flex items-center gap-2">
                    <BarcodeOutlined /> Barcode Generator
                </span>
            }
            open={visible}
            onCancel={onClose}
            width={600}
            footer={[
                <Button key="close" onClick={onClose}>Close</Button>,
                <Button key="print" type="primary" icon={<PrinterOutlined />}>Print Barcodes</Button>,
                <Button key="download" icon={<DownloadOutlined />}>Download</Button>
            ]}
        >
            <div className="space-y-6 py-4">
                <Row gutter={16}>
                    <Col span={16}>
                        <Text strong className="block mb-2">Enter SKU or Barcode Number</Text>
                        <Input
                            placeholder="e.g. ITEM-123456"
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            size="large"
                        />
                    </Col>
                    <Col span={8}>
                        <Text strong className="block mb-2">Format</Text>
                        <Select
                            value={format}
                            onChange={setFormat}
                            style={{ width: "100%" }}
                            size="large"
                            options={[
                                { value: "CODE128", label: "CODE 128" },
                                { value: "EAN13", label: "EAN 13" },
                                { value: "UPC", label: "UPC-A" },
                            ]}
                        />
                    </Col>
                </Row>

                <Card className="bg-slate-50 flex items-center justify-center min-h-[200px] border-dashed">
                    {sku ? (
                        <div className="text-center">
                            <div className="bg-white p-4 border border-slate-200 rounded shadow-sm inline-block">
                                <div className="h-20 w-64 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/EAN13.svg/1200px-EAN13.svg.png')] bg-contain bg-no-repeat bg-center"></div>
                                <Title level={4} className="mt-2 mb-0 tracking-[0.5em]">{sku}</Title>
                            </div>
                            <p className="mt-4 text-slate-400 text-xs">A preview of your barcode will appear here</p>
                        </div>
                    ) : (
                        <div className="text-slate-400 text-center">
                            <BarcodeOutlined style={{ fontSize: 48 }} />
                            <p>Enter a SKU above to generate a barcode</p>
                        </div>
                    )}
                </Card>

                <div className="bg-blue-50 p-4 rounded-lg">
                    <Title level={5} className="m-0 text-blue-800">Labels Configuration</Title>
                    <Row gutter={16} className="mt-4">
                        <Col span={12}>
                            <Text type="secondary" style={{ fontSize: 12 }}>Label Width (mm)</Text>
                            <Input defaultValue="40" size="small" className="mt-1" />
                        </Col>
                        <Col span={12}>
                            <Text type="secondary" style={{ fontSize: 12 }}>Label Height (mm)</Text>
                            <Input defaultValue="25" size="small" className="mt-1" />
                        </Col>
                    </Row>
                </div>
            </div>
        </Modal>
    );
};

export default BarcodeGenerator;
