@echo off
REM Capacitor初始化脚本 (Windows)

echo 开始初始化Capacitor...

REM 构建项目
echo 构建项目...
call npm run build

REM 初始化Capacitor（如果还没有）
if not exist "android" (
  if not exist "ios" (
    echo 初始化Capacitor...
    call npx cap init
  )
)

REM 添加平台
echo 添加Android平台...
call npx cap add android

REM 同步
echo 同步到原生项目...
call npx cap sync

echo 完成！现在可以运行以下命令：
echo   Android: npx cap open android
echo   iOS: npx cap open ios

pause
