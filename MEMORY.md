## Estado actual
- Skill 05-foto ejecutada: `src/services/photos.ts` gestiona permiso de cámara, captura y copia segura a la carpeta permanente `Documents/evidencias`.
- `src/store/draft.ts` incluye `clientId` y `setPhotoUri`, con persistencia del borrador y borrado de la foto anterior al reemplazarla.
- `src/app/(tecnico)/lectura/paso-3.tsx` agrega la sección de foto, estados de permiso, preview y validación de foto obligatoria u opcional.
- `app.json` incluye el plugin `expo-image-picker` con el texto de permiso en español.
- `docs/CONTRATO.md` §5 actualizado con `clientId`, `setPhotoUri` y la nota de uso en la skill 06.
- `npx tsc --noEmit` quedó en verde.

## Próximos pasos
- Probar en el teléfono: `MED-000001`, lectura 182, foto opcional y continuar sin foto; `MED-000001`, lectura 183, foto obligatoria y bloquear acceso; `MED-000002` o lectura dañada, confirmación de foto obligatoria.
- Verificar flujo de permiso denegado: explicación, botón reintentar; bloqueado: abrir ajustes; para foto opcional continuar sin foto; para obligatoria mostrar "Falta la foto obligatoria".
- Continuar con la skill 06 para guardar localmente y enlazar `draft.clientId` con el registro final.
