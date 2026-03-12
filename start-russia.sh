#!/bin/bash

# Glagol Pro - Local Server Setup for Russia
echo "🇷🇺 إعداد سيرفر محلي لروسيا"

# تثبيت الحزم المطلوبة
echo "📦 تثبيت الحزم..."
npm install

# تشغيل MongoDB
echo "🗄️ تشغيل قاعدة البيانات..."
brew services start mongodb-community

# تهيئة قاعدة البيانات
echo "🌱 تهيئة قاعدة البيانات..."
npm run seed

# تشغيل السيرفر على كل الشبكات
echo "🚀 تشغيل السيرفر..."
export HOST=0.0.0.0
export PORT=3000
node all-in-one-server.js
