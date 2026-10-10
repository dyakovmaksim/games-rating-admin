CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, expires_at INTEGER NOT NULL, last_write INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 2 AND 120),
  normalized_title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL CHECK (length(trim(description)) BETWEEN 10 AND 2000),
  image_url TEXT NOT NULL, game_url TEXT NOT NULL,
  genre TEXT NOT NULL, platform TEXT NOT NULL, release_date TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft','published')),
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS games_unique_title ON games(session_id, lower(trim(title)));
CREATE INDEX IF NOT EXISTS games_session_created ON games(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS games_session_filters ON games(session_id, genre, platform, status);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
