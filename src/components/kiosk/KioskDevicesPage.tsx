import React, { useCallback, useEffect, useState } from 'react';
import { Table, Badge, Button, Input, Modal, message, Typography, Space, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, LogoutOutlined, DeleteOutlined, ReloadOutlined, DesktopOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { authService } from '../../services/auth/authService';
import type { KioskDeviceInfo } from '../../types/auth/kiosk.types';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

// The fleet view: every kiosk device that has ever paired to this shop,
// whether it's currently reachable, and who's signed in on it. Driven
// entirely by the heartbeat each device posts every 60s (KioskHeartbeat.tsx)
// — "Online" just means a heartbeat landed recently, and "Sign out" is
// delivered on that same device's *next* check-in, not instantly, since
// there's no push channel to a browser tab.
const KioskDevicesPage: React.FC = () => {
    const [devices, setDevices] = useState<KioskDeviceInfo[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [renaming, setRenaming] = useState<KioskDeviceInfo | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [busyId, setBusyId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setDevices(await authService.listKioskDevices());
        } catch {
            message.error('Failed to load kiosk devices');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleRename = async () => {
        if (!renaming || !renameValue.trim()) return;
        try {
            await authService.renameKioskDevice(renaming.id, renameValue.trim());
            message.success('Device renamed');
            setRenaming(null);
            load();
        } catch {
            message.error('Failed to rename device');
        }
    };

    const handleSignOut = (device: KioskDeviceInfo) => {
        Modal.confirm({
            title: 'Sign out this device?',
            content: "Whoever's signed in will be signed out the next time this device checks in — usually within a minute, not instantly.",
            okText: 'Sign Out',
            okType: 'danger',
            onOk: async () => {
                setBusyId(device.id);
                try {
                    await authService.signOutKioskDevice(device.id);
                    message.success('Sign-out requested');
                } catch {
                    message.error('Failed to request sign-out');
                } finally {
                    setBusyId(null);
                }
            },
        });
    };

    const handleRemove = (device: KioskDeviceInfo) => {
        Modal.confirm({
            title: 'Remove this device?',
            content: "This only stops tracking it here — it reappears automatically the next time it's actually used. It does not sign it out or wipe it.",
            okText: 'Remove',
            okType: 'danger',
            onOk: async () => {
                try {
                    await authService.removeKioskDevice(device.id);
                    message.success('Device removed');
                    load();
                } catch {
                    message.error('Failed to remove device');
                }
            },
        });
    };

    const columns: ColumnsType<KioskDeviceInfo> = [
        {
            title: 'Device',
            key: 'device',
            render: (_, d) => (
                <Space>
                    <DesktopOutlined style={{ color: '#8c8c8c' }} />
                    <Text strong>{d.device_name || 'Unnamed device'}</Text>
                </Space>
            ),
        },
        {
            title: 'Status',
            key: 'online',
            render: (_, d) => (
                <Badge status={d.online ? 'success' : 'default'} text={d.online ? 'Online' : 'Offline'} />
            ),
        },
        {
            title: 'Signed in as',
            key: 'user',
            render: (_, d) => d.current_user_name || <Text type="secondary">Nobody (at PIN screen)</Text>,
        },
        {
            title: 'Last seen',
            key: 'last_seen',
            render: (_, d) => (
                <Tooltip title={dayjs(d.last_seen_at).format('DD MMM YYYY, HH:mm:ss')}>
                    {dayjs(d.last_seen_at).fromNow()}
                </Tooltip>
            ),
        },
        {
            title: 'Paired',
            key: 'paired_at',
            render: (_, d) => dayjs(d.paired_at).format('DD MMM YYYY'),
        },
        {
            title: '',
            key: 'actions',
            align: 'right',
            render: (_, d) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => { setRenaming(d); setRenameValue(d.device_name || ''); }}
                    >
                        Rename
                    </Button>
                    <Button
                        size="small"
                        danger
                        icon={<LogoutOutlined />}
                        loading={busyId === d.id}
                        disabled={!d.current_user_name}
                        onClick={() => handleSignOut(d)}
                    >
                        Sign Out
                    </Button>
                    <Button size="small" icon={<DeleteOutlined />} onClick={() => handleRemove(d)} />
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <Title level={4} style={{ margin: 0 }}>Kiosk Devices</Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        Every register that has paired to this shop. Status updates roughly every minute.
                    </Text>
                </div>
                <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Refresh</Button>
            </div>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={devices ?? []}
                loading={loading}
                pagination={false}
                locale={{ emptyText: 'No kiosk devices have paired to this shop yet.' }}
            />

            <Modal
                open={!!renaming}
                title="Rename Device"
                onCancel={() => setRenaming(null)}
                onOk={handleRename}
                okText="Save"
            >
                <Input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    placeholder="e.g. Front Counter, Till 2"
                    maxLength={100}
                    autoFocus
                    onPressEnter={handleRename}
                />
            </Modal>
        </div>
    );
};

export default KioskDevicesPage;
