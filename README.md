# TimeArea - 长途出行天气查询系统

## 项目简介

TimeArea 是一个帮助用户在长途出行时查询经过地天气信息的纯前端应用。用户可以输入多个经过地点和对应的经过时间，系统会显示每个地点在指定时间的天气预报信息。

## 技术栈

- **React 18** + **TypeScript** - 前端框架
- **Vite** - 构建工具
- **Ant Design** - UI组件库
- **Zustand** - 状态管理
- **Axios** - HTTP请求
- **Day.js** - 日期处理

## 功能特性

- ✅ 地点输入和地理编码（百度地图API）
- ✅ 天气查询（和风天气API）
- ✅ 批量查询多个地点的天气
- ✅ 本地缓存优化
- ✅ 响应式设计

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
VITE_WEATHER_API_KEY=your_qweather_api_key
VITE_MAP_API_KEY=your_baidu_map_ak
```

**注意**：和风天气API只需要Key，不需要Secret。Secret通常用于签名验证，免费版API不需要。

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 4. 构建生产版本

```bash
npm run build
```

构建产物在 `dist` 目录。

## API密钥申请

### 百度地图API

1. 访问 https://lbsyun.baidu.com/
2. 注册/登录账号
3. 进入控制台，创建应用
4. 获取AK（Access Key）
5. 配置应用的IP白名单或域名白名单

### 和风天气API

1. 访问 https://dev.qweather.com/
2. 注册/登录账号
3. 创建应用，获取Key和Secret
4. 免费版支持每日1000次调用
5. 配置应用的域名白名单

## 项目结构

```
src/
├── components/        # 组件
│   ├── route/        # 路线相关组件
│   └── weather/      # 天气相关组件
├── services/         # API服务
├── utils/            # 工具函数
├── store/            # 状态管理
├── types/            # 类型定义
├── pages/            # 页面
└── styles/           # 样式文件
```

## 开发说明

详细开发指南请查看 [docs/开发指南.md](./docs/开发指南.md)

## 许可证

MIT License
