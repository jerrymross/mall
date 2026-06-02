-- =============================================================
-- Supabase Schema – Marknadsföringsverktyg
-- =============================================================

-- DESIGN SYSTEMS (versioned, admin-managed)
CREATE TABLE design_systems (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  version         TEXT NOT NULL,
  tokens          JSONB NOT NULL,
  logo_asset_url  TEXT,
  is_active       BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Only one active design system at a time
CREATE UNIQUE INDEX design_systems_one_active ON design_systems (is_active)
  WHERE is_active = true;

-- GRADIENT PRESETS
CREATE TABLE gradients (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  definition        JSONB NOT NULL,
  is_preset         BOOLEAN DEFAULT false,
  design_system_id  UUID REFERENCES design_systems(id),
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- TEMPLATES (admin-created, locked layouts)
CREATE TABLE templates (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  description       TEXT,
  category          TEXT NOT NULL,
  thumbnail_url     TEXT,
  design_system_id  UUID NOT NULL REFERENCES design_systems(id),
  pages             JSONB NOT NULL,
  is_published      BOOLEAN DEFAULT false,
  created_by        UUID REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- PROFILES (extends auth.users)
CREATE TABLE profiles (
  id    UUID PRIMARY KEY REFERENCES auth.users(id),
  role  TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  name  TEXT
);

-- PRODUCT SHEETS (user documents)
CREATE TABLE product_sheets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL DEFAULT 'Untitled',
  template_id       UUID NOT NULL REFERENCES templates(id),
  design_system_id  UUID NOT NULL REFERENCES design_systems(id),
  content_map       JSONB NOT NULL DEFAULT '{}',
  ai_context        JSONB NOT NULL DEFAULT '{}',
  status            TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','ready','exported')),
  exported_pdf_url  TEXT,
  owner_id          UUID NOT NULL REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ROW LEVEL SECURITY
ALTER TABLE product_sheets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner access" ON product_sheets
  USING (owner_id = auth.uid());

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read published templates" ON templates
  FOR SELECT USING (is_published = true);
CREATE POLICY "admin full access" ON templates
  USING (auth.jwt() ->> 'role' = 'admin');

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Storage buckets (run in Supabase Dashboard > Storage)
-- supabase.storage.createBucket('assets', { public: false })
-- supabase.storage.createBucket('exports', { public: false })
-- supabase.storage.createBucket('template-thumbs', { public: true })
