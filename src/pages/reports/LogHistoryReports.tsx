import React, { useCallback, useEffect, useState } from 'react';
import {
  Card, Table, Typography, Space, Input, DatePicker, Tag, Modal,
  Spin, Empty, message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Legend,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import { ReloadOutlined, PrinterOutlined } from '@ant-design/icons';
import { CommonButton } from '../../components/common/Button';
import PeriodFilter from '../../components/reports/shared/PeriodFilter';
import type { PeriodFilterValue } from '../../components/reports/shared/PeriodFilter';
import KPIStatRow from '../../components/reports/shared/KPIStatRow';
import ReportViewToggle from '../../components/reports/shared/ReportViewToggle';
import { logHistoryService } from '../../services/reports/logHistoryService';
import type {
  LogHistorySessionListResponse, LogHistoryAnalyticsResponse, LogHistorySession,
  LogHistoryReceipt, CurrentlyLoggedInItem, LeaderboardItem,
} from '../../types/entities/report.types';

const { Title, Text } = Typography;

const fmt = (n: number) => `LKR ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Formats a duration given in seconds as "Xh Ym". */
const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
};

// Two-series categorical colors (validated CVD-safe pair): blue = cash/sales, orange = card/refunds.
const COLOR_PRIMARY = '#1677ff';
const COLOR_SECONDARY = '#eb6834';

/** Shared recharts Tooltip formatter for money-valued series (avoids `any` in the Formatter<ValueType,NameType> signature). */
const tooltipMoneyFormatter = (value: unknown) => fmt(Number(value));

/** Direct-label renderer for the Cash vs Card pie slices. */
const pieSliceLabel = (props: unknown) => {
  const { name, value } = props as { name: string; value: number };
  return `${name}: ${fmt(value)}`;
};

const LogHistoryReports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [sessionList, setSessionList] = useState<LogHistorySessionListResponse | null>(null);
  const [analytics, setAnalytics] = useState<LogHistoryAnalyticsResponse | null>(null);
  const [search, setSearch] = useState('');
  const [sessionDate, setSessionDate] = useState<dayjs.Dayjs | null>(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<PeriodFilterValue | null>(null);
  const [view, setView] = useState('List');

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receipt, setReceipt] = useState<LogHistoryReceipt | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (view === 'Analytics' && !analyticsPeriod) return;
    setLoading(true);
    try {
      if (view === 'List') {
        const data = await logHistoryService.getSessionList({
          search: search || undefined,
          date: sessionDate ? sessionDate.format('YYYY-MM-DD') : undefined,
        });
        setSessionList(data);
      } else {
        const data = await logHistoryService.getAnalytics({
          date_from: analyticsPeriod?.dateFrom,
          date_to: analyticsPeriod?.dateTo,
        });
        setAnalytics(data);
      }
    } catch {
      message.error('Failed to load log history report');
    } finally {
      setLoading(false);
    }
  }, [search, sessionDate, analyticsPeriod, view]);

  useEffect(() => { loadData(); }, [loadData]);

  const handlePrintReceipt = async (sessionId: string) => {
    setReceiptModalOpen(true);
    setReceiptLoading(true);
    setReceipt(null);
    try {
      const data = await logHistoryService.getReceipt(sessionId);
      setReceipt(data);
    } catch {
      message.error('Failed to load session receipt');
    } finally {
      setReceiptLoading(false);
    }
  };

  const closeReceiptModal = () => {
    setReceiptModalOpen(false);
    setReceipt(null);
  };

  const sessionColumns: ColumnsType<LogHistorySession> = [
    { title: 'Session Start Time', dataIndex: 'session_start_time', key: 'session_start_time', render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm') },
    { title: 'Session End Time', dataIndex: 'session_end_time', key: 'session_end_time', render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '—') },
    { title: 'Username', dataIndex: 'username', key: 'username', render: (v) => <strong>{v}</strong> },
    { title: 'Cash In Hand', dataIndex: 'cash_in_hand', key: 'cash_in_hand', align: 'right', render: (v: number) => fmt(v) },
    { title: 'Cash Amount', dataIndex: 'cash_amount', key: 'cash_amount', align: 'right', render: (v: number) => fmt(v) },
    { title: 'Card Amount', dataIndex: 'card_amount', key: 'card_amount', align: 'right', render: (v: number) => fmt(v) },
    { title: 'Total Sale Amount', dataIndex: 'total_sale_amount', key: 'total_sale_amount', align: 'right', render: (v: number) => <strong>{fmt(v)}</strong> },
    { title: 'Total Refund Amount', dataIndex: 'total_refund_amount', key: 'total_refund_amount', align: 'right', render: (v: number) => fmt(v) },
    { title: 'Note', dataIndex: 'note', key: 'note', render: (v?: string) => v || '—' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v === 'active' ? 'green' : 'default'}>{v?.toUpperCase()}</Tag> },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <CommonButton size="small" icon={<PrinterOutlined />} onClick={() => handlePrintReceipt(record.session_id)}>
          Print
        </CommonButton>
      ),
    },
  ];

  const loggedInColumns: ColumnsType<CurrentlyLoggedInItem> = [
    { title: 'Username', dataIndex: 'username', key: 'username', render: (v) => <strong>{v}</strong> },
    { title: 'Login Time', dataIndex: 'login_time', key: 'login_time', render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm') },
    { title: 'Duration', dataIndex: 'duration_seconds', key: 'duration_seconds', render: (v: number) => formatDuration(v) },
    { title: 'Live Sales So Far', dataIndex: 'live_sales_so_far', key: 'live_sales_so_far', align: 'right', render: (v: number) => <strong>{fmt(v)}</strong> },
  ];

  const leaderboardColumns: ColumnsType<LeaderboardItem> = [
    { title: 'Username', dataIndex: 'username', key: 'username', render: (v) => <strong>{v}</strong> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v?.toLowerCase() === 'live' ? 'green' : 'default'}>{v}</Tag> },
    { title: 'Last Login', dataIndex: 'last_login', key: 'last_login', render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm') },
    { title: 'Session Count', dataIndex: 'session_count', key: 'session_count', align: 'right' },
    { title: 'Total Sales', dataIndex: 'total_sales', key: 'total_sales', align: 'right', render: (v: number) => <strong>{fmt(v)}</strong> },
    { title: 'Total Refunds', dataIndex: 'total_refunds', key: 'total_refunds', align: 'right', render: (v: number) => fmt(v) },
  ];

  const pieData = analytics
    ? [
        { name: 'Cash', value: analytics.cash_card_split.cash },
        { name: 'Card', value: analytics.cash_card_split.card },
      ]
    : [];

  return (
    <div style={{ padding: '12px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Title level={4} style={{ margin: 0 }}>Log History Report</Title>
        <Space wrap>
          {view === 'List' ? (
            <>
              <Input.Search
                placeholder="Search username..."
                allowClear
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 220 }}
              />
              <DatePicker
                placeholder="Session date"
                value={sessionDate}
                onChange={setSessionDate}
                format="YYYY-MM-DD"
                allowClear
              />
            </>
          ) : (
            <PeriodFilter onChange={setAnalyticsPeriod} defaultPreset="this_month" />
          )}
          <ReportViewToggle value={view} onChange={setView} />
          <CommonButton icon={<ReloadOutlined style={{ color: 'blue' }} />} onClick={loadData} loading={loading}>Refresh</CommonButton>
        </Space>
      </div>

      <Spin spinning={loading} tip="Loading report...">
        {view === 'List' ? (
          sessionList && sessionList.sessions.length > 0 ? (
            <Card size="small">
              <Table
                columns={sessionColumns}
                dataSource={sessionList.sessions}
                rowKey="session_id"
                size="small"
                pagination={{ pageSize: 15, showTotal: (t) => `${t} records` }}
                scroll={{ x: 'max-content' }}
              />
            </Card>
          ) : (
            !loading && <Empty description="No sessions found" />
          )
        ) : analytics ? (
          <>
            <KPIStatRow
              items={[
                { label: 'Total Sessions', value: analytics.kpis.total_sessions, precision: 0, prefix: '' },
                { label: 'Currently Live', value: analytics.kpis.currently_live, precision: 0, prefix: '' },
                { label: `Top Performer: ${analytics.kpis.top_performer_name || 'N/A'}`, value: analytics.kpis.top_performer_sales },
                { label: 'Total Revenue', value: analytics.kpis.total_revenue },
                { label: 'Total Refunds', value: analytics.kpis.total_refunds, highlight: true },
              ]}
            />

            <Card title="Currently Logged In" size="small" style={{ marginBottom: 16 }}>
              {analytics.currently_logged_in.length > 0 ? (
                <Table
                  columns={loggedInColumns}
                  dataSource={analytics.currently_logged_in}
                  rowKey="username"
                  size="small"
                  pagination={false}
                />
              ) : (
                <Empty description="No one is currently logged in" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>

            <Card title="User Activity Leaderboard" size="small" style={{ marginBottom: 16 }}>
              {analytics.leaderboard.length > 0 ? (
                <Table
                  columns={leaderboardColumns}
                  dataSource={analytics.leaderboard}
                  rowKey="username"
                  size="small"
                  pagination={{ pageSize: 10 }}
                />
              ) : (
                <Empty description="No leaderboard data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>

            <Card title="Top Cashiers by Sales" size="small" style={{ marginBottom: 16 }}>
              {analytics.top_cashiers.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={analytics.top_cashiers} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="username" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={tooltipMoneyFormatter} />
                    <Bar dataKey="sales" name="Sales" fill={COLOR_PRIMARY} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="No cashier data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>

            <Card title="Cash vs Card Split" size="small" style={{ marginBottom: 16 }}>
              {pieData.some((d) => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={pieSliceLabel}
                    >
                      <Cell fill={COLOR_PRIMARY} />
                      <Cell fill={COLOR_SECONDARY} />
                    </Pie>
                    <Tooltip formatter={tooltipMoneyFormatter} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="No payment split data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>

            <Card title="Daily Sales vs Refunds Trend" size="small">
              {analytics.daily_trend.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={analytics.daily_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={tooltipMoneyFormatter} />
                    <Legend />
                    <Line type="monotone" dataKey="sales" name="Sales" stroke={COLOR_PRIMARY} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="refunds" name="Refunds" stroke={COLOR_SECONDARY} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="No trend data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>
          </>
        ) : (
          !loading && <Empty description="No analytics data" />
        )}
      </Spin>

      <Modal
        title="Session Receipt"
        open={receiptModalOpen}
        onCancel={closeReceiptModal}
        footer={[
          <CommonButton key="close" onClick={closeReceiptModal}>Close</CommonButton>,
          <CommonButton key="print" type="primary" icon={<PrinterOutlined />} onClick={() => window.print()} disabled={!receipt}>
            Print
          </CommonButton>,
        ]}
      >
        <Spin spinning={receiptLoading}>
          {receipt ? (
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Text strong>{receipt.username}</Text>
              <Text type="secondary">
                {dayjs(receipt.session_start_time).format('YYYY-MM-DD HH:mm')}
                {' — '}
                {receipt.session_end_time ? dayjs(receipt.session_end_time).format('YYYY-MM-DD HH:mm') : 'Ongoing'}
              </Text>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text>Duration</Text><Text>{formatDuration(receipt.duration_seconds)}</Text></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text>Cash In Hand</Text><Text>{fmt(receipt.cash_in_hand)}</Text></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text>Cash Amount</Text><Text>{fmt(receipt.cash_amount)}</Text></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text>Card Amount</Text><Text>{fmt(receipt.card_amount)}</Text></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text>Credit Sales</Text><Text>{fmt(receipt.credit_sales)}</Text></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text>Credit Payments</Text><Text>{fmt(receipt.credit_payments)}</Text></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text strong>Total Sale Amount</Text><Text strong>{fmt(receipt.total_sale_amount)}</Text></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text>Total Refund Amount</Text><Text>{fmt(receipt.total_refund_amount)}</Text></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text>Note</Text><Text>{receipt.note || '—'}</Text></div>
            </Space>
          ) : (
            !receiptLoading && <Empty description="No receipt data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Spin>
      </Modal>
    </div>
  );
};

export default LogHistoryReports;
