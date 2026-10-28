## Estado actual
- Skill 06-registro-local implementada: las lecturas se guardan en SQLite con `src/db/readings.ts`, consultas parametrizadas, prevención de duplicados por medidor y mes, y estado inicial pendiente de envío.
- `src/hooks/useNetworkStatus.ts` consulta la conectividad al guardar; los registros quedan pendientes de verificar si no hay conexión o faltan datos del medidor.
- `src/domain/date.ts` genera el mes local; los borradores admiten `meter: null`; la pantalla principal lista lecturas y fotos persistidas.
- `docs/CONTRATO.md` §3 y §5 refleja los nuevos módulos y que `draft.meter` puede ser nulo.
- `npx tsc --noEmit` pasó; prueba de integración SQLite con Node confirmó guardado, estado inicial, listado y rechazo de duplicados. La ejecución web no pudo compilar por falta del WASM incluido/esperado por `expo-sqlite`.
- Paso 3 aclara que la lectura aún no está guardada hasta pulsar el botón; inicio informa cuando no hay registros. Falta probar conectividad, cámara y persistencia real en dispositivo.

## Próximos pasos
- Probar en el teléfono: MED-000001 con lectura 182 y conexión; MED-000002 consultado y luego modo avión; MED-000003 sin caché y modo avión; duplicado en el mismo mes; reapertura de la app; lectura 183 sin foto obligatoria.
- Si las pruebas pasan, continuar con la skill 06b-correccion; después implementar sincronización según la skill 08.
