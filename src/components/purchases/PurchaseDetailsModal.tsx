import React, { useRef } from 'react';
import { Modal, Descriptions, Tag, Table, Divider, Button, Space, Typography } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import type { GRN, GRNItem, GRNStatus, PaymentMethod } from '../../types/entities/purchase.types';
import dayjs from 'dayjs';
import PrintGRN from './PrintGRN';

const { Text } = Typography;

interface Props {
  visible: boolean;
  grn: GRN | null;
  onClose: () => void;
}

const statusColor: Record<GRNStatus, string> = {
  draft: 'default',
  completed: 'green',
  cancelled: 'red',
};

const paymentColor: Record<PaymentMethod, string> = {
  cash: 'blue',
  cheque: 'purple',
  credit: 'orange',
};

const fmt = (n: number) =>
  `Rs. ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PurchaseDetailsModal: React.FC<Props> = ({ visible, grn, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>GRN - ${grn?.grnNumber}</title>
          <style>
            body { margin: 0; padding: 0; }
            @media print { body { margin: 0; } }
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

  if (!grn) return null;

  const itemColumns = [
    {
      title: '#',
      key: 'idx',
      width: 40,
      render: (_: any, __: GRNItem, idx: number) => idx + 1,
    },
    {
      title: 'Product',
      key: 'product',
      render: (_: any, record: GRNItem) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.productName}</div>
          {record.productSKU && <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.productSKU}</div>}
          {record.variationType && <Tag style={{ marginTop: 2 }}>{record.variationType}</Tag>}
        </div>
      ),
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right' as const,
      width: 80,
    },
    {
      title: 'Unit',
      key: 'unit',
      width: 70,
      render: (_: any, r: GRNItem) => r.unitShortName || r.unitName || '-',
    },
    {
      title: 'Cost Price',
      dataIndex: 'costPrice',
      key: 'costPrice',
      align: 'right' as const,
      width: 110,
      render: (v: number) => (
        <span style={{ fontFamily: 'monospace' }}>
          {v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Net Price',
      dataIndex: 'netPrice',
      key: 'netPrice',
      align: 'right' as const,
      width: 120,
      render: (v: number) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
          {v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Expiry',
      key: 'expiry',
      width: 110,
      render: (_: any, r: GRNItem) => {
        if (!r.expiryDate) return <span style={{ color: '#d9d9d9' }}>N/A</span>;
        const diff = dayjs(r.expiryDate).diff(dayjs(), 'month');
        const color = diff < 6 ? 'red' : diff < 12 ? 'orange' : 'green';
        return <Tag color={color}>{dayjs(r.expiryDate).format('DD MMM YYYY')}</Tag>;
      },
    },
    {
      title: 'S/N',
      key: 'serial',
      width: 60,
      render: (_: any, r: GRNItem) =>
        r.hasSerialNumbers ? (
          <Tag color={r.serialNumbers && r.serialNumbers.length > 0 ? 'green' : 'orange'}>
            {r.serialNumbers?.length || 0}
          </Tag>
        ) : (
          '-'
        ),
    },
  ];

  return (
    <>
      <Modal
        open={visible}
        onCancel={onClose}
        width={900}
        title={
          <Space>
            <span>GRN Details</span>
            <Tag color={statusColor[grn.status]} style={{ fontSize: '13px' }}>
              {grn.grnNumber}
            </Tag>
          </Space>
        }
        footer={
          <Space>
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              Print GRN
            </Button>
            <Button onClick={onClose}>Close</Button>
          </Space>
        }
      >
        {/* Header Info */}
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="GRN Number">
            <Text strong style={{ fontFamily: 'monospace' }}>
              {grn.grnNumber}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={statusColor[grn.status]}>
              {grn.status.charAt(0).toUpperCase() + grn.status.slice(1)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="GRN Date">
            {dayjs(grn.grnDate).format('DD MMM YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label="Payment Method">
            <Tag color={paymentColor[grn.paymentMethod]}>
              {grn.paymentMethod.charAt(0).toUpperCase() + grn.paymentMethod.slice(1)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Warehouse">{grn.warehouseName}</Descriptions.Item>
          <Descriptions.Item label="Supplier">
            {grn.supplierName || <Text type="secondary">Walk-in Purchase</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="Created By">{grn.createdByName}</Descriptions.Item>
          <Descriptions.Item label="Created At">
            {dayjs(grn.createdAt).format('DD MMM YYYY HH:mm')}
          </Descriptions.Item>
          {grn.notes && (
            <Descriptions.Item label="Notes" span={2}>
              {grn.notes}
            </Descriptions.Item>
          )}
        </Descriptions>

        <Divider style={{ margin: '16px 0' }}>Items ({grn.itemCount})</Divider>

        <Table
          columns={itemColumns}
          dataSource={grn.items}
          rowKey="id"
          pagination={false}
          size="small"
          scroll={{ x: 600 }}
          expandable={{
            expandedRowRender: (record: GRNItem) =>
              record.hasSerialNumbers && record.serialNumbers && record.serialNumbers.length > 0 ? (
                <div style={{ padding: '8px 16px' }}>
                  <Text strong>Serial Numbers: </Text>
                  {record.serialNumbers.map((sn) => (
                    <Tag key={sn} style={{ marginBottom: 4 }}>
                      {sn}
                    </Tag>
                  ))}
                </div>
              ) : null,
            rowExpandable: (record: GRNItem) =>
              record.hasSerialNumbers && (record.serialNumbers?.length ?? 0) > 0,
          }}
        />

        <Divider style={{ margin: '16px 0' }}>Payment Summary</Divider>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <table style={{ borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 16px', color: '#666' }}>Total Amount:</td>
                <td style={{ padding: '4px 16px', textAlign: 'right', fontFamily: 'monospace' }}>
                  {fmt(grn.totalAmount)}
                </td>
              </tr>
              {grn.discountAmount > 0 && (
                <tr>
                  <td style={{ padding: '4px 16px', color: '#666' }}>Discount:</td>
                  <td style={{ padding: '4px 16px', textAlign: 'right', fontFamily: 'monospace', color: '#52c41a' }}>
                    - {fmt(grn.discountAmount)}
                  </td>
                </tr>
              )}
              <tr style={{ borderTop: '1px solid #d9d9d9' }}>
                <td style={{ padding: '6px 16px', fontWeight: 700 }}>Net Amount:</td>
                <td style={{ padding: '6px 16px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                  {fmt(grn.netAmount)}
                </td>
              </tr>
              {grn.debitBalanceUsed > 0 && (
                <tr>
                  <td style={{ padding: '4px 16px', color: '#666' }}>Debit Balance Used:</td>
                  <td style={{ padding: '4px 16px', textAlign: 'right', fontFamily: 'monospace' }}>
                    {fmt(grn.debitBalanceUsed)}
                  </td>
                </tr>
              )}
              <tr>
                <td style={{ padding: '4px 16px', color: '#666' }}>Paid Amount:</td>
                <td style={{ padding: '4px 16px', textAlign: 'right', fontFamily: 'monospace' }}>
                  {fmt(grn.paidAmount)}
                </td>
              </tr>
              {grn.creditAmount > 0 && (
                <tr>
                  <td style={{ padding: '4px 16px', color: '#ff4d4f' }}>Credit Balance:</td>
                  <td style={{ padding: '4px 16px', textAlign: 'right', fontFamily: 'monospace', color: '#ff4d4f' }}>
                    {fmt(grn.creditAmount)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {grn.paymentMethod === 'cheque' && grn.chequeNumber && (
          <>
            <Divider style={{ margin: '16px 0' }}>Cheque Details</Divider>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Cheque Number">{grn.chequeNumber}</Descriptions.Item>
              {grn.chequeDate && (
                <Descriptions.Item label="Cheque Date">
                  {dayjs(grn.chequeDate).format('DD MMM YYYY')}
                  {grn.isPostDated && <Tag color="orange" style={{ marginLeft: 8 }}>Post-dated</Tag>}
                </Descriptions.Item>
              )}
              {grn.chequeNote && (
                <Descriptions.Item label="Note" span={2}>{grn.chequeNote}</Descriptions.Item>
              )}
              {grn.pendingChequeAmount > 0 && (
                <Descriptions.Item label="Pending Amount">
                  <Text type="warning">{fmt(grn.pendingChequeAmount)}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </>
        )}
      </Modal>

      {/* Hidden print view */}
      <div style={{ display: 'none' }}>
        <PrintGRN ref={printRef} grn={grn} />
      </div>
    </>
  );
};

export default PurchaseDetailsModal;
