import React from 'react';
import { Card, Typography, Empty } from 'antd';

const { Title, Text } = Typography;

const TopExpensesCard: React.FC = () => {
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
            
            <div style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Empty description="No Expense Data Available" />
            </div>
        </Card>
    );
};

export default TopExpensesCard;
