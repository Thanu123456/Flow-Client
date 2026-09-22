import React, { useEffect, useState } from 'react';
import { Button, Dropdown, message } from 'antd';
import type { MenuProps } from 'antd';
import { PrinterOutlined, CheckCircleFilled, DisconnectOutlined } from '@ant-design/icons';
import {
    isWebUsbSupported,
    hasStoredPrinter,
    pairPrinter,
    forgetStoredPrinter,
    reconnectPrinter,
    sendToPrinter,
} from '../../utils/printing/webUsbPrinter';
import { ReceiptBuilder } from '../../utils/printing/escpos';
import { openCashDrawer } from '../../utils/printing/receiptPrint';

// Toolbar control for the direct thermal-printer connection (WebUSB/ESC-POS
// — see utils/printing). A kiosk with no printer paired still works fine:
// checkout just falls back to the browser print dialog (receiptPrint.ts
// handles that transparently), this is purely for the faster/no-dialog path
// plus the drawer-kick action.
const PrinterStatusButton: React.FC = () => {
    const [paired, setPaired] = useState(hasStoredPrinter());
    const [busy, setBusy] = useState(false);

    useEffect(() => setPaired(hasStoredPrinter()), []);

    const handlePair = async () => {
        setBusy(true);
        try {
            await pairPrinter();
            setPaired(true);
            message.success('Printer paired — receipts will print directly to it.');
        } catch (err: any) {
            if (err?.name !== 'NotFoundError') { // user just closed the device picker
                message.error(err?.message || 'Failed to pair printer.');
            }
        } finally {
            setBusy(false);
        }
    };

    const handleUnpair = () => {
        forgetStoredPrinter();
        setPaired(false);
        message.info('Printer unpaired — receipts will use the browser print dialog.');
    };

    const handleTestPrint = async () => {
        setBusy(true);
        try {
            const device = await reconnectPrinter();
            if (!device) throw new Error('Paired printer not found — check it\'s plugged in and powered on.');
            const bytes = new ReceiptBuilder()
                .init().align('center').bold(true).line('Test Print').bold(false)
                .line('Printer connection OK').newline().cut(true).build();
            await sendToPrinter(device, bytes);
            message.success('Test print sent.');
        } catch (err: any) {
            message.error(err?.message || 'Test print failed.');
        } finally {
            setBusy(false);
        }
    };

    const handleOpenDrawer = async () => {
        setBusy(true);
        const ok = await openCashDrawer();
        setBusy(false);
        if (!ok) message.error('Could not reach the drawer — check the printer connection.');
    };

    if (!isWebUsbSupported()) {
        return (
            <Button
                size="middle"
                icon={<PrinterOutlined />}
                disabled
                title="Direct printer connection needs Chrome or Edge"
            >
                Printer N/A
            </Button>
        );
    }

    const items: MenuProps['items'] = paired
        ? [
            { key: 'test', label: 'Test Print', onClick: handleTestPrint },
            { key: 'drawer', label: 'Open Cash Drawer', onClick: handleOpenDrawer },
            { type: 'divider' },
            { key: 'unpair', label: 'Unpair Printer', danger: true, icon: <DisconnectOutlined />, onClick: handleUnpair },
        ]
        : [
            { key: 'pair', label: 'Pair Receipt Printer…', onClick: handlePair },
        ];

    return (
        <Dropdown menu={{ items }} trigger={['click']}>
            <Button
                size="middle"
                loading={busy}
                icon={paired ? <CheckCircleFilled style={{ color: '#52c41a' }} /> : <PrinterOutlined />}
            >
                {paired ? 'Printer Ready' : 'Pair Printer'}
            </Button>
        </Dropdown>
    );
};

export default PrinterStatusButton;
