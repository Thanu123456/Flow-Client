import React from 'react';
import { Table, Card, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface ExpireAlertItem {
    id: string;
    product_id: string;
    product_name: string;
    variation_type: string;
    purchase_date: string;
    expiry_date: string;
}

const ExpireDateAlertTable: React.FC = () => {
    // Mock data
    const data: ExpireAlertItem[] = [
        // Empty in image
    ];

    const columns: ColumnsType<ExpireAlertItem> = [
        {
            title: 'PRODUCT ID',
            dataIndex: 'product_id',
            key: 'product_id',
            className: 'text-xs font-bold text-gray-500',
        },
        {
            title: 'PRODUCT NAME',
            dataIndex: 'product_name',
            key: 'product_name',
            render: (text) => <span className="font-semibold">{text}</span>
        },
        {
            title: 'VARIATION',
            dataIndex: 'variation_type',
            key: 'variation_type',
        },
        {
            title: 'PURCHASED',
            dataIndex: 'purchase_date',
            key: 'purchase_date',
        },
        {
            title: 'EXPIRY',
            dataIndex: 'expiry_date',
            key: 'expiry_date',
            render: (text) => <span className="text-red-500 font-bold">{text}</span>
        },
    ];

    return (
        <Card 
            className="shadow-sm rounded-2xl border border-gray-100 h-full"
            styles={{ body: { padding: '24px' } }}
        >
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Title level={5} style={{ margin: 0, fontWeight: 800 }}>Expire Date Alert</Title>
                    <Text type="secondary" className="text-xs uppercase tracking-wider font-semibold">
                        Expiry Risk Monitoring
                    </Text>
                </div>
            </div>
            
            <Table 
                columns={columns} 
                dataSource={data} 
                pagination={false} 
                size="middle"
                rowKey="id"
                scroll={{ x: true }}
                className="custom-table"
                locale={{ emptyText: <div style={{ height: 100 }}>No items near expiry</div> }}
            />
        </Card>
    );
};

export default ExpireDateAlertTable;
