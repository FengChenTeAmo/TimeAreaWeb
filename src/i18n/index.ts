import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入中文翻译文件
import zhCNCommon from './locales/zh-CN/common.json';
import zhCNHome from './locales/zh-CN/home.json';
import zhCNHistory from './locales/zh-CN/history.json';
import zhCNRoutes from './locales/zh-CN/routes.json';
import zhCNCache from './locales/zh-CN/cache.json';

// 导入英文翻译文件
import enUSCommon from './locales/en-US/common.json';
import enUSHome from './locales/en-US/home.json';
import enUSHistory from './locales/en-US/history.json';
import enUSRoutes from './locales/en-US/routes.json';
import enUSCache from './locales/en-US/cache.json';

// 导入西班牙语翻译文件
import esESCommon from './locales/es-ES/common.json';
import esESHome from './locales/es-ES/home.json';
import esESHistory from './locales/es-ES/history.json';
import esESRoutes from './locales/es-ES/routes.json';
import esESCache from './locales/es-ES/cache.json';

// 导入印地语翻译文件
import hiINCommon from './locales/hi-IN/common.json';
import hiINHome from './locales/hi-IN/home.json';
import hiINHistory from './locales/hi-IN/history.json';
import hiINRoutes from './locales/hi-IN/routes.json';
import hiINCache from './locales/hi-IN/cache.json';

// 导入阿拉伯语翻译文件
import arSACommon from './locales/ar-SA/common.json';
import arSAHome from './locales/ar-SA/home.json';
import arSAHistory from './locales/ar-SA/history.json';
import arSARoutes from './locales/ar-SA/routes.json';
import arSACache from './locales/ar-SA/cache.json';

const resources = {
  'zh-CN': {
    common: zhCNCommon,
    home: zhCNHome,
    history: zhCNHistory,
    routes: zhCNRoutes,
    cache: zhCNCache,
  },
  'en-US': {
    common: enUSCommon,
    home: enUSHome,
    history: enUSHistory,
    routes: enUSRoutes,
    cache: enUSCache,
  },
  'es-ES': {
    common: esESCommon,
    home: esESHome,
    history: esESHistory,
    routes: esESRoutes,
    cache: esESCache,
  },
  'hi-IN': {
    common: hiINCommon,
    home: hiINHome,
    history: hiINHistory,
    routes: hiINRoutes,
    cache: hiINCache,
  },
  'ar-SA': {
    common: arSACommon,
    home: arSAHome,
    history: arSAHistory,
    routes: arSARoutes,
    cache: arSACache,
  },
};

i18n
  .use(LanguageDetector) // 自动检测浏览器语言
  .use(initReactI18next) // 初始化react-i18next
  .init({
    resources,
    fallbackLng: {
      'es-ES': ['es-ES', 'en-US', 'zh-CN'],
      'hi-IN': ['hi-IN', 'en-US', 'zh-CN'],
      'ar-SA': ['ar-SA', 'en-US', 'zh-CN'], // 阿拉伯语回退到英文，再回退到中文
      default: ['zh-CN', 'en-US'],
    },
    defaultNS: 'common',
    ns: ['common', 'home', 'history', 'routes', 'cache'],
    
    interpolation: {
      escapeValue: false, // React已经转义，不需要i18next转义
    },
    
    detection: {
      // 语言检测配置
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

// 监听语言变化，更新HTML lang和dir属性
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  // 设置文字方向：阿拉伯语为RTL，其他为LTR
  document.documentElement.dir = lng.startsWith('ar') ? 'rtl' : 'ltr';
});

// 初始化时设置正确的方向
if (typeof document !== 'undefined') {
  const currentLang = i18n.language || 'zh-CN';
  document.documentElement.dir = currentLang.startsWith('ar') ? 'rtl' : 'ltr';
}

export default i18n;
