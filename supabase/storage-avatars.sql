-- ============================================
-- Storage Bucket for Avatars
-- Run this in Supabase SQL Editor
-- ============================================

-- Create avatars bucket (if not exists, do it manually in Dashboard)
-- Dashboard -> Storage -> New Bucket -> Name: "avatars" -> Public: true

-- Storage policies for avatars bucket
-- Note: These need to be created in Dashboard -> Storage -> Policies

-- Or via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Anyone can view avatars
CREATE POLICY "avatars_select" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'avatars');

-- Policy: Authenticated users can upload their own avatar
CREATE POLICY "avatars_insert" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (
        bucket_id = 'avatars' AND
        (storage.foldername(name))[1] = 'avatars'
    );

-- Policy: Users can update their own avatar
CREATE POLICY "avatars_update" ON storage.objects
    FOR UPDATE TO authenticated USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (regexp_match(name, '^avatars/([^-]+)'))[1]
    );

-- Policy: Users can delete their own avatar
CREATE POLICY "avatars_delete" ON storage.objects
    FOR DELETE TO authenticated USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (regexp_match(name, '^avatars/([^-]+)'))[1]
    );

