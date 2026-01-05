#!/bin/bash

# Capacitor初始化脚本

echo "开始初始化Capacitor..."

# 构建项目
echo "构建项目..."
npm run build

# 初始化Capacitor（如果还没有）
if [ ! -d "android" ] && [ ! -d "ios" ]; then
  echo "初始化Capacitor..."
  npx cap init
fi

# 添加平台
echo "添加Android平台..."
npx cap add android

# 同步
echo "同步到原生项目..."
npx cap sync

echo "完成！现在可以运行以下命令："
echo "  Android: npx cap open android"
echo "  iOS: npx cap open ios"
