import React, { useCallback, useEffect, useState } from 'react';
import {
  Card, Table, Typography, Space, Input,
  Spin, Empty, message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import { ReloadOutlined } from '@ant-design/icons';
import { CommonButton } from '../../components/common/Button';
import PeriodFilter from '../../components/reports/shared/PeriodFilter';
import type { PeriodFilterValue } from '../../components/reports/shared/PeriodFilter';
import KPIStatRow from '../../components/reports/shared/KPIStatRow';
import ReportViewToggle from '../../components/reports/shared/ReportViewToggle';
import ExportButtons from '../../components/reports/shared/ExportButtons';
import { purchaseReportService } from '../../services/reports/purchaseReportService';
import { downloadBlob } from '../../utils/downloadBlob';
import type {
  PurchaseReportListResponse, PurchaseReportAnalyticsResponse, GRNListItem, PaymentMethodBreakdownItem,
} from '../../types/entities/report.types';

const { Title, Text } = Typography;

const fmt = (n: number) => `LKR ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PurchaseReports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<PurchaseReportListResponse | null>(null);
  const [analytics, setAnalytics] = useState<PurchaseReportAnalyticsResponse | null>(null);
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState<PeriodFilterValue | null>(null);
  const [view, setView] = useState('List');

  const currentFilter = {
    search: search || undefined,
    date_from: period?.dateFrom,
    date_to: period?.dateTo,
  };

  const loadData = useCallback(async () => {
    if (!period) return;
    setLoading(true);
    try {
      if (view === 'List') {
        const data = await purchaseReportService.getList(currentFilter);
        setList(data);
      } else {
        const data = await purchaseReportService.getAnalytics({ date_from: period.dateFrom, date_to: period.dateTo });
        setAnalytics(data);
      }
    } catch {
      message.error('Failed to load purchases report');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, period, view]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleExportExcel = async () => {
    const blob = await purchaseReportService.exportExcel(currentFilter);
    downloadBlob(blob, `Purchases-Report-${dayjs().format('YYYY-MM-DD-HHmm')}.xlsx`);
  };

  const handleExportPdf = async () => {
    const blob = await purchaseReportService.exportPdf(currentFilter);
    downloadBlob(blob, `Purchases-Report-${dayjs().format('YYYY-MM-DD-HHmm')}.pdf`);
  };

  const grnColumns: ColumnsType<GRNListItem> = [
    { title: 'GRN Number', dataIndex: 'grn_number', key: 'grn_number', render: (v) => <strong>{v}</strong> },
    { title: 'Payment Method', dataIndex: 'payment_method', key: 'payment_method', render: (v: string) => v?.toUpperCase() },
    { title: 'Total Amount', dataIndex: 'total_amount', key: 'total_amount', align: 'right', render: (v: number) => <strong>{fmt(v)}</strong> },
    { title: 'Date', dataIndex: 'date', key: 'date', render: (v: string) => dayjs(v).format('YYYY-MM-DD') },
  ];

  const paymentColumns: ColumnsType<PaymentMethodBreakdownItem> = [
    { title: 'Method', dataIndex: 'method', key: 'method', render: (v: string) => v?.toUpperCase() },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', align: 'right', render: (v: number) => fmt(v) },
    { title: 'GRN Count', dataIndex: 'grn_count', key: 'grn_count', align: 'right' },
  ];

  const paymentBreakdown = analytics?.payment_breakdown ?? [];
  const paymentTotals = paymentBreakdown.reduce(
    (acc, p) => ({ amount: acc.amount + p.amount, grn_count: acc.grn_count + p.grn_count }),
    { amount: 0, grn_count: 0 },
  );

  return (
    <div style={{ padding: '12px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Title level={4} style={{ margin: 0 }}>Purchases Report</Title>
        <Space wrap>
          {view === 'List' && (
            <Input.Search
              placeholder="Search GRN number..."
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 220 }}
            />
          )}
          <PeriodFilter onChange={setPeriod} defaultPreset="this_month" />
          <ReportViewToggle value={view} onChange={setView} />
          <ExportButtons onExportExcel={handleExportExcel} onExportPdf={handleExportPdf} disabled={view === 'List' ? !list : !analytics} />
          <CommonButton icon={<ReloadOutlined style={{ color: 'blue' }} />} onClick={loadData} loading={loading}>Refresh</CommonButton>
        </Space>
      </div>

      <Spin spinning={loading} tip="Loading report...">
        {view === 'List' ? (
          list && list.items.length > 0 ? (
            <Card size="small">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                <Text strong>Running Total: {fmt(list.running_total)}</Text>
              </div>
              <Table
                columns={grnColumns}
                dataSource={list.items}
                rowKey="id"
                size="small"
                pagination={{ pageSize: 15, showTotal: (t) => `${t} records` }}
              />
            </Card>
          ) : (
            !loading && <Empty description="No data" />
          )
        ) : analytics ? (
          <>
            <KPIStatRow
              items={[
                { label: 'Total Purchases', value: analytics.kpis.total_purchases, precision: 0, prefix: '' },
                { label: 'Total Amount', value: analytics.kpis.total_amount },
                { label: 'Total Discount', value: analytics.kpis.total_discount },
                { label: 'Total Paid', value: analytics.kpis.total_paid },
                { label: 'Outstanding', value: analytics.kpis.outstanding, highlight: true },
              ]}
            />

            <Card title="Payment Method Breakdown" size="small" style={{ marginBottom: 16 }}>
              <Table
                columns={paymentColumns}
                dataSource={paymentBreakdown}
                rowKey="method"
                size="small"
                pagination={false}
                summary={() => (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}><strong>TOTAL</strong></Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right"><strong>{fmt(paymentTotals.amount)}</strong></Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="right"><strong>{paymentTotals.grn_count}</strong></Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
              />
            </Card>

            <Card title="Top Suppliers by Amount" size="small" style={{ marginBottom: 16 }}>
              {analytics.top_suppliers.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={analytics.top_suppliers} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="supplier_name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => fmt(Number(v))} />
                    <Bar dataKey="amount" name="Amount" fill="#1677ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="No supplier data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>

            <Card title="Top 10 Grocery Items by Amount" size="small" style={{ marginBottom: 16 }}>
              {analytics.top_items.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={analytics.top_items} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="product_name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => fmt(Number(v))} />
                    <Bar dataKey="amount" name="Amount" fill="#1677ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="No item data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>

            <Card title="Purchase Trend" size="small">
              {analytics.trend.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={analytics.trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => fmt(Number(v))} />
                    <Line type="monotone" dataKey="amount" name="Amount" stroke="#1677ff" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="No trend data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>
          </>
        ) : (
          !loading && <Empty description="No data" />
        )}
      </Spin>
    </div>
  );
};

export default PurchaseReports;
