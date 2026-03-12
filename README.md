# Glagol Pro - Backend Server

نظام إدارة مكتب الترجمة والتصديق المتكامل

## 🚀 المميزات

### ✨ قاعدة البيانات المتكاملة
- **MongoDB** - قاعدة بيانات NoSQL قوية ومرنة
- **Mongoose** - ODM للتعامل مع البيانات بكفاءة
- **نماذج بيانات شاملة** - تغطية جميع جوانب النظام

### 🔐 نظام الأمان المتقدم
- **JWT Authentication** - توكنات آمنة للمصادقة
- **Role-based Access Control** - صلاحيات حسب الدور
- **Password Hashing** - تشفير كلمات المرور
- **Rate Limiting** - حماية من الهجمات

### 📊 واجهات API شاملة
- **Orders API** - إدارة الطلبات بالكامل
- **Services API** - إدارة الخدمات والأسعار
- **Companies API** - إدارة الشركات والعملاء
- **Staff API** - إدارة الموظفين والصلاحيات
- **Dashboard API** - إحصائيات وتقارير

### 🎯 المميزات التقنية
- **RESTful API** - واجهات قياسية وسهلة الاستخدام
- **Data Validation** - التحقق من صحة البيانات
- **Error Handling** - معالجة الأخطاء بشكل احترافي
- **Logging** - تسجيل الأحداث والعمليات

## 📦 التثبيت والتشغيل

### المتطلبات الأساسية
- Node.js 16+ 
- MongoDB 4.4+
- npm أو yarn

### خطوات التثبيت

1. **تثبيت الحزم**
```bash
npm install
```

2. **إعداد متغيرات البيئة**
```bash
cp .env.example .env
# تعديل الملف .env حسب الإعدادات الخاصة بك
```

3. **تشغيل قاعدة البيانات**
```bash
# تشغيل MongoDB
mongod
```

4. **تهيئة قاعدة البيانات**
```bash
# إدخال البيانات الأولية
npm run seed
```

5. **تشغيل السيرفر**
```bash
# للطور التطوير
npm run dev

# للطور الإنتاج
npm start
```

## 🏗️ هيكل المشروع

```
glagol-pro-server/
├── models/                 # نماذج البيانات
│   ├── User.js            # المستخدمين
│   ├── Order.js           # الطلبات
│   ├── Service.js         # الخدمات
│   ├── Company.js         # الشركات
│   ├── CompanyDoc.js      # مستندات الشركات
│   ├── Settings.js        # الإعدادات
│   └── DailyFinance.js    # السجلات المالية اليومية
├── routes/                # واجهات API
│   ├── auth.js            # المصادقة
│   ├── orders.js          # الطلبات
│   ├── services.js        # الخدمات
│   ├── companies.js       # الشركات
│   ├── staff.js           # الموظفين
│   └── dashboard.js       # لوحة التحكم
├── middleware/            # البرمجيات الوسيطة
│   ├── auth.js            # المصادقة والصلاحيات
│   └── validation.js      # التحقق من البيانات
├── scripts/               # السكربتات
│   └── seed.js            # تهيئة قاعدة البيانات
├── uploads/               # الملفات المرفوعة
├── backups/               # نسخ احتياطية
├── server.js              # السيرفر الرئيسي
├── package.json           # معلومات المشروع
└── .env                   # متغيرات البيئة
```

## 🔗 واجهات API

### المصادقة
- `POST /api/auth/login` - تسجيل الدخول
- `GET /api/auth/me` - معلومات المستخدم الحالي
- `POST /api/auth/logout` - تسجيل الخروج

### الطلبات
- `GET /api/orders` - عرض كل الطلبات
- `GET /api/orders/:id` - عرض طلب محدد
- `POST /api/orders` - إنشاء طلب جديد
- `PUT /api/orders/:id` - تحديث طلب
- `DELETE /api/orders/:id` - حذف طلب
- `PATCH /api/orders/:id/workflow` - تحديث سير العمل
- `POST /api/orders/:id/payment` - إضافة دفعة

