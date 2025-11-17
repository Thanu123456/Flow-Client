import { Layout } from "antd";
import { customTheme } from "./config/theme.config";
import { App as AntdApp, ConfigProvider } from "antd";
import { BrandsPage } from "./components/brands";
import HeaderWithSearch from "./components/common/Layout/HeaderWithSearch";

const handleMenuClick = () => {
  console.log("Menu clicked");
  // This will be used for sidebar toggle later
};

const App = () => (
  <ConfigProvider theme={customTheme}>
    <ConfigProvider>
      <AntdApp>
        <Layout className="min-h-screen">
          <HeaderWithSearch onMenuClick={handleMenuClick} />
        </Layout>
        <BrandsPage />
      </AntdApp>
    </ConfigProvider>
  </ConfigProvider>
);

export default App;
