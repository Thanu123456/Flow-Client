// The universal fallback: render the receipt as HTML into a small popup and
// hand it to the OS print dialog. Works with any printer the OS already has
// a driver for, but can't skip the dialog and can't trigger a cash drawer —
// that needs the direct WebUSB path (see receiptPrint.ts), which this backs
// up when no printer is paired or WebUSB isn't available in this browser.
export function printViaWindow(html: string, title: string): void {
    const win = window.open('', '_blank', 'width=420,height=700');
    if (!win) return; // popup blocked — nothing more we can do without a user gesture to retry
    win.document.write(`
        <html>
            <head>
                <title>${title}</title>
                <style>
                    body { margin: 0; padding: 12px; }
                    @media print { body { margin: 0; padding: 0; } }
                    table { width: 100%; border-collapse: collapse; }
                </style>
            </head>
            <body>${html}</body>
        </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
        win.print();
        win.close();
    }, 300);
}
