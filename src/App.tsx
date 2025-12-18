import { useState } from "react";
import { customTheme } from "./config/theme.config";
import { App as AntdApp, ConfigProvider } from "antd";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { BrandsPage } from "./components/brands";
import HeaderWithSearch from "./components/common/Layout/HeaderWithSearch";
import DummySidebar from "./components/common/Layout/DummySidebar";
import { UnitsPage } from "./components/units";
import { CategoriesPage } from "./components/categories";
import { SubCategoriesPage } from "./components/subcategories";

interface AppLayoutProps {
  children:
    | React.ReactNode
    | ((props: {
        onHeaderCollapseChange: (collapsed: boolean) => void;
        sidebarOpen: boolean;
        setSidebarOpen: (open: boolean) => void;
      }) => React.ReactNode);
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sidebarWidth = sidebarOpen ? 280 : 70;

  const handleHeaderCollapseChange = (collapsed: boolean) => {
    setHeaderCollapsed(collapsed);
  };

  const renderChildren = () => {
    if (typeof children === "function") {
      return children({
        onHeaderCollapseChange: handleHeaderCollapseChange,
        sidebarOpen,
        setSidebarOpen,
      });
    }
    return children;
  };

  return (
    <>
      <DummySidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(!sidebarOpen)}
      />
      <div
        style={{
          marginLeft: `${sidebarWidth}px`,
          transition: "margin-left 0.3s ease",
          minHeight: "100vh",
        }}
      >
        <HeaderWithSearch
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          collapsed={headerCollapsed}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main style={{ padding: "24px" }}>{renderChildren()}</main>
      </div>
    </>
  );
};

const App = () => {
  return (
    <ConfigProvider theme={customTheme}>
      <AntdApp>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <AppLayout>
                  <UnitsPage />
                </AppLayout>
              }
            />
            <Route
              path="/units"
              element={
                <AppLayout>
                  {({
                    onHeaderCollapseChange,
                    sidebarOpen,
                    setSidebarOpen,
                  }) => (
                    <UnitsPage
                      onHeaderCollapseChange={onHeaderCollapseChange}
                      sidebarOpen={sidebarOpen}
                      setSidebarOpen={setSidebarOpen}
                    />
                  )}
                </AppLayout>
              }
            />
            <Route
              path="/brands"
              element={
                <AppLayout>
                  {({
                    onHeaderCollapseChange,
                    sidebarOpen,
                    setSidebarOpen,
                  }) => (
                    <BrandsPage
                      onHeaderCollapseChange={onHeaderCollapseChange}
                      sidebarOpen={sidebarOpen}
                      setSidebarOpen={setSidebarOpen}
                    />
                  )}
                </AppLayout>
              }
            />
            <Route
              path="/categories"
              element={
                <AppLayout>
                  {({
                    onHeaderCollapseChange,
                    sidebarOpen,
                    setSidebarOpen,
                  }) => (
                    <CategoriesPage
                      onHeaderCollapseChange={onHeaderCollapseChange}
                      sidebarOpen={sidebarOpen}
                      setSidebarOpen={setSidebarOpen}
                    />
                  )}
                </AppLayout>
              }
            />
            <Route
              path="/subcategories"
              element={
                <AppLayout>
                  {({
                    onHeaderCollapseChange,
                    sidebarOpen,
                    setSidebarOpen,
                  }) => (
                    <SubCategoriesPage
                      onHeaderCollapseChange={onHeaderCollapseChange}
                      sidebarOpen={sidebarOpen}
                      setSidebarOpen={setSidebarOpen}
                    />
                  )}
                </AppLayout>
              }
            />
          </Routes>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
