export const DATABASE_VERSION = 2;

export const migrations = [
  `
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      user_id TEXT PRIMARY KEY NOT NULL,
      daily_goal_minutes INTEGER NOT NULL,
      keep_screen_awake INTEGER NOT NULL DEFAULT 1,
      notifications_enabled INTEGER NOT NULL DEFAULT 1,
      haptics_enabled INTEGER NOT NULL DEFAULT 0,
      require_biometrics INTEGER NOT NULL DEFAULT 0,
      lock_session_on_background INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pomodoro_presets (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      focus_minutes INTEGER NOT NULL,
      short_break_minutes INTEGER NOT NULL,
      long_break_minutes INTEGER NOT NULL,
      rounds INTEGER NOT NULL,
      strict_mode INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS focus_sessions (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      preset_id TEXT,
      preset_name TEXT NOT NULL,
      focus_minutes INTEGER NOT NULL,
      short_break_minutes INTEGER NOT NULL,
      long_break_minutes INTEGER NOT NULL,
      rounds INTEGER NOT NULL,
      strict_mode INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL,
      interruption_reason TEXT,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      interrupted_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_presets_user_id ON pomodoro_presets(user_id);
    CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON focus_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_focus_sessions_status ON focus_sessions(status);
  `,
  `
    ALTER TABLE app_settings
    ADD COLUMN sound_effects_enabled INTEGER NOT NULL DEFAULT 1;
  `,
];
