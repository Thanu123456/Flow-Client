import React, { useEffect, useRef } from 'react';
import { App as AntdApp } from 'antd';
import { useNavigate } from 'react-router-dom';

const SessionExpiredHandler: React.FC = () => {
    const { modal } = AntdApp.useApp();
    const navigate = useNavigate();
    const isShowing = useRef(false);

    useEffect(() => {
        const handleSessionExpired = (event: Event) => {
            const customEvent = event as CustomEvent;
            const path = window.location.pathname;

            // Only handle 401 (session expired) that hasn't already triggered a modal
            // Also avoid showing if user is already on a login page
            if (customEvent.detail?.status === 401 && !isShowing.current && !path.includes('/login')) {
                isShowing.current = true;
                const redirectUrl = customEvent.detail.redirectUrl || '/login';

                modal.warning({
                    title: 'Session Expired',
                    content: 'Your session has expired or you have been logged out. Please login again to continue.',
                    okText: 'Back to Login',
                    centered: true,
                    maskClosable: false, // Force user to click the button
                    onOk: () => {
                        isShowing.current = false;
                        window.location.href = redirectUrl;
                    },
                    afterClose: () => {
                        // Safety in case multiple 401 errors come in rapidly
                        isShowing.current = false;
                    }
                });
            }
        };

        window.addEventListener('api-error', handleSessionExpired);
        return () => window.removeEventListener('api-error', handleSessionExpired);
    }, [modal, navigate]);

    return null;
};

export default SessionExpiredHandler;
