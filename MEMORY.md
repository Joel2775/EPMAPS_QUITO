## Estado actual
- Skills 06b y 07 implementadas: corrección solo mientras está pendiente y borradores reanudables; la foto original se conserva durante una corrección.
- Skill 08 implementada: SQLite reclama, verifica y marca lecturas; `src/services/sync.ts` comprueba `clientId` antes del POST y evita duplicados.
- `src/components/SyncManager.tsx` reintenta al abrir, reconectar, volver a primer plano y cada 30 segundos con pendientes; `ConnectionBanner.tsx` muestra conexión, pendientes y envío.
- `src/store/sync.ts` mantiene el estado de sincronización en memoria; lista local se actualiza al cambiar `version`.
- `docs/CONTRATO.md` actualizado con el servicio, store, componentes y consultas de envío.
- `npx tsc --noEmit` pasó tras la implementación y el ajuste final del gestor.
- MockAPI devuelve HTTP 404 al filtrar `/readings?clientId=...` sin coincidencias, aunque `/readings` existe y responde 200. `findReadingByClientId` ahora recurre a la lista y compara el `clientId` exacto; reconoce registros antiguos sin exigir `status: "sent"`.
- La primera prueba dejó 3 lecturas locales pendientes de forma segura; volverán a sincronizarse automáticamente con el ajuste.

## Próximos pasos
- Reprobar que las 3 lecturas se envíen y confirmar que hay exactamente un registro remoto por `clientId`.
- Completar en dispositivo la checklist: online/offline, verificación pendiente, cierre y reapertura, cambios de red sin duplicados, banner en todas las pantallas y bloqueo de corrección una vez enviada.
