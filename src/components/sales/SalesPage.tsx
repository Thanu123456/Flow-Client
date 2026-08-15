import React, { useRef, useState } from 'react';
import { Space, message, DatePicker } from 'antd';
import { ReloadOutlined, FilePdfOutlined, FileExcelOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import SalesHistoryTable from './SalesHistoryTable';
import SalesReport from '../reports/SalesReport';
import { PageLayout } from '../common/PageLayout';
import { CommonButton } from '../common/Button';
import { reportService } from '../../services/reports/reportService';
import { exportElementToPdf } from '../../utils/pdf/exportElementToPdf';
import type { SalesReportResponse } from '../../types/entities/report.types';

const SalesPage: React.FC = () => {
	const [collapsed, setCollapsed] = useState(false);
	const [searchText, setSearchText] = useState('');
	const [paymentFilter, setPaymentFilter] = useState<string | undefined>(undefined);
	const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
	const [refresh, setRefresh] = useState(false);
	const [exportingPdf, setExportingPdf] = useState(false);
	const [exportingExcel, setExportingExcel] = useState(false);
	const [reportData, setReportData] = useState<SalesReportResponse | null>(null);
	const reportRef = useRef<HTMLDivElement>(null);

	const handleRefresh = () => {
		setSearchText('');
		setPaymentFilter(undefined);
		setDateRange(null);
		setRefresh(!refresh);
	};

	const handleExportPDF = async () => {
		setExportingPdf(true);
		try {
			const report = await reportService.getSalesReport({
				search: searchText || undefined,
				payment_method: paymentFilter || undefined,
				date_from: dateRange?.[0]?.format('YYYY-MM-DD') ?? undefined,
				date_to: dateRange?.[1]?.format('YYYY-MM-DD') ?? undefined,
			});
			setReportData(report);
			// Wait for the hidden template to render with the new data before capturing it.
			await new Promise((resolve) => setTimeout(resolve, 100));
			if (reportRef.current) {
				await exportElementToPdf(reportRef.current, `Sales-Report-${dayjs().format('YYYY-MM-DD-HHmm')}.pdf`);
			}
		} catch {
			message.error('Failed to generate PDF report');
		} finally {
			setExportingPdf(false);
			setReportData(null);
		}
	};

	const handleExportExcel = async () => {
		setExportingExcel(true);
		try {
			const blob = await reportService.exportSalesReportExcel({
				search: searchText || undefined,
				payment_method: paymentFilter || undefined,
				date_from: dateRange?.[0]?.format('YYYY-MM-DD') ?? undefined,
				date_to: dateRange?.[1]?.format('YYYY-MM-DD') ?? undefined,
			});
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', `Sales-Report-${dayjs().format('YYYY-MM-DD-HHmm')}.xlsx`);
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
		} catch {
			message.error('Failed to export Excel');
		} finally {
			setExportingExcel(false);
		}
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
						loading={exportingPdf}
						tooltip="Download PDF"
					>
						PDF
					</CommonButton>
					<CommonButton
						icon={<FileExcelOutlined style={{ color: "#107C41" }} />}
						onClick={handleExportExcel}
						loading={exportingExcel}
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

			{/* Off-screen render target for PDF capture — not visible to the user */}
			{reportData && (
				<div style={{ position: 'fixed', top: 0, left: '-10000px', zIndex: -1 }}>
					<SalesReport ref={reportRef} report={reportData} />
				</div>
			)}
		</PageLayout>
	);
};

export default SalesPage;
