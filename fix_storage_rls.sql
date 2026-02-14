
-- Enable RLS on storage.objects if not already
-- (Storage schema usually has it enabled)

-- Policy to allow authenticated users to upload files to 'avatars' bucket
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'avatars' );

-- Policy to allow public to view avatars
CREATE POLICY "Allow public viewing"
ON storage.objects
FOR SELECT
TO public
USING ( bucket_id = 'avatars' );

-- Policy to allow users to update their own avatars
CREATE POLICY "Allow users to update their own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING ( bucket_id = 'avatars' AND owner = auth.uid() )
WITH CHECK ( bucket_id = 'avatars' AND owner = auth.uid() );
