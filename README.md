# 🏥 نظام إدارة العيادات الطبية

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?logo=postgresql)

**نظام متكامل واحترافي لإدارة العيادات الطبية**

[معاينة مباشرة](https://your-clinic.vercel.app) · [الإبلاغ عن خطأ](https://github.com/your-username/clinic-system/issues)

</div>

---

## ✨ المميزات الرئيسية

- 🔐 **نظام مصادقة متكامل** — NextAuth.js مع JWT وتحكم بالأدوار (RBAC)
- 👥 **إدارة المرضى** — تسجيل، بحث، تصفية، وأرشفة
- 👨‍⚕️ **إدارة الأطباء** — الملفات الشخصية، الجداول، والتخصصات
- 📅 **إدارة المواعيد** — جدولة، تأكيد، إلغاء بحالات متعددة
- 📋 **السجلات الطبية** — تشخيص، أعراض، وصفات طبية، علامات حيوية
- 🧾 **إدارة الفواتير** — إنشاء، متابعة، تصفية حسب الحالة
- 📊 **لوحة تحكم تفاعلية** — إحصاءات ورسوم بيانية فورية
- 📈 **تقارير شاملة** — مواعيد، إيرادات، أداء الأطباء مع تصدير CSV
- 🌙 **الوضع الداكن** — دعم كامل للمظهر الفاتح والداكن
- 🌐 **دعم RTL** — واجهة عربية كاملة

---

## 🛠️ التقنيات المستخدمة

| الطبقة | التقنية |
|--------|---------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes, Server Actions |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js v5 (Credentials) |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Deployment | Vercel + Neon/Supabase |

---

## 🚀 التشغيل المحلي

### المتطلبات
- Node.js 18+
- PostgreSQL 14+
- npm أو yarn

### الخطوات

```bash
# 1. استنساخ المشروع
git clone https://github.com/your-username/clinic-system.git
cd clinic-system

# 2. تثبيت المكتبات
npm install

# 3. إعداد المتغيرات البيئية
cp .env.example .env
# عدّل قاعدة البيانات وباقي القيم في .env

# 4. إعداد قاعدة البيانات
npm run db:generate
npm run db:push

# 5. تشغيل البيانات التجريبية
npm run db:seed

# 6. تشغيل المشروع
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000)

---

## 🔑 حسابات الاختبار

| الدور | البريد الإلكتروني | كلمة المرور |
|-------|-------------------|-------------|
| مدير النظام | admin@clinic.com | Admin@123456 |
| طبيب | dr.ahmed@clinic.com | Admin@123456 |
| ممرضة | nurse@clinic.com | Admin@123456 |
| استقبال | reception@clinic.com | Admin@123456 |
| مريض | patient1@gmail.com | Admin@123456 |

---

## 📁 هيكل المشروع

```
clinic-system/
├── prisma/
│   ├── schema.prisma      # مخطط قاعدة البيانات
│   └── seed.ts            # البيانات التجريبية
├── src/
│   ├── app/
│   │   ├── (auth)/        # صفحات تسجيل الدخول
│   │   ├── (dashboard)/   # صفحات النظام المحمية
│   │   └── api/           # API Routes
│   ├── components/
│   │   ├── layout/        # Sidebar, Header
│   │   ├── dashboard/     # مكونات لوحة التحكم
│   │   ├── patients/      # مكونات المرضى
│   │   ├── doctors/       # مكونات الأطباء
│   │   ├── appointments/  # مكونات المواعيد
│   │   ├── medical-records/ # السجلات الطبية
│   │   ├── invoices/      # الفواتير
│   │   ├── reports/       # التقارير
│   │   ├── users/         # إدارة المستخدمين
│   │   └── settings/      # الإعدادات
│   ├── lib/
│   │   ├── auth/          # إعداد NextAuth
│   │   ├── db/            # Prisma Client
│   │   ├── utils/         # دوال مساعدة
│   │   └── validations/   # Zod Schemas
│   ├── styles/
│   │   └── globals.css    # الأنماط العامة
│   ├── types/             # TypeScript Types
│   └── middleware.ts      # حماية المسارات
└── ...
```

---

## 🌐 النشر على Vercel

### 1. إعداد قاعدة البيانات
استخدم [Neon](https://neon.tech) أو [Supabase](https://supabase.com) للحصول على PostgreSQL مجاناً.

### 2. النشر
```bash
# تسجيل الدخول إلى Vercel
npm i -g vercel
vercel login

# النشر
vercel --prod
```

### 3. المتغيرات البيئية في Vercel
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-32-chars-minimum
NEXTAUTH_URL=https://your-app.vercel.app
```

---

## 👥 أدوار المستخدمين

| الدور | الصلاحيات |
|-------|-----------|
| **ADMIN** | إدارة كاملة للنظام |
| **DOCTOR** | مواعيده، سجلاته الطبية |
| **NURSE** | متابعة المرضى والمواعيد |
| **RECEPTIONIST** | تسجيل المرضى، المواعيد، الفواتير |
| **PATIENT** | ملفه الشخصي، مواعيده، فواتيره |

---

## 📄 الترخيص

MIT License — حر الاستخدام للأغراض التجارية والشخصية.

---

<div align="center">
  صنع بـ ❤️ لتحسين إدارة العيادات الطبية العربية
</div>
