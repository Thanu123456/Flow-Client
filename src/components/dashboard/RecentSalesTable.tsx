import React from 'react';
import { Table, Card, Typography, Tag, Skeleton, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useDashboardStore } from '../../store/reports/dashboardStore';

const { Title, Text } = Typography;

interface RecentSaleItem {
    id: string;
    referenceNo: string;
    customer: string;
    userName: string;
    itemCount: number;
    paymentMethod: string;
    totalPrice: number;
    saleDate: string;
}

const RecentSalesTable: React.FC = () => {
    const { charts, chartsLoading } = useDashboardStore();

    const data: RecentSaleItem[] = React.useMemo(() => {
        const raw = charts?.recentSales ?? [];
        console.log('[RecentSalesTable] raw recentSales:', raw.length, 'items', raw);
        return raw.map(item => ({
            id: item.id,
            referenceNo: item.referenceNo,
            customer: item.customer,
            userName: item.userName,
            itemCount: item.itemCount,
            paymentMethod: item.paymentMethod,
            totalPrice: item.totalPrice,
            saleDate: item.saleDate
        }));
    }, [charts]);

    const columns: ColumnsType<RecentSaleItem> = [
        { 
            title: 'REFERENCE NO', 
            dataIndex: 'referenceNo', 
            key: 'referenceNo',
            render: (text) => <span className="font-normal text-blue-600">{text}</span>
        },
        { title: 'CUSTOMER', dataIndex: 'customer', key: 'customer' },
        { title: 'USER NAME', dataIndex: 'userName', key: 'userName' },
        { title: 'ITEMS', dataIndex: 'itemCount', key: 'itemCount', align: 'center' },
        { 
            title: 'METHOD', 
            dataIndex: 'paymentMethod', 
            key: 'paymentMethod',
            render: (text) => (
                <Tag color={text === 'Cash' || text === 'cash' ? 'green' : 'blue'}>{text.toUpperCase()}</Tag>
            )
        },
        { 
            title: 'TOTAL PRICE', 
            dataIndex: 'totalPrice', 
            key: 'totalPrice', 
            align: 'right', 
            render: (v) => <span className="font-normal">{v.toFixed(2)}</span> 
        },
        { title: 'SALE DATE', dataIndex: 'saleDate', key: 'saleDate', className: 'text-gray-400 text-xs' },
    ];

    return (
        <Card 
            className="shadow-sm rounded-2xl border border-gray-100 h-full"
            styles={{ body: { padding: '24px' } }}
        >
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Title level={5} style={{ margin: 0, fontWeight: 400 }}>Recent Sales</Title>
                    <Text type="secondary" className="text-xs uppercase tracking-wider font-normal">
                        Latest Live Transactions
                    </Text>
                </div>
            </div>
            
            {chartsLoading ? (
                <Skeleton active paragraph={{ rows: 8 }} />
            ) : data.length > 0 ? (
                <Table 
                    columns={columns} 
                    dataSource={data} 
                    pagination={false} 
                    size="middle"
                    rowKey="id"
                    scroll={{ x: true }}
                    className="custom-table"
                />
            ) : (
                <div className="flex items-center justify-center min-h-[300px]">
                    <Empty description="No recent sales found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
            )}
        </Card>
    );
};

export default RecentSalesTable;
