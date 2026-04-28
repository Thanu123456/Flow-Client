import React, { useEffect } from 'react';
import { Modal, Table, Button, Space, Empty, Spin, Popconfirm } from 'antd';
import { DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useHoldStore } from '../../store/transactions/holdStore';
import type { HeldBill } from '../../types/entities/holdBill.types';

interface HeldBillsModalProps {
  visible: boolean;
  onClose: () => void;
  onResume: (bill: HeldBill) => void;
}

const HeldBillsModal: React.FC<HeldBillsModalProps> = ({ visible, onClose, onResume }) => {
  const { heldBills, loading, submitting, fetchHeldBills, resumeHold, deleteHold } = useHoldStore();

  useEffect(() => {
    if (visible) fetchHeldBills('active');
  }, [visible]);

  const handleResume = async (bill: HeldBill) => {
    const resumed = await resumeHold(bill.id);
    if (resumed) {
      onResume(resumed);
      onClose();
    }
  };

  const columns: ColumnsType<HeldBill> = [
    {
      title: 'Bill #',
      dataIndex: 'billNumber',
      key: 'billNumber',
      width: 130,
    },
    {
      title: 'Label',
      dataIndex: 'notes',
      key: 'notes',
      render: (n: string) => n || <span className="text-gray-400">—</span>,
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text: string) => text || 'Walk-in',
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items: any[]) => items?.length ?? 0,
      width: 70,
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => `LKR ${amount.toFixed(2)}`,
      width: 130,
    },
    {
      title: 'Held At',
      dataIndex: 'heldAt',
      key: 'heldAt',
      render: (date: string) => new Date(date).toLocaleString(),
      width: 160,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            loading={submitting}
            onClick={() => handleResume(record)}
          >
            Resume
          </Button>
          <Popconfirm
            title="Delete held bill?"
            description="This cannot be undone."
            onConfirm={() => deleteHold(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger size="small" icon={<DeleteOutlined />} loading={submitting}>
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
      width={950}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        {heldBills.length === 0 && !loading ? (
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
