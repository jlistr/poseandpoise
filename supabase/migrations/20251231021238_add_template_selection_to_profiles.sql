-- Add template selection to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS selected_template TEXT DEFAULT 'editorial';

-- Create a templates reference table (optional but recommended)
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

-- Seed the templates
INSERT INTO portfolio_templates (id, name, description, is_available, sort_order) VALUES
  ('editorial', 'Editorial', 'Elegant editorial layout with dynamic image galleries and sophisticated typography', true, 1),
  ('minimal', 'Minimal', 'Clean, focused design that lets your photos take center stage', false, 2),
  ('classic', 'Classic', 'Traditional comp card layout favored by agencies worldwide', false, 3)
ON CONFLICT (id) DO NOTHING;