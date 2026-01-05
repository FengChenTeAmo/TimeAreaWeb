import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: object;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'TimeArea - 长途出行天气查询系统',
  description = 'TimeArea是一个专业的天气查询工具，帮助您在长途出行时查询经过地点的天气信息。支持多地点批量查询、历史记录、路线管理等功能。',
  keywords = '天气查询,长途出行,天气预报,路线天气,天气查询工具,出行规划',
  image = '/icon-512.png',
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = 'website',
  structuredData
}) => {
  const fullTitle = title.includes('TimeArea') ? title : `${title} - TimeArea`;
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
  const fullUrl = url.startsWith('http') ? url : `${siteUrl}${url}`;

  return (
    <Helmet>
      {/* 基础SEO标签 */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="TimeArea" />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph标签（用于社交媒体分享） */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="TimeArea" />
      <meta property="og:locale" content="zh_CN" />

      {/* Twitter Card标签 */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />

      {/* 移动端优化 */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-title" content="TimeArea" />

      {/* 结构化数据（JSON-LD） */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};
