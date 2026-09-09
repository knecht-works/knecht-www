-- Votes from the "Was this page helpful?" widget on the docs pages.
-- Apply once: wrangler d1 execute knecht-www --remote --file server/db/docs-feedback.sql
CREATE TABLE IF NOT EXISTS docs_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('up', 'down')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS docs_feedback_path ON docs_feedback (path);
