import React from 'react';
import { ConfigProvider } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from 'antd';
import { customTheme } from './config/theme.config';
import HeaderWithSearch from './components/common/Layout/HeaderWithSearch';

// Import example components (commented - uncomment as needed)
// import { ButtonExamples } from './components/common/Button/ButtonExamples';
// import InputExamples from './components/common/Input/InputExample';
// import { TableExample } from './components/common/Table/TableExample';
// import { NavigationExample } from './components/common/Navigation/NavigationExample';

const App: React.FC = () => {
  const handleMenuClick = () => {
    console.log('Menu clicked');
    // This will be used for sidebar toggle later
  };

  return (
    <ConfigProvider theme={customTheme}>
      <BrowserRouter>
        <Layout className="min-h-screen">
          {/* Header Component */}
          <HeaderWithSearch onMenuClick={handleMenuClick} />

          {/* Main Layout Content */}
          <Layout.Content className="p-6">
            {/* Uncomment any of the example components below to use them */}
            
            {/* <ButtonExamples /> */}
            
            {/* <InputExamples /> */}
            
            {/* <TableExample /> */}
            
            {/* <NavigationExample /> */}

            {/* Add your main application content here */}
          </Layout.Content>

          {/* Optional: Footer Component (add if needed) */}
          {/* <Layout.Footer className="text-center">
            Flow POS ©2024 Created by Escope International
          </Layout.Footer> */}
        </Layout>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;