import type { SQLiteDatabase } from "expo-sqlite";

import {
  applyVerification,
  claimReading,
  countUnsent,
  listPending,
  markSent,
  releaseReading,
} from "@/db/readings";
import { verifyWithMeter } from "@/domain/consumption";
import {
  fetchMeterByCode,
  findReadingByClientId,
  postReading,
  toReadingDTO,
} from "@/services/api";
import { useSyncStore } from "@/store/sync";

let isSyncing = false;
let syncRequestedAgain = false;

export async function refreshPendingCount(
  db: SQLiteDatabase
): Promise<void> {
  const pendingCount = await countUnsent(db);
  useSyncStore.getState().setPendingCount(pendingCount);
}

async function syncBatch(db: SQLiteDatabase): Promise<void> {
  const pendingReadings = await listPending(db);

  for (const reading of pendingReadings) {
    if (!(await claimReading(db, reading.clientId))) {
      continue;
    }

    let readingToSend = reading;

    try {
      if (reading.verification === "pending_verification") {
        let meter;
        try {
          meter = await fetchMeterByCode(reading.meterCode);
        } catch (error) {
          await releaseReading(db, reading.clientId);
          console.warn(
            `No se pudo verificar la lectura ${reading.clientId}.`,
            error
          );
          continue;
        }

        const verification = verifyWithMeter(reading, meter);
        const updated = await applyVerification(
          db,
          reading.clientId,
          verification
        );

        if (!updated) {
          throw new Error(
            `No se pudo aplicar la verificación de ${reading.clientId}.`
          );
        }

        readingToSend = {
          ...reading,
          ...verification,
          verification: "verified",
          syncStatus: "sending",
        };
      }

      const existing = await findReadingByClientId(reading.clientId);

      if (existing) {
        if (!(await markSent(db, reading.clientId))) {
          throw new Error(
            `No se pudo marcar como enviada la lectura ${reading.clientId}.`
          );
        }
        continue;
      }

      await postReading(toReadingDTO(readingToSend));

      if (!(await markSent(db, reading.clientId))) {
        throw new Error(
          `No se pudo marcar como enviada la lectura ${reading.clientId}.`
        );
      }
    } catch (error) {
      await releaseReading(db, reading.clientId);
      console.warn(
        `Se detuvo la sincronización en la lectura ${reading.clientId}; queda pendiente.`,
        error
      );
      break;
    }
  }
}

export async function syncPending(db: SQLiteDatabase): Promise<void> {
  if (isSyncing) {
    syncRequestedAgain = true;
    return;
  }

  isSyncing = true;
  useSyncStore.getState().setIsSyncing(true);
  let failure: unknown;

  try {
    do {
      syncRequestedAgain = false;

      try {
        await syncBatch(db);
      } catch (error) {
        failure = error;
      }

      try {
        await refreshPendingCount(db);
      } catch (error) {
        failure ??= error;
      }

      useSyncStore.getState().incrementVersion();
    } while (syncRequestedAgain && failure === undefined);
  } finally {
    isSyncing = false;
    useSyncStore.getState().setIsSyncing(false);
  }

  if (failure !== undefined) {
    throw failure;
  }
}
