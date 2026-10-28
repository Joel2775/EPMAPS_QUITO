import type { SQLiteBindValue, SQLiteDatabase } from "expo-sqlite";

import type {
  ReadingCondition,
  ReadingRow,
  SyncStatus,
  Verification,
} from "@/types";

type DatabaseReadingRow = {
  client_id: string;
  meter_code: string;
  month_year: string;
  condition: ReadingCondition;
  reading_value: number | null;
  reason_or_damage: string | null;
  previous_reading: number | null;
  average_monthly: number | null;
  consumption: number | null;
  is_anomalous: number;
  anomaly_confirmed: number;
  photo_uri: string | null;
  verification: Verification;
  sync_status: SyncStatus;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
};

export type NewReadingRow = Omit<ReadingRow, "syncStatus">;

const INSERT_READING_SQL = `
  INSERT INTO readings (
    client_id, meter_code, month_year, condition, reading_value,
    reason_or_damage, previous_reading, average_monthly, consumption,
    is_anomalous, anomaly_confirmed, photo_uri, verification, sync_status,
    created_at, updated_at, sent_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
`;

const READING_COLUMNS = `
  client_id, meter_code, month_year, condition, reading_value,
  reason_or_damage, previous_reading, average_monthly, consumption,
  is_anomalous, anomaly_confirmed, photo_uri, verification, sync_status,
  created_at, updated_at, sent_at
`;

function mapReadingRow(row: DatabaseReadingRow): ReadingRow {
  return {
    clientId: row.client_id,
    meterCode: row.meter_code,
    monthYear: row.month_year,
    condition: row.condition,
    readingValue: row.reading_value,
    reasonOrDamage: row.reason_or_damage,
    previousReading: row.previous_reading,
    averageMonthly: row.average_monthly,
    consumption: row.consumption,
    isAnomalous: row.is_anomalous === 1,
    anomalyConfirmed: row.anomaly_confirmed === 1,
    photoUri: row.photo_uri,
    verification: row.verification,
    syncStatus: row.sync_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sentAt: row.sent_at,
  };
}

function toDatabaseValues(row: NewReadingRow): SQLiteBindValue[] {
  return [
    row.clientId,
    row.meterCode,
    row.monthYear,
    row.condition,
    row.readingValue,
    row.reasonOrDamage,
    row.previousReading,
    row.averageMonthly,
    row.consumption,
    row.isAnomalous ? 1 : 0,
    row.anomalyConfirmed ? 1 : 0,
    row.photoUri,
    row.verification,
    row.createdAt,
    row.updatedAt,
    row.sentAt,
  ];
}

export async function insertReading(
  db: SQLiteDatabase,
  row: NewReadingRow
): Promise<void> {
  await db.runAsync(INSERT_READING_SQL, ...toDatabaseValues(row));
}

export async function getReadingByMeterMonth(
  db: SQLiteDatabase,
  meterCode: string,
  monthYear: string
): Promise<ReadingRow | null> {
  const row = await db.getFirstAsync<DatabaseReadingRow>(
    `SELECT ${READING_COLUMNS} FROM readings WHERE meter_code = ? AND month_year = ?`,
    meterCode,
    monthYear
  );
  return row ? mapReadingRow(row) : null;
}

export async function getReadingByClientId(
  db: SQLiteDatabase,
  clientId: string
): Promise<ReadingRow | null> {
  const row = await db.getFirstAsync<DatabaseReadingRow>(
    `SELECT ${READING_COLUMNS} FROM readings WHERE client_id = ?`,
    clientId
  );
  return row ? mapReadingRow(row) : null;
}

export async function updateReading(
  db: SQLiteDatabase,
  row: ReadingRow
): Promise<number> {
  const result = await db.runAsync(
    `
      UPDATE readings
      SET
        meter_code = ?, month_year = ?, condition = ?, reading_value = ?,
        reason_or_damage = ?, previous_reading = ?, average_monthly = ?,
        consumption = ?, is_anomalous = ?, anomaly_confirmed = ?,
        photo_uri = ?, verification = ?, sync_status = ?, updated_at = ?, sent_at = ?
      WHERE client_id = ? AND sync_status = 'pending'
    `,
    row.meterCode,
    row.monthYear,
    row.condition,
    row.readingValue,
    row.reasonOrDamage,
    row.previousReading,
    row.averageMonthly,
    row.consumption,
    row.isAnomalous ? 1 : 0,
    row.anomalyConfirmed ? 1 : 0,
    row.photoUri,
    row.verification,
    row.syncStatus,
    row.updatedAt,
    row.sentAt,
    row.clientId
  );

  return Number(result.changes ?? 0);
}

export async function listReadings(
  db: SQLiteDatabase
): Promise<ReadingRow[]> {
  const rows = await db.getAllAsync<DatabaseReadingRow>(
    `SELECT ${READING_COLUMNS} FROM readings ORDER BY created_at DESC, rowid DESC`
  );
  return rows.map(mapReadingRow);
}

export async function listPending(
  db: SQLiteDatabase
): Promise<ReadingRow[]> {
  const rows = await db.getAllAsync<DatabaseReadingRow>(
    `SELECT ${READING_COLUMNS} FROM readings WHERE sync_status = 'pending' ORDER BY created_at ASC, rowid ASC`
  );
  return rows.map(mapReadingRow);
}

export async function claimReading(
  db: SQLiteDatabase,
  clientId: string
): Promise<boolean> {
  const result = await db.runAsync(
    "UPDATE readings SET sync_status = 'sending' WHERE client_id = ? AND sync_status = 'pending'",
    clientId
  );
  return result.changes === 1;
}

export async function markSent(
  db: SQLiteDatabase,
  clientId: string
): Promise<boolean> {
  const now = new Date().toISOString();
  const result = await db.runAsync(
    "UPDATE readings SET sync_status = 'sent', sent_at = ?, updated_at = ? WHERE client_id = ? AND sync_status = 'sending'",
    now,
    now,
    clientId
  );
  return result.changes === 1;
}

export async function releaseReading(
  db: SQLiteDatabase,
  clientId: string
): Promise<void> {
  await db.runAsync(
    "UPDATE readings SET sync_status = 'pending' WHERE client_id = ? AND sync_status = 'sending'",
    clientId
  );
}

export async function resetSendingToPending(
  db: SQLiteDatabase
): Promise<void> {
  await db.runAsync(
    "UPDATE readings SET sync_status = 'pending' WHERE sync_status = 'sending'"
  );
}

export async function applyVerification(
  db: SQLiteDatabase,
  clientId: string,
  verification: {
    previousReading: number;
    averageMonthly: number;
    consumption: number | null;
    isAnomalous: boolean;
  }
): Promise<boolean> {
  const result = await db.runAsync(
    `
      UPDATE readings
      SET previous_reading = ?, average_monthly = ?, consumption = ?,
          is_anomalous = ?, verification = 'verified'
      WHERE client_id = ? AND sync_status = 'sending'
    `,
    verification.previousReading,
    verification.averageMonthly,
    verification.consumption,
    verification.isAnomalous ? 1 : 0,
    clientId
  );
  return result.changes === 1;
}

export async function countUnsent(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) AS count FROM readings WHERE sync_status != 'sent'"
  );
  if (!row) {
    throw new Error("No se pudo contar las lecturas pendientes.");
  }
  return row.count;
}
