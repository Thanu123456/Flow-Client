import React from 'react';
import { Table, Card, Typography, Skeleton, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useDashboardStore } from '../../store/reports/dashboardStore';

const { Title, Text } = Typography;

interface StockAlertItem {
    id: string;
    productID: string;
    productName: string;
    brandName: string;
    variationType: string;
    unit: string;
    stock: number;
}

const StockAlertTable: React.FC = () => {
    const { charts, chartsLoading } = useDashboardStore();

    const data: StockAlertItem[] = React.useMemo(() => {
        const raw = charts?.stockAlerts ?? [];
        console.log('[StockAlertTable] raw stockAlerts:', raw.length, 'items', raw);
        return raw;
    }, [charts]);

    const columns: ColumnsType<StockAlertItem> = [
        {
            title: 'PRODUCT ID',
            dataIndex: 'productID',
            key: 'productID',
            className: 'text-xs font-normal text-gray-500',
        },
        {
            title: 'PRODUCT NAME',
            dataIndex: 'productName',
            key: 'productName',
            className: 'font-normal',
        },
        {
            title: 'BRAND NAME',
            dataIndex: 'brandName',
            key: 'brandName',
        },
        {
            title: 'VARIATION',
            dataIndex: 'variationType',
            key: 'variationType',
        },
        {
            title: 'UNIT',
            dataIndex: 'unit',
            key: 'unit',
        },
        {
            title: 'STOCK',
            dataIndex: 'stock',
            key: 'stock',
            align: 'right',
            render: (stock: number) => (
                <Text type="danger" style={{ fontWeight: 400 }}>{stock}</Text>
            ),
        },
    ];

    return (
        <Card 
            className="shadow-sm rounded-2xl border border-gray-100 h-full"
            styles={{ body: { padding: '24px' } }}
        >
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Title level={5} style={{ margin: 0, fontWeight: 400 }}>Stock Alert</Title>
                    <Text type="secondary" className="text-xs uppercase tracking-wider font-normal">
                        Low Inventory Warning
                    </Text>
                </div>
            </div>
            
            {chartsLoading ? (
                <Skeleton active paragraph={{ rows: 6 }} />
            ) : data.length > 0 ? (
                <Table 
                    columns={columns} 
                    dataSource={data} 
                    pagination={false} 
                    size="small"
                    rowKey="id"
                    scroll={{ x: true }}
                    className="custom-table"
                />
            ) : (
                <div className="flex items-center justify-center min-h-[200px]">
                    <Empty description="All stock levels healthy" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
            )}
        </Card>
    );
};

export default StockAlertTable;
