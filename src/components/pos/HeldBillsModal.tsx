import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, Space, Empty, Spin, Popconfirm, message } from 'antd';
import { DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface HeldBill {
    id: string;
    bill_number: string;
    customer_name?: string;
    total_amount: number;
    items: any[];
    held_at: string;
    status: string;
}

interface HeldBillsModalProps {
    visible: boolean;
    onClose: () => void;
    onResume: (billData: HeldBill) => void;
    loading?: boolean;
}

const HeldBillsModal: React.FC<HeldBillsModalProps> = ({
    visible,
    onClose,
    onResume,
    loading = false,
}) => {
    const [heldBills, setHeldBills] = useState<HeldBill[]>([]);
    const [loadingBills, setLoadingBills] = useState(false);

    useEffect(() => {
        if (visible) {
            loadHeldBills();
        }
    }, [visible]);

    const loadHeldBills = async () => {
        setLoadingBills(true);
        try {
            const response = await fetch('/api/admin/pos/holds');
            if (response.ok) {
                const data = await response.json();
                setHeldBills(data.data || []);
            }
        } catch (error) {
            message.error('Failed to load held bills');
        } finally {
            setLoadingBills(false);
        }
    };

    const handleResume = async (bill: HeldBill) => {
        try {
            const response = await fetch(`/api/admin/pos/holds/${bill.id}/resume`, {
                method: 'POST',
            });
            if (response.ok) {
                const data = await response.json();
                onResume(data.data);
                onClose();
                message.success('Bill resumed');
            }
        } catch (error) {
            message.error('Failed to resume bill');
        }
    };

    const handleDelete = async (billId: string) => {
        try {
            await fetch(`/api/admin/pos/holds/${billId}`, {
                method: 'DELETE',
            });
            message.success('Bill deleted');
            loadHeldBills();
        } catch (error) {
            message.error('Failed to delete bill');
        }
    };

    const columns: ColumnsType<HeldBill> = [
        {
            title: 'Bill #',
            dataIndex: 'bill_number',
            key: 'bill_number',
            width: 120,
        },
        {
            title: 'Customer',
            dataIndex: 'customer_name',
            key: 'customer_name',
            render: (text) => text || 'Walk-in',
        },
        {
            title: 'Items',
            dataIndex: 'items',
            key: 'items',
            render: (items) => items?.length || 0,
            width: 80,
        },
        {
            title: 'Total',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (amount) => `LKR ${amount.toFixed(2)}`,
            width: 120,
        },
        {
            title: 'Held',
            dataIndex: 'held_at',
            key: 'held_at',
            render: (date) => new Date(date).toLocaleString(),
            width: 160,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 200,
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleResume(record)}
                    >
                        Resume
                    </Button>
                    <Popconfirm
                        title="Delete Bill"
                        description="Are you sure you want to delete this held bill?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger size="small" icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Modal
            title="Held Bills"
            open={visible}
            onCancel={onClose}
            width={900}
            footer={[
                <Button key="close" onClick={onClose}>
                    Close
                </Button>,
            ]}
        >
            <Spin spinning={loadingBills || loading}>
                {heldBills.length === 0 ? (
                    <Empty description="No held bills" />
                ) : (
                    <Table
                        dataSource={heldBills}
                        columns={columns}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        size="small"
                    />
                )}
            </Spin>
        </Modal>
    );
};

export default HeldBillsModal;
