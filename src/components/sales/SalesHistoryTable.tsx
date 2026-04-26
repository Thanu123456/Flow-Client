import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	Table, Button, Modal, message, Tag, Empty, Spin, Descriptions, Space,
} from 'antd';
import { EyeOutlined, RollbackOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { saleService } from '../../services/transactions/saleService';
import type { SaleListItem, SaleDetailItem } from '../../types/entities/sale.types';

const PAYMENT_COLORS: Record<string, string> = {
	cash: 'green',
	card: 'blue',
	cod: 'orange',
	credit: 'purple',
	hold: 'default',
};

interface SalesHistoryTableProps {
	search?: string;
	paymentMethod?: string;
	dateRange?: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
	refresh?: boolean;
}

const SalesHistoryTable: React.FC<SalesHistoryTableProps> = ({
	search,
	paymentMethod,
	dateRange,
	refresh
}) => {
	const navigate = useNavigate();
	const [sales, setSales] = useState<SaleListItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [detailVisible, setDetailVisible] = useState(false);
	const [detailLoading, setDetailLoading] = useState(false);
	const [selectedSale, setSelectedSale] = useState<SaleDetailItem | null>(null);

	const loadSales = useCallback(async () => {
		setLoading(true);
		try {
			const data = await saleService.listSales({
				search: search || undefined,
				payment_method: paymentMethod || undefined,
				date_from: dateRange?.[0]?.format('YYYY-MM-DD') ?? undefined,
				date_to: dateRange?.[1]?.format('YYYY-MM-DD') ?? undefined,
			});
			setSales(data);
		} catch {
			message.error('Failed to load sales');
		} finally {
			setLoading(false);
		}
	}, [search, paymentMethod, dateRange]);

	useEffect(() => { loadSales(); }, [loadSales, refresh]);

	const openDetail = async (id: string) => {
		setDetailVisible(true);
		setDetailLoading(true);
		setSelectedSale(null);
		try {
			const detail = await saleService.getSaleDetail(id);
			setSelectedSale(detail);
		} catch {
			message.error('Failed to load sale details');
			setDetailVisible(false);
		} finally {
			setDetailLoading(false);
		}
	};

	const columns: ColumnsType<SaleListItem> = [
		{
			title: 'Bill Number',
			dataIndex: 'invoice_number',
			key: 'invoice_number',
			width: 180,
			render: (text) => <strong>{text || '—'}</strong>,
		},
		{
			title: 'Customer',
			dataIndex: 'customer_name',
			key: 'customer_name',
			width: 150,
			render: (text) => text || 'Walk-in',
		},
		{
			title: 'Subtotal',
			dataIndex: 'subtotal',
			key: 'subtotal',
			width: 110,
			align: 'right',
			render: (v: number) => `LKR ${v.toFixed(2)}`,
		},
		{
			title: 'Discount',
			dataIndex: 'discount_amount',
			key: 'discount_amount',
			width: 100,
			align: 'right',
			render: (v: number) => v > 0 ? `-LKR ${v.toFixed(2)}` : '—',
		},
		{
			title: 'Delivery',
			dataIndex: 'delivery_charge',
			key: 'delivery_charge',
			width: 100,
			align: 'right',
			render: (v: number) => v > 0 ? `+LKR ${v.toFixed(2)}` : '—',
		},
		{
			title: 'Total',
			dataIndex: 'total_amount',
			key: 'total_amount',
			width: 120,
			align: 'right',
			render: (v: number) => (
				<strong style={{ color: '#1890ff' }}>{`LKR ${v.toFixed(2)}`}</strong>
			),
		},
		{
			title: 'Payment',
			dataIndex: 'payment_method',
			key: 'payment_method',
			width: 100,
			render: (method: string) => (
				<Tag color={PAYMENT_COLORS[method?.toLowerCase()] ?? 'default'}>
					{method?.toUpperCase()}
				</Tag>
			),
		},
		{
			title: 'Date',
			dataIndex: 'created_at',
			key: 'created_at',
			width: 160,
			render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
		},
		{
			title: 'Actions',
			key: 'actions',
			width: 160,
			render: (_, record) => (
				<Space size="small">
					<Button
						type="primary"
						size="small"
						icon={<EyeOutlined />}
						onClick={() => openDetail(record.id)}
					>
						View
					</Button>
					<Button
						size="small"
						danger
						icon={<RollbackOutlined />}
						onClick={() => navigate(`/sales-returns/new/${record.id}`)}
						disabled={record.status === 'refunded'}
					>
						Return
					</Button>
				</Space>
			),
		},
	];

	const itemColumns: ColumnsType<any> = [
		{ title: 'Product', dataIndex: 'name', key: 'name' },
		{
			title: 'Qty', dataIndex: 'quantity', key: 'quantity', width: 80,
			render: (v: number) => v % 1 === 0 ? v : v.toFixed(3),
		},
		{
			title: 'Unit Price', dataIndex: 'price', key: 'price', width: 110, align: 'right',
			render: (v: number) => `LKR ${v.toFixed(2)}`,
		},
		{
			title: 'Total', key: 'total', width: 110, align: 'right',
			render: (_: any, r: any) => `LKR ${(r.quantity * r.price).toFixed(2)}`,
		},
	];

	return (
		<>
			{/* Table */}
			<Spin spinning={loading}>
				{sales.length === 0 && !loading ? (
					<Empty description="No sales found" />
				) : (
					<Table
						columns={columns}
						dataSource={sales}
						rowKey="id"
						pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (t) => `${t} records` }}
						size="small"
						scroll={{ x: 900 }}
					/>
				)}
			</Spin>

			{/* Detail Modal */}
			<Modal
				title={selectedSale ? `Sale — ${selectedSale.invoice_number || selectedSale.id}` : 'Sale Details'}
				open={detailVisible}
				onCancel={() => setDetailVisible(false)}
				footer={
					<Button onClick={() => setDetailVisible(false)}>Close</Button>
				}
				width={760}
			>
				<Spin spinning={detailLoading}>
					{selectedSale && (
						<>
							<Descriptions size="small" column={2} bordered style={{ marginBottom: 16 }}>
								<Descriptions.Item label="Invoice #">{selectedSale.invoice_number || '—'}</Descriptions.Item>
								<Descriptions.Item label="Customer">{selectedSale.customer_name}</Descriptions.Item>
								<Descriptions.Item label="Payment">
									<Tag color={PAYMENT_COLORS[selectedSale.payment_method?.toLowerCase()] ?? 'default'}>
										{selectedSale.payment_method?.toUpperCase()}
									</Tag>
								</Descriptions.Item>
								<Descriptions.Item label="Date">
									{dayjs(selectedSale.created_at).format('YYYY-MM-DD HH:mm')}
								</Descriptions.Item>
								<Descriptions.Item label="Status">
									<Tag color={selectedSale.status === 'completed' ? 'green' : 'orange'}>
										{selectedSale.status?.toUpperCase()}
									</Tag>
								</Descriptions.Item>
							</Descriptions>

							<Table
								columns={itemColumns}
								dataSource={selectedSale.items}
								rowKey="id"
								pagination={false}
								size="small"
								style={{ marginBottom: 16 }}
							/>

							<div style={{ textAlign: 'right', lineHeight: '2em' }}>
								<div>Subtotal: <strong>LKR {selectedSale.subtotal.toFixed(2)}</strong></div>
								{selectedSale.discount_amount > 0 && (
									<div>Discount: <strong style={{ color: '#f5222d' }}>-LKR {selectedSale.discount_amount.toFixed(2)}</strong></div>
								)}
								{selectedSale.delivery_charge > 0 && (
									<div>Delivery: <strong>+LKR {selectedSale.delivery_charge.toFixed(2)}</strong></div>
								)}
								<div style={{ fontSize: 16 }}>
									Total: <strong style={{ color: '#1890ff' }}>LKR {selectedSale.total_amount.toFixed(2)}</strong>
								</div>
								<div>Paid: <strong>LKR {selectedSale.paid_amount.toFixed(2)}</strong></div>
							</div>
						</>
					)}
				</Spin>
			</Modal>
		</>
	);
};

export default SalesHistoryTable;
