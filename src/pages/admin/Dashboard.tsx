import React, { useEffect, useState } from 'react';
import {
    Button,
    Typography,
    Card,
    theme,
    Spin,
    Dropdown,
    Avatar,
    Modal,
    Row,
    Col,
    notification
} from 'antd';
import {
    LogoutOutlined,
    ReloadOutlined,
    UserOutlined,
    DashboardOutlined,
    DownOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Stores
import { useProductStore } from '../../store/inventory/productStore';
import { useCategoryStore } from '../../store/management/categoryStore';
import { useSubcategoryStore } from '../../store/management/subCategoryStore';
import { useBrandStore } from '../../store/management/brandStore';
import { useUnitStore } from '../../store/management/unitStore';
import { useWarehouseStore } from '../../store/management/warehouseStore';
import { useWarrantyStore } from '../../store/management/warrantyStore';
import { useVariationStore } from '../../store/management/variationStore';
import { useDashboardStore } from '../../store/reports/dashboardStore';
import HeaderWithSearch from '../../components/common/Layout/HeaderWithSearch';
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
    const { logout, user, tenant } = useAuth();
    const { token } = theme.useToken();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('today');
    const [showAlert, setShowAlert] = useState(true);

    const { fetchDashboardData: fetchAnalytics, fetchDashboardCharts, charts } = useDashboardStore();

    const showInsightNotification = () => {
        notification.destroy(); // Clear existing to prevent stacking
        notification.warning({
            message: <span className="font-bold text-amber-900 tracking-tight">Business Insight</span>,
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

    const { getProducts } = useProductStore();
    const { getCategories } = useCategoryStore();
    const { getSubcategories } = useSubcategoryStore();
    const { getBrands } = useBrandStore();
    const { getUnits } = useUnitStore();
    const { getWarehouses } = useWarehouseStore();
    const { getWarranties } = useWarrantyStore();
    const { getVariations } = useVariationStore();

    const fetchDashboardData = async (selectedPeriod = period) => {
        setLoading(true);
        // Show insight when syncing data manually
        showInsightNotification();
        try {
            // Fetch dashboard analytics first — these are the only requests that
            // gate the loading spinner. Running them alone avoids competing with
            // 8 background store requests for DB connections on cold start.
            await Promise.allSettled([
                fetchAnalytics(selectedPeriod),
                fetchDashboardCharts(selectedPeriod)
            ]);
        } finally {
            setLoading(false);
        }

        // Pre-warm supporting stores in the background after the dashboard is
        // already visible. Staggered to avoid exhausting the DB connection pool
        // when all requests hit simultaneously on cold start.
        const params = { page: 1, limit: 1 };
        const prewarmFns = [
            () => getProducts(params),
            () => getCategories(params),
            () => getSubcategories(params),
            () => getBrands(params),
            () => getUnits(params),
            () => getWarehouses(params),
            () => getWarranties(params),
            () => getVariations(params),
        ];
        (async () => {
            for (const fn of prewarmFns) {
                fn().catch(() => {});
                await new Promise(r => setTimeout(r, 300));
            }
        })();
    };

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);



    const handleLogoutConfirm = () => {
        Modal.confirm({
            title: 'Confirm Logout',
            content: 'Are you sure you want to log out of the system?',
            okText: 'Logout',
            okType: 'danger',
            cancelText: 'Stay',
            onOk: async () => {
                await logout();
                navigate('/login');
            },
            centered: true
        });
    };

    const userMenuItems = [
        {
            key: 'dashboard',
            label: 'Dashboard',
            icon: <DashboardOutlined />,
            onClick: () => navigate('/dashboard')
        },
        {
            key: 'profile',
            label: 'My Profile',
            icon: <UserOutlined />,
            onClick: () => navigate('/profile')
        },
        {
            type: 'divider' as const,
        },
        {
            key: 'logout',
            label: 'Logout',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: handleLogoutConfirm
        }
    ];

    return (
        <div style={{ background: token.colorBgLayout, minHeight: '100vh' }}>
            <HeaderWithSearch />
            <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, position: 'relative' }}>
                    <Title level={2} style={{ margin: 0 }}>Admin Dashboard</Title>

                    {charts?.stockAlerts && charts.stockAlerts.length > 0 && showAlert && (
                        <div
                            className="bg-amber-500 text-white px-8 py-3 rounded-2xl flex items-center gap-4 shadow-2xl animate-bounce border-2 border-white/30 backdrop-blur-md"
                            style={{
                                position: 'absolute',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                zIndex: 10,
                                minWidth: '420px',
                                justifyContent: 'space-between',
                                top: '8px' // Slightly lowered within the title row
                            }}
                        >
                            <span className="font-extrabold flex items-center gap-3 text-sm uppercase tracking-widest italic">
                                <span className="w-3 h-3 bg-white rounded-full animate-ping"></span>
                                ATTENTION: STOCK IS LOW! CHECK ALERT TABLE
                            </span>
                            <button
                                className="text-white hover:bg-white/20 transition-all bg-white/10 rounded-xl w-8 h-8 flex items-center justify-center font-black text-lg border border-white/20"
                                onClick={() => setShowAlert(false)}
                            >
                                ×
                            </button>
                        </div>
                    )}

                    <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
                        <Button
                            style={{ height: 'auto', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 8 }}
                        >
                            <Avatar
                                size="small"
                                style={{ backgroundColor: token.colorPrimary }}
                                icon={<UserOutlined />}
                            />
                            <Text strong>{user?.full_name}</Text>
                            <DownOutlined style={{ fontSize: 12, color: token.colorTextSecondary }} />
                        </Button>
                    </Dropdown>
                </div>

                <Card style={{ marginBottom: 24 }}>
                    <Text>
                        Welcome back, <strong>{user?.full_name}</strong>!
                    </Text>
                    <br />
                    {tenant && (
                        <Text type="secondary">
                            Managing: {tenant.shop_name} ({tenant.business_type})
                        </Text>
                    )}
                </Card>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
                    <Title level={4} style={{ margin: 0 }}>Business Overview</Title>
                    <Button
                        icon={<ReloadOutlined style={{ color: "blue" }} />}
                        onClick={() => fetchDashboardData(period)}
                        loading={loading}
                        style={{
                            backgroundColor: token.colorPrimaryBg,
                            color: token.colorPrimary,
                            borderColor: token.colorPrimaryBorder,
                            borderRadius: token.borderRadius
                        }}
                    >
                        Sync Data
                    </Button>
                </div>

                <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-2">
                        <Button
                            type={period === 'today' ? 'primary' : 'default'}
                            onClick={() => { setPeriod('today'); fetchDashboardData('today'); }}
                            className={`${period === 'today' ? 'bg-indigo-900 border-indigo-900' : 'border-gray-200'} rounded-md px-6 font-bold h-10`}
                        >
                            TODAY
                        </Button>
                        <Button
                            type={period === 'week' ? 'primary' : 'default'}
                            onClick={() => { setPeriod('week'); fetchDashboardData('week'); }}
                            className={`${period === 'week' ? 'bg-indigo-900 border-indigo-900' : 'border-gray-200'} rounded-md px-4 font-bold h-10`}
                        >
                            THIS WEEK
                        </Button>
                        <Button
                            type={period === 'month' ? 'primary' : 'default'}
                            onClick={() => { setPeriod('month'); fetchDashboardData('month'); }}
                            className={`${period === 'month' ? 'bg-indigo-900 border-indigo-900' : 'border-gray-200'} rounded-md px-4 font-bold h-10`}
                        >
                            THIS MONTH
                        </Button>
                        <Button
                            type={period === 'year' ? 'primary' : 'default'}
                            onClick={() => { setPeriod('year'); fetchDashboardData('year'); }}
                            className={`${period === 'year' ? 'bg-indigo-900 border-indigo-900' : 'border-gray-200'} rounded-md px-4 font-bold h-10`}
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
