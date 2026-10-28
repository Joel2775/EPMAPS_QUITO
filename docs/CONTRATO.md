# CONTRATO.md — Fuente única de nombres y reglas

Toda IA debe leer este archivo y el ADR de la skill antes de escribir código. Si necesita un nombre, tipo o tabla que no está aquí, lo agrega aquí primero.

App móvil de lecturas de medidores de agua (EPMAPS Quito). Expo SDK 57 + TypeScript + Expo Router.

## 1. Reglas globales
1. Solo las dependencias de la sección 2. Instalar con `npx expo install` (las que no son de Expo, con `npm install`).
2. Cada skill toca solo los archivos que declara.
3. La UI se implementa con `StyleSheet`. Todo color, tamaño y espaciado sale de `src/theme/tokens.ts`; la skill 09 aplica el sistema visual claymorphism.
4. Identificadores en inglés; textos visibles y comentarios en español.
5. Al terminar: `npx tsc --noEmit` sin errores, "Explicación para la defensa" (máx. 10 líneas) y mensaje de commit sugerido. La IA no hace commit.
6. Nada de Base64 ni de fotos en carpeta temporal.
7. La paleta de interfaz y sus tonos neutros/funcionales se limitan a los colores definidos en `src/theme/tokens.ts`; no se escriben valores de color directamente en pantallas o componentes.
8. Las pantallas desplazables ajustan el contenido y las acciones al teclado; Android usa `softwareKeyboardLayoutMode: "resize"` y se respetan las áreas seguras del sistema.

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
- `src/app`: solo pantallas y layouts. `src/db`: único lugar con SQL; `readings.ts` contiene las consultas parametrizadas para registrar, buscar y listar lecturas. `src/services`: único acceso a MockAPI (api.ts), envío (sync.ts) y descarte de borradores (drafts.ts); `queryClient.ts` configura TanStack Query en memoria. `src/store`: único lugar con Zustand. `src/schemas`: Zod. `src/domain`: funciones puras de reglas de negocio, incluyendo `date.ts` (`currentMonthYear` con hora local). `src/hooks`: `useMeter.ts` consulta medidores con TanStack Query y `useNetworkStatus.ts` expone el estado de conexión y su consulta puntual. `src/components/ui/`: componentes reutilizables de presentación. `src/components/ResumeDraftPrompt.tsx` ofrece reanudar o descartar un borrador hidratado; `src/theme/tokens.ts`, `src/types`, `src/constants` (config.ts, tecnicos.ts).
- R2: `src/schemas/meter.ts` exporta `meterCodeSchema`, que valida el formato `/^MED-\d{6}$/` sin transformar el código.
- Rutas: `/login`, grupo `src/app/(tecnico)/(tabs)/` con `/` (búsqueda de medidor, pestaña Buscar) y `/explore` (lista de lecturas, pestaña Lecturas), y `/lectura/paso-1` (estado), `/lectura/paso-2` (lectura o motivo), `/lectura/paso-3` (foto y confirmación) como rutas internas fuera de las pestañas.
- `src/components/ConnectionBanner.tsx` muestra conexión, pendientes y estado de envío en todas las pantallas (R9); `src/components/SyncManager.tsx` coordina los reintentos.
- `src/store/sync.ts` mantiene en memoria `pendingCount`, `isSyncing` y `version`. `src/services/sync.ts` sincroniza lecturas sin duplicarlas y verifica las registradas sin conexión.

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
- `src/services/api.ts` también exporta `findReadingByClientId(clientId)` para localizar una lectura por coincidencia exacta y `postReading(dto)` para crearla. Ambas operaciones rechazan errores de red y respuestas HTTP no exitosas. El DTO enviado se construye desde `ReadingRow` como `ReadingDTO`, con `status: "sent"`.
- El proyecto MockAPI debe publicar el recurso `readings` para `GET /readings?clientId=<id>` y `POST /readings`. Si la búsqueda filtrada responde 404, `api.ts` consulta `GET /readings` y compara `clientId` exactamente; un error en ambas consultas sí detiene el envío para evitar duplicados.
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
Zustand: `session.ts` { employeeCode, hasHydrated, login, logout } persistido; `draft.ts` { step, meterCode, meter, condition, readingText, reasonOrDamage, anomalyConfirmed, clientId, editingClientId, photoUri, hasHydrated, startDraft, startEditDraft, setStep, setCondition, setReadingData, setPhotoUri, clearDraft, selectHasDraft }. `selectHasDraft(state)` indica si `meterCode !== null`. `draft.meter` puede ser `null` si el medidor no estaba en caché; `startDraft(meterCode, meter)` conserva el código aun cuando no hay datos previos. `startEditDraft(row)` carga la lectura pendiente a corregir y deja `editingClientId` para distinguir el modo edición. `src/types/index.ts` define `ReadingRow` con propiedades camelCase, y `src/db/readings.ts` mapea esas propiedades a las columnas SQLite snake_case. Se persisten los datos del borrador, excepto `hasHydrated` y las acciones. `clientId` se genera una sola vez en `startDraft` con `Date.now()` y un sufijo aleatorio corto, y `setPhotoUri` actualiza `photoUri` borrando la anterior con `deletePhoto` salvo en modo edición; la skill 06 usa `draft.clientId` al guardar.

