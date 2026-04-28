import React, { useEffect, useState } from 'react';
import {
  Table, Button, Tabs, Input, Space, Popconfirm, Tag, Typography, DatePicker, message,
} from 'antd';
import {
  SearchOutlined, CheckCircleOutlined, DeleteOutlined, ArrowLeftOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useHoldStore } from '../../store/transactions/holdStore';
import { usePOSStore } from '../../store/transactions/posStore';
import type { HeldBill } from '../../types/entities/holdBill.types';

const { Title } = Typography;
const { RangePicker } = DatePicker;

type StatusTab = 'active' | 'resumed' | 'cancelled';

const STATUS_COLOR: Record<string, string> = {
  active: 'gold',
  resumed: 'green',
  cancelled: 'red',
};

const HoldBills: React.FC = () => {
  const navigate = useNavigate();
  const { heldBills, loading, submitting, fetchHeldBills, resumeHold, deleteHold } = useHoldStore();
  const { resumeHoldBill } = usePOSStore();

  const [activeTab, setActiveTab] = useState<StatusTab>('active');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  useEffect(() => {
    fetchHeldBills(activeTab);
  }, [activeTab]);

  const handleResume = async (bill: HeldBill) => {
    const resumed = await resumeHold(bill.id);
    if (resumed) {
      resumeHoldBill(resumed);
      message.success('Bill restored — opening POS...');
      navigate('/pos');
    }
  };

  const filtered = heldBills.filter((b) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      b.billNumber.toLowerCase().includes(q) ||
      (b.notes && b.notes.toLowerCase().includes(q)) ||
      (b.customerName && b.customerName.toLowerCase().includes(q));

    const matchesDate =
      !dateRange ||
      !dateRange[0] ||
      !dateRange[1] ||
      (dayjs(b.heldAt).isAfter(dateRange[0].startOf('day')) &&
        dayjs(b.heldAt).isBefore(dateRange[1].endOf('day')));

    return matchesSearch && matchesDate;
  });

  const columns: ColumnsType<HeldBill> = [
    {
      title: 'Bill #',
      dataIndex: 'billNumber',
      key: 'billNumber',
      width: 140,
    },
    {
      title: 'Label / Note',
      dataIndex: 'notes',
      key: 'notes',
      render: (n: string) => n || <span className="text-gray-400">—</span>,
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (t: string) => t || 'Walk-in',
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      width: 70,
      render: (items: any[]) => items?.length ?? 0,
    },
    {
      title: 'Total (LKR)',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 130,
      render: (v: number) => v.toFixed(2),
    },
    {
      title: 'Held At',
      dataIndex: 'heldAt',
      key: 'heldAt',
      width: 170,
      render: (d: string) => dayjs(d).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s: string) => (
        <Tag color={STATUS_COLOR[s] ?? 'default'}>{s.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) =>
        record.status === 'active' ? (
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              loading={submitting}
              onClick={() => handleResume(record)}
            >
              Open in POS
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
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        ),
    },
  ];

  const tabItems = (
    [
      { key: 'active', label: 'Active' },
      { key: 'resumed', label: 'Resumed' },
      { key: 'cancelled', label: 'Cancelled' },
    ] as { key: StatusTab; label: string }[]
  ).map(({ key, label }) => ({
    key,
    label,
    children: (
      <Table
        dataSource={filtered}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 15, showSizeChanger: true }}
        size="middle"
        scroll={{ x: 900 }}
      />
    ),
  }));

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            type="text"
          />
          <Title level={4} className="m-0">
            Held Bills
          </Title>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex items-center gap-4 flex-wrap">
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Search by bill #, label or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: 320 }}
          />
          <RangePicker
            value={dateRange as any}
            onChange={(v) => setDateRange(v as any)}
            style={{ width: 260 }}
          />
          <Button onClick={() => { setSearch(''); setDateRange(null); }}>
            Clear Filters
          </Button>
          <div className="ml-auto text-sm text-gray-500">
            {filtered.length} record{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <Tabs
            activeKey={activeTab}
            onChange={(k) => setActiveTab(k as StatusTab)}
            items={tabItems}
            className="px-4"
          />
        </div>
      </div>
    </div>
  );
};

export default HoldBills;
