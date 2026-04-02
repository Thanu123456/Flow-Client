import React from 'react';
import { Card, Row, Col, Typography, Tag } from 'antd';
import {
  Wallet,
  ShoppingCart,
  RotateCcw,
  TrendingUp,
  Banknote,
  ArrowDownIcon,
  ArrowUpIcon
} from 'lucide-react';

import { useDashboardStore } from '../../store/reports/dashboardStore';
import { Skeleton } from 'antd';

const { Title, Text } = Typography;

// Formatter for currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value).replace('LKR', 'LKR:');
};

export const SummaryCards: React.FC = () => {
  const { data, loading } = useDashboardStore();

  const sales = data?.summary?.sales;
  const purchases = data?.summary?.purchases;
  const salesReturn = data?.summary?.salesReturn;
  const purchasesReturn = data?.summary?.purchasesReturn;
  const expenses = data?.summary?.expenses;
  const profit = data?.summary?.profit;

  const stats = [
    {
      title: 'SALES',
      amount: sales?.amount || 0.00,
      icon: <Wallet size={48} className="text-indigo-600" />,
      trend: sales?.trend || '-100.00%',
      isPositive: sales?.isPositive || false
    },
    {
      title: 'PURCHASES',
      amount: purchases?.amount || 0.00,
      icon: <div className="relative">
        <ShoppingCart size={48} className="text-indigo-600" />
        <ArrowDownIcon size={20} className="absolute -bottom-1 -right-1 text-indigo-800" />
      </div>,
      trend: purchases?.trend || '-100.00%',
      isPositive: purchases?.isPositive || false
    },
    {
      title: 'SALES RETURN',
      amount: salesReturn?.amount || 0.00,
      icon: <RotateCcw size={48} className="text-indigo-600" />,
      trend: salesReturn?.trend || '0.00%',
      isPositive: salesReturn?.isPositive || true
    },
    {
      title: 'PURCHASES RETURN',
      amount: purchasesReturn?.amount || 0.00,
      icon: <div className="relative">
        <ShoppingCart size={48} className="text-indigo-600" />
        <ArrowUpIcon size={20} className="absolute -bottom-1 -right-1 text-indigo-800" />
      </div>,
      trend: purchasesReturn?.trend || '0.00%',
      isPositive: purchasesReturn?.isPositive || true
    },
    {
      title: 'EXPENSES',
      amount: expenses?.amount || 0.00,
      icon: <Banknote size={48} className="text-indigo-600" />,
      trend: expenses?.trend || '0.00%',
      isPositive: expenses?.isPositive || true
    },
    {
      title: 'PROFIT',
      amount: profit?.amount || 0.00,
      icon: <div className="relative">
        <TrendingUp size={48} className="text-indigo-600" />
        <span className="absolute -top-1 -right-1 text-indigo-600 font-bold">$</span>
      </div>,
      trend: profit?.trend || '-100.00%',
      isPositive: profit?.isPositive || false,
      amountColor: '#22c55e'
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      {stats.map((stat, index) => (
        <Col xs={24} md={12} key={index}>
          <Card
            bordered={false}
            className="shadow-sm rounded-xl border border-gray-100"
            styles={{ body: { padding: '16px 24px' } }}
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 2 }} />
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    {stat.icon}
                  </div>
                  <div>
                    <Text className="text-indigo-500 font-bold text-lg mb-0 block">
                      {stat.title}
                    </Text>
                    <div className="flex items-baseline gap-2">
                      <Title level={3} style={{ margin: 0, fontWeight: 800, color: stat.amountColor || 'inherit' }}>
                        {formatCurrency(stat.amount)}
                      </Title>
                    </div>
                  </div>
                </div>
                <Tag
                  className={`m-0 font-bold px-2 py-1 rounded ${stat.isPositive ? 'border-green-200 bg-green-50 text-green-500' : 'border-orange-200 bg-orange-50 text-orange-500'
                    }`}
                  style={{ fontSize: '14px' }}
                >
                  {stat.trend}
                </Tag>
              </div>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export const SecondarySummaryCards: React.FC = () => {
  const { data, loading } = useDashboardStore();

  const stats = [
    {
      title: 'STOCK VALUE',
      amount: data?.secondarySummary?.stockValue || 0.00,
      color: 'blue'
    },
    {
      title: 'COD RETURNS',
      subtitle: '0 Orders Returned',
      amount: data?.secondarySummary?.codReturns || 0.00,
      color: 'red'
    },
    {
      title: 'COD PENDING',
      subtitle: '0 Pending Orders',
      amount: data?.secondarySummary?.codPending || 0.00,
      color: 'orange'
    },
    {
      title: 'COD DELIVERED',
      subtitle: '0 Delivered Orders',
      amount: data?.secondarySummary?.codDelivered || 0.00,
      color: 'green'
    },
    {
      title: 'ESTIMATED PROFIT',
      amount: data?.secondarySummary?.estimatedProfit || 0.00,
      color: 'blue'
    }
  ];

  return (
    <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
      {stats.map((stat, index) => (
        <Col key={index} style={{ flex: 1, minWidth: '200px' }}>
          <Card
            bordered={false}
            className="shadow-sm rounded-xl border border-gray-100 h-full"
            styles={{ body: { padding: '12px 16px' } }}
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <>
                <Text type="secondary" className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: stat.color !== 'blue' ? stat.color : '#4338ca' }}>
                  {stat.title}
                </Text>
                {stat.subtitle && (
                  <Text className="text-[10px] block font-bold" style={{ color: stat.color }}>
                    {stat.subtitle}
                  </Text>
                )}
                <div className="mt-2 flex items-center gap-1">
                  <Text strong className="text-xs">LKR:</Text>
                  <Title level={4} style={{ margin: 0, fontWeight: 800, fontSize: '18px' }}>
                    {stat.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Title>
                </div>
              </>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default SummaryCards;
