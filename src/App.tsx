import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { HelmetProvider } from 'react-helmet-async';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import esES from 'antd/locale/es_ES';
import arEG from 'antd/locale/ar_EG'; // Ant Design 的阿拉伯语locale
import { useTranslation } from 'react-i18next';
import { Home } from './pages/Home';
import { History } from './pages/History';
import { Cache } from './pages/Cache';
import { Routes as RoutesPage } from './pages/Routes';
import { SEO } from './components/seo/SEO';
import { getPageSEOConfig, generateWebsiteStructuredData } from './utils/seo';
import './i18n'; // 导入i18n配置
import './App.css';

// Ant Design 语言映射
const antdLocales: Record<string, any> = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'es-ES': esES,
  'hi-IN': zhCN, // 印地语暂时使用中文locale
  'ar-SA': arEG, // 阿拉伯语使用 Ant Design 的阿拉伯语locale
};

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

// Ant Design Locale包装组件
const AntdLocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const locale = antdLocales[i18n.language] || zhCN;
  const isRTL = i18n.language.startsWith('ar');

  return (
    <ConfigProvider 
      locale={locale}
      direction={isRTL ? 'rtl' : 'ltr'} // 设置方向
    >
      {children}
    </ConfigProvider>
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
  // 获取 base 路径（用于 GitHub Pages 部署）
  // 如果部署在子路径下（如 /TimeAreaWeb/），需要设置 basename
  const basename = import.meta.env.BASE_URL || '/';
  
  return (
    <HelmetProvider>
      <AntdLocaleProvider>
        <BrowserRouter basename={basename}>
          <AppRoutes />
        </BrowserRouter>
      </AntdLocaleProvider>
    </HelmetProvider>
  );
}

export default App;
