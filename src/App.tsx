import React from "react";
import { ConfigProvider, App as AntdApp } from "antd";
import { BrowserRouter } from "react-router-dom";
import { customTheme } from "./config/theme.config";
import { AuthProvider } from "./contexts/AuthContext";
import { PermissionProvider } from "./contexts/PermissionContext";
import { TenantProvider } from "./contexts/TenantContext";
import AppRoutes from "./routes/AppRoutes";

const App: React.FC = () => {
  return (
    <ConfigProvider theme={customTheme}>
      <AntdApp>
        <BrowserRouter>
          <AuthProvider>
            <TenantProvider>
              <PermissionProvider>
                <AppRoutes />
              </PermissionProvider>
            </TenantProvider>
          </AuthProvider>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
