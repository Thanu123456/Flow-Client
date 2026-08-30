import React, { useEffect, useState } from 'react';
import {
    Button,
    Typography,
    theme,
    Spin,
    Avatar,
    Row,
    Col,
    App
} from 'antd';
import {
    ReloadOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

// Stores
import { useDashboardStore } from '../../store/reports/dashboardStore';
import { useAdminDashboard } from '../../hooks/data/useAdminDashboard';
import {
    SalesPurchasesChart,
    SummaryCards,
    SecondarySummaryCards,
    SalesPurchasesBarChart,
    TopProductsPieChart,
    CreditBalancePieChart,
    CreditCustomersList,
    StockAlertTable,
    TopCustomersPieChart,
    MostSellingItemsTable,
    LeastSellingItemsTable,
    TopExpensesCard,
    ExpireDateAlertTable,
    RecentSalesTable,
    HourlySalesPeakChart,
    PaymentMethodPieChart,
    RevenueByCategoryChart,
    ProfitMarginBarChart,
    InventoryTurnoverChart
} from '../../components/dashboard';


const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
    const { user, tenant } = useAuth();
    const { token } = theme.useToken();
    const { notification } = App.useApp();

    const [period, setPeriod] = useState('today');
    const [showAlert, setShowAlert] = useState(true);

    const charts = useDashboardStore((s) => s.charts);

    // Analytics + charts, React Query-cached per period. Switching to a period you
    // already viewed (within 2 min) is instant and makes no request.
    const { isFetching: loading, refetch: refetchDashboard } = useAdminDashboard(period);

    const showInsightNotification = () => {
        notification.destroy(); // Clear existing to prevent stacking
        notification.warning({
            message: <span className="font-normal text-amber-900 tracking-tight">Business Insight</span>,
            description: <span className="text-amber-800 font-medium">Review your business activity logs.</span>,
            placement: 'bottomRight',
            duration: 5,
            icon: <ReloadOutlined style={{ color: '#d46b08' }} />,
            style: { 
                backgroundColor: '#fffbe6',
                borderRadius: '12px',
                border: '1px solid #ffe7ba',
                boxShadow: '0 10px 15px -3px rgba(180, 83, 9, 0.1), 0 4px 6px -2px rgba(180, 83, 9, 0.05)'
            }
        });
    };

    useEffect(() => {
        // Initial load insight
        showInsightNotification();

        const insightInterval = setInterval(() => {
            showInsightNotification();
        }, 300000); // Every 5 minutes

        return () => clearInterval(insightInterval);
    }, []);

    // Manual "Sync Data": refetch the current period and re-show the insight toast.
    const fetchDashboardData = () => {
        showInsightNotification();
        refetchDashboard();
    };

    // Period switch: React Query refetches automatically off the `period` key
    // (and serves cached data instantly for a period already viewed).
    const handlePeriodChange = (next: string) => {
        setPeriod(next);
        showInsightNotification();
    };




    return (
        <div style={{ background: token.colorBgLayout, minHeight: '100vh' }}>
            <div style={{ padding: '12px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 12, position: 'relative' }}>
                    {charts?.stockAlerts && charts.stockAlerts.length > 0 && showAlert && (
                        <div
                            className="bg-amber-500 text-white px-8 py-3 rounded-2xl flex items-center gap-4 shadow-2xl animate-bounce border-2 border-white/30 backdrop-blur-md"
                            style={{
                                position: 'relative',
                                zIndex: 10,
                                minWidth: '420px',
                                justifyContent: 'space-between',
                            }}
                        >
                            <span className="font-normal flex items-center gap-3 text-sm uppercase tracking-widest italic">
                                <span className="w-3 h-3 bg-white rounded-full animate-ping"></span>
                                ATTENTION: STOCK IS LOW! CHECK ALERT TABLE
                            </span>
                            <button
                                className="text-white hover:bg-white/20 transition-all bg-white/10 rounded-xl w-8 h-8 flex items-center justify-center font-normal text-lg border border-white/20"
                                onClick={() => setShowAlert(false)}
                            >
                                ×
                            </button>
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Title level={4} style={{ margin: 0, fontWeight: 400, letterSpacing: '-0.02em' }}>
                        Business Overview
                    </Title>
                    
                    <div className="flex items-center gap-3">
                        {user && (
                            <div className="hidden lg:flex items-center gap-2 bg-slate-100/50 border border-slate-200/60 px-3 py-1 rounded-full transition-all hover:bg-slate-100">
                                <Avatar 
                                    size={22} 
                                    style={{ backgroundColor: token.colorPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                                    icon={<UserOutlined style={{ fontSize: 11 }} />} 
                                />
                                <div className="flex items-center gap-2 whitespace-nowrap">
                                    <Text className="text-[11px] text-slate-600 font-medium">
                                        Hi, <span className="text-slate-900">{user.full_name.split(' ')[0]}</span>
                                    </Text>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                    <Text className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">
                                        {tenant?.shop_name}
                                    </Text>
                                </div>
                            </div>
                        )}

                        <Button
                            icon={<ReloadOutlined style={{ color: "blue" }} />}
                            onClick={() => fetchDashboardData()}
                            loading={loading}
                            style={{
                                backgroundColor: token.colorPrimaryBg,
                                color: token.colorPrimary,
                                borderColor: token.colorPrimaryBorder,
                                borderRadius: '8px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '13px',
                                fontWeight: 500
                            }}
                        >
                            Sync Data
                        </Button>
                    </div>
                </div>

                <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2">
                        <Button
                            type={period === 'today' ? 'primary' : 'default'}
                            onClick={() => handlePeriodChange('today')}
                            className={`${period === 'today' ? 'bg-indigo-900 border-indigo-900' : 'border-gray-200'} rounded-md px-6 font-normal h-10`}
                        >
                            TODAY
                        </Button>
                        <Button
                            type={period === 'week' ? 'primary' : 'default'}
                            onClick={() => handlePeriodChange('week')}
                            className={`${period === 'week' ? 'bg-indigo-900 border-indigo-900' : 'border-gray-200'} rounded-md px-4 font-normal h-10`}
                        >
                            THIS WEEK
                        </Button>
                        <Button
                            type={period === 'month' ? 'primary' : 'default'}
                            onClick={() => handlePeriodChange('month')}
                            className={`${period === 'month' ? 'bg-indigo-900 border-indigo-900' : 'border-gray-200'} rounded-md px-4 font-normal h-10`}
                        >
                            THIS MONTH
                        </Button>
                        <Button
                            type={period === 'year' ? 'primary' : 'default'}
                            onClick={() => handlePeriodChange('year')}
                            className={`${period === 'year' ? 'bg-indigo-900 border-indigo-900' : 'border-gray-200'} rounded-md px-4 font-normal h-10`}
                        >
                            THIS YEAR
                        </Button>
                    </div>
                </div>

                <Spin spinning={loading} tip="Loading Analytics...">
                    <SummaryCards />
                    <SecondarySummaryCards />

                    <div style={{ margin: '32px 0 16px' }}>
                        <Title level={4}>Sales & Financial Trends</Title>
                    </div>

                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} lg={16}>
                            <SalesPurchasesChart />
                        </Col>
                        <Col xs={24} lg={8}>
                            <ProfitMarginBarChart />
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} lg={12}>
                            <HourlySalesPeakChart />
                        </Col>
                        <Col xs={24} lg={12}>
                            <SalesPurchasesBarChart />
                        </Col>
                    </Row>

                    <div style={{ margin: '32px 0 16px' }}>
                        <Title level={4}>Business Performance Distribution</Title>
                    </div>

                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} lg={8}>
                            <TopProductsPieChart />
                        </Col>
                        <Col xs={24} lg={8}>
                            <RevenueByCategoryChart />
                        </Col>
                        <Col xs={24} lg={8}>
                            <PaymentMethodPieChart />
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} lg={8}>
                            <TopCustomersPieChart />
                        </Col>
                        <Col xs={24} lg={8}>
                            <CreditBalancePieChart />
                        </Col>
                        <Col xs={24} lg={8}>
                            <TopExpensesCard />
                        </Col>
                    </Row>

                    <div style={{ margin: '32px 0 16px' }}>
                        <Title level={4}>Inventory Speed & Alerts</Title>
                    </div>

                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} lg={12}>
                            <InventoryTurnoverChart />
                        </Col>
                        <Col xs={24} lg={12}>
                            <StockAlertTable />
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} lg={12}>
                            <MostSellingItemsTable />
                        </Col>
                        <Col xs={24} lg={12}>
                            <LeastSellingItemsTable />
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} lg={12}>
                            <ExpireDateAlertTable />
                        </Col>
                        <Col xs={24} lg={12}>
                            <CreditCustomersList />
                        </Col>
                    </Row>

                    <div style={{ margin: '32px 0 16px' }}>
                        <Title level={4}>Recent Operations</Title>
                    </div>

                    <Row gutter={[16, 16]}>
                        <Col xs={24}>
                            <RecentSalesTable />
                        </Col>
                    </Row>
                </Spin>
            </div>
        </div>
    );
};

export default Dashboard;
