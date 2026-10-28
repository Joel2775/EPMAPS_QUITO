import type { SQLiteDatabase } from "expo-sqlite";

const INIT_SQL = `
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS readings (
  client_id TEXT PRIMARY KEY,
  meter_code TEXT NOT NULL,
  month_year TEXT NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('normal','inaccesible','dañado')),
  reading_value REAL, reason_or_damage TEXT, previous_reading REAL,
  average_monthly REAL, consumption REAL,
  is_anomalous INTEGER NOT NULL DEFAULT 0,
  anomaly_confirmed INTEGER NOT NULL DEFAULT 0,
  photo_uri TEXT,
  verification TEXT NOT NULL DEFAULT 'verified' CHECK (verification IN ('verified','pending_verification')),
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending','sending','sent')),
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, sent_at TEXT,
  UNIQUE (meter_code, month_year)
);
CREATE INDEX IF NOT EXISTS idx_readings_sync ON readings (sync_status);
`;

export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(INIT_SQL);
}
