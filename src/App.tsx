import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { HelmetProvider } from 'react-helmet-async';
import zhCN from 'antd/locale/zh_CN';
import { Home } from './pages/Home';
import { History } from './pages/History';
import { Cache } from './pages/Cache';
import { Routes as RoutesPage } from './pages/Routes';
import { SEO } from './components/seo/SEO';
import { getPageSEOConfig, generateWebsiteStructuredData } from './utils/seo';
import './App.css';

// SEO包装组件（需要在Routes内部使用）
const SEOWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const seoConfig = getPageSEOConfig(location.pathname);
  const structuredData = generateWebsiteStructuredData();

  return (
    <>
      <SEO
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        url={location.pathname}
        structuredData={structuredData}
      />
      {children}
    </>
  );
};

function AppRoutes() {
  return (
    <SEOWrapper>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/cache" element={<Cache />} />
        <Route path="/routes" element={<RoutesPage />} />
      </Routes>
    </SEOWrapper>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ConfigProvider locale={zhCN}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ConfigProvider>
    </HelmetProvider>
  );
}

export default App;
