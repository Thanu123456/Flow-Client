import React, { useState } from 'react';
import { Space, message, DatePicker } from 'antd';
import { ReloadOutlined, FilePdfOutlined, FileExcelOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import SalesHistoryTable from './SalesHistoryTable';
import { PageLayout } from '../common/PageLayout';
import { CommonButton } from '../common/Button';

const SalesPage: React.FC = () => {
	const [collapsed, setCollapsed] = useState(false);
	const [searchText, setSearchText] = useState('');
	const [paymentFilter, setPaymentFilter] = useState<string | undefined>(undefined);
	const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
	const [refresh, setRefresh] = useState(false);

	const handleRefresh = () => {
		setSearchText('');
		setPaymentFilter(undefined);
		setDateRange(null);
		setRefresh(!refresh);
	};

	const handleExportPDF = () => {
		message.info('Export to PDF coming soon');
	};

	const handleExportExcel = () => {
		message.info('Export to Excel coming soon');
	};

	return (
		<PageLayout
			title="Sales History"
			collapsed={collapsed}
			onCollapsedChange={setCollapsed}
			searchConfig={{
				placeholder: 'Search bill # or customer...',
				value: searchText,
				onChange: setSearchText,
			}}
			filterConfig={[
				{
					placeholder: 'Payment Method',
					value: paymentFilter,
					onChange: setPaymentFilter,
					options: [
						{ label: 'Cash', value: 'cash' },
						{ label: 'Card', value: 'card' },
						{ label: 'COD', value: 'cod' },
						{ label: 'Credit', value: 'credit' },
					],
				},
			]}
			extra={
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
					<span style={{ color: '#555', fontWeight: 500, whiteSpace: 'nowrap' }}>Date:</span>
					<DatePicker.RangePicker
						value={dateRange}
						onChange={(dates: any) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null] | null)}
						format="YYYY-MM-DD"
						style={{ width: '100%' }}
						presets={[
							{ label: 'Today', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
							{ label: 'Yesterday', value: [dayjs().subtract(1, 'day').startOf('day'), dayjs().subtract(1, 'day').endOf('day')] },
							{ label: 'Last 7 Days', value: [dayjs().subtract(7, 'days'), dayjs()] },
							{ label: 'Last 30 Days', value: [dayjs().subtract(30, 'days'), dayjs()] },
							{ label: 'This Month', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
						]}
						allowClear
					/>
				</div>
			}
			actions={
				<Space>
					<CommonButton
						icon={<FilePdfOutlined style={{ color: "#FF0000" }} />}
						onClick={handleExportPDF}
						tooltip="Download PDF"
					>
						PDF
					</CommonButton>
					<CommonButton
						icon={<FileExcelOutlined style={{ color: "#107C41" }} />}
						onClick={handleExportExcel}
						tooltip="Download Excel"
					>
						Excel
					</CommonButton>
					<CommonButton
						icon={<ReloadOutlined style={{ color: "blue" }} />}
						onClick={handleRefresh}
					>
						Refresh
					</CommonButton>
				</Space>
			}
		>
			<SalesHistoryTable
				search={searchText}
				paymentMethod={paymentFilter}
				dateRange={dateRange}
				refresh={refresh}
			/>
		</PageLayout>
	);
};

export default SalesPage;
