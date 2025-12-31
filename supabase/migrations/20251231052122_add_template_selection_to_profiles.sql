-- Migration: Add template selection to profiles
-- Run this in Supabase SQL Editor

-- Add selected_template column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS selected_template TEXT DEFAULT 'editorial';

-- Optional: Create a templates reference table for future expansion
CREATE TABLE IF NOT EXISTS portfolio_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_available BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed the initial templates
INSERT INTO portfolio_templates (id, name, description, is_available, sort_order) VALUES
  ('editorial', 'Editorial', 'Elegant editorial layout with dynamic image galleries and sophisticated typography', true, 1),
  ('minimal', 'Minimal', 'Clean, focused design that lets your photos take center stage', false, 2),
  ('classic', 'Classic', 'Traditional comp card layout favored by agencies worldwide', false, 3)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_available = EXCLUDED.is_available,
  sort_order = EXCLUDED.sort_order;

-- Add comment for documentation
COMMENT ON COLUMN profiles.selected_template IS 'The portfolio template ID selected by the user (editorial, minimal, classic)';