# 移动端适配和APP打包指南

## 一、移动端适配

### 1.1 响应式设计

项目已实现完整的移动端响应式设计：

- **断点设置**：768px以下为移动端，480px以下为小屏手机
- **布局适配**：移动端使用垂直布局，桌面端使用水平布局
- **字体大小**：移动端自动调整字体大小
- **触摸优化**：按钮和输入框针对触摸操作优化

### 1.2 移动端优化特性

- ✅ 防止iOS双击缩放
- ✅ 安全区域适配（iPhone刘海屏）
- ✅ 输入框字体大小优化（防止iOS自动缩放）
- ✅ 触摸反馈优化
- ✅ 滚动性能优化

## 二、PWA支持

### 2.1 已配置的功能

- ✅ Service Worker（离线缓存）
- ✅ Web App Manifest（添加到主屏幕）
- ✅ 自动更新机制

### 2.2 使用PWA

1. 构建项目：`npm run build`
2. 部署到HTTPS服务器
3. 用户在浏览器中访问
4. 浏览器会提示"添加到主屏幕"
5. 添加后可以像原生APP一样使用

## 三、使用Capacitor打包APP

### 3.1 安装Capacitor

```bash
npm install
```

### 3.2 初始化Capacitor

```bash
# 添加Android平台
npx cap add android

# 添加iOS平台（需要Mac）
npx cap add ios
```

### 3.3 构建项目

```bash
npm run build
```

### 3.4 同步到原生项目

```bash
npx cap sync
```

### 3.5 打开原生IDE

**Android:**
```bash
npx cap open android
```

**iOS:**
```bash
npx cap open ios
```

### 3.6 在IDE中构建APP

- **Android Studio**: 打开项目后，点击运行按钮
- **Xcode**: 选择设备或模拟器，点击运行

## 四、APP配置

### 4.1 应用信息

- **应用ID**: `com.timearea.app`
- **应用名称**: `TimeArea`
- **版本**: 在 `package.json` 中配置

### 4.2 图标和启动屏

需要准备以下资源：

**Android (res目录)**:
- `mipmap-mdpi/icon.png` (48x48)
- `mipmap-hdpi/icon.png` (72x72)
- `mipmap-xhdpi/icon.png` (96x96)
- `mipmap-xxhdpi/icon.png` (144x144)
- `mipmap-xxxhdpi/icon.png` (192x192)

**iOS (Assets.xcassets)**:
- `AppIcon.appiconset` 包含各种尺寸图标

### 4.3 权限配置

**Android (AndroidManifest.xml)**:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

**iOS (Info.plist)**:
```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
</dict>
```

## 五、打包发布

### 5.1 Android打包

1. 在Android Studio中打开项目
2. 选择 `Build` -> `Generate Signed Bundle / APK`
3. 选择 `APK` 或 `Android App Bundle`
4. 创建或选择密钥库
5. 选择构建类型（Release）
6. 完成打包

### 5.2 iOS打包

1. 在Xcode中打开项目
2. 选择 `Product` -> `Archive`
3. 等待归档完成
4. 在Organizer中选择归档
5. 点击 `Distribute App`
6. 选择分发方式（App Store、Ad Hoc等）

## 六、测试

### 6.1 开发环境测试

```bash
npm run dev
```

在手机浏览器中访问开发服务器地址（需要同一网络）

### 6.2 生产环境测试

```bash
npm run build
npm run preview
```

### 6.3 原生APP测试

使用Android Studio或Xcode的模拟器/真机测试

## 七、注意事项

1. **API密钥安全**
   - 生产环境建议使用环境变量注入
   - 不要在代码中硬编码密钥

2. **网络权限**
   - Android和iOS都需要配置网络权限
   - 确保API调用可以正常进行

3. **HTTPS要求**
   - PWA和Capacitor都需要HTTPS
   - 开发环境可以使用HTTP，生产环境必须HTTPS

4. **图标资源**
   - 需要准备各种尺寸的图标
   - 可以使用在线工具生成：https://www.appicon.co/

5. **性能优化**
   - 移动端注意图片大小
   - 使用懒加载减少初始加载时间

## 八、常见问题

### Q: 打包后API调用失败？
A: 检查网络权限配置，确保允许HTTP/HTTPS请求

### Q: iOS打包需要什么？
A: 需要Mac电脑、Xcode、Apple开发者账号

### Q: 如何更新APP？
A: PWA会自动更新，原生APP需要通过应用商店更新

### Q: 可以同时支持Android和iOS吗？
A: 可以，Capacitor支持跨平台开发
