import React, { useState, useEffect } from 'react';
import { Modal, Radio, Divider, Tag, Typography } from 'antd';
import { 
    ShoppingOutlined, 
    GlobalOutlined, 
    BankOutlined,
    CheckCircleFilled 
} from '@ant-design/icons';

const { Text, Title } = Typography;

interface PriceModeSelectorProps {
    visible: boolean;
    currentMode: "our" | "retail" | "wholesale";
    onSelect: (mode: "our" | "retail" | "wholesale") => void;
    onClose: () => void;
}

const PriceModeSelector: React.FC<PriceModeSelectorProps> = ({
    visible,
    currentMode,
    onSelect,
    onClose,
}) => {
    const [selectedMode, setSelectedMode] = useState<"our" | "retail" | "wholesale">(currentMode);

    useEffect(() => {
        if (visible) {
            setSelectedMode(currentMode);
        }
    }, [visible, currentMode]);

    const handleOk = () => {
        onSelect(selectedMode);
        onClose();
    };

    const modes = [
        {
            value: "our",
            label: "Our Price (Cost)",
            icon: <BankOutlined className="text-purple-600 text-xl" />,
            color: "purple",
            description: "Internal cost-based pricing for inventory valuation and back-office calculation.",
            badge: "O"
        },
        {
            value: "retail",
            label: "Retail Price",
            icon: <ShoppingOutlined className="text-blue-600 text-xl" />,
            color: "blue",
            description: "Standard consumer selling price used for regular walk-in customers.",
            badge: "R"
        },
        {
            value: "wholesale",
            label: "Wholesale Price",
            icon: <GlobalOutlined className="text-green-600 text-xl" />,
            color: "green",
            description: "Special discounted price for bulk purchases and authorized B2B customers.",
            badge: "W"
        }
    ];

    return (
        <Modal
            title={
                <div className="flex items-center gap-2 py-1">
                    <span className="text-lg font-extrabold text-gray-800">Select Price Mode</span>
                </div>
            }
            open={visible}
            onCancel={onClose}
            onOk={handleOk}
            width={480}
            okText="Apply Pricing"
            cancelText="Keep Current"
            centered
            className="premium-modal"
            styles={{ body: { padding: '20px 24px' } }}
        >
            <div className="flex flex-col gap-4">
                <Text type="secondary" className="text-[13px] mb-2 block">
                    Choose the applicable pricing strategy for this transaction. This will update all items currently in the cart.
                </Text>

                <div className="grid gap-3">
                    {modes.map((mode) => (
                        <div
                            key={mode.value}
                            onClick={() => setSelectedMode(mode.value as any)}
                            className={`
                                flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
                                ${selectedMode === mode.value 
                                    ? `bg-${mode.color}-50 border-${mode.color}-500 ring-1 ring-${mode.color}-100 shadow-sm` 
                                    : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-md'}
                            `}
                        >
                            <div className={`
                                w-12 h-12 rounded-full flex items-center justify-center shrink-0
                                ${selectedMode === mode.value ? `bg-${mode.color}-100` : 'bg-gray-50'}
                            `}>
                                {mode.icon}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[15px] font-bold ${selectedMode === mode.value ? 'text-gray-900' : 'text-gray-700'}`}>
                                            {mode.label}
                                        </span>
                                        <Tag color={mode.color} className="font-mono px-1.5 h-[18px] leading-[18px] uppercase border-0 rounded-sm">
                                            {mode.badge}
                                        </Tag>
                                    </div>
                                    {selectedMode === mode.value && (
                                        <CheckCircleFilled className={`text-${mode.color}-500 text-lg`} />
                                    )}
                                </div>
                                <p className={`text-[12px] mt-1 leading-relaxed ${selectedMode === mode.value ? 'text-gray-600' : 'text-gray-400'}`}>
                                    {mode.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .premium-modal .ant-modal-content {
                    border-radius: 16px;
                    overflow: hidden;
                }
                .premium-modal .ant-modal-header {
                    border-bottom: 1px solid #f0f0f0;
                    margin-bottom: 0;
                    padding: 16px 24px;
                }
                .premium-modal .ant-btn-primary {
                    background: #1890ff;
                }
                /* Utility classes since tailwind might not be fully configured for these variables */
                .bg-purple-50 { background-color: #f9f5ff; }
                .bg-blue-50 { background-color: #f0f7ff; }
                .bg-green-50 { background-color: #f6ffed; }
                .border-purple-500 { border-color: #722ed1; }
                .border-blue-500 { border-color: #1890ff; }
                .border-green-500 { border-color: #52c41a; }
                .text-purple-500 { color: #722ed1; }
                .text-blue-500 { color: #1890ff; }
                .text-green-500 { color: #52c41a; }
                .bg-purple-100 { background-color: #f3e8ff; }
                .bg-blue-100 { background-color: #e6f7ff; }
                .bg-green-100 { background-color: #f6ffed; }
            `}</style>
        </Modal>
    );
};

export default PriceModeSelector;

