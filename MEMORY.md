## Estado actual
- Skill 06b-correccion implementada: `src/db/readings.ts` agrega `getReadingByClientId` y `updateReading` con guardia `sync_status = 'pending'`.
- `src/store/draft.ts` conserva `editingClientId` y `startEditDraft`; las fotos nuevas no reemplazan la evidencia original.
- Skill 07-borrador implementada: el paso 2 persiste cada cambio, la app ofrece reanudar o descartar tras hidratar y el descarte conserva la foto original de una corrección.
- `docs/CONTRATO.md` documenta `selectHasDraft`, `src/services/drafts.ts` y `ResumeDraftPrompt.tsx`.
- `npx tsc --noEmit` pasó. El lint reportó un error preexistente en `src/app/(tecnico)/buscar.tsx`.

## Próximos pasos
- Probar en dispositivo todos los casos de la checklist de la skill 07, además de los casos pendientes de corrección de la skill 06b.
- Continuar con la sincronización de la skill 08 después de validar en dispositivo.