`src/db/readings.ts` expone además `listPending`, `claimReading`, `markSent`, `releaseReading`, `resetSendingToPending`, `applyVerification` y `countUnsent`. Todas las escrituras usan consultas parametrizadas: se reclama una fila antes de sincronizarla, los fallos la devuelven a `pending` y la verificación solo se aplica mientras está en `sending`.

`src/domain/consumption.ts` exporta `verifyWithMeter(row, meter)`, que recalcula lectura anterior, promedio, consumo y anomalía con los datos del servidor. `src/services/sync.ts` verifica y envía pendientes de forma idempotente: reclama cada lectura, consulta MockAPI por su `clientId` exacto antes de crearla y evita recorridos simultáneos. `refreshPendingCount(db)` actualiza el indicador de pendientes.

`src/store/sync.ts` es un store Zustand no persistido con `{ pendingCount, isSyncing, version }` y acciones para actualizarlos. `src/components/SyncManager.tsx`, montado dentro de los providers raíz, recupera estados `sending` al abrir la app y reintenta al reconectar, volver a primer plano y cada 30 segundos mientras haya pendientes y la app esté activa. `src/components/ConnectionBanner.tsx` muestra conexión, cantidad pendiente y el estado «Enviando…».


## 6. Reglas de negocio
- R1: usuarios quemados en `constants/tecnicos.ts`; la sesión persiste hasta cerrar sesión.
- R2: código válido `/^MED-\d{6}$/`; si no cumple, error y NO se llama a la API.
- R3: mostrar 7 datos (dirección, sector, cuenta, estado, última lectura, fecha, consumo promedio). Caché de TanStack Query, `staleTime` 12 h, solo en memoria.
- R4: sin conexión se puede registrar; si no hay lectura anterior con la que comparar, `verification = "pending_verification"` y se verifica al reconectar.
- R5: normal exige lectura; inaccesible exige motivo y sin lectura; dañado exige descripción y lectura opcional.
- R6: `parseReading(readingText)` convierte lecturas no negativas con coma o punto decimal a número; `consumption = readingValue - lastReading`; anómalo si `consumption > 3 * averageMonthlyConsumption` (estrictamente mayor). Estas funciones puras viven en `src/domain/consumption.ts`. En el paso 2 del formulario se muestra la advertencia y se exige la confirmación del técnico. Si es anómalo: foto obligatoria.
- R7: foto obligatoria si anómalo o dañado; opcional en los demás casos. Se copia a carpeta permanente con nombre `evidencia-<clientId>-<Date.now()>.jpg` para que una nueva foto nunca pise la original. Con permiso denegado: explicar y permitir continuar solo si la foto no es obligatoria.
- R8: el borrador se persiste; `src/components/ResumeDraftPrompt.tsx` ofrece continuar o descartar una vez por apertura, solo tras hidratar. Continuar reconstruye la pila con `router.push` (inicio → paso 1 → … → paso N) para que atrás funcione; `src/services/drafts.ts` descarta el estado y elimina su foto sin borrar la foto original de una corrección.
- R9: envío automático al reconectar (listener de `expo-network`), al abrir la app y al volver a primer plano; un solo envío a la vez. Banner de conexión y pendientes en todas las pantallas.
- R10: corregible mientras `sync_status !== "sent"`; enviada ya no. Un solo registro