### الخدمات
- `GET /api/services` - عرض كل الخدمات
- `GET /api/services/:id` - عرض خدمة محددة
- `POST /api/services` - إضافة خدمة جديدة
- `PUT /api/services/:id` - تحديث خدمة
- `DELETE /api/services/:id` - حذف خدمة
- `PATCH /api/services/reorder` - إعادة ترتيب الخدمات

### الشركات
- `GET /api/companies` - عرض كل الشركات
- `GET /api/companies/:id` - عرض شركة محددة
- `POST /api/companies` - إضافة شركة جديدة
- `PUT /api/companies/:id` - تحديث شركة
- `DELETE /api/companies/:id` - حذف شركة
- `GET /api/companies/debts/list` - قائمة الديون
- `GET /api/companies/:id/statement` - كشف حساب

### الموظفين
- `GET /api/staff` - عرض كل الموظفين
- `GET /api/staff/:id` - عرض موظف محدد
- `POST /api/staff` - إضافة موظف جديد
- `PUT /api/staff/:id` - تحديث موظف
- `DELETE /api/staff/:id` - حذف موظف
- `PATCH /api/staff/:id/toggle` - تفعيل/إلغاء تفعيل

### لوحة التحكم
- `GET /api/dashboard` - بيانات لوحة التحكم
- `GET /api/dashboard/stats/system` - إحصائيات النظام
- `PATCH /api/dashboard/daily-notes` - حفظ ملاحظات اليومية

## 🔐 الصلاحيات والأدوار

### المدير (Admin)
- صلاحية كاملة على كل الوظائف
- إدارة الموظفين والصلاحيات
- الوصول للإعدادات والتقارير المالية

### الاستقبال (Reception)
- إدارة الطلبات والشركات
- عرض التقارير الأساسية
- لا يمكن الوصول للإعدادات المالية

### المترجم (Translator)
- عرض الطلبات المسندة له
- تحديث حالة سير العمل
- لا يمكن الوصول للبيانات المالية

## 🛡️ الأمان

### حماية البيانات
- تشفير كلمات المرور باستخدام bcrypt
- استخدام JWT tokens للمصادقة
- Rate limiting للحد من الطلبات
- CORS للتحكم في الوصول

### التحقق من البيانات
- استخدام Joi للتحقق من صحة البيانات
- التحقق من الصلاحيات قبل كل عملية
- معالجة الأخطاء بشكل آمن

## 📈 المراقبة والتسجيل

### Health Check
- `GET /health` - فحص حالة السيرفر

### التسجيل
- استخدام Morgan لتسجيل الطلبات
- تسجيل الأخطاء والاستثناءات
- تسجيل عمليات قاعدة البيانات

## 🔄 النسخ الاحتياطي

### النسخ التلقائي
```bash
# يمكن إضافة cron job للنسخ الاحتياطي
0 2 * * * /path/to/backup-script.sh
```

### استعادة البيانات
```bash
# استعادة من نسخة احتياطية
mongorestore --db glagol_pro /path/to/backup
```

## 🚀 النشر

### باستخدام Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### باستخدام PM2
```bash
# تثبيت PM2
npm install -g pm2

# تشغيل التطبيق
pm2 start server.js --name glagol-pro

# عرض الحالة
pm2 status
```

## 🐛 تصحيح الأخطاء

### مشاكل شائعة
1. **فشل الاتصال بقاعدة البيانات**
   - التأكد من تشغيل MongoDB
   - فحص رابط الاتصال في .env

2. **خطأ في المصادقة**
   - التأكد من صحة JWT_SECRET
   - فحص انتهاء صلاحية التوكن

3. **مشاكل في الصلاحيات**
   - التأكد من إعداد الصلاحيات بشكل صحيح
   - فحص دور المستخدم

## 📞 الدعم

لأي استفسارات أو مشاكل:
- البريد الإلكتروني: support@glagol.pro
- الوثائق: [docs.glagol.pro](https://docs.glagol.pro)

## 📜 الترخيص

هذا المشروع مرخص تحت ترخيص MIT - راجع ملف LICENSE للتفاصيل.
