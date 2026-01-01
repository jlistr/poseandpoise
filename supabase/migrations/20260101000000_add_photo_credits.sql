-- Migration: Add photographer and studio credit columns to photos table
-- Description: Allows models to credit photographers and studios for their portfolio photos
-- Date: January 2026

-- Add photographer credit column
ALTER TABLE photos 
ADD COLUMN IF NOT EXISTS photographer TEXT;

-- Add studio/location credit column
ALTER TABLE photos 
ADD COLUMN IF NOT EXISTS studio TEXT;

-- Add comments for documentation
COMMENT ON COLUMN photos.photographer IS 'Name of the photographer who took this photo';
COMMENT ON COLUMN photos.studio IS 'Studio or location where the photo was taken';

