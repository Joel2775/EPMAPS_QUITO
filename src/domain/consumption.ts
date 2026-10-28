import type { ReadingCondition } from "@/types";

const READING_PATTERN = /^(?:\d+(?:[.,]\d+)?|[.,]\d+)$/;

export function parseReading(readingText: string): number | null {
  const normalized = readingText.trim();

  if (!READING_PATTERN.test(normalized)) {
    return null;
  }

  const reading = Number(normalized.replace(",", "."));
  return Number.isFinite(reading) && reading >= 0 ? reading : null;
}

export function calculateConsumption(
  reading: number,
  lastReading: number | null
): number | null {
  return lastReading === null ? null : reading - lastReading;
}

export function isAnomalous(
  consumption: number | null,
  average: number | null
): boolean {
  return (
    consumption !== null &&
    average !== null &&
    consumption > 3 * average
  );
}

export function isPhotoRequired(
  condition: ReadingCondition,
  anomalous: boolean
): boolean {
  return anomalous || condition === "dañado";
}
