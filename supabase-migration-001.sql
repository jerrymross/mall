-- Allow templates without a linked design_system (local/built-in templates)
ALTER TABLE templates ALTER COLUMN design_system_id DROP NOT NULL;

-- Allow anonymous inserts on templates (no auth for now)
CREATE POLICY "anon insert templates" ON templates
  FOR INSERT WITH CHECK (true);

CREATE POLICY "anon read templates" ON templates
  FOR SELECT USING (is_published = true);

CREATE POLICY "anon delete templates" ON templates
  FOR DELETE USING (true);
