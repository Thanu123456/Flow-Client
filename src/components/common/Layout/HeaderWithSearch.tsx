import { useState, useEffect } from 'react';
import { Layout, Input, Button, Badge, Avatar, Dropdown, Space, Modal, List, Typography } from 'antd';
import type { MenuProps } from 'antd';
import {
    MenuOutlined,
    SearchOutlined,
    PlusOutlined,
    ShoppingCartOutlined,
    FullscreenOutlined,
    FullscreenExitOutlined,
    MailOutlined,
    BellOutlined,
    SettingOutlined,
    UserOutlined,
    LogoutOutlined,
    KeyOutlined,
    DashboardOutlined,
    CloseOutlined,
} from '@ant-design/icons';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface SearchResult {
    id: string;
    title: string;
    type: string;
    url: string;
}

interface HeaderProps {
    onMenuClick: () => void;
    collapsed?: boolean;
}

const HeaderWithSearch: React.FC<HeaderProps> = ({ onMenuClick, collapsed = false }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

    const [unreadMessages] = useState(1);
    const [unreadNotifications] = useState(3);

    const user = {
        name: 'John Doe',
        email: 'john@example.com',
        avatar: null,
        role: 'Admin',
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchModalVisible(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        if (value.length > 0) {
            const results: SearchResult[] = [
                { id: '1', title: 'Product: ' + value, type: 'Product', url: '/products/1' },
                { id: '2', title: 'Customer: ' + value, type: 'Customer', url: '/customers/1' },
                { id: '3', title: 'Sale: ' + value, type: 'Sale', url: '/sales/1' },
            ];
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const userMenuItems: MenuProps['items'] = [
        {
            key: 'profile-info',
            label: (
                <div className="px-3 py-2">
                    <div className="font-semibold text-gray-800">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                    <div className="text-xs text-gray-400 mt-1">{user.role}</div>
                </div>
            ),
            disabled: true,
        },
        { type: 'divider' },
        { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: 'profile', icon: <UserOutlined />, label: 'My Profile' },
        { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
        { key: 'change-password', icon: <KeyOutlined />, label: 'Change Password' },
        { type: 'divider' },
        { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true },
    ];

    return (
        <>
            <AntHeader
                className="bg-white px-6 flex items-center justify-between sticky top-0 z-50 border-b border-gray-200 transition-all duration-300"
                style={{
                    boxShadow: 'none',
                    backgroundColor: '#FFFFFF',
                    height: collapsed ? '0px' : '64px',
                    overflow: 'hidden',
                    opacity: collapsed ? 0 : 1,
                }}
            >
                {/* Left: Menu + Search */}
                <div className="flex items-center gap-4 flex-1">
                    <Button
                        type="text"
                        icon={<MenuOutlined />}
                        onClick={onMenuClick}
                        className="text-gray-700 hover:text-black border-2 border-black w-10 h-10 rounded-lg"
                    />

                    <div className="max-w-md w-full">
                        <Input
                            placeholder="Search anything..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            suffix={
                                <kbd className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded">
                                    Cmd K
                                </kbd>
                            }
                            className="rounded-lg border-2 border-black hover:border-black cursor-pointer"
                            size="large"
                            readOnly
                            onClick={() => setSearchModalVisible(true)}
                        />
                    </div>
                </div>

                {/* Right: Actions */}
                <Space size={12}>
                    {/* Add New - Black Border */}
                    <Button
                        icon={<PlusOutlined />}
                        className="border-2 border-black text-black hover:bg-gray-50 font-medium h-10 px-5 rounded-lg shadow-sm"
                    >
                        Add New
                    </Button>

                    {/* POS - Black Border */}
                    <Button
                        icon={<ShoppingCartOutlined />}
                        className="border-2 border-black text-black hover:bg-gray-50 font-medium h-10 px-5 rounded-lg shadow-sm"
                    >
                        POS
                    </Button>

                    {/* Fullscreen */}
                    <Button
                        type="text"
                        icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                        onClick={toggleFullscreen}
                        className="border-2 border-black text-gray-700 hover:text-black w-10 h-10 rounded-lg"
                    />

                    {/* Messages */}
                    <Badge count={unreadMessages} offset={[-5, 5]}>
                        <Button
                            type="text"
                            icon={<MailOutlined className="text-lg" />}
                            className="border-2 border-black text-gray-700 hover:text-black w-10 h-10 rounded-lg"
                        />
                    </Badge>

                    {/* Notifications */}
                    <Badge count={unreadNotifications} offset={[-5, 5]}>
                        <Button
                            type="text"
                            icon={<BellOutlined className="text-lg" />}
                            className="border-2 border-black text-gray-700 hover:text-black w-10 h-10 rounded-lg"
                        />
                    </Badge>

                    {/* Settings */}
                    <Button
                        type="text"
                        icon={<SettingOutlined className="text-lg" />}
                        className="border-2 border-black text-gray-700 hover:text-black w-10 h-10 rounded-lg"
                    />

                    {/* User Avatar */}
                    <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
                        <div className="cursor-pointer">
                            <Avatar
                                size={40}
                                src={user.avatar}
                                icon={!user.avatar && <UserOutlined />}
                                className="bg-gradient-to-br from-orange-400 to-orange-600 ring-4 ring-white shadow-md hover:ring-gray-200 transition-all"
                            />
                        </div>
                    </Dropdown>
                </Space>
            </AntHeader>

            {/* Search Modal */}
            <Modal
                open={searchModalVisible}
                onCancel={() => {
                    setSearchModalVisible(false);
                    setSearchQuery('');
                    setSearchResults([]);
                }}
                footer={null}
                closeIcon={<CloseOutlined className="text-gray-500" />}
                width={640}
                className="search-modal"
                bodyStyle={{ padding: 0 }}
            >
                <div className="p-5 border-b border-gray-200">
                    <Input
                        placeholder="Search products, customers, sales, orders..."
                        prefix={<SearchOutlined className="text-gray-400" />}
                        size="large"
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="rounded-lg text-base border-2 border-black"
                    />
                </div>

                <div className="max-h-96 overflow-y-auto">
                    {searchResults.length > 0 ? (
                        <List
                            dataSource={searchResults}
                            renderItem={(item) => (
                                <List.Item
                                    className="cursor-pointer hover:bg-gray-50 px-5 py-3 border-b border-gray-100"
                                    onClick={() => {
                                        setSearchModalVisible(false);
                                        setSearchQuery('');
                                    }}
                                >
                                    <List.Item.Meta
                                        title={<Text strong>{item.title}</Text>}
                                        description={<Text type="secondary" className="text-xs">{item.type}</Text>}
                                    />
                                </List.Item>
                            )}
                        />
                    ) : searchQuery ? (
                        <div className="p-10 text-center text-gray-400">
                            <p className="text-lg">No results found for "<strong>{searchQuery}</strong>"</p>
                        </div>
                    ) : (
                        <div className="p-10 text-center text-gray-400">
                            <p>Type to search...</p>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
};

export default HeaderWithSearch;