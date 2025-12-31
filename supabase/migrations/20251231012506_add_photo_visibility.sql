-- Migration: Add is_visible column to photos table
-- Description: Allows models to toggle visibility of photos in their public gallery
-- Date: December 2025

-- Add is_visible column with default value of true
ALTER TABLE photos 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN photos.is_visible IS 'Controls whether the photo appears in the public portfolio gallery';

-- Create index for efficient filtering of visible photos
CREATE INDEX IF NOT EXISTS photos_visibility_idx ON photos(profile_id, is_visible, sort_order);

-- Update RLS policy to only show visible photos on public profiles
DROP POLICY IF EXISTS "Photos viewable on public profiles" ON photos;

CREATE POLICY "Photos viewable on public profiles"
  ON photos FOR SELECT
  USING (
    -- Only show visible photos on public profiles
    is_visible = true
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = photos.profile_id
      AND profiles.is_public = true
    )
  );

-- Users can still view ALL their own photos (including hidden ones)
-- This policy should already exist, but let's ensure it's correct
DROP POLICY IF EXISTS "Users can view own photos" ON photos;

CREATE POLICY "Users can view own photos"
  ON photos FOR SELECT
  USING (auth.uid() = profile_id);

-- Function to reorder photos and update sort_order
-- Call this when saving drag-and-drop changes
CREATE OR REPLACE FUNCTION reorder_photos(
  p_profile_id UUID,
  p_photo_ids UUID[]
)
RETURNS VOID AS $$
DECLARE
  i INTEGER := 0;
  photo_id UUID;
BEGIN
  -- Verify all photos belong to the user
  IF EXISTS (
    SELECT 1 FROM unnest(p_photo_ids) AS pid
    WHERE NOT EXISTS (
      SELECT 1 FROM photos 
      WHERE id = pid AND profile_id = p_profile_id
    )
  ) THEN
    RAISE EXCEPTION 'One or more photos do not belong to this profile';
  END IF;

  -- Update sort_order based on array position
  FOREACH photo_id IN ARRAY p_photo_ids
  LOOP
    UPDATE photos 
    SET sort_order = i, updated_at = NOW()
    WHERE id = photo_id AND profile_id = p_profile_id;
    i := i + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION reorder_photos(UUID, UUID[]) TO authenticated;

-- Function to bulk update photo visibility and order
CREATE OR REPLACE FUNCTION update_photos_batch(
  p_updates JSONB
)
RETURNS VOID AS $$
DECLARE
  photo_update JSONB;
  p_profile_id UUID;
BEGIN
  -- Get the current user's profile id
  p_profile_id := auth.uid();
  
  -- Loop through each update
  FOR photo_update IN SELECT * FROM jsonb_array_elements(p_updates)
  LOOP
    UPDATE photos
    SET 
      sort_order = COALESCE((photo_update->>'sort_order')::INTEGER, sort_order),
      is_visible = COALESCE((photo_update->>'is_visible')::BOOLEAN, is_visible),
      updated_at = NOW()
    WHERE 
      id = (photo_update->>'id')::UUID 
      AND profile_id = p_profile_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_photos_batch(JSONB) TO authenticated;