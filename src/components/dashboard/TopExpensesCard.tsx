import React from 'react';
import { Card, Typography, Empty, Skeleton, List, Progress } from 'antd';
import { useDashboardStore } from '../../store/reports/dashboardStore';

const { Title, Text } = Typography;

const TopExpensesCard: React.FC = () => {
    const { charts, chartsLoading } = useDashboardStore();

    const data = React.useMemo(() => {
        const raw = charts?.topExpenses ?? [];
        console.log('[TopExpensesCard] raw topExpenses:', raw.length, 'items', raw);
        return raw;
    }, [charts]);

    const maxAmount = React.useMemo(() => {
        if (data.length === 0) return 0;
        return Math.max(...data.map(item => item.value));
    }, [data]);

    return (
        <Card 
            className="shadow-sm rounded-2xl border border-gray-100 h-full"
            styles={{ body: { padding: '24px' } }}
        >
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Title level={5} style={{ margin: 0, fontWeight: 800 }}>Top Expenses</Title>
                    <Text type="secondary" className="text-xs uppercase tracking-wider font-semibold">
                        This Month's Spending
                    </Text>
                </div>
            </div>
            
            <div style={{ minHeight: 200 }}>
                {chartsLoading ? (
                    <Skeleton active paragraph={{ rows: 5 }} />
                ) : data.length > 0 ? (
                    <List
                        dataSource={data}
                        renderItem={(item) => (
                            <List.Item style={{ border: 'none', padding: '12px 0' }}>
                                <div style={{ width: '100%' }}>
                                    <div className="flex justify-between mb-1">
                                        <Text strong>{item.label}</Text>
                                        <Text strong>LKR {item.value.toLocaleString()}</Text>
                                    </div>
                                    <Progress 
                                        percent={(item.value / maxAmount) * 100} 
                                        showInfo={false} 
                                        strokeColor={item.value === maxAmount ? '#ff4d4f' : '#faad14'}
                                        trailColor="#f5f5f5"
                                        strokeWidth={8}
                                    />
                                </div>
                            </List.Item>
                        )}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full min-h-[200px]">
                        <Empty description="No Expense Data Available" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    </div>
                )}
            </div>
        </Card>
    );
};

export default TopExpensesCard;
