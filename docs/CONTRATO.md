# CONTRATO.md — Fuente única de nombres y reglas

Toda IA debe leer este archivo y el ADR de la skill antes de escribir código. Si necesita un nombre, tipo o tabla que no está aquí, lo agrega aquí primero.

App móvil de lecturas de medidores de agua (EPMAPS Quito). Expo SDK 57 + TypeScript + Expo Router.

## 1. Reglas globales
1. Solo las dependencias de la sección 2. Instalar con `npx expo install` (las que no son de Expo, con `npm install`).
2. Cada skill toca solo los archivos que declara.
3. UI mínima con StyleSheet hasta la skill 09. Todo color y espaciado sale de `src/theme/tokens.ts`.
4. Identificadores en inglés; textos visibles y comentarios en español.
5. Al terminar: `npx tsc --noEmit` sin errores, "Explicación para la defensa" (máx. 10 líneas) y mensaje de commit sugerido. La IA no hace commit.
6. Nada de Base64 ni de fotos en carpeta temporal.

## 2. Dependencias permitidas
| Paquete | Req. | ADR |
|---|---|---|
| expo-router | R1, R8, R9 | 001 |
| expo-sqlite | R4, R7, R10 | 002 |
| @tanstack/react-query | R3 | 003 |
| zustand | R1, R8 | 004 |
| react-hook-form | R5, R6 | 005 |
| zod, @hookform/resolvers | R2, R5 | 006 |
| expo-image-picker, expo-file-system | R7 | 007 |
| expo-network | R9 | 008 |

Prohibido: Redux, Formik, WatermelonDB, expo-camera, NetInfo, Axios, librerías de UI, uuid.
Por verificar en la documentación del SDK 57: persistir Zustand con `expo-sqlite/kv-store` (si no sirve, AsyncStorage con un ADR) y los nombres de la API nueva de `expo-file-system` (File, Directory, Paths).

## 3. Estructura
- `src/app`: solo pantallas y layouts. `src/db`: único lugar con SQL. `src/services`: único acceso a MockAPI (api.ts) y envío (sync.ts); `queryClient.ts` configura TanStack Query en memoria. `src/store`: único lugar con Zustand. `src/schemas`: Zod. `src/hooks`: `useMeter.ts` consulta medidores con TanStack Query. `src/components`, `src/theme/tokens.ts`, `src/types`, `src/constants` (config.ts, tecnicos.ts).
- R2: `src/schemas/meter.ts` exporta `meterCodeSchema`, que valida el formato `/^MED-\d{6}$/` sin transformar el código.
- Rutas: `/login`, `/` (lista), `/buscar`, `/lectura/paso-1` (estado), `/lectura/paso-2` (lectura o motivo), `/lectura/paso-3` (foto y confirmación).
- El banner de conexión y pendientes vive en `src/app/_layout.tsx` (R9).

## 4. API (MockAPI)
Base: variable `EXPO_PUBLIC_API_URL` en `.env` (se commitea porque la URL no es secreta; hay un `.env.example`). `src/constants/config.ts` solo la exporta y lanza un error claro si falta.

```ts
export type MeterDTO = {
  id: string; code: string; accountNumber: string; address: string; sector: string;
  condition: string; // estado que reporta la OFICINA
  lastReading: number; lastReadingDate: string; averageMonthlyConsumption: number;
};
export type ReadingCondition = "normal" | "inaccesible" | "dañado"; // lo marca el TÉCNICO
export type SyncStatus = "pending" | "sending" | "sent";
export type Verification = "verified" | "pending_verification";
export type ReadingDTO = {
  id?: string; clientId: string; meterCode: string; monthYear: string; // "MM-YYYY"
  condition: ReadingCondition; readingValue: number | null;
  reasonOrDamageDescription: string | null; isAnomalous: boolean;
  photoUri: string | null; status: "sent"; createdAt: string;
};
```
- Consulta: `GET /meters?code=MED-000001`. El filtro puede ser parcial: comprobar `item.code === code` exacto.
- `src/services/api.ts` exporta `fetchMeterByCode(code)` y los errores `MeterNotFoundError` y `MeterNetworkError`.
- Si MockAPI no incluye `id` en el medidor, `api.ts` normaliza el DTO usando el `code` exacto como `id`.
- `condition` significa cosas distintas en `meters` y `readings`; no confundirlas.

## 5. SQLite local (`db/init.ts`, tabla `readings`: pendientes y enviadas)
```sql
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
```
Zustand: `session.ts` { employeeCode, hasHydrated, login, logout } persistido; `draft.ts` { step, meterCode, meter, values, anomalyConfirmed, photoUri } persistido, con `hasHydrated`.

## 6. Reglas de negocio
- R1: usuarios quemados en `constants/tecnicos.ts`; la sesión persiste hasta cerrar sesión.
- R2: código válido `/^MED-\d{6}$/`; si no cumple, error y NO se llama a la API.
- R3: mostrar 7 datos (dirección, sector, cuenta, estado, última lectura, fecha, consumo promedio). Caché de TanStack Query, `staleTime` 12 h, solo en memoria.
- R4: sin conexión se puede registrar; si no hay lectura anterior con la que comparar, `verification = "pending_verification"` y se verifica al reconectar.
- R5: normal exige lectura; inaccesible exige motivo y sin lectura; dañado exige descripción y lectura opcional.
- R6: `consumption = readingValue - lastReading`; anómalo si `consumption > 3 * averageMonthlyConsumption` (estrictamente mayor). Si es anómalo: advertencia, confirmación del técnico y foto obligatoria.
- R7: foto obligatoria si anómalo o dañado; opcional en los demás casos. Se copia a carpeta permanente (`evidencia-<clientId>.jpg`). Con permiso denegado: explicar y permitir continuar solo si la foto no es obligatoria.
- R8: el borrador se persiste; al abrir, ofrecer continuar o descartar. Navegar solo tras hidratar y reconstruir la pila (inicio → paso 1 → … → paso N) para que atrás funcione.
- R9: envío automático al reconectar (listener de `expo-network`), al abrir la app y al volver a primer plano; un solo envío a la vez. Banner de conexión y pendientes en todas las pantallas.
- R10: corregible mientras `sync_status !== "sent"`; enviada ya no. Un solo registro