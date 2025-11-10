-- Create storage bucket for dish images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dish-images',
  'dish-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Storage policies for dish images
CREATE POLICY "Anyone can view dish images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'dish-images');

CREATE POLICY "Admins can upload dish images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'dish-images' AND
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can update dish images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'dish-images' AND
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can delete dish images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'dish-images' AND
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);