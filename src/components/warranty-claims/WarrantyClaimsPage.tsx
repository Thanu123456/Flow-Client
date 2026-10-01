import React, { useCallback, useEffect, useState } from 'react';
import { Tabs, Table, Tag, Space, Card, Statistic, App } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { PageLayout } from '../common/PageLayout';
import { CommonButton } from '../common/Button';
import { useDebounce } from '../../hooks/ui/useDebounce';
import { warrantyClaimService } from '../../services/management/warrantyClaimService';
import { apiErrorMessage } from '../../utils/apiError';
import { formatTerm } from '../../utils/warranty';
import type {
  ClaimStats, WarrantyClaim, WarrantyRegistration,
} from '../../types/entities/warrantyClaim.types';
import RegistrationModal from './RegistrationModal';
import ClaimDrawer from './ClaimDrawer';
import WarrantyLookupModal from './WarrantyLookupModal';
import {
  ClaimStatusTag, StateTag, SupplierStatusTag, fmtDate, fmtDateTime,
} from './warrantyUi';

type TabKey = 'claims' | 'register';

const CLAIM_FILTERS = [
  { label: 'Unfinished (open / approved / in repair)', value: 'open_any' },
  { label: 'Open', value: 'open' },
  { label: 'Approved', value: 'approved' },
  { label: 'In repair', value: 'in_repair' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Awaiting supplier', value: 'supplier:pending' },
];

const REGISTER_FILTERS = [
  { label: 'In warranty', value: 'active' },
  { label: 'Expiring in 30 days', value: 'expiring' },
  { label: 'Lifetime', value: 'lifetime' },
  { label: 'Expired', value: 'expired' },
  { label: 'Void', value: 'voided' },
];

const WarrantyClaimsPage: React.FC = () => {
  const { message } = App.useApp();
  const [tab, setTab] = useState<TabKey>('claims');
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 350);
  const [claimFilter, setClaimFilter] = useState<string | undefined>('open_any');
  const [regFilter, setRegFilter] = useState<string | undefined>(undefined);

  const [stats, setStats] = useState<ClaimStats | null>(null);
  const [claims, setClaims] = useState<WarrantyClaim[]>([]);
  const [regs, setRegs] = useState<WarrantyRegistration[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);

  const [claimId, setClaimId] = useState<string | null>(null);
  const [regId, setRegId] = useState<string | null>(null);
  const [lookupOpen, setLookupOpen] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      setStats(await warrantyClaimService.stats());
    } catch {
      /* counters are a nicety */
    }
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'claims') {
        const supplierPending = claimFilter === 'supplier:pending';
        const res = await warrantyClaimService.listClaims({
          page, limit, search: debounced,
          status: supplierPending ? undefined : claimFilter,
          supplierStatus: supplierPending ? 'pending' : undefined,
        });
        setClaims(res.data);
        setTotal(res.total);
      } else {
        const expiring = regFilter === 'expiring';
        const res = await warrantyClaimService.listRegistrations({
          page, limit, search: debounced,
          state: expiring ? 'active' : regFilter,
          expiringInDays: expiring ? 30 : undefined,
        });
        setRegs(res.data);
        setTotal(res.total);
      }
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to load warranty data'));
    } finally {
      setLoading(false);
    }
  }, [tab, page, limit, debounced, claimFilter, regFilter, message]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadList(); }, [loadList]);
  useEffect(() => { setPage(1); }, [tab, debounced, claimFilter, regFilter]);

  const refreshAll = () => { loadStats(); loadList(); };

  const pagination = {
    current: page,
    pageSize: limit,
    total,
    showSizeChanger: true,
    showTotal: (t: number) => `${t} item${t === 1 ? '' : 's'}`,
    onChange: (p: number, s: number) => { setPage(p); setLimit(s); },
  };

  const filterConfig = tab === 'claims'
    ? [{ placeholder: 'Filter by status', value: claimFilter, onChange: setClaimFilter, options: CLAIM_FILTERS }]
    : [{ placeholder: 'Filter by warranty state', value: regFilter, onChange: setRegFilter, options: REGISTER_FILTERS }];

  return (
    <>
      <PageLayout
        title="Warranty Claims"
        searchConfig={{
          placeholder: tab === 'claims' ? 'Search claim no, invoice, serial, customer…' : 'Search invoice, serial, customer, product…',
          value: search,
          onChange: setSearch,
        }}
        filterConfig={filterConfig}
        actions={
          <Space>
            <CommonButton type="primary" icon={<SearchOutlined />} onClick={() => setLookupOpen(true)}>
              Warranty Check
            </CommonButton>
            <CommonButton icon={<ReloadOutlined style={{ color: 'blue' }} />} onClick={refreshAll}>
              Refresh
            </CommonButton>
          </Space>
        }
      >
        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card size="small"><Statistic title="Open claims" value={stats?.open ?? 0} /></Card>
          <Card size="small"><Statistic title="In repair" value={stats?.inRepair ?? 0} /></Card>
          <Card size="small"><Statistic title="Awaiting supplier" value={stats?.awaitingSupplier ?? 0} /></Card>
          <Card size="small"><Statistic title="Expiring in 30 days" value={stats?.expiringSoon ?? 0} /></Card>
        </div>

        <Tabs
          activeKey={tab}
          onChange={(k) => setTab(k as TabKey)}
          items={[
            { key: 'claims', label: 'Claims' },
            { key: 'register', label: 'Warranty Register' },
          ]}
        />

        {tab === 'claims' ? (
          <Table<WarrantyClaim>
            rowKey="id"
            loading={loading}
            dataSource={claims}
            pagination={pagination}
            onRow={(c) => ({ onClick: () => setClaimId(c.id), style: { cursor: 'pointer' } })}
            columns={[
              { title: 'Claim', dataIndex: 'claimNumber', render: (n: string) => <span className="font-semibold">{n}</span> },
              { title: 'Opened', dataIndex: 'createdAt', render: fmtDateTime },
              {
                title: 'Product',
                dataIndex: 'productName',
                render: (n: string, c) => (
                  <div>
                    <div>{n}</div>
                    <div className="text-xs text-gray-500">{c.invoiceNumber}{c.serialNumber ? ` · SN ${c.serialNumber}` : ''}</div>
                  </div>
                ),
              },
              { title: 'Customer', dataIndex: 'customerName', render: (n?: string) => n || 'Walk-in' },
              { title: 'Issue', dataIndex: 'issueDescription', ellipsis: true },
              {
                title: 'Status',
                dataIndex: 'status',
                render: (s, c) => (
                  <Space size={4} wrap>
                    <ClaimStatusTag status={s} />
                    {!c.inWarranty && <Tag color="orange">Out of warranty</Tag>}
                  </Space>
                ),
              },
              {
                title: 'Supplier',
                dataIndex: 'supplierClaimStatus',
                render: (s) => (s === 'none' ? <span className="text-gray-400">-</span> : <SupplierStatusTag status={s} />),
              },
            ]}
          />
        ) : (
          <Table<WarrantyRegistration>
            rowKey="id"
            loading={loading}
            dataSource={regs}
            pagination={pagination}
            onRow={(r) => ({ onClick: () => setRegId(r.id), style: { cursor: 'pointer' } })}
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
              { title: 'Sold', dataIndex: 'startDate', render: fmtDate },
              { title: 'Expires', dataIndex: 'expiryDate', render: (d?: string) => (d ? fmtDate(d) : <Tag color="cyan">Lifetime</Tag>) },
              { title: 'Status', render: (_: unknown, r) => <StateTag reg={r} /> },
              { title: 'Claims', dataIndex: 'claimCount', align: 'center' as const },
            ]}
          />
        )}
      </PageLayout>

      <RegistrationModal
        registrationId={regId}
        onClose={() => setRegId(null)}
        onChanged={refreshAll}
        onOpenClaim={(c) => { setRegId(null); setClaimId(c.id); }}
      />
      <ClaimDrawer claimId={claimId} onClose={() => setClaimId(null)} onChanged={refreshAll} />
      <WarrantyLookupModal open={lookupOpen} onClose={() => setLookupOpen(false)} />
    </>
  );
};

export default WarrantyClaimsPage;
