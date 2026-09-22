import React from "react";
import { ConfigProvider, App as AntdApp } from "antd";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./services/api/queryClient";
import { customTheme } from "./config/theme.config";
import { AuthProvider } from "./contexts/AuthContext";
import { PermissionProvider } from "./contexts/PermissionContext";
import { TenantProvider } from "./contexts/TenantContext";
import AppRoutes from "./routes/AppRoutes";
import SessionExpiredHandler from "./components/auth/SessionExpiredHandler";
import IdleTimeoutHandler from "./components/auth/IdleTimeoutHandler";
import OfflineIndicator from "./components/common/OfflineIndicator";
import KioskLockdownGuard from "./components/kiosk/KioskLockdownGuard";
import ElevationBanner from "./components/kiosk/ElevationBanner";
import KioskHeartbeat from "./components/kiosk/KioskHeartbeat";

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={customTheme}>
        <AntdApp>
          <BrowserRouter>
            <AuthProvider>
              <TenantProvider>
                <PermissionProvider>
                  <SessionExpiredHandler />
                  <IdleTimeoutHandler />
                  <OfflineIndicator />
                  <KioskLockdownGuard />
                  <ElevationBanner />
                  <KioskHeartbeat />
                  <AppRoutes />
                </PermissionProvider>
              </TenantProvider>
            </AuthProvider>
          </BrowserRouter>
        </AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default App;
