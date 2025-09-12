-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view objects in the episode-assets bucket
CREATE POLICY "Allow read access to episode-assets bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'episode-assets' AND auth.role() = 'authenticated');

-- Allow authenticated users to upload to episode-assets bucket
CREATE POLICY "Allow upload to episode-assets bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'episode-assets' 
    AND auth.role() = 'authenticated'
  );

-- Allow users to update their own uploads in episode-assets bucket
CREATE POLICY "Allow update in episode-assets bucket"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'episode-assets' 
    AND auth.role() = 'authenticated'
    AND auth.uid() = owner
  )
  WITH CHECK (
    bucket_id = 'episode-assets' 
    AND auth.role() = 'authenticated'
    AND auth.uid() = owner
  );

-- Allow users to delete their own uploads in episode-assets bucket
CREATE POLICY "Allow delete from episode-assets bucket"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'episode-assets' 
    AND auth.role() = 'authenticated'
    AND (auth.uid() = owner OR auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_app_meta_data->>'role' = 'admin' OR raw_app_meta_data->>'role' = 'super_admin'
    ))
  );

-- Create a function to check if user has access to an episode
CREATE OR REPLACE FUNCTION has_episode_access(episode_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM episode_access
    WHERE user_id = auth.uid() 
    AND episode_id = has_episode_access.episode_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the read policy to check episode access
DROP POLICY IF EXISTS "Allow read access to episode-assets bucket" ON storage.objects;

CREATE POLICY "Allow read access to episode-assets bucket"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'episode-assets' 
    AND (
      -- Allow access to public assets
      storage.filename(name) LIKE 'public/%' OR
      -- Or if user has access to the episode
      (
        auth.role() = 'authenticated' AND 
        has_episode_access(
          (regexp_match(
            storage.filename(name), 
            'episodes\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/'
          ))[1]::uuid
        )
      )
    )
  );
