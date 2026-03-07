import React, { useEffect, useState } from 'react';
import {
    Button,
    Typography,
    Card,
    theme,
    Row,
    Col,
    Spin,
    Statistic,
    Dropdown,
    Avatar,
    Modal
} from 'antd';
import {
    LogoutOutlined,
    AppstoreOutlined,
    TagsOutlined,
    DatabaseOutlined,
    NodeIndexOutlined,
    BlockOutlined,
    ShopOutlined,
    SafetyCertificateOutlined,
    ControlOutlined,
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

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
    const { logout, user, tenant } = useAuth();
    const { token } = theme.useToken();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const { getProducts, pagination: productPagination } = useProductStore();
    const { getCategories, pagination: categoryPagination } = useCategoryStore();
    const { getSubcategories, pagination: subCategoryPagination } = useSubcategoryStore();
    const { getBrands, pagination: brandPagination } = useBrandStore();
    const { getUnits, pagination: unitPagination } = useUnitStore();
    const { getWarehouses, pagination: warehousePagination } = useWarehouseStore();
    const { getWarranties, pagination: warrantyPagination } = useWarrantyStore();
    const { getVariations, pagination: variationPagination } = useVariationStore();

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
        <div style={{ padding: 24, background: token.colorBgLayout, minHeight: '100vh' }}>
            <HeaderWithSearch />
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
                <Title level={4} style={{ margin: 0 }}>Quick Statistics</Title>
                <Button
                    icon={<ReloadOutlined />}
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
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} md={6}>
                        <Card
                            hoverable
                            bordered={false}
                            onClick={() => navigate('/products')}
                            style={{ cursor: 'pointer', transition: 'all 0.3s', borderRadius: token.borderRadiusLG }}
                        >
                            <Statistic
                                title="Total Products"
                                value={productPagination.total || 0}
                                prefix={<DatabaseOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card
                            hoverable
                            bordered={false}
                            onClick={() => navigate('/categories')}
                            style={{ cursor: 'pointer', transition: 'all 0.3s', borderRadius: token.borderRadiusLG }}
                        >
                            <Statistic
                                title="Categories"
                                value={categoryPagination.total || 0}
                                prefix={<AppstoreOutlined />}
                                valueStyle={{ color: '#13c2c2' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card
                            hoverable
                            bordered={false}
                            onClick={() => navigate('/subcategories')}
                            style={{ cursor: 'pointer', transition: 'all 0.3s', borderRadius: token.borderRadiusLG }}
                        >
                            <Statistic
                                title="Sub-Categories"
                                value={subCategoryPagination.total || 0}
                                prefix={<NodeIndexOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card
                            hoverable
                            bordered={false}
                            onClick={() => navigate('/brands')}
                            style={{ cursor: 'pointer', transition: 'all 0.3s', borderRadius: token.borderRadiusLG }}
                        >
                            <Statistic
                                title="Brands"
                                value={brandPagination.total || 0}
                                prefix={<TagsOutlined />}
                                valueStyle={{ color: '#722ed1' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card
                            hoverable
                            bordered={false}
                            onClick={() => navigate('/units')}
                            style={{ cursor: 'pointer', transition: 'all 0.3s', borderRadius: token.borderRadiusLG }}
                        >
                            <Statistic
                                title="Units"
                                value={unitPagination.total || 0}
                                prefix={<BlockOutlined />}
                                valueStyle={{ color: '#eb2f96' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card
                            hoverable
                            bordered={false}
                            onClick={() => navigate('/warehouses')}
                            style={{ cursor: 'pointer', transition: 'all 0.3s', borderRadius: token.borderRadiusLG }}
                        >
                            <Statistic
                                title="Warehouses"
                                value={warehousePagination.total || 0}
                                prefix={<ShopOutlined />}
                                valueStyle={{ color: '#fa8c16' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card
                            hoverable
                            bordered={false}
                            onClick={() => navigate('/warranties')}
                            style={{ cursor: 'pointer', transition: 'all 0.3s', borderRadius: token.borderRadiusLG }}
                        >
                            <Statistic
                                title="Warranties"
                                value={warrantyPagination.total || 0}
                                prefix={<SafetyCertificateOutlined />}
                                valueStyle={{ color: '#faad14' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card
                            hoverable
                            bordered={false}
                            onClick={() => navigate('/variations')}
                            style={{ cursor: 'pointer', transition: 'all 0.3s', borderRadius: token.borderRadiusLG }}
                        >
                            <Statistic
                                title="Variations"
                                value={variationPagination.total || 0}
                                prefix={<ControlOutlined />}
                                valueStyle={{ color: '#f5222d' }}
                            />
                        </Card>
                    </Col>
                </Row>
            </Spin>
        </div>
    );
};

export default Dashboard;
