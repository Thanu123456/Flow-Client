import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from 'antd';
import HeaderWithSearch from './components/common/Layout/HeaderWithSearch';




const App: React.FC = () => {
  const handleMenuClick = () => {
    console.log('Menu clicked');
    // This will be used for sidebar toggle later
  };

  return (
    <BrowserRouter>
      <Layout className="min-h-screen">
        <HeaderWithSearch onMenuClick={handleMenuClick} />
      </Layout>
    </BrowserRouter>
  );
};

export default App;