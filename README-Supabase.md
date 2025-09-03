# دليل إعداد Supabase لمشروع إنتاج الحلقات

## المتطلبات المسبقة

1. حساب Supabase نشط
2. مشروع Supabase تم إنشاؤه
3. Node.js و npm مثبتين

## خطوات الإعداد

### 1. الحصول على مفاتيح API من Supabase

1. اذهب إلى لوحة تحكم Supabase: https://supabase.com/dashboard/project/vjnkhusztogvtvaikumw
2. اضغط على "Settings" من القائمة الجانبية
3. اضغط على "API"
4. ستجد "anon public" key تحت "Project API keys"
5. انسخ هذا المفتاح

### 2. تحديث ملف البيئة

1. افتح ملف `.env.local`
2. استبدل `your_supabase_anon_key_here` بالمفتاح الذي نسخته من Supabase:

```env
VITE_SUPABASE_URL=https://vjnkhusztogvtvaikumw.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

### 3. إنشاء جداول قاعدة البيانات

1. في لوحة تحكم Supabase، اذهب إلى "SQL Editor"
2. انسخ محتوى ملف `supabase-schema.sql`
3. الصق المحتوى في SQL Editor
4. اضغط على "Run" لتنفيذ الاستعلام

### 4. التحقق من التثبيت

1. شغل المشروع:
```bash
npm run dev
```

2. اذهب إلى صفحة الحلقات: http://localhost:5174/episodes
3. يجب أن ترى الحلقات التجريبية التي تم إنشاؤها

## هيكل قاعدة البيانات

### جدول `episodes`
- `id`: معرف فريد للحلقة
- `title`: عنوان الحلقة
- `description`: وصف الحلقة (اختياري)
- `status`: حالة الحلقة (draft, in_progress, completed)
- `created_at`: تاريخ الإنشاء
- `updated_at`: تاريخ آخر تحديث

### جدول `episode_content`
- `id`: معرف فريد للمحتوى
- `episode_id`: معرف الحلقة المرتبطة
- `type`: نوع المحتوى (storyboard, animation, audio, text, editing, drawing)
- `content`: محتوى JSON للبيانات
- `created_at`: تاريخ الإنشاء
- `updated_at`: تاريخ آخر تحديث

## الميزات المتاحة

### إدارة الحلقات
- عرض قائمة بجميع الحلقات
- إضافة حلقات جديدة
- تحديث حالة الحلقات
- حذف الحلقات

### إدارة المحتوى
- حفظ محتوى كل تبويب منفصل
- استرجاع المحتوى حسب الحلقة ونوعه
- تحديث المحتوى الموجود

## الأمان

تم تطبيق Row Level Security (RLS) على جميع الجداول مع السياسات التالية:
- قراءة متاحة لجميع المستخدمين
- الكتابة والتعديل متاحة للمستخدمين المسجلين فقط

يمكن تعديل هذه السياسات حسب متطلبات المشروع الأمنية.

## استكشاف الأخطاء

### خطأ في الاتصال
```
Error: Missing Supabase environment variables
```
**الحل**: تأكد من وجود ملف `.env.local` وأن المفاتيح صحيحة

### خطأ في تحميل البيانات
```
Error loading episodes
```
**الحل**:
1. تأكد من أن جداول قاعدة البيانات تم إنشاؤها
2. تحقق من صحة URL و API key
3. تأكد من أن RLS policies مضبوطة بشكل صحيح

### خطأ في الصلاحيات
```
permission denied for table episodes
```
**الحل**: تأكد من أن سياسات RLS مضبوطة بشكل صحيح في Supabase

## التطوير المستقبلي

- إضافة نظام المستخدمين والصلاحيات
- تطبيق المصادقة والتفويض
- إضافة نظام النسخ الاحتياطي
- تحسين الأداء مع فهارس إضافية
- إضافة نظام التتبع والتحليلات
