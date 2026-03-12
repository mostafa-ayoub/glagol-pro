# Glagol Pro - نظام إدارة مكتب الترجمة

[![GitHub Pages](https://github.com/yourusername/glagol-pro/actions/workflows/deploy.yml/badge.svg)](https://github.com/yourusername/glagol-pro/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

نظام إدارة احترافي لمكاتب الترجمة والتصديق، مصمم خصيصًا للسوق الروسية والشرق أوسطية.

## 🎯 **المميزات الرئيسية**

### 📊 **إدارة الطلبات**
- تتبع شامل لسير العمل
- إدارة الحالات والمواعيد النهائية
- حساب الإيرادات والمدفوعات
- طباعة التقارير والفواتير

### 👥 **إدارة العملاء**
- إدارة الشركات والأفراد
- تتبع الديون والدفعات
- سجل المعاملات الكامل
- إدارة العقود والاتفاقيات

### 💰 **نظام مالي متكامل**
- تقارير مالية مفصلة
- إحصائيات الأداء
- تتبع الربح والخسارة
- ميزانية اليومية

### 🔐 **أمان متقدم**
- نظام مصادقة JWT
- صلاحيات حسب الدور
- تشفير البيانات
- نسخ احتياطي تلقائي

### 📱 **متعدد المنصات**
- يعمل على جميع الأجهزة
- تطبيق PWA للهاتف
- وصول من أي مكان
- دعم اللغات المتعددة

## 🚀 **التجربة السريعة**

### **الوصول المباشر**
- **العرض:** [https://yourusername.github.io/glagol-pro](https://yourusername.github.io/glagol-pro)
- **النسخة الكاملة:** [https://glagol-pro.herokuapp.com](https://glagol-pro.herokuapp.com)

### **بيانات الدخول التجريبية**
- **مدير:** admin123
- **استقبال:** recep123
- **مترجم:** staff123

## 🛠️ **التثبيت المحلي**

### **المتطلبات**
- Node.js 16+
- MongoDB 4.4+
- Git

### **الخطوات**
```bash
# 1. استنساخ المستودع
git clone https://github.com/yourusername/glagol-pro.git
cd glagol-pro

# 2. تثبيت الحزم
npm install

# 3. تشغيل MongoDB
brew services start mongodb-community

# 4. تهيئة قاعدة البيانات
npm run seed

# 5. تشغيل السيرفر
npm start
```

### **الوصول**
- **الواجهة:** http://localhost:3000
- **API:** http://localhost:3000/api

## 🌐 **النشر**

### **GitHub Pages (مجاني)**
```bash
# 1. Fork المستودع
# 2. عدّل GitHub Pages في الإعدادات
# 3. سيتم النشر تلقائيًا
```

### **Heroku**
```bash
# 1. إنشاء تطبيق Heroku
heroku create glagol-pro

# 2. رفع الكود
git push heroku main

# 3. تهيئة قاعدة البيانات
heroku run npm run seed
```

### **Docker**
```bash
# 1. بناء الصورة
docker build -t glagol-pro .

# 2. تشغيل الحاوية
docker run -p 3000:3000 glagol-pro
```

## 📱 **التطبيق للهاتف**

### **PWA Features**
- يعمل بدون إنترنت (بعد التحميل)
- إشعارات فورية
- وصول للكاميرا والمعرض
- تثبيت على الشاشة الرئيسية

### **التثبيت**
1. افتح الرابط في المتصفح
2. اضغط "إضافة للشاشة الرئيسية"
3. استخدم كتطبيق أصلي

## 🔧 **التخصيص**

### **إعدادات النظام**
```javascript
// في .env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/glagol_pro
JWT_SECRET=your_secret_key
```

### **تخصيص الواجهة**
```css
/* في glagol-pro-v5.html */
:root {
  --accent: #your_color;
  --bg: #your_background;
  --ink: #your_text_color;
}
```

## 📊 **واجهات API**

### **المصادقة**
```http
POST /api/auth/login
GET /api/auth/me
POST /api/auth/logout
```

### **الطلبات**
```http
GET /api/orders
POST /api/orders
PUT /api/orders/:id
DELETE /api/orders/:id
```

### **الشركات**
```http
GET /api/companies
POST /api/companies
PUT /api/companies/:id
GET /api/companies/:id/statement
```

### **الخدمات**
```http
GET /api/services
POST /api/services
PUT /api/services/:id
PATCH /api/services/reorder
```

## 🤝 **المساهمة**

### **كيف تساهم**
1. Fork المشروع
2. أنشئ فرعًا جديدًا (`git checkout -b feature/AmazingFeature`)
3. قدم التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. ارفع الفرع (`git push origin feature/AmazingFeature`)
5. افتح Pull Request

### **المبادئ التوجيهية**
- كود نظيف ومنظم
- اختبارات للوظائف الجديدة
- التوثيق ضروري
- احترام أنماط الكود الحالية

## 📄 **الترخيص**

هذا المشروع مرخص تحت ترخيص MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

## 🆘 **الدعم**

### **طرق التواصل**
- 📧 البريد الإلكتروني: support@glagol.pro
- 🐛 الإبلاغ عن مشاكل: [GitHub Issues](https://github.com/yourusername/glagol-pro/issues)
- 💬 النقاشات: [GitHub Discussions](https://github.com/yourusername/glagol-pro/discussions)

### **الوثائق**
- [📚 الوثائق الكاملة](https://docs.glagol.pro)
- [🎥 الفيديوهات التعليمية](https://youtube.com/glagol-pro)
- [📖 الدليل السريع](https://docs.glagol.pro/quickstart)

## 🎊 **الشكر والتقدير**

- جميع المترجمين الذين ساهموا باختبار النظام
- مجتمع المصادر المفتوحة
- مستخدمينا القيماء

---

**🚀 [جرب النظام الآن](https://yourusername.github.io/glagol-pro)**

**⭐ إذا أعجبك المشروع، لا تنسى إعطاء نجمة!**
