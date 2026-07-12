-- ── Storage bucket for task files ────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-files', 'task-files', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Authenticated users can upload task files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'task-files');

CREATE POLICY "Anyone can view task files"
ON storage.objects FOR SELECT
USING (bucket_id = 'task-files');

CREATE POLICY "Uploader can delete own files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'task-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ── Task attachments table ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS task_attachments (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id      UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  uploaded_by  UUID REFERENCES auth.users(id),
  file_name    TEXT NOT NULL,
  file_size    BIGINT,
  storage_path TEXT NOT NULL,
  mime_type    TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view attachments"
ON task_attachments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add attachments"
ON task_attachments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Uploader can delete own attachments"
ON task_attachments FOR DELETE TO authenticated
USING (auth.uid() = uploaded_by);

-- ── Agent deliverable + mount points on tasks ─────────────────────────────────
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS agent_deliverable TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS mount_points      TEXT;  -- JSON array

-- ── Mount progress tracking ───────────────────────────────────────────────────
ALTER TABLE mounts ADD COLUMN IF NOT EXISTS progress_note TEXT;
ALTER TABLE mounts ADD COLUMN IF NOT EXISTS updated_at    TIMESTAMPTZ DEFAULT NOW();
