export type MeterDTO = {
  id: string;
  code: string;
  accountNumber: string;
  address: string;
  sector: string;
  condition: string;
  lastReading: number;
  lastReadingDate: string;
  averageMonthlyConsumption: number;
};

export type ReadingCondition = "normal" | "inaccesible" | "dañado";

export type SyncStatus = "pending" | "sending" | "sent";

export type Verification = "verified" | "pending_verification";

export type ReadingDTO = {
  id?: string;
  clientId: string;
  meterCode: string;
  monthYear: string;
  condition: ReadingCondition;
  readingValue: number | null;
  reasonOrDamageDescription: string | null;
  isAnomalous: boolean;
  photoUri: string | null;
  status: "sent";
  createdAt: string;
};

export type ReadingRow = {
  clientId: string;
  meterCode: string;
  monthYear: string;
  condition: ReadingCondition;
  readingValue: number | null;
  reasonOrDamage: string | null;
  previousReading: number | null;
  averageMonthly: number | null;
  consumption: number | null;
  isAnomalous: boolean;
  anomalyConfirmed: boolean;
  photoUri: string | null;
  verification: Verification;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
  sentAt: string | null;
};
