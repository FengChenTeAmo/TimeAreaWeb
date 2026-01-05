# APP打包快速开始指南

## 一、准备工作

### 1.1 安装依赖

```bash
npm install
```

### 1.2 准备图标

需要准备应用图标（1024x1024像素），然后使用工具生成各种尺寸：
- 访问 https://www.appicon.co/ 生成图标
- 或使用其他图标生成工具

将生成的图标放到：
- `public/icon-192.png`
- `public/icon-512.png`

## 二、初始化Capacitor

### 2.1 构建项目

```bash
npm run build
```

### 2.2 初始化Capacitor

```bash
# 初始化（首次运行）
npx cap init

# 添加Android平台
npx cap add android

# 添加iOS平台（需要Mac）
npx cap add ios
```

### 2.3 同步到原生项目

```bash
npx cap sync
```

## 三、打开原生IDE

### 3.1 Android

```bash
npx cap open android
```

在Android Studio中：
1. 等待Gradle同步完成
2. 连接Android设备或启动模拟器
3. 点击运行按钮

### 3.2 iOS（需要Mac）

```bash
npx cap open ios
```

在Xcode中：
1. 选择设备或模拟器
2. 点击运行按钮

## 四、打包发布

### 4.1 Android APK

1. 在Android Studio中
2. `Build` -> `Generate Signed Bundle / APK`
3. 选择 `APK`
4. 创建或选择密钥库
5. 选择 `release` 构建类型
6. 完成打包

### 4.2 Android App Bundle (AAB)

1. 在Android Studio中
2. `Build` -> `Generate Signed Bundle / APK`
3. 选择 `Android App Bundle`
4. 创建或选择密钥库
5. 选择 `release` 构建类型
6. 完成打包（用于Google Play发布）

### 4.3 iOS

1. 在Xcode中
2. `Product` -> `Archive`
3. 等待归档完成
4. 在Organizer中选择归档
5. `Distribute App`
6. 选择分发方式

## 五、更新APP

### 5.1 更新代码后

```bash
# 1. 构建
npm run build

# 2. 同步
npx cap sync

# 3. 在IDE中重新构建
```

## 六、配置说明

### 6.1 应用信息

编辑 `capacitor.config.ts` 修改：
- `appId`: 应用唯一标识
- `appName`: 应用名称

### 6.2 权限配置

**Android**: 编辑 `android/app/src/main/AndroidManifest.xml`
**iOS**: 编辑 `ios/App/App/Info.plist`

## 七、测试

### 7.1 开发测试

```bash
npm run dev
```

在手机浏览器访问（需要同一网络）

### 7.2 原生测试

使用Android Studio或Xcode的模拟器/真机测试

## 八、常见问题

### Q: 需要Android Studio吗？
A: 是的，Android打包需要Android Studio

### Q: iOS打包需要什么？
A: 需要Mac、Xcode、Apple开发者账号

### Q: 可以只打包Android吗？
A: 可以，只运行 `npx cap add android` 即可

### Q: 打包后如何更新？
A: 更新代码后重新构建和同步，然后重新打包
