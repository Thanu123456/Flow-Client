import React from 'react';
import { Table, Card, Typography, Skeleton, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useDashboardStore } from '../../store/reports/dashboardStore';

const { Title, Text } = Typography;

interface ExpireAlertItem {
    id: string;
    productID: string;
    productName: string;
    variationType: string;
    purchaseDate: string;
    expiryDate: string;
}

const ExpireDateAlertTable: React.FC = () => {
    const { charts, chartsLoading } = useDashboardStore();

    const data: ExpireAlertItem[] = React.useMemo(() => {
        const raw = charts?.expireAlerts ?? [];
        console.log('[ExpireDateAlertTable] raw expireAlerts:', raw.length, 'items', raw);
        return raw;
    }, [charts]);

    const columns: ColumnsType<ExpireAlertItem> = [
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
            render: (text) => <span className="font-normal">{text}</span>
        },
        {
            title: 'VARIATION',
            dataIndex: 'variationType',
            key: 'variationType',
        },
        {
            title: 'PURCHASED',
            dataIndex: 'purchaseDate',
            key: 'purchaseDate',
        },
        {
            title: 'EXPIRY',
            dataIndex: 'expiryDate',
            key: 'expiryDate',
            render: (text) => <span className="text-red-500 font-normal">{text}</span>
        },
    ];

    return (
        <Card 
            className="shadow-sm rounded-2xl border border-gray-100 h-full"
            styles={{ body: { padding: '24px' } }}
        >
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Title level={5} style={{ margin: 0, fontWeight: 400 }}>Expire Date Alert</Title>
                    <Text type="secondary" className="text-xs uppercase tracking-wider font-normal">
                        Expiry Risk Monitoring
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
                    size="middle"
                    rowKey="id"
                    scroll={{ x: true }}
                    className="custom-table"
                />
            ) : (
                <div className="flex items-center justify-center min-h-[200px]">
                    <Empty description="No items near expiry" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
            )}
        </Card>
    );
};

export default ExpireDateAlertTable;
