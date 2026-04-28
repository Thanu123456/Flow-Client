import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Form, Row, Col, Alert, Space } from 'antd';
import type { Product } from '../../types/entities/product.types';

interface WeightEntryModalProps {
    visible: boolean;
    product: Product | null;
    onConfirm: (quantity: number) => void;
    onCancel: () => void;
    allowNoStock: boolean;
}

const WeightEntryModal: React.FC<WeightEntryModalProps> = ({
    visible,
    product,
    onConfirm,
    onCancel,
    allowNoStock,
}) => {
    const [quantity, setQuantity] = useState<string>('');
    const [error, setError] = useState<string>('');

    // Reset state when modal opens
    useEffect(() => {
        if (visible) {
            setQuantity('');
            setError('');
        }
    }, [visible]);

    const handleConfirm = () => {
        setError('');

        if (!quantity || quantity.trim() === '') {
            setError('Please enter a quantity');
            return;
        }

        const qty = parseFloat(quantity);
        if (isNaN(qty)) {
            setError('Please enter a valid number');
            return;
        }

        if (qty <= 0) {
            setError('Quantity must be greater than 0');
            return;
        }

        // Feature #8 – stock check
        if (!allowNoStock && product) {
            const availableStock = product.currentStock ?? 0;
            if (qty > availableStock) {
                setError(
                    `Cannot exceed available stock: ${availableStock.toFixed(3)} ${product.unitShortName || product.unitName}`
                );
                return;
            }
        }

        onConfirm(qty);
    };

    const handleCancel = () => {
        setQuantity('');
        setError('');
        onCancel();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleConfirm();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    if (!product) return null;

    // Use correct Product type fields
    const availableStock = product.currentStock ?? 0;
    const unitLabel = product.unitShortName || product.unitName || 'Unit';

    return (
        <Modal
            title={`Enter Quantity – ${product.name}`}
            open={visible}
            onCancel={handleCancel}
            footer={null}
            width={420}
            centered
            destroyOnClose
        >
            {/* Product info card */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Row gutter={16} className="mb-3">
                    <Col span={12}>
                        <div className="text-sm text-gray-500 font-medium">Product</div>
                        <div className="text-base font-semibold text-gray-800 truncate">{product.name}</div>
                    </Col>
                    <Col span={12}>
                        <div className="text-sm text-gray-500 font-medium">Unit</div>
                        <div className="text-base font-semibold text-blue-600">{unitLabel}</div>
                    </Col>
                </Row>
                <div>
                    <div className="text-sm text-gray-500 font-medium">Available Stock</div>
                    <div className="text-lg font-bold text-blue-600">
                        {availableStock.toFixed(3)} {unitLabel}
                    </div>
                </div>
            </div>

            {/* Feature #8 – Stock warnings */}
            {!allowNoStock && availableStock <= 0 && (
                <Alert
                    message="This product is out of stock and cannot be added"
                    type="error"
                    showIcon
                    className="mb-4"
                />
            )}
            {availableStock <= 0 && allowNoStock && (
                <Alert
                    message="Out of stock – this will be added as negative inventory"
                    type="warning"
                    showIcon
                    className="mb-4"
                />
            )}

            {/* Input */}
            <Form layout="vertical">
                <Form.Item
                    label={`Quantity (${unitLabel})`}
                    required
                    validateStatus={error ? 'error' : ''}
                    help={error}
                >
                    <Input
                        type="number"
                        step="0.001"
                        placeholder="Enter quantity (e.g., 2.500)"
                        value={quantity}
                        onChange={(e) => {
                            setQuantity(e.target.value);
                            setError('');
                        }}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        size="large"
                        className="text-lg"
                        disabled={!allowNoStock && availableStock <= 0}
                    />
                </Form.Item>

                <div className="text-xs text-gray-500 mb-6">
                    💡 Press <strong>Enter</strong> to confirm or <strong>Escape</strong> to cancel
                </div>

                <Space style={{ width: '100%', justifyContent: 'flex-end' }} size="middle">
                    <Button onClick={handleCancel} size="large">Cancel</Button>
                    <Button
                        type="primary"
                        onClick={handleConfirm}
                        size="large"
                        disabled={!quantity || isNaN(parseFloat(quantity)) || (!allowNoStock && availableStock <= 0)}
                    >
                        Add to Cart
                    </Button>
                </Space>
            </Form>
        </Modal>
    );
};

export default WeightEntryModal;
