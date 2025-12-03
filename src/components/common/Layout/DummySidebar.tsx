import { Menu, Switch } from 'antd';
import {
    HomeOutlined,
    ShoppingOutlined,
    UserOutlined,
    BarChartOutlined,
    SettingOutlined,
    TagOutlined,
    ShoppingCartOutlined,
    TeamOutlined,
    FileTextOutlined,
    DollarOutlined,
    LogoutOutlined,
} from '@ant-design/icons';

interface DummySidebarProps {
    open: boolean;
    onClose: () => void;
}

const DummySidebar: React.FC<DummySidebarProps> = ({ open, onClose }) => {
    const sidebarWidth = open ? 280 : 70;

    const menuItems = [
        { key: 'dashboard', icon: <HomeOutlined />, label: 'Dashboard' },
        {
            key: 'products',
            icon: <ShoppingOutlined />,
            label: 'Products',
            children: [
                { key: 'products-list', label: 'Product List' },
                { key: 'products-add', label: 'Add Product' },
                { key: 'products-categories', label: 'Categories' },
            ],
        },
        { key: 'inventory', icon: <TagOutlined />, label: 'Inventory' },
        {
            key: 'sales',
            icon: <ShoppingCartOutlined />,
            label: 'Sales',
            children: [
                { key: 'sales-list', label: 'Sales List' },
                { key: 'sales-new', label: 'New Sale' },
                { key: 'sales-pos', label: 'POS' },
            ],
        },
        { key: 'customers', icon: <TeamOutlined />, label: 'Customers' },
        {
            key: 'reports',
            icon: <BarChartOutlined />,
            label: 'Reports',
            children: [
                { key: 'reports-sales', label: 'Sales Report' },
                { key: 'reports-inventory', label: 'Inventory Report' },
                { key: 'reports-profit', label: 'Profit Report' },
            ],
        },
        { key: 'expenses', icon: <DollarOutlined />, label: 'Expenses' },
        { key: 'invoices', icon: <FileTextOutlined />, label: 'Invoices' },
        { key: 'users', icon: <UserOutlined />, label: 'Users' },
        { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
    ];

    return (
        <aside
            style={{
                position: 'fixed',
                left: 0,
                top: 0,
                height: '100vh',
                width: `${sidebarWidth}px`,
                backgroundColor: '#ffffff',
                borderRight: '2px solid #e5e7eb',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.3s ease',
            }}
        >
            {/* Logo / Brand Header */}
            <div
                style={{
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '2px solid #e5e7eb',
                    padding: '0 16px',
                }}
            >
                {open ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: '#3b82f6',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <ShoppingCartOutlined style={{ color: 'white', fontSize: '20px' }} />
                        </div>
                        <span style={{ fontWeight: 'bold', fontSize: '20px', color: '#1f2937' }}>
                            FlowPOS
                        </span>
                    </div>
                ) : (
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: '#3b82f6',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <ShoppingCartOutlined style={{ color: 'white', fontSize: '20px' }} />
                    </div>
                )}
            </div>

            {/* Menu */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                <Menu
                    mode="inline"
                    defaultSelectedKeys={['dashboard']}
                    items={menuItems}
                    inlineCollapsed={!open}
                    style={{ borderRight: 'none' }}
                />
            </div>

            {/* Bottom Section - Dark Mode Toggle & Logout */}
            <div
                style={{
                    borderTop: '2px solid #e5e7eb',
                    padding: '16px',
                }}
            >
                {open ? (
                    <>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '16px',
                                padding: '0 8px',
                            }}
                        >
                            <span style={{ color: '#4b5563', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '18px' }}>🌙</span>
                                Dark Mode
                            </span>
                            <Switch size="small" />
                        </div>
                        <button
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                            }}
                        >
                            <LogoutOutlined />
                            <span>Logout</span>
                        </button>
                    </>
                ) : (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <button
                            style={{
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#4b5563',
                                backgroundColor: 'transparent',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                            }}
                        >
                            <span style={{ fontSize: '18px' }}>🌙</span>
                        </button>
                        <button
                            style={{
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                            }}
                        >
                            <LogoutOutlined />
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default DummySidebar;