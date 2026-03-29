import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, message, Tag, Empty, Spin, Popconfirm } from 'antd';
import { CheckCircleOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface CODOrder {
	id: string;
	bill_number: string;
	customer_name?: string;
	customer_phone?: string;
	customer_address?: string;
	total_amount: number;
	status: 'pending_delivery' | 'delivered' | 'cancelled';
	created_at: string;
	items?: any[];
}

const CODOrdersTable: React.FC = () => {
	const [orders, setOrders] = useState<CODOrder[]>([]);
	const [loading, setLoading] = useState(false);
	const [detailsModalVisible, setDetailsModalVisible] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<CODOrder | null>(null);

	const loadOrders = async () => {
		setLoading(true);
		try {
			const response = await fetch('/api/admin/pos/cod-orders');
			if (response.ok) {
				const data = await response.json();
				setOrders(data.data || []);
			}
		} catch (error) {
			message.error('Failed to load COD orders');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadOrders();
	}, []);

	const handleMarkDelivered = async (orderId: string) => {
		try {
			const response = await fetch(`/api/admin/pos/cod-orders/${orderId}/deliver`, {
				method: 'PATCH',
			});
			if (response.ok) {
				message.success('Order marked as delivered');
				loadOrders();
			}
		} catch (error) {
			message.error('Failed to mark order as delivered');
		}
	};

	const handleCancel = async (orderId: string) => {
		try {
			const response = await fetch(`/api/admin/pos/cod-orders/${orderId}/cancel`, {
				method: 'PATCH',
			});
			if (response.ok) {
				message.success('Order cancelled and stock restored');
				loadOrders();
			}
		} catch (error) {
			message.error('Failed to cancel order');
		}
	};

	const getStatusColor = (status: string) => {
		const colorMap: Record<string, string> = {
			pending_delivery: 'orange',
			delivered: 'green',
			cancelled: 'red',
		};
		return colorMap[status] || 'default';
	};

	const getStatusText = (status: string) => {
		const textMap: Record<string, string> = {
			pending_delivery: 'Pending Delivery',
			delivered: 'Delivered',
			cancelled: 'Cancelled',
		};
		return textMap[status] || status;
	};

	const columns: ColumnsType<CODOrder> = [
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
		},
		{
			title: 'Phone',
			dataIndex: 'customer_phone',
			key: 'customer_phone',
			width: 120,
		},
		{
			title: 'Address',
			dataIndex: 'customer_address',
			key: 'customer_address',
			width: 200,
			ellipsis: true,
		},
		{
			title: 'Total',
			dataIndex: 'total_amount',
			key: 'total_amount',
			width: 110,
			render: (amount) => <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{`LKR ${amount.toFixed(2)}`}</span>,
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			width: 140,
			render: (status) => (
				<Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
			),
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
			width: 200,
			render: (_, record) => (
				<Space>
					<Button
						type="primary"
						size="small"
						icon={<EyeOutlined />}
						onClick={() => {
							setSelectedOrder(record);
							setDetailsModalVisible(true);
						}}
					>
						View
					</Button>
					{record.status === 'pending_delivery' && (
						<>
							<Button
								type="primary"
								size="small"
								icon={<CheckCircleOutlined />}
								onClick={() => handleMarkDelivered(record.id)}
								style={{ backgroundColor: '#52c41a' }}
							>
								Delivered
							</Button>
							<Popconfirm
								title="Cancel Order"
								description="Are you sure you want to cancel this order? Stock will be restored."
								onConfirm={() => handleCancel(record.id)}
								okText="Yes"
								cancelText="No"
							>
								<Button danger size="small" icon={<DeleteOutlined />}>
									Cancel
								</Button>
							</Popconfirm>
						</>
					)}
				</Space>
			),
		},
	];

	return (
		<>
			<Spin spinning={loading}>
				{orders.length === 0 ? (
					<Empty description="No COD orders found" />
				) : (
					<Table
						columns={columns}
						dataSource={orders}
						rowKey="id"
						pagination={{ pageSize: 10 }}
						size="small"
					/>
				)}
			</Spin>

			<Modal
				title={`Order Details - ${selectedOrder?.bill_number}`}
				open={detailsModalVisible}
				onCancel={() => setDetailsModalVisible(false)}
				footer={[
					<Button key="close" onClick={() => setDetailsModalVisible(false)}>
						Close
					</Button>,
					selectedOrder?.status === 'pending_delivery' && (
						<>
							<Button
								key="delivered"
								type="primary"
								onClick={() => {
									if (selectedOrder) {
										handleMarkDelivered(selectedOrder.id);
										setDetailsModalVisible(false);
									}
								}}
							>
								Mark Delivered
							</Button>
							<Popconfirm
								title="Cancel Order"
								description="Are you sure you want to cancel this order?"
								onConfirm={() => {
									if (selectedOrder) {
										handleCancel(selectedOrder.id);
										setDetailsModalVisible(false);
									}
								}}
								okText="Yes"
								cancelText="No"
							>
								<Button key="cancel" danger>
									Cancel Order
								</Button>
							</Popconfirm>
						</>
					),
				]}
				width={700}
			>
				{selectedOrder && (
					<div>
						<div style={{ marginBottom: '20px' }}>
							<p><strong>Bill Number:</strong> {selectedOrder.bill_number}</p>
							<p><strong>Customer:</strong> {selectedOrder.customer_name}</p>
							<p><strong>Phone:</strong> {selectedOrder.customer_phone}</p>
							<p><strong>Address:</strong> {selectedOrder.customer_address}</p>
							<p>
								<strong>Status:</strong> <Tag color={getStatusColor(selectedOrder.status)}>
									{getStatusText(selectedOrder.status)}
								</Tag>
							</p>
							<p><strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
						</div>

						<div style={{ marginBottom: '20px' }}>
							<h4>Items</h4>
							<Table
								dataSource={selectedOrder.items}
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
							<p style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
								<strong>Total:</strong> LKR {selectedOrder.total_amount.toFixed(2)}
							</p>
						</div>
					</div>
				)}
			</Modal>
		</>
	);
};

export default CODOrdersTable;
