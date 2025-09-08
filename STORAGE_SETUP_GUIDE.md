# دليل إعداد Supabase Storage للستوري بورد

## المشكلة الحالية
تطبيق الستوري بورد يواجه خطأ 403 عند محاولة رفع الصور بسبب سياسات Row Level Security (RLS) في Supabase Storage.

## الحل: إعداد سياسات RLS للـ Storage

### الخطوة 1: الوصول إلى لوحة تحكم Supabase
1. اذهب إلى: https://supabase.com/dashboard/project/vjnkhusztogvtvaikumw
2. سجل الدخول إلى حسابك

### الخطوة 2: إعداد سياسات RLS للـ Storage
1. في لوحة التحكم، اضغط على **"SQL Editor"** من القائمة الجانبية
2. انسخ والصق الكود التالي في محرر SQL:

```sql
-- Storage RLS Policies for Storyboard Images
-- These policies allow public access to the storyboard-images bucket

-- Policy for INSERT operations (uploading files)
CREATE POLICY "Allow public upload to storyboard-images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'storyboard-images'
);

-- Policy for SELECT operations (downloading/viewing files)
CREATE POLICY "Allow public read from storyboard-images"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'storyboard-images'
);

-- Policy for DELETE operations (deleting files)
CREATE POLICY "Allow public delete from storyboard-images"
ON storage.objects FOR DELETE
TO public
USING (
  bucket_id = 'storyboard-images'
);

-- Policy for UPDATE operations (updating file metadata)
CREATE POLICY "Allow public update in storyboard-images"
ON storage.objects FOR UPDATE
TO public
USING (
  bucket_id = 'storyboard-images'
)
WITH CHECK (
  bucket_id = 'storyboard-images'
);
```

3. اضغط على **"Run"** لتنفيذ السياسات

### الخطوة 3: التحقق من وجود الـ Bucket
1. اذهب إلى **"Storage"** من القائمة الجانبية
2. تأكد من وجود bucket باسم **"storyboard-images"**
3. إذا لم يكن موجوداً، اضغط على **"New bucket"** وأنشئه بالاسم **"storyboard-images"**
4. اجعل الـ bucket **Public** لتحسين الأداء (اختياري)

### الخطوة 4: اختبار التطبيق
بعد تطبيق السياسات، يجب أن يعمل رفع الصور بدون أخطاء.

## بديل مؤقت (للاختبار فقط)
إذا كنت تريد حلاً سريعاً للاختبار:
1. اذهب إلى **"Table Editor"** > **"storage"** schema > **"objects"** table
2. اضغط على أيقونة التعديل للجدول
3. ألغِ تفعيل **"Enable RLS"**
4. احفظ التغييرات

⚠️ **تحذير**: إلغاء تفعيل RLS يجعل جميع الملفات قابلة للوصول العام. استخدم هذا للاختبار فقط.

## ملاحظات أمنية
- السياسات الحالية تسمح بالوصول العام للـ bucket
- يمكن تقييد الوصول للمستخدمين المسجلين فقط بتغيير `TO public` إلى `TO authenticated`
- للمشاريع الإنتاجية، يُنصح بإعداد سياسات أكثر تقييداً