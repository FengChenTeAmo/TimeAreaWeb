/**
 * SEO工具函数
 */

export interface PageSEOConfig {
  title: string;
  description: string;
  keywords?: string;
  path: string;
}

/**
 * 生成结构化数据（JSON-LD）
 */
export function generateStructuredData(config: {
  name: string;
  description: string;
  url: string;
  logo?: string;
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: config.name,
    description: config.description,
    url: config.url,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CNY'
    },
    ...(config.logo && {
      logo: config.logo,
      image: config.logo
    })
  };
}

/**
 * 生成网站结构化数据
 */
export function generateWebsiteStructuredData(): object {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TimeArea',
    description: '长途出行天气查询系统',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

/**
 * 页面SEO配置
 */
export const pageSEOConfigs: Record<string, PageSEOConfig> = {
  '/': {
    title: 'TimeArea - 长途出行天气查询系统',
    description: '输入经过地点和到达时间，查询沿途天气信息。支持多地点批量查询、GPS定位、历史记录等功能。',
    keywords: '天气查询,长途出行,天气预报,路线天气,天气查询工具,出行规划,多地点天气',
    path: '/'
  },
  '/history': {
    title: '查询历史 - TimeArea',
    description: '查看您的天气查询历史记录、常用地点和统计信息。快速重新执行历史查询，提高查询效率。',
    keywords: '查询历史,历史记录,常用地点,天气统计,查询记录',
    path: '/history'
  },
  '/routes': {
    title: '路线管理 - TimeArea',
    description: '管理您的出行路线、模板和收藏。支持路线分享、复制、编辑等功能，方便您规划出行路线。',
    keywords: '路线管理,出行路线,路线模板,路线分享,路线收藏',
    path: '/routes'
  },
  '/cache': {
    title: '缓存管理 - TimeArea',
    description: '查看和管理系统缓存，包括天气数据、地理编码等缓存信息。优化缓存使用，提高查询速度。',
    keywords: '缓存管理,系统缓存,天气缓存,地理编码缓存',
    path: '/cache'
  }
};

/**
 * 获取页面SEO配置
 */
export function getPageSEOConfig(pathname: string): PageSEOConfig {
  return pageSEOConfigs[pathname] || pageSEOConfigs['/'];
}
