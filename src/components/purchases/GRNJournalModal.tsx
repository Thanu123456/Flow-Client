import React, { useEffect, useState } from 'react';
import { Modal, Table, Typography, Tag, Empty, Spin, message } from 'antd';
import dayjs from 'dayjs';
import { purchaseService } from '../../services/transactions/purchaseService';
import type { JournalEntry, JournalLine } from '../../types/entities/purchase.types';

const { Text, Title } = Typography;

interface Props {
  visible: boolean;
  grnId: string | null;
  grnNumber?: string;
  onClose: () => void;
  // Defaults to the GRN journal endpoint; pass an alternate fetcher (e.g. the
  // purchase-return journal) to reuse this viewer for other GL-posting sources.
  fetchEntries?: (id: string) => Promise<JournalEntry[]>;
  title?: string;
}

const fmt = (n: number) =>
  n === 0 ? '' : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const GRNJournalModal: React.FC<Props> = ({ visible, grnId, grnNumber, onClose, fetchEntries, title }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    if (visible && grnId) {
      setLoading(true);
      (fetchEntries ?? purchaseService.getGRNJournal)(grnId)
        .then(setEntries)
        .catch(() => messageApi.error('Failed to load journal entries'))
        .finally(() => setLoading(false));
    } else {
      setEntries([]);
    }
  }, [visible, grnId]);

  const columns = [
    { title: 'Account', key: 'account', render: (_: any, l: JournalLine) => `${l.accountCode} — ${l.accountName}` },
    { title: 'Debit', dataIndex: 'debit', key: 'debit', align: 'right' as const, render: fmt },
    { title: 'Credit', dataIndex: 'credit', key: 'credit', align: 'right' as const, render: fmt },
  ];

  return (
    <Modal open={visible} onCancel={onClose} onOk={onClose} title={title || `GL Journal — ${grnNumber || ''}`} width={640}>
      {contextHolder}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
      ) : entries.length === 0 ? (
        <Empty description="No journal entries raised for this document yet." />
      ) : (
        entries.map((e) => (
          <div key={e.id} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <Title level={5} style={{ margin: 0 }}>
                {e.entryNumber}
                {e.reversesEntryId && <Tag color="orange" style={{ marginLeft: 8 }}>Reversal</Tag>}
                {e.reversedByEntryId && <Tag color="red" style={{ marginLeft: 8 }}>Reversed</Tag>}
              </Title>
              <Text type="secondary">{dayjs(e.entryDate).format('DD MMM YYYY')}</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>{e.description}</Text>
            <Table
              columns={columns}
              dataSource={e.lines}
              rowKey={(_, idx) => `${e.id}-${idx}`}
              pagination={false}
              size="small"
              style={{ marginTop: 8 }}
            />
          </div>
        ))
      )}
    </Modal>
  );
};

export default GRNJournalModal;
