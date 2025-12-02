import { useState } from "react";
import { Layout } from "antd";
import { customTheme } from "./config/theme.config";
import { App as AntdApp, ConfigProvider } from "antd";
import { BrandsPage } from "./components/brands";
import HeaderWithSearch from "./components/common/Layout/HeaderWithSearch";

const App = () => {
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ConfigProvider theme={customTheme}>
      <ConfigProvider>
        <AntdApp>
          <Layout className="min-h-screen">
            <HeaderWithSearch 
              onMenuClick={() => console.log("Menu clicked")} 
              collapsed={headerCollapsed}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />
          </Layout>
          <BrandsPage
            onHeaderCollapseChange={setHeaderCollapsed}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </AntdApp>
      </ConfigProvider>
    </ConfigProvider>
  );
};

export default App;
