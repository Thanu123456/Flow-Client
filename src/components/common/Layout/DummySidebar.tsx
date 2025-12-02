import { Drawer, Menu } from 'antd';
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
} from '@ant-design/icons';

interface DummySidebarProps {
    open: boolean;
    onClose: () => void;
}

const DummySidebar: React.FC<DummySidebarProps> = ({ open, onClose }) => {
    const menuItems = [
        {
            key: 'dashboard',
            icon: <HomeOutlined />,
            label: 'Dashboard',
        },
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
        {
            key: 'inventory',
            icon: <TagOutlined />,
            label: 'Inventory',
        },
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
        {
            key: 'customers',
            icon: <TeamOutlined />,
            label: 'Customers',
        },
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
        {
            key: 'expenses',
            icon: <DollarOutlined />,
            label: 'Expenses',
        },
        {
            key: 'invoices',
            icon: <FileTextOutlined />,
            label: 'Invoices',
        },
        {
            key: 'users',
            icon: <UserOutlined />,
            label: 'Users',
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Settings',
        },
    ];

    return (
        <Drawer
            title="Navigation Menu"
            placement="left"
            onClose={onClose}
            open={open}
            width={280}
            styles={{
                body: { padding: 0 },
                header: {
                    borderBottom: '2px solid #000',
                    backgroundColor: '#fff',
                },
            }}
            closeIcon={<span className="text-black font-bold text-xl">×</span>}
        >
            <Menu
                mode="inline"
                defaultSelectedKeys={['dashboard']}
                items={menuItems}
                className="border-r-0"
                style={{
                    height: '100%',
                    borderRight: 'none',
                }}
            />
        </Drawer>
    );
};

export default DummySidebar;
