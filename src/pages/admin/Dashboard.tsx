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
    Col
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
import HeaderWithSearch from '../../components/common/Layout/HeaderWithSearch';
import SalesPurchasesChart from '../../components/dashboard/SalesPurchasesChart';
import SummaryCards from '../../components/dashboard/SummaryCards';
import SalesPurchasesBarChart from '../../components/dashboard/SalesPurchasesBarChart';
import TopProductsPieChart from '../../components/dashboard/TopProductsPieChart';
import CreditBalancePieChart from '../../components/dashboard/CreditBalancePieChart';
import CreditCustomersList from '../../components/dashboard/CreditCustomersList';


const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
    const { logout, user, tenant } = useAuth();
    const { token } = theme.useToken();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const { getProducts } = useProductStore();
    const { getCategories } = useCategoryStore();
    const { getSubcategories } = useSubcategoryStore();
    const { getBrands } = useBrandStore();
    const { getUnits } = useUnitStore();
    const { getWarehouses } = useWarehouseStore();
    const { getWarranties } = useWarrantyStore();
    const { getVariations } = useVariationStore();

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const params = { page: 1, limit: 1 };
            await Promise.allSettled([
                getProducts(params),
                getCategories(params),
                getSubcategories(params),
                getBrands(params),
                getUnits(params),
                getWarehouses(params),
                getWarranties(params),
                getVariations(params)
            ]);
        } catch (error) {
            console.error("Failed to load dashboard statistics:", error);
        } finally {
            setLoading(false);
        }
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Title level={2} style={{ margin: 0 }}>Admin Dashboard</Title>
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
                        onClick={fetchDashboardData}
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

                <Spin spinning={loading} tip="Loading Analytics...">
                    <SummaryCards />
                    
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} lg={16}>
                            <SalesPurchasesChart />
                        </Col>
                        <Col xs={24} lg={8}>
                            <TopProductsPieChart />
                        </Col>
                    </Row>
                    
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} lg={16}>
                            <SalesPurchasesBarChart />
                        </Col>
                        <Col xs={24} lg={8}>
                            <CreditBalancePieChart />
                        </Col>
                    </Row>
                    
                    <Row gutter={[16, 16]}>
                        <Col xs={24}>
                            <CreditCustomersList />
                        </Col>
                    </Row>
                </Spin>
            </div>
        </div>
    );
};

export default Dashboard;
