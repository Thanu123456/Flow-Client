import React from 'react';
import { Table, Card, Typography, Skeleton, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useDashboardStore } from '../../store/reports/dashboardStore';

const { Title, Text } = Typography;

interface ProductStatsItem {
    no: number;
    productName: string;
    quantity: number;
    revenue: number;
}

const LeastSellingItemsTable: React.FC = () => {
    const { charts, chartsLoading } = useDashboardStore();

    const data: ProductStatsItem[] = React.useMemo(() => {
        const raw = charts?.leastSellingItems ?? [];
        console.log('[LeastSellingItemsTable] raw leastSellingItems:', raw.length, 'items', raw);
        return raw.map(item => ({
            no: item.no,
            productName: item.productName,
            quantity: item.quantity,
            revenue: item.revenue
        }));
    }, [charts]);

    const columns: ColumnsType<ProductStatsItem> = [
        {
            title: 'No',
            dataIndex: 'no',
            key: 'no',
            width: 40,
        },
        {
            title: 'Product Name',
            dataIndex: 'productName',
            key: 'productName',
            render: (text) => <span className="font-normal">{text}</span>
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'right',
            render: (v: number) => <Text type="danger" style={{ fontWeight: 400 }}>{v.toFixed(2)}</Text>,
        },
        {
            title: 'Revenue',
            dataIndex: 'revenue',
            key: 'revenue',
            align: 'right',
            render: (v: number) => <span className="font-normal">{v.toFixed(2)}</span>,
        },
    ];

    return (
        <Card 
            className="shadow-sm rounded-2xl border border-gray-100 h-full"
            styles={{ body: { padding: '24px' } }}
        >
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Title level={5} style={{ margin: 0, fontWeight: 400 }}>Least Selling Items</Title>
                    <Text type="secondary" className="text-xs uppercase tracking-wider font-normal">
                        Underperforming Inventory
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
                    rowKey="no"
                    scroll={{ y: 300 }}
                    className="custom-table"
                />
            ) : (
                <div className="flex items-center justify-center min-h-[300px]">
                    <Empty description="No underperforming items data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
            )}
        </Card>
    );
};

export default LeastSellingItemsTable;
