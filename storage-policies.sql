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

-- Alternative: If you want to allow access only to authenticated users,
-- replace 'TO public' with 'TO authenticated' in all policies above

-- Note: These policies assume the bucket 'storyboard-images' exists
-- and is configured properly in your Supabase project