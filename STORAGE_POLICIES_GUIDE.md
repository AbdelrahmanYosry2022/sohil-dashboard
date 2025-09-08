# دليل إنشاء سياسات Storage في Supabase

## المشكلة
عند محاولة رفع الصور، تظهر رسالة خطأ لأن Supabase Storage يتطلب سياسات RLS للسماح برفع الملفات.

## الحل: إنشاء السياسات يدوياً في Dashboard

### الخطوة 1: الوصول إلى Storage Policies
1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. من الشريط الجانبي، اضغط على **Storage**
4. اضغط على **Policies** في الأعلى

### الخطوة 2: إنشاء سياسة رفع الملفات (INSERT)
1. اضغط **New Policy**
2. اختر **Create from scratch**
3. املأ البيانات التالية:
   - **Policy Name**: `Allow authenticated upload to storyboard-images`
   - **Allowed operation**: `INSERT`
   - **Target roles**: `authenticated`
   - **USING expression**: اتركه فارغ
   - **WITH CHECK expression**:
   ```sql
   bucket_id = 'storyboard-images'
   ```
4. اضغط **Save policy**

### الخطوة 3: إنشاء سياسة قراءة الملفات (SELECT)
1. اضغط **New Policy** مرة أخرى
2. اختر **Create from scratch**
3. املأ البيانات:
   - **Policy Name**: `Allow authenticated read from storyboard-images`
   - **Allowed operation**: `SELECT`
   - **Target roles**: `authenticated`
   - **USING expression**:
   ```sql
   bucket_id = 'storyboard-images'
   ```
   - **WITH CHECK expression**: اتركه فارغ
4. اضغط **Save policy**

### الخطوة 4: إنشاء سياسة حذف الملفات (DELETE)
1. اضغط **New Policy**
2. اختر **Create from scratch**
3. املأ البيانات:
   - **Policy Name**: `Allow authenticated delete from storyboard-images`
   - **Allowed operation**: `DELETE`
   - **Target roles**: `authenticated`
   - **USING expression**:
   ```sql
   bucket_id = 'storyboard-images'
   ```
4. اضغط **Save policy**

### الخطوة 5: التأكد من وجود Bucket
1. في Storage، اضغط على **Buckets**
2. تأكد من وجود bucket باسم `storyboard-images`
3. إذا لم يكن موجوداً:
   - اضغط **Create bucket**
   - اسم الـ bucket: `storyboard-images`
   - اختر **Public bucket** (للسماح بالوصول للصور)
   - اضغط **Create bucket**

### الخطوة 6: اختبار رفع الصور
بعد إنشاء السياسات، ارجع إلى التطبيق على http://localhost:5173/ وجرب رفع صورة.

## ملاحظات مهمة
- تأكد من تسجيل الدخول في التطبيق قبل محاولة رفع الصور
- السياسات تسمح فقط للمستخدمين المصادقين برفع/قراءة/حذف الملفات
- إذا واجهت مشاكل، تأكد من أن اسم الـ bucket صحيح (`storyboard-images`)

## استكشاف الأخطاء
إذا لم تعمل السياسات:
1. تأكد من أن جميع السياسات الأربع تم إنشاؤها
2. تأكد من أن Target roles هو `authenticated`
3. تأكد من أن bucket_id صحيح في جميع السياسات
4. جرب إعادة تحميل الصفحة وتسجيل الدخول مرة أخرى