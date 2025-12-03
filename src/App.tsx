import { useState } from "react";
import { Layout } from "antd";
import { customTheme } from "./config/theme.config";
import { App as AntdApp, ConfigProvider } from "antd";
import { BrandsPage } from "./components/brands";
import HeaderWithSearch from "./components/common/Layout/HeaderWithSearch";
import DummySidebar from "./components/common/Layout/DummySidebar";

const App = () => {
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Calculate sidebar width for content margin
  const sidebarWidth = sidebarOpen ? 280 : 70;

  return (
    <ConfigProvider theme={customTheme}>
      <AntdApp>
        {/* Persistent Sidebar - always visible */}
        <DummySidebar 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        {/* Main Content Area */}
        <div 
          style={{
            marginLeft: `${sidebarWidth}px`,
            transition: 'margin-left 0.3s ease',
            minHeight: '100vh',
          }}
        >
          <HeaderWithSearch 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
            collapsed={headerCollapsed}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
          <BrandsPage
            onHeaderCollapseChange={setHeaderCollapsed}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </div>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;