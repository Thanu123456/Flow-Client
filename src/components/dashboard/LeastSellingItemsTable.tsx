import React from 'react';
import { Table, Card, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface ProductStatsItem {
    no: number;
    product_name: string;
    quantity: number;
    revenue: number;
}

const LeastSellingItemsTable: React.FC = () => {
    const data: ProductStatsItem[] = [
        { no: 1, product_name: 'රජනි (1kg)', quantity: 0.00, revenue: 0.00 },
        { no: 2, product_name: 'රජනි (200g)', quantity: 0.00, revenue: 0.00 },
        { no: 3, product_name: 'රජනි (75g)', quantity: 0.00, revenue: 0.00 },
        { no: 4, product_name: 'ඇන්කර් (1kg)', quantity: 0.00, revenue: 0.00 },
        { no: 5, product_name: 'ඇන්කර් (200g)', quantity: 0.00, revenue: 0.00 },
        { no: 6, product_name: 'මලිබන් කිරි ඩේවර්...', quantity: 0.00, revenue: 0.00 },
        { no: 7, product_name: 'ඇන්ටන් (400g)', quantity: 0.00, revenue: 0.00 },
        { no: 8, product_name: 'අලියකු (200g)', quantity: 0.00, revenue: 0.00 },
        { no: 9, product_name: 'ඩයමන්ඩ් කිරිපි...', quantity: 0.00, revenue: 0.00 },
    ];

    const columns: ColumnsType<ProductStatsItem> = [
        {
            title: 'No',
            dataIndex: 'no',
            key: 'no',
            width: 40,
        },
        {
            title: 'Product Name',
            dataIndex: 'product_name',
            key: 'product_name',
            render: (text) => <span className="font-semibold">{text}</span>
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'right',
            render: (v: number) => <Text type="danger" style={{ fontWeight: 700 }}>{v.toFixed(2)}</Text>,
        },
        {
            title: 'Revenue',
            dataIndex: 'revenue',
            key: 'revenue',
            align: 'right',
            render: (v: number) => <span className="font-bold">{v.toFixed(2)}</span>,
        },
    ];

    return (
        <Card 
            className="shadow-sm rounded-2xl border border-gray-100 h-full"
            styles={{ body: { padding: '24px' } }}
        >
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Title level={5} style={{ margin: 0, fontWeight: 800 }}>Least Selling Items</Title>
                    <Text type="secondary" className="text-xs uppercase tracking-wider font-semibold">
                        Underperforming Inventory
                    </Text>
                </div>
            </div>
            
            <Table 
                columns={columns} 
                dataSource={data} 
                pagination={false} 
                size="middle"
                rowKey="no"
                scroll={{ y: 300 }}
                className="custom-table"
            />
        </Card>
    );
};

export default LeastSellingItemsTable;
