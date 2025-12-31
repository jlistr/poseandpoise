-- Migration: Add is_visible column to photos table
-- Run this in Supabase SQL Editor or via CLI

-- Add is_visible column with default value of true
ALTER TABLE photos 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Optional: Add updated_at if it doesn't exist
ALTER TABLE photos 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create index for efficient filtering
CREATE INDEX IF NOT EXISTS photos_visibility_idx 
ON photos(profile_id, is_visible, sort_order);