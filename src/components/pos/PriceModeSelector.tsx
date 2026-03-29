import React, { useState, useEffect } from 'react';
import { Modal, Radio, Divider, Tag } from 'antd';

interface PriceModeSelectorProps {
    visible: boolean;
    currentMode: "our" | "retail" | "wholesale";
    onSelect: (mode: "our" | "retail" | "wholesale") => void;
    onClose: () => void;
}

/**
 * Price Mode Selector Modal
 * Allows user to select between Our/Retail/Wholesale pricing
 * Feature #6: Price Mode Switching (2.1)
 */
const PriceModeSelector: React.FC<PriceModeSelectorProps> = ({
    visible,
    currentMode,
    onSelect,
    onClose,
}) => {
    const [selectedMode, setSelectedMode] = useState<"our" | "retail" | "wholesale">(currentMode);

    // Sync selectedMode with currentMode when modal opens or currentMode changes
    useEffect(() => {
        if (visible) {
            setSelectedMode(currentMode);
        }
    }, [visible, currentMode]);

    const handleOk = () => {
        onSelect(selectedMode);
        onClose();
    };

    return (
        <Modal
            title="Select Price Mode"
            open={visible}
            onCancel={onClose}
            onOk={handleOk}
            width={450}
            okText="Apply"
            cancelText="Cancel"
            centered
        >
            <div className="space-y-4">
                <Radio.Group
                    value={selectedMode}
                    onChange={(e) => setSelectedMode(e.target.value)}
                    style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                    {/* Our Price Option */}
                    <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition">
                        <Radio value="our">
                            <div>
                                <div className="font-semibold flex items-center gap-2">
                                    Our Price (Cost)
                                    <Tag color="purple">O</Tag>
                                </div>
                                <div className="text-sm text-gray-500 ml-6 mt-1">
                                    Internal cost price for inventory valuation
                                </div>
                            </div>
                        </Radio>
                    </div>

                    <Divider style={{ margin: '8px 0' }} />

                    {/* Retail Price Option */}
                    <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition">
                        <Radio value="retail">
                            <div>
                                <div className="font-semibold flex items-center gap-2">
                                    Retail Price
                                    <Tag color="blue">R</Tag>
                                </div>
                                <div className="text-sm text-gray-500 ml-6 mt-1">
                                    Standard retail selling price to customers
                                </div>
                            </div>
                        </Radio>
                    </div>

                    <Divider style={{ margin: '8px 0' }} />

                    {/* Wholesale Price Option */}
                    <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition">
                        <Radio value="wholesale">
                            <div>
                                <div className="font-semibold flex items-center gap-2">
                                    Wholesale Price
                                    <Tag color="green">W</Tag>
                                </div>
                                <div className="text-sm text-gray-500 ml-6 mt-1">
                                    Bulk purchase discount price
                                </div>
                            </div>
                        </Radio>
                    </div>
                </Radio.Group>

                <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="text-sm text-yellow-800">
                        <strong>Note:</strong> Prices are locked when items are added to cart. Changing the price mode after adding items will not affect existing cart items.
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default PriceModeSelector;
