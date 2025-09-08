-- تطبيق سياسات Storage للمستخدمين المصادقين
-- يجب تشغيل هذا الملف في SQL Editor في Supabase Dashboard
-- أو استخدام Storage > Policies في Dashboard

-- حذف السياسات القديمة إن وجدت (اختياري)
-- DROP POLICY IF EXISTS "Allow public upload to storyboard-images" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow public read from storyboard-images" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow public delete from storyboard-images" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow public update in storyboard-images" ON storage.objects;

-- إنشاء سياسات Storage للمستخدمين المصادقين
-- استخدم هذه الأوامر في Storage > Policies > New Policy > Create from scratch

-- 1. سياسة رفع الملفات (INSERT)
-- Policy Name: Allow authenticated upload to storyboard-images
-- Operation: INSERT
-- Target roles: authenticated
insert into storage.objects (bucket_id, name, owner, metadata) 
select 'storyboard-images', 'test', auth.uid(), '{}'
where bucket_id = 'storyboard-images';

-- أو استخدم هذا الكود في Storage Policies:
/*
CREATE POLICY "Allow authenticated upload to storyboard-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'storyboard-images'
);
*/

-- 2. سياسة قراءة الملفات (SELECT)
/*
CREATE POLICY "Allow authenticated read from storyboard-images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'storyboard-images'
);
*/

-- 3. سياسة حذف الملفات (DELETE)
/*
CREATE POLICY "Allow authenticated delete from storyboard-images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'storyboard-images'
);
*/

-- 4. سياسة تحديث الملفات (UPDATE)
/*
CREATE POLICY "Allow authenticated update in storyboard-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'storyboard-images'
)
WITH CHECK (
  bucket_id = 'storyboard-images'
);
*/

-- التحقق من السياسات المطبقة
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- ملاحظة: إذا لم تعمل الأوامر أعلاه، استخدم Storage > Policies في Dashboard
-- وأنشئ السياسات يدوياً باستخدام الواجهة الرسومية