import React from 'react';
import { Table, Card, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface StockAlertItem {
    id: string;
    product_id: string;
    product_name: string;
    brand_name: string;
    variation_type: string;
    unit: string;
    stock: number;
}

const StockAlertTable: React.FC = () => {
    // Mock data based on image
    const data: StockAlertItem[] = [
        {
            id: '1',
            product_id: 'PRO151',
            product_name: '230 පාන්',
            brand_name: 'N/A',
            variation_type: 'N/A',
            unit: 'Pieces',
            stock: 10,
        }
    ];

    const columns: ColumnsType<StockAlertItem> = [
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
            className: 'font-semibold',
        },
        {
            title: 'BRAND NAME',
            dataIndex: 'brand_name',
            key: 'brand_name',
        },
        {
            title: 'VARIATION',
            dataIndex: 'variation_type',
            key: 'variation_type',
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
                <Text type="danger" style={{ fontWeight: 800 }}>{stock}</Text>
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
                    <Title level={5} style={{ margin: 0, fontWeight: 800 }}>Stock Alert</Title>
                    <Text type="secondary" className="text-xs uppercase tracking-wider font-semibold">
                        Low Inventory Warning
                    </Text>
                </div>
            </div>
            
            <Table 
                columns={columns} 
                dataSource={data} 
                pagination={false} 
                size="small"
                rowKey="id"
                scroll={{ x: true }}
                className="custom-table"
            />
        </Card>
    );
};

export default StockAlertTable;
