# SEO优化说明

## 概述

TimeArea 已经集成了完整的SEO优化功能，包括动态meta标签、结构化数据、Open Graph标签等，提升搜索引擎收录和社交媒体分享效果。

## 已实现的SEO功能

### 1. 动态Meta标签管理

使用 `react-helmet-async` 实现每个页面的动态SEO配置：

- **页面标题（Title）**：每个页面都有独特的标题
- **描述（Description）**：详细的页面描述
- **关键词（Keywords）**：相关关键词
- **Canonical URL**：防止重复内容

### 2. Open Graph标签

用于社交媒体分享优化：

- `og:title` - 分享标题
- `og:description` - 分享描述
- `og:image` - 分享图片
- `og:url` - 分享链接
- `og:type` - 内容类型

### 3. Twitter Card标签

优化Twitter分享显示：

- `twitter:card` - 卡片类型
- `twitter:title` - 标题
- `twitter:description` - 描述
- `twitter:image` - 图片

### 4. 结构化数据（JSON-LD）

使用Schema.org标准的结构化数据：

- **WebApplication** - 应用信息
- **WebSite** - 网站信息
- **SearchAction** - 搜索功能

### 5. 基础SEO文件

- **robots.txt** - 搜索引擎爬虫规则
- **sitemap.xml** - 网站地图

## 页面SEO配置

### 首页 (/)
- 标题：TimeArea - 长途出行天气查询系统
- 描述：输入经过地点和到达时间，查询沿途天气信息
- 关键词：天气查询,长途出行,天气预报,路线天气

### 历史记录页 (/history)
- 标题：查询历史 - TimeArea
- 描述：查看您的天气查询历史记录、常用地点和统计信息
- 关键词：查询历史,历史记录,常用地点,天气统计

### 路线管理页 (/routes)
- 标题：路线管理 - TimeArea
- 描述：管理您的出行路线、模板和收藏
- 关键词：路线管理,出行路线,路线模板,路线分享

### 缓存管理页 (/cache)
- 标题：缓存管理 - TimeArea
- 描述：查看和管理系统缓存，包括天气数据、地理编码等缓存信息
- 关键词：缓存管理,系统缓存,天气缓存

## 使用方法

### 添加新页面的SEO配置

1. 在 `src/utils/seo.ts` 的 `pageSEOConfigs` 中添加新页面配置：

```typescript
'/new-page': {
  title: '新页面 - TimeArea',
  description: '页面描述',
  keywords: '关键词1,关键词2',
  path: '/new-page'
}
```

2. SEO组件会自动应用配置，无需额外操作。

### 自定义页面SEO

在页面组件中直接使用SEO组件：

```typescript
import { SEO } from '../components/seo/SEO';

export const MyPage: React.FC = () => {
  return (
    <>
      <SEO
        title="自定义标题"
        description="自定义描述"
        keywords="自定义关键词"
      />
      {/* 页面内容 */}
    </>
  );
};
```

## 部署注意事项

### 1. 更新sitemap.xml

部署前需要更新 `public/sitemap.xml` 中的域名：

```xml
<loc>https://your-domain.com/</loc>
```

替换为实际部署域名。

### 2. 更新robots.txt

更新 `public/robots.txt` 中的sitemap地址：

```
Sitemap: https://your-domain.com/sitemap.xml
```

### 3. 验证结构化数据

使用Google的[结构化数据测试工具](https://search.google.com/test/rich-results)验证结构化数据是否正确。

### 4. 提交sitemap

在Google Search Console和Bing Webmaster Tools中提交sitemap.xml。

## SEO最佳实践

1. **定期更新内容**：保持页面内容的新鲜度
2. **优化图片**：使用alt标签和合适的文件名
3. **提高页面速度**：优化加载性能
4. **移动端优化**：确保移动端体验良好
5. **内链建设**：合理使用内部链接
6. **外链建设**：获取高质量的外部链接

## 验证工具

- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [结构化数据测试工具](https://search.google.com/test/rich-results)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Open Graph调试器](https://developers.facebook.com/tools/debug/)

## 技术实现

- **react-helmet-async**：管理动态meta标签
- **Schema.org**：结构化数据标准
- **JSON-LD**：结构化数据格式
- **Open Graph**：社交媒体分享协议
