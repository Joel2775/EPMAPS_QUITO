## Estado actual
- Skill 06b-correccion implementada: `src/db/readings.ts` agrega `getReadingByClientId` y `updateReading` con guardia `sync_status = 'pending'`.
- `src/store/draft.ts` incluye `editingClientId` y `startEditDraft`, preservando el borrador original al corregir una lectura pendiente.
- `src/services/photos.ts` usa nombres con timestamp para evitar sobrescribir la foto original al cambiar evidencia en una corrección.
- `src/app/(tecnico)/index.tsx` y `buscar.tsx` muestran el flujo de corrección y piden confirmar reemplazo del borrador en curso.
- Las pantallas `lectura/paso-1` y `paso-3` soportan modo edición: resaltar estado actual, guardar corrección sin duplicado y borrar solo la foto previa si cambió.
- `docs/CONTRATO.md` actualizó los datos del borrador y la regla de nombre de foto para R7. `npx tsc --noEmit` pasó.

## Próximos pasos
- Probar en dispositivo los casos de la checklist de la skill 06b: corrección de lectura normal y anómala, duplicado pendiente, foto nueva y salida sin guardar.
- Continuar con la siguiente skill de descarte de borradores y luego la sincronización de la skill 08.
