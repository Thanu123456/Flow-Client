import React, { useCallback, useEffect, useState } from 'react';
import {
  Card, Col, Row, Statistic, Table, Typography, Space, Select, Tag,
  Spin, Empty, message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
} from 'recharts';
import type { ValueType } from 'recharts/types/component/DefaultTooltipContent';
import dayjs from 'dayjs';
import { ReloadOutlined } from '@ant-design/icons';
import { CommonButton } from '../../components/common/Button';
import PeriodFilter from '../../components/reports/shared/PeriodFilter';
import type { PeriodFilterValue } from '../../components/reports/shared/PeriodFilter';
import KPIStatRow from '../../components/reports/shared/KPIStatRow';
import ReportViewToggle from '../../components/reports/shared/ReportViewToggle';
import ExportButtons from '../../components/reports/shared/ExportButtons';
import { profitLossService } from '../../services/reports/profitLossService';
import { downloadBlob } from '../../utils/downloadBlob';
import type {
  ProfitLossResponse, BillRow, PaymentBreakdownItem,
} from '../../types/entities/report.types';

const { Title, Text } = Typography;

const fmt = (n: number) => `LKR ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const FinancialReports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ProfitLossResponse | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<string | undefined>(undefined);
  const [period, setPeriod] = useState<PeriodFilterValue | null>(null);
  const [view, setView] = useState('Analytics');

  const currentFilter = {
    payment_method: paymentFilter,
    date_from: period?.dateFrom,
    date_to: period?.dateTo,
  };

  const loadReport = useCallback(async () => {
    if (!period) return;
    setLoading(true);
    try {
      const data = await profitLossService.getReport({ ...currentFilter, include_bills: true });
      setReport(data);
    } catch {
      message.error('Failed to load profit & loss report');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentFilter, period]);

  useEffect(() => { loadReport(); }, [loadReport]);

  const handleExportExcel = async () => {
    const blob = await profitLossService.exportExcel(currentFilter);
    downloadBlob(blob, `Profit-Loss-Report-${dayjs().format('YYYY-MM-DD-HHmm')}.xlsx`);
  };

  const handleExportPdf = async () => {
    const blob = await profitLossService.exportPdf(currentFilter);
    downloadBlob(blob, `Profit-Loss-Report-${dayjs().format('YYYY-MM-DD-HHmm')}.pdf`);
  };

  const billColumns: ColumnsType<BillRow> = [
    {
      title: 'Bill No',
      dataIndex: 'bill_no',
      key: 'bill_no',
      render: (v, record) => (
        <Space size={6}>
          <strong>{v}</strong>
          {record.is_return && <Tag color="error">Return</Tag>}
        </Space>
      ),
    },
    { title: 'Customer', dataIndex: 'customer', key: 'customer' },
    { title: 'Cashier', dataIndex: 'cashier', key: 'cashier' },
    { title: 'Qty of Items', dataIndex: 'qty_of_items', key: 'qty_of_items', align: 'right', width: 110 },
    { title: 'Payment Method', dataIndex: 'payment_method', key: 'payment_method', render: (v: string) => v?.toUpperCase() },
    {
      title: 'Total Price',
      dataIndex: 'total_price',
      key: 'total_price',
      align: 'right',
      render: (v: number, record) => (
        <strong style={{ color: record.is_return ? '#cf1322' : undefined }}>{fmt(v)}</strong>
      ),
    },
    { title: 'Sale Date', dataIndex: 'sale_date', key: 'sale_date', render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm') },
    {
      title: 'Profit',
      dataIndex: 'profit',
      key: 'profit',
      align: 'right',
      render: (v: number) => <span style={{ color: v < 0 ? '#cf1322' : undefined }}>{fmt(v)}</span>,
    },
  ];

  const paymentColumns: ColumnsType<PaymentBreakdownItem> = [
    { title: 'Method', dataIndex: 'method', key: 'method', render: (v: string) => v?.toUpperCase() },
    { title: 'Revenue', dataIndex: 'revenue', key: 'revenue', align: 'right', render: (v: number) => <strong>{fmt(v)}</strong> },
  ];

  const hourlyChartData = (report?.hourly_peak ?? []).map((h) => ({
    hourLabel: `${String(h.hour).padStart(2, '0')}:00`,
    revenue: h.revenue,
  }));

  const kpis = report?.kpis;

  return (
    <div style={{ padding: '12px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Title level={4} style={{ margin: 0 }}>Profit & Loss Report</Title>
        <Space wrap>
          <Select
            placeholder="Payment Method"
            allowClear
            value={paymentFilter}
            onChange={setPaymentFilter}
            style={{ width: 150 }}
            options={[
              { label: 'Cash', value: 'cash' },
              { label: 'Card', value: 'card' },
              { label: 'COD', value: 'cod' },
              { label: 'Credit', value: 'credit' },
            ]}
          />
          <PeriodFilter onChange={setPeriod} defaultPreset="this_month" />
          <ReportViewToggle value={view} onChange={setView} />
          <ExportButtons onExportExcel={handleExportExcel} onExportPdf={handleExportPdf} disabled={!report} />
          <CommonButton icon={<ReloadOutlined style={{ color: 'blue' }} />} onClick={loadReport} loading={loading}>Refresh</CommonButton>
        </Space>
      </div>

      <Spin spinning={loading} tip="Loading report...">
        {report && kpis ? (
          view === 'Analytics' ? (
            <>
              <KPIStatRow
                items={[
                  { label: 'Total Revenue', value: kpis.total_revenue },
                  { label: 'Gross Profit', value: kpis.gross_profit },
                  { label: 'Net Profit', value: kpis.net_profit, highlight: true },
                  { label: 'Bills Issued', value: kpis.bills_issued, precision: 0, prefix: '' },
                  { label: 'Items Sold', value: kpis.items_sold, precision: 2, prefix: '' },
                  { label: 'Average Basket Value', value: kpis.average_basket_value },
                  { label: 'Operating Expenses', value: kpis.operating_expenses },
                ]}
              />

              {/* Tax / Payment Gateway Fees — flagged as unimplemented placeholders, never shown as real "LKR 0.00" */}
              <Card title="Tax & Payment Gateway Fees" size="small" style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]}>
                  <Col xs={12} md={6}>
                    <Statistic
                      title={(
                        <Space size={4}>
                          Tax
                          {kpis.tax_unimplemented && <Tag color="default">Not tracked yet</Tag>}
                        </Space>
                      )}
                      value={kpis.tax_unimplemented ? 'N/A' : kpis.tax}
                      precision={kpis.tax_unimplemented ? undefined : 2}
                      prefix={kpis.tax_unimplemented ? undefined : 'LKR'}
                      valueStyle={kpis.tax_unimplemented ? { color: 'rgba(0,0,0,0.35)', fontStyle: 'italic', fontSize: 18 } : undefined}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <Statistic
                      title={(
                        <Space size={4}>
                          Payment Gateway Fees
                          {kpis.payment_gateway_fees_unimplemented && <Tag color="default">Not tracked yet</Tag>}
                        </Space>
                      )}
                      value={kpis.payment_gateway_fees_unimplemented ? 'N/A' : kpis.payment_gateway_fees}
                      precision={kpis.payment_gateway_fees_unimplemented ? undefined : 2}
                      prefix={kpis.payment_gateway_fees_unimplemented ? undefined : 'LKR'}
                      valueStyle={kpis.payment_gateway_fees_unimplemented ? { color: 'rgba(0,0,0,0.35)', fontStyle: 'italic', fontSize: 18 } : undefined}
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <Statistic
                      title="Estimated Profit from Remaining Stock"
                      value={report.estimated_profit_from_stock}
                      precision={2}
                      prefix="LKR"
                    />
                  </Col>
                </Row>
              </Card>

              <Card title="Revenue Trend" size="small" style={{ marginBottom: 16 }}>
                {report.revenue_trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={report.revenue_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <RechartsTooltip formatter={(v: ValueType | undefined) => fmt(Number(v))} />
                      <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#1677ff" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty description="No revenue trend data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>

              <Card title="Daily Profit Trend" size="small" style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 8 }}>
                  This chart always shows a fixed trailing 30-day window and does not respect the period filter above.
                </Text>
                {report.profit_trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={report.profit_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <RechartsTooltip formatter={(v: ValueType | undefined) => fmt(Number(v))} />
                      <Line type="monotone" dataKey="profit" name="Profit" stroke="#1677ff" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty description="No profit trend data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>

              <Card title="Hourly Peak Analysis" size="small" style={{ marginBottom: 16 }}>
                {hourlyChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={hourlyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="hourLabel" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <RechartsTooltip formatter={(v: ValueType | undefined) => fmt(Number(v))} />
                      <Bar dataKey="revenue" name="Revenue" fill="#1677ff" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty description="No hourly data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Card title="Top 10 by Revenue" size="small" style={{ marginBottom: 16 }}>
                    {report.top_by_revenue.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={report.top_by_revenue} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                          <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="product_name" width={110} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                          <RechartsTooltip formatter={(v: ValueType | undefined) => fmt(Number(v))} />
                          <Bar dataKey="revenue" name="Revenue" fill="#1677ff" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Empty description="No data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title="Top 10 by Quantity" size="small" style={{ marginBottom: 16 }}>
                    {report.top_by_quantity.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={report.top_by_quantity} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                          <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="product_name" width={110} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                          <RechartsTooltip formatter={(v: ValueType | undefined) => Number(v).toLocaleString('en-US')} />
                          <Bar dataKey="qty" name="Quantity" fill="#1677ff" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Empty description="No data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                  </Card>
                </Col>
              </Row>

              <Card title="Payment Method Breakdown" size="small">
                {report.payment_breakdown.length > 0 ? (
                  <Table
                    columns={paymentColumns}
                    dataSource={report.payment_breakdown}
                    rowKey="method"
                    size="small"
                    pagination={false}
                  />
                ) : (
                  <Empty description="No payment data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            </>
          ) : (
            report.bills.length > 0 ? (
              <Card size="small">
                <Table
                  columns={billColumns}
                  dataSource={report.bills}
                  rowKey="bill_no"
                  size="small"
                  pagination={{ pageSize: 15, showTotal: (t) => `${t} records` }}
                />
              </Card>
            ) : (
              !loading && <Empty description="No bill data" />
            )
          )
        ) : (
          !loading && <Empty description="No report data" />
        )}
      </Spin>
    </div>
  );
};

export default FinancialReports;
