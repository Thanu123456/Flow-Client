import React, { useRef } from 'react';
import { Modal, Descriptions, Table, Tag, Typography, Space, Popconfirm, message } from 'antd';
import { CheckOutlined, CloseOutlined, LockOutlined, PrinterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { PurchaseOrder, POItem, POStatus } from '../../types/entities/purchaseOrder.types';
import { CommonButton } from '../common/Button';
import PrintPO from './PrintPO';
import { usePermissions } from '../../hooks/auth/usePermissions';
import { PERMISSIONS } from '../../types/auth/permissions';

const { Text } = Typography;

const statusColor: Record<POStatus, string> = {
  draft: 'default',
  approved: 'blue',
  partially_received: 'gold',
  received: 'green',
  closed: 'purple',
  cancelled: 'red',
};

interface Props {
  visible: boolean;
  po: PurchaseOrder | null;
  onClose: () => void;
  onApprove: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
  onCloseOrder: (id: string) => Promise<void>;
}

const fmt = (n: number) => `Rs. ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PODetailsModal: React.FC<Props> = ({ visible, po, onClose, onApprove, onCancel, onCloseOrder }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [busy, setBusy] = React.useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { hasPermission } = usePermissions();
  const canApprove = hasPermission(PERMISSIONS.PURCHASES_APPROVE);

  if (!po) return null;

  const handlePrint = () => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>PO - ${po?.poNumber}</title>
          <style>
             @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            body { margin: 0; padding: 20px; font-family: 'Inter', sans-serif; }
            @media print { body { margin: 0; padding: 0; } }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #eee; padding: 8px; text-align: left; }
            th { background-color: #f9f9f9; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  };

  const columns = [
    { title: 'Product', dataIndex: 'productName', key: 'productName' },
    { title: 'Variation', dataIndex: 'variationType', key: 'variationType', render: (v?: string) => v || '-' },
    { title: 'Unit', dataIndex: 'unitShortName', key: 'unitShortName', render: (v?: string) => v || '-' },
    { title: 'Ordered', dataIndex: 'orderedQty', key: 'orderedQty', align: 'right' as const },
    { title: 'Received', dataIndex: 'receivedQty', key: 'receivedQty', align: 'right' as const },
    { title: 'Outstanding', dataIndex: 'outstandingQty', key: 'outstandingQty', align: 'right' as const },
    { title: 'Unit Cost', dataIndex: 'unitCost', key: 'unitCost', align: 'right' as const, render: fmt },
    { title: 'Line Total', dataIndex: 'lineTotal', key: 'lineTotal', align: 'right' as const, render: fmt },
  ];

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch (e: any) {
      messageApi.error(e.response?.data?.error?.details || e.response?.data?.error?.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={visible}
      title={`Purchase Order — ${po.poNumber}`}
      onCancel={onClose}
      width={900}
      footer={
        <Space>
          <CommonButton icon={<PrinterOutlined />} onClick={handlePrint}>Print PO</CommonButton>
          {po.status === 'draft' && canApprove && (
            <Popconfirm title="Approve this purchase order?" onConfirm={() => run(() => onApprove(po.id))}>
              <CommonButton type="primary" icon={<CheckOutlined />} loading={busy}>Approve</CommonButton>
            </Popconfirm>
          )}
          {(po.status === 'draft' || po.status === 'approved' || po.status === 'partially_received') && canApprove && (
            <Popconfirm title="Cancel this purchase order?" onConfirm={() => run(() => onCancel(po.id))}>
              <CommonButton danger icon={<CloseOutlined />} loading={busy}>Cancel</CommonButton>
            </Popconfirm>
          )}
          {(po.status === 'approved' || po.status === 'partially_received') && canApprove && (
            <Popconfirm title="Close this purchase order? The outstanding quantity will not be received." onConfirm={() => run(() => onCloseOrder(po.id))}>
              <CommonButton icon={<LockOutlined />} loading={busy}>Close</CommonButton>
            </Popconfirm>
          )}
        </Space>
      }
    >
      {contextHolder}
      <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Status">
          <Tag color={statusColor[po.status]}>{po.status.replace('_', ' ').toUpperCase()}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Order Date">{dayjs(po.orderDate).format('DD MMM YYYY')}</Descriptions.Item>
        <Descriptions.Item label="Supplier">{po.supplierName}</Descriptions.Item>
        <Descriptions.Item label="Warehouse">{po.warehouseName}</Descriptions.Item>
        <Descriptions.Item label="Expected Date">{po.expectedDate ? dayjs(po.expectedDate).format('DD MMM YYYY') : '-'}</Descriptions.Item>
        <Descriptions.Item label="Over-receipt Tolerance">{po.overReceiptTolerancePct}%</Descriptions.Item>
        <Descriptions.Item label="Subtotal">{fmt(po.subtotal)}</Descriptions.Item>
        <Descriptions.Item label="Discount">{fmt(po.discountAmount)}</Descriptions.Item>
        <Descriptions.Item label="Total Amount">
          <Text strong>{fmt(po.totalAmount)}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Created By">{po.createdByName || '-'}</Descriptions.Item>
        {po.notes && <Descriptions.Item label="Notes" span={2}>{po.notes}</Descriptions.Item>}
      </Descriptions>

      <Table<POItem>
        columns={columns}
        dataSource={po.items}
        rowKey="id"
        pagination={false}
        size="small"
      />

      {/* Hidden print view */}
      <div style={{ display: 'none' }}>
        <PrintPO ref={printRef} po={po} />
      </div>
    </Modal>
  );
};

export default PODetailsModal;
