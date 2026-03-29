import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Input, Select, DatePicker, message, Tag, Empty, Spin } from 'antd';
import { EyeOutlined, PrinterOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

interface SaleItem {
	id: string;
	bill_number: string;
	customer_name?: string;
	total_amount: number;
	payment_method: string;
	created_at: string;
	items?: any[];
	subtotal: number;
	discount_amount?: number;
	delivery_charge?: number;
}

const SalesHistoryTable: React.FC = () => {
	const [sales, setSales] = useState<SaleItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchText, setSearchText] = useState('');
	const [paymentFilter, setPaymentFilter] = useState<string>('');
	const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
	const [detailsModalVisible, setDetailsModalVisible] = useState(false);
	const [selectedSale, setSelectedSale] = useState<SaleItem | null>(null);

	const loadSales = async () => {
		setLoading(true);
		try {
			let url = '/api/admin/sales';
			const params = new URLSearchParams();

			if (searchText) {
				params.append('search', searchText);
			}
			if (paymentFilter) {
				params.append('payment_method', paymentFilter);
			}
			if (dateRange && dateRange[0] && dateRange[1]) {
				params.append('date_from', dateRange[0].format('YYYY-MM-DD'));
				params.append('date_to', dateRange[1].format('YYYY-MM-DD'));
			}

			if (params.toString()) {
				url += '?' + params.toString();
			}

			const response = await fetch(url);
			if (response.ok) {
				const data = await response.json();
				setSales(data.data || []);
			}
		} catch (error) {
			message.error('Failed to load sales');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadSales();
	}, [searchText, paymentFilter, dateRange]);

	const handlePrint = async (saleId: string) => {
		try {
			const response = await fetch(`/api/admin/sales/${saleId}/receipt`);
			if (response.ok) {
				const data = await response.json();
				// Trigger browser print dialog
				const printWindow = window.open('', '', 'height=600,width=800');
				if (printWindow) {
					printWindow.document.write(data.receipt_html || 'Receipt data');
					printWindow.document.close();
					printWindow.print();
				}
			}
		} catch (error) {
			message.error('Failed to print receipt');
		}
	};

	const columns: ColumnsType<SaleItem> = [
		{
			title: 'Bill #',
			dataIndex: 'bill_number',
			key: 'bill_number',
			width: 120,
			render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
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
			width: 100,
			render: (amount) => `LKR ${amount.toFixed(2)}`,
		},
		{
			title: 'Discount',
			dataIndex: 'discount_amount',
			key: 'discount_amount',
			width: 100,
			render: (amount) => amount ? `LKR ${amount.toFixed(2)}` : '-',
		},
		{
			title: 'Delivery',
			dataIndex: 'delivery_charge',
			key: 'delivery_charge',
			width: 100,
			render: (charge) => charge ? `LKR ${charge.toFixed(2)}` : '-',
		},
		{
			title: 'Total',
			dataIndex: 'total_amount',
			key: 'total_amount',
			width: 110,
			render: (amount) => <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{`LKR ${amount.toFixed(2)}`}</span>,
		},
		{
			title: 'Payment',
			dataIndex: 'payment_method',
			key: 'payment_method',
			width: 100,
			render: (method) => {
				const colorMap: Record<string, string> = {
					cash: 'green',
					card: 'blue',
					cod: 'orange',
				};
				return <Tag color={colorMap[method] || 'default'}>{method.toUpperCase()}</Tag>;
			},
		},
		{
			title: 'Date',
			dataIndex: 'created_at',
			key: 'created_at',
			width: 160,
			render: (date) => new Date(date).toLocaleString(),
		},
		{
			title: 'Actions',
			key: 'actions',
			width: 150,
			render: (_, record) => (
				<Space>
					<Button
						type="primary"
						size="small"
						icon={<EyeOutlined />}
						onClick={() => {
							setSelectedSale(record);
							setDetailsModalVisible(true);
						}}
					>
						View
					</Button>
					<Button
						size="small"
						icon={<PrinterOutlined />}
						onClick={() => handlePrint(record.id)}
					>
						Print
					</Button>
				</Space>
			),
		},
	];

	return (
		<>
			<Space direction="vertical" style={{ width: '100%', marginBottom: '20px' }} size="large">
				<Space wrap>
					<Input
						placeholder="Search bill # or customer..."
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						style={{ width: 250 }}
						allowClear
					/>
					<Select
						placeholder="Payment Method"
						value={paymentFilter}
						onChange={setPaymentFilter}
						style={{ width: 150 }}
						allowClear
						options={[
							{ label: 'Cash', value: 'cash' },
							{ label: 'Card', value: 'card' },
							{ label: 'COD', value: 'cod' },
						]}
					/>
					<DatePicker.RangePicker
						value={dateRange}
						onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null] | null)}
						format="YYYY-MM-DD"
					/>
					<Button onClick={loadSales}>Refresh</Button>
				</Space>
			</Space>

			<Spin spinning={loading}>
				{sales.length === 0 ? (
					<Empty description="No sales found" />
				) : (
					<Table
						columns={columns}
						dataSource={sales}
						rowKey="id"
						pagination={{ pageSize: 10 }}
						size="small"
					/>
				)}
			</Spin>

			<Modal
				title={`Sale Details - ${selectedSale?.bill_number}`}
				open={detailsModalVisible}
				onCancel={() => setDetailsModalVisible(false)}
				footer={[
					<Button key="close" onClick={() => setDetailsModalVisible(false)}>
						Close
					</Button>,
					<Button
						key="print"
						type="primary"
						icon={<PrinterOutlined />}
						onClick={() => {
							if (selectedSale) {
								handlePrint(selectedSale.id);
							}
						}}
					>
						Print
					</Button>,
				]}
				width={700}
			>
				{selectedSale && (
					<div>
						<div style={{ marginBottom: '20px' }}>
							<p><strong>Bill Number:</strong> {selectedSale.bill_number}</p>
							<p><strong>Customer:</strong> {selectedSale.customer_name || 'Walk-in'}</p>
							<p><strong>Payment Method:</strong> {selectedSale.payment_method.toUpperCase()}</p>
							<p><strong>Date:</strong> {new Date(selectedSale.created_at).toLocaleString()}</p>
						</div>

						<div style={{ marginBottom: '20px' }}>
							<h4>Items</h4>
							<Table
								dataSource={selectedSale.items}
								columns={[
									{
										title: 'Product',
										dataIndex: 'name',
										key: 'name',
									},
									{
										title: 'Qty',
										dataIndex: 'quantity',
										key: 'quantity',
										width: 80,
									},
									{
										title: 'Price',
										dataIndex: 'price',
										key: 'price',
										width: 100,
										render: (price) => `LKR ${price.toFixed(2)}`,
									},
									{
										title: 'Total',
										dataIndex: 'total',
										key: 'total',
										width: 100,
										render: (_, record) => `LKR ${(record.quantity * record.price).toFixed(2)}`,
									},
								]}
								rowKey="id"
								pagination={false}
								size="small"
							/>
						</div>

						<div style={{ textAlign: 'right', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
							<p><strong>Subtotal:</strong> LKR {selectedSale.subtotal.toFixed(2)}</p>
							{selectedSale.discount_amount ? (
								<p><strong>Discount:</strong> -LKR {selectedSale.discount_amount.toFixed(2)}</p>
							) : null}
							{selectedSale.delivery_charge ? (
								<p><strong>Delivery:</strong> +LKR {selectedSale.delivery_charge.toFixed(2)}</p>
							) : null}
							<p style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
								<strong>Total:</strong> LKR {selectedSale.total_amount.toFixed(2)}
							</p>
						</div>
					</div>
				)}
			</Modal>
		</>
	);
};

export default SalesHistoryTable;
