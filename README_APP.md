# TimeArea APP打包指南

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 准备图标

需要准备应用图标（1024x1024像素），推荐使用在线工具生成：
- 访问 https://www.appicon.co/
- 上传1024x1024的图标
- 下载生成的图标包
- 将 `icon-192.png` 和 `icon-512.png` 放到 `public/` 目录

### 3. 构建项目

```bash
npm run build
```

### 4. 初始化Capacitor

```bash
# 初始化Capacitor
npx cap init

# 添加Android平台
npx cap add android

# 添加iOS平台（需要Mac）
npx cap add ios

# 同步到原生项目
npx cap sync
```

### 5. 打开原生IDE

**Android:**
```bash
npx cap open android
```

**iOS (需要Mac):**
```bash
npx cap open ios
```

### 6. 在IDE中构建和运行

- **Android Studio**: 连接设备或启动模拟器，点击运行
- **Xcode**: 选择设备或模拟器，点击运行

## 移动端特性

✅ 完整的响应式设计
✅ 触摸优化
✅ PWA支持（可添加到主屏幕）
✅ 移动端专用布局
✅ 防止双击缩放
✅ 安全区域适配

## 详细文档

- [移动端适配和APP打包指南](./docs/移动端适配和APP打包指南.md)
- [APP打包快速开始](./docs/APP打包快速开始.md)
