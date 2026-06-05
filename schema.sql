-- W Firm Biology lab — cohort memory store (Cloudflare D1)
CREATE TABLE IF NOT EXISTS lab_memory (
  id         TEXT PRIMARY KEY,
  data       TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
