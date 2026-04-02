import React from 'react';
import { Table, Card, Typography, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface RecentSaleItem {
    id: string;
    reference_no: string;
    customer: string;
    user_name: string;
    quantity_of_items: number;
    payment_method: string;
    total_price: number;
    sale_date: string;
}

const RecentSalesTable: React.FC = () => {
    // Mock data based on Image 5
    const data: RecentSaleItem[] = [
        { id: '1', reference_no: 'OC260401222584', customer: 'My', user_name: 'Admin 12', quantity_of_items: 1, payment_method: 'Cash', total_price: 100.00, sale_date: '2026-04-01 22:25:34' },
        { id: '2', reference_no: 'OR260401222224', customer: 'My', user_name: 'Admin 12', quantity_of_items: 1, payment_method: 'Credit', total_price: 100.00, sale_date: '2026-04-01 22:22:13' },
        { id: '3', reference_no: 'OR260401221824', customer: 'My', user_name: 'Admin 12', quantity_of_items: 1, payment_method: 'Credit', total_price: 100.00, sale_date: '2026-04-01 22:18:28' },
        { id: '4', reference_no: 'OR260401221647', customer: 'My', user_name: 'Admin 12', quantity_of_items: 1, payment_method: 'Credit', total_price: 100.00, sale_date: '2026-04-01 22:16:20' },
        { id: '5', reference_no: 'OR260401202694', customer: 'My', user_name: 'Admin 12', quantity_of_items: 1, payment_method: 'Credit', total_price: 180.00, sale_date: '2026-04-01 20:26:52' },
        { id: '6', reference_no: 'OR260401202682', customer: 'My', user_name: 'Admin 12', quantity_of_items: 3, payment_method: 'Credit', total_price: 400.00, sale_date: '2026-04-01 20:26:38' },
        { id: '7', reference_no: 'OR260401201998', customer: 'My', user_name: 'Admin 12', quantity_of_items: 1, payment_method: 'Credit', total_price: 180.00, sale_date: '2026-04-01 20:19:03' },
    ];

    const columns: ColumnsType<RecentSaleItem> = [
        { 
            title: 'REFERENCE NO', 
            dataIndex: 'reference_no', 
            key: 'reference_no',
            render: (text) => <span className="font-bold text-blue-600">{text}</span>
        },
        { title: 'CUSTOMER', dataIndex: 'customer', key: 'customer' },
        { title: 'USER NAME', dataIndex: 'user_name', key: 'user_name' },
        { title: 'ITEMS', dataIndex: 'quantity_of_items', key: 'quantity_of_items', align: 'center' },
        { 
            title: 'METHOD', 
            dataIndex: 'payment_method', 
            key: 'payment_method',
            render: (text) => (
                <Tag color={text === 'Cash' ? 'green' : 'blue'}>{text.toUpperCase()}</Tag>
            )
        },
        { 
            title: 'TOTAL PRICE', 
            dataIndex: 'total_price', 
            key: 'total_price', 
            align: 'right', 
            render: (v) => <span className="font-extrabold">{v.toFixed(2)}</span> 
        },
        { title: 'SALE DATE', dataIndex: 'sale_date', key: 'sale_date', className: 'text-gray-400 text-xs' },
    ];

    return (
        <Card 
            className="shadow-sm rounded-2xl border border-gray-100 h-full"
            styles={{ body: { padding: '24px' } }}
        >
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Title level={5} style={{ margin: 0, fontWeight: 800 }}>Recent Sales</Title>
                    <Text type="secondary" className="text-xs uppercase tracking-wider font-semibold">
                        Latest Live Transactions
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
            />
        </Card>
    );
};

export default RecentSalesTable;
