-- Check if material_categories table exists, if not create it
CREATE TABLE IF NOT EXISTS material_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check if the materials table exists, if not create it
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category_id UUID REFERENCES material_categories(id),
  video_embed TEXT,
  example_problems JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on the slug field for faster lookups
CREATE INDEX IF NOT EXISTS materials_slug_idx ON materials(slug);
CREATE INDEX IF NOT EXISTS materials_category_id_idx ON materials(category_id);

-- Insert some default categories if they don't exist
INSERT INTO material_categories (name, slug, description) 
VALUES 
  ('Aljabar', 'aljabar', 'Materi aljabar dasar hingga lanjutan'),
  ('Geometri', 'geometri', 'Materi geometri dan pengukuran'),
  ('Kalkulus', 'kalkulus', 'Materi kalkulus dasar dan lanjutan'),
  ('Trigonometri', 'trigonometri', 'Materi trigonometri')
ON CONFLICT (slug) DO NOTHING;

-- Set up RLS (Row Level Security) policies
-- Allow all users to read materials
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_categories ENABLE ROW LEVEL SECURITY;

-- Materials policies
DROP POLICY IF EXISTS "Materials are viewable by everyone" ON materials;
CREATE POLICY "Materials are viewable by everyone" 
  ON materials FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Materials can be inserted by admins" ON materials;
CREATE POLICY "Materials can be inserted by admins" 
  ON materials FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Materials can be updated by admins" ON materials;
CREATE POLICY "Materials can be updated by admins" 
  ON materials FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Materials can be deleted by admins" ON materials;
CREATE POLICY "Materials can be deleted by admins" 
  ON materials FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Categories policies
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON material_categories;
CREATE POLICY "Categories are viewable by everyone" 
  ON material_categories FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Categories can be inserted by admins" ON material_categories;
CREATE POLICY "Categories can be inserted by admins" 
  ON material_categories FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Categories can be updated by admins" ON material_categories;
CREATE POLICY "Categories can be updated by admins" 
  ON material_categories FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Categories can be deleted by admins" ON material_categories;
CREATE POLICY "Categories can be deleted by admins" 
  ON material_categories FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.id = auth.uid()
      AND user_roles.role = 'admin'
    )
  ); 