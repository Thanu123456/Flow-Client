import React, { useState } from 'react';
import { Input, Table, Empty, App, Tag } from 'antd';
import { warrantyClaimService } from '../../services/management/warrantyClaimService';
import { apiErrorMessage } from '../../utils/apiError';
import { formatTerm } from '../../utils/warranty';
import type { WarrantyRegistration } from '../../types/entities/warrantyClaim.types';
import { StateTag, fmtDate } from './warrantyUi';

interface Props {
  onSelect: (reg: WarrantyRegistration) => void;
  autoFocus?: boolean;
}

/** "Does this invoice / serial still have warranty?" — search by invoice no, serial, phone, customer or product. */
const WarrantyLookup: React.FC<Props> = ({ onSelect, autoFocus }) => {
  const { message } = App.useApp();
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<WarrantyRegistration[] | null>(null);

  const run = async (value: string) => {
    const term = value.trim();
    if (term.length < 2) {
      message.info('Enter at least 2 characters');
      return;
    }
    setLoading(true);
    try {
      setRows(await warrantyClaimService.lookup(term));
    } catch (e) {
      message.error(apiErrorMessage(e, 'Lookup failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Input.Search
        autoFocus={autoFocus}
        size="large"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onSearch={run}
        loading={loading}
        enterButton="Check warranty"
        placeholder="Invoice number, serial number, phone or product"
        allowClear
      />
      {rows && (
        <Table<WarrantyRegistration>
          className="mt-3"
          size="small"
          rowKey="id"
          loading={loading}
          dataSource={rows}
          pagination={rows.length > 8 ? { pageSize: 8, size: 'small' } : false}
          locale={{ emptyText: <Empty description="No warranty found for that search" /> }}
          onRow={(r) => ({ onClick: () => onSelect(r), style: { cursor: 'pointer' } })}
          columns={[
            {
              title: 'Product',
              dataIndex: 'productName',
              render: (n: string, r) => (
                <div>
                  <div className="font-medium">{n}</div>
                  <div className="text-xs text-gray-500">{r.invoiceNumber}{r.serialNumber ? ` · SN ${r.serialNumber}` : ''}</div>
                </div>
              ),
            },
            { title: 'Customer', dataIndex: 'customerName', render: (n?: string) => n || 'Walk-in' },
            {
              title: 'Warranty',
              render: (_: unknown, r) => (
                <div>
                  <div>{r.warrantyName}</div>
                  <div className="text-xs text-gray-500">{formatTerm(r.duration, r.period)}</div>
                </div>
              ),
            },
            { title: 'Expires', dataIndex: 'expiryDate', render: (d?: string) => (d ? fmtDate(d) : <Tag color="cyan">Lifetime</Tag>) },
            { title: 'Status', render: (_: unknown, r) => <StateTag reg={r} /> },
          ]}
        />
      )}
    </div>
  );
};

export default WarrantyLookup;